import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { PUBLIC_PRODUCT_SELECT } from "./product.routes";

export const cartRouter = Router();

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: { select: PUBLIC_PRODUCT_SELECT } } } },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: { include: { product: { select: PUBLIC_PRODUCT_SELECT } } } },
    });
  }
  return cart;
}

cartRouter.get("/", requireAuth, async (req, res) => {
  const cart = await getOrCreateCart(req.user!.userId);
  res.json(cart);
});

const addItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive().default(1),
});

cartRouter.post("/items", requireAuth, async (req, res) => {
  const parsed = addItemSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Données invalides" });

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product || !product.isActive) {
    return res.status(404).json({ message: "Produit introuvable" });
  }

  const cart = await getOrCreateCart(req.user!.userId);
  const existingItem = cart.items.find((i) => i.productId === parsed.data.productId);

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + parsed.data.quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: parsed.data.productId, quantity: parsed.data.quantity },
    });
  }

  const updated = await getOrCreateCart(req.user!.userId);
  res.status(201).json(updated);
});

cartRouter.patch("/items/:productId", requireAuth, async (req, res) => {
  const quantity = z.number().int().min(0).parse(req.body.quantity);
  const cart = await getOrCreateCart(req.user!.userId);
  const item = cart.items.find((i) => i.productId === req.params.productId);
  if (!item) return res.status(404).json({ message: "Article introuvable dans le panier" });

  if (quantity === 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
  }

  const updated = await getOrCreateCart(req.user!.userId);
  res.json(updated);
});

cartRouter.delete("/items/:productId", requireAuth, async (req, res) => {
  const cart = await getOrCreateCart(req.user!.userId);
  const item = cart.items.find((i) => i.productId === req.params.productId);
  if (item) await prisma.cartItem.delete({ where: { id: item.id } });

  const updated = await getOrCreateCart(req.user!.userId);
  res.json(updated);
});
