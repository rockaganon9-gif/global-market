import { Router } from "express";
import slugify from "slugify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { PUBLIC_PRODUCT_SELECT } from "./product.routes";

export const vendorRouter = Router();

const createVendorSchema = z.object({
  shopName: z.string().min(2),
  description: z.string().optional(),
  logoUrl: z.string().url().optional(),
  country: z.string().min(2),
  city: z.string().optional(),
});

// Un client devient vendeur en créant sa boutique (statut PENDING jusqu'à approbation admin).
vendorRouter.post("/", requireAuth, async (req, res) => {
  const parsed = createVendorSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Données invalides", details: parsed.error.flatten() });
  }

  const existing = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
  if (existing) {
    return res.status(409).json({ message: "Vous avez déjà une boutique" });
  }

  const baseSlug = slugify(parsed.data.shopName, { lower: true, strict: true });
  let shopSlug = baseSlug;
  let suffix = 1;
  while (await prisma.vendor.findUnique({ where: { shopSlug } })) {
    shopSlug = `${baseSlug}-${suffix++}`;
  }

  const vendor = await prisma.vendor.create({
    data: { ...parsed.data, shopSlug, userId: req.user!.userId },
  });

  await prisma.user.update({
    where: { id: req.user!.userId },
    data: { role: "VENDOR" },
  });

  res.status(201).json(vendor);
});

// Revenus du vendeur connecté: ventes, commission plateforme, et reversements reçus.
vendorRouter.get("/me/revenue", requireAuth, requireRole("VENDOR"), async (req, res) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
  if (!vendor) return res.status(403).json({ message: "Aucune boutique associée" });

  const items = await prisma.orderItem.findMany({
    where: {
      vendorId: vendor.id,
      order: {
        OR: [{ paymentStatus: "PAID" }, { paymentMethod: "CASH_ON_DELIVERY", status: "DELIVERED" }],
      },
    },
    include: { order: { select: { currency: true } } },
  });

  const salesCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
  const commissionCents = items.reduce((sum, i) => sum + i.commissionCents, 0);
  const payoutCents = salesCents - commissionCents;

  const paidOut = await prisma.payout.aggregate({
    where: { vendorId: vendor.id },
    _sum: { amountCents: true },
  });
  const paidOutCents = paidOut._sum.amountCents ?? 0;

  const payouts = await prisma.payout.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    currency: items[0]?.order.currency ?? "XOF",
    salesCents,
    commissionCents,
    payoutCents,
    paidOutCents,
    remainingCents: payoutCents - paidOutCents,
    orderCount: new Set(items.map((i) => i.orderId)).size,
    payouts,
  });
});

// Thèmes premium déjà achetés par le vendeur connecté.
vendorRouter.get("/me/theme-purchases", requireAuth, requireRole("VENDOR"), async (req, res) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
  if (!vendor) return res.status(403).json({ message: "Aucune boutique associée" });

  const purchases = await prisma.themePurchase.findMany({
    where: { vendorId: vendor.id, paymentStatus: "PAID" },
  });
  res.json(purchases);
});

// Change le thème actif de la boutique du vendeur connecté (gratuit: immédiat, premium: doit être déjà acheté).
vendorRouter.patch("/me/theme", requireAuth, requireRole("VENDOR"), async (req, res) => {
  const themeId = z.string().parse(req.body.themeId);

  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
  if (!vendor) return res.status(403).json({ message: "Aucune boutique associée" });

  const theme = await prisma.theme.findUnique({ where: { id: themeId } });
  if (!theme) return res.status(404).json({ message: "Thème introuvable" });

  if (theme.isPremium) {
    const owned = await prisma.themePurchase.findFirst({
      where: { vendorId: vendor.id, themeId, paymentStatus: "PAID" },
    });
    if (!owned) {
      return res.status(402).json({ message: "Ce thème premium doit être acheté avant de pouvoir être activé" });
    }
  }

  const updated = await prisma.vendor.update({
    where: { id: vendor.id },
    data: { themeId },
    include: { theme: true },
  });
  res.json(updated);
});

// Vitrine publique: quelques boutiques approuvées à mettre en avant sur l'accueil.
vendorRouter.get("/public/featured", async (_req, res) => {
  const vendors = await prisma.vendor.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      shopName: true,
      shopSlug: true,
      logoUrl: true,
      country: true,
      city: true,
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });
  res.json(vendors);
});

vendorRouter.get("/:slug", async (req, res) => {
  const vendor = await prisma.vendor.findUnique({
    where: { shopSlug: req.params.slug },
    include: { theme: true },
  });
  if (!vendor || vendor.status !== "APPROVED") {
    return res.status(404).json({ message: "Boutique introuvable" });
  }
  res.json(vendor);
});

vendorRouter.get("/:slug/products", async (req, res) => {
  const vendor = await prisma.vendor.findUnique({ where: { shopSlug: req.params.slug } });
  if (!vendor) return res.status(404).json({ message: "Boutique introuvable" });

  const products = await prisma.product.findMany({
    where: { vendorId: vendor.id, isActive: true },
    orderBy: { createdAt: "desc" },
    select: PUBLIC_PRODUCT_SELECT,
  });
  res.json(products);
});

// Admin: liste des boutiques en attente d'approbation.
vendorRouter.get("/", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  const vendors = await prisma.vendor.findMany({ orderBy: { createdAt: "desc" } });
  res.json(vendors);
});

vendorRouter.patch("/:id/status", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const status = z.enum(["PENDING", "APPROVED", "SUSPENDED"]).parse(req.body.status);
  const vendor = await prisma.vendor.update({
    where: { id: req.params.id },
    data: { status },
  });
  res.json(vendor);
});
