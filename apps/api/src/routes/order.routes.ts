import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { getCommissionRate } from "./admin.routes";

export const orderRouter = Router();

const checkoutSchema = z.object({
  paymentMethod: z.enum(["MOBILE_MONEY", "CARD", "CASH_ON_DELIVERY"]),
  // Facultatif: uniquement requis si le panier contient au moins un produit physique.
  shippingAddress: z
    .object({
      fullName: z.string().min(2),
      phone: z.string().min(6),
      country: z.string().min(2),
      city: z.string().min(2),
      addressLine: z.string().min(3),
    })
    .optional(),
});

// Crée une commande à partir du panier courant de l'acheteur, puis vide le panier.
orderRouter.post("/", requireAuth, async (req, res) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Données invalides", details: parsed.error.flatten() });
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: req.user!.userId },
    include: { items: { include: { product: true } } },
  });
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Le panier est vide" });
  }

  const hasPhysical = cart.items.some((i) => i.product.type === "PHYSICAL");
  const hasDigital = cart.items.some((i) => i.product.type === "DIGITAL");
  const { shippingAddress, paymentMethod } = parsed.data;

  if (hasPhysical && !shippingAddress) {
    return res.status(400).json({ message: "Adresse de livraison requise pour les produits physiques du panier" });
  }
  if (hasDigital && paymentMethod === "CASH_ON_DELIVERY") {
    return res.status(400).json({
      message: "Le paiement à la livraison n'est pas disponible pour un panier contenant un produit digital",
    });
  }

  for (const item of cart.items) {
    if (item.product.type === "PHYSICAL" && item.quantity > item.product.stock) {
      return res.status(409).json({ message: `Stock insuffisant pour "${item.product.title}"` });
    }
  }

  const totalCents = cart.items.reduce((sum, i) => sum + i.product.priceCents * i.quantity, 0);
  const currency = cart.items[0]?.product.currency ?? "XOF";
  const commissionRate = await getCommissionRate();

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        buyerId: req.user!.userId,
        totalCents,
        currency,
        paymentMethod,
        shippingFullName: shippingAddress?.fullName,
        shippingPhone: shippingAddress?.phone,
        shippingCountry: shippingAddress?.country,
        shippingCity: shippingAddress?.city,
        shippingAddress: shippingAddress?.addressLine,
        items: {
          create: cart.items.map((i) => ({
            productId: i.productId,
            vendorId: i.product.vendorId,
            title: i.product.title,
            priceCents: i.product.priceCents,
            quantity: i.quantity,
            productType: i.product.type,
            commissionCents: Math.round((i.product.priceCents * i.quantity * commissionRate) / 100),
          })),
        },
      },
      include: { items: true },
    });

    for (const item of cart.items) {
      if (item.product.type === "PHYSICAL") {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return created;
  });

  res.status(201).json(order);
});

// Ajoute le lien de téléchargement sur chaque article digital d'une commande payée
// (le lien vient du produit en direct, pas d'un instantané, au cas où le vendeur le mette à jour).
function withDownloadLinks<T extends { paymentStatus: string; items: { productType: string; productId: string }[] }>(
  order: T,
  digitalUrlByProductId: Map<string, string | null>,
) {
  return {
    ...order,
    items: order.items.map((item) => ({
      ...item,
      downloadUrl:
        order.paymentStatus === "PAID" && item.productType === "DIGITAL"
          ? digitalUrlByProductId.get(item.productId) ?? null
          : undefined,
    })),
  };
}

async function attachDownloadLinks<
  T extends { paymentStatus: string; items: { productType: string; productId: string }[] },
>(orders: T[]) {
  const digitalProductIds = orders.flatMap((o) => o.items.filter((i) => i.productType === "DIGITAL").map((i) => i.productId));
  if (digitalProductIds.length === 0) return orders.map((o) => withDownloadLinks(o, new Map()));

  const products = await prisma.product.findMany({
    where: { id: { in: digitalProductIds } },
    select: { id: true, digitalFileUrl: true },
  });
  const digitalUrlByProductId = new Map(products.map((p) => [p.id, p.digitalFileUrl]));
  return orders.map((o) => withDownloadLinks(o, digitalUrlByProductId));
}

orderRouter.get("/", requireAuth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { buyerId: req.user!.userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(await attachDownloadLinks(orders));
});

orderRouter.get("/:id", requireAuth, async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: true },
  });
  if (!order) return res.status(404).json({ message: "Commande introuvable" });

  const isBuyer = order.buyerId === req.user!.userId;
  let isVendorOfOrder = false;
  if (req.user!.role === "VENDOR") {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
    isVendorOfOrder = !!vendor && order.items.some((i) => i.vendorId === vendor.id);
  }
  if (!isBuyer && req.user!.role !== "ADMIN" && !isVendorOfOrder) {
    return res.status(403).json({ message: "Accès refusé" });
  }
  const [withLinks] = await attachDownloadLinks([order]);
  res.json(withLinks);
});

// Commandes contenant des produits du vendeur connecté.
orderRouter.get("/vendor/mine", requireAuth, requireRole("VENDOR"), async (req, res) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
  if (!vendor) return res.status(403).json({ message: "Aucune boutique associée" });

  const items = await prisma.orderItem.findMany({
    where: { vendorId: vendor.id },
    include: { order: true },
    orderBy: { order: { createdAt: "desc" } },
  });
  res.json(items);
});

orderRouter.patch("/:id/status", requireAuth, requireRole("VENDOR", "ADMIN"), async (req, res) => {
  const status = z
    .enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"])
    .parse(req.body.status);
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
  });
  res.json(order);
});
