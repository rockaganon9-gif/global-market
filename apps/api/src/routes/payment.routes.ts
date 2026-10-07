import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";

export const paymentRouter = Router();

interface FlutterwaveInitResponse {
  status: string;
  data?: { link: string };
}

interface FlutterwaveVerifyResponse {
  status: string;
  data?: { status: string; amount: number; currency: string };
}

const FLW_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const FLW_BASE_URL = "https://api.flutterwave.com/v3";
const PAYMENT_REDIRECT_URL = process.env.PAYMENT_REDIRECT_URL ?? "http://localhost:3000/checkout/callback";

// Démarre un paiement Mobile Money / Carte via Flutterwave et renvoie le lien de paiement à afficher au client.
paymentRouter.post("/initialize", requireAuth, async (req, res) => {
  const { orderId } = z.object({ orderId: z.string() }).parse(req.body);

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.buyerId !== req.user!.userId) {
    return res.status(404).json({ message: "Commande introuvable" });
  }
  if (order.paymentMethod === "CASH_ON_DELIVERY") {
    return res.status(400).json({ message: "Cette commande est payable à la livraison" });
  }
  if (order.paymentStatus === "PAID") {
    return res.status(400).json({ message: "Commande déjà payée" });
  }
  if (!FLW_SECRET_KEY) {
    return res.status(500).json({ message: "Le fournisseur de paiement n'est pas configuré" });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });

  const response = await fetch(`${FLW_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FLW_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: order.id,
      amount: order.totalCents / 100,
      currency: order.currency,
      redirect_url: PAYMENT_REDIRECT_URL,
      customer: { email: user?.email, phonenumber: user?.phone, name: user?.fullName },
      customizations: { title: "Global Market", description: `Commande ${order.id}` },
    }),
  });

  const data = (await response.json()) as FlutterwaveInitResponse;
  if (!response.ok || data.status !== "success" || !data.data) {
    return res.status(502).json({ message: "Échec de l'initialisation du paiement", details: data });
  }

  await prisma.order.update({ where: { id: order.id }, data: { paymentRef: order.id } });
  res.json({ paymentLink: data.data.link });
});

// Démarre le paiement d'un thème premium pour la boutique du vendeur connecté.
paymentRouter.post("/theme/initialize", requireAuth, requireRole("VENDOR"), async (req, res) => {
  const { themeId } = z.object({ themeId: z.string() }).parse(req.body);

  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
  if (!vendor) return res.status(403).json({ message: "Aucune boutique associée" });

  const theme = await prisma.theme.findUnique({ where: { id: themeId } });
  if (!theme || !theme.isPremium) {
    return res.status(404).json({ message: "Thème premium introuvable" });
  }
  if (!FLW_SECRET_KEY) {
    return res.status(500).json({ message: "Le fournisseur de paiement n'est pas configuré" });
  }

  const existing = await prisma.themePurchase.findFirst({
    where: { vendorId: vendor.id, themeId, paymentStatus: "PAID" },
  });
  if (existing) return res.status(400).json({ message: "Vous possédez déjà ce thème" });

  const purchase = await prisma.themePurchase.upsert({
    where: { vendorId_themeId: { vendorId: vendor.id, themeId } },
    update: { paymentStatus: "PENDING", amountCents: theme.priceCents },
    create: { vendorId: vendor.id, themeId, amountCents: theme.priceCents, currency: "XOF" },
  });

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });

  const response = await fetch(`${FLW_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FLW_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: `theme_${purchase.id}`,
      amount: theme.priceCents / 100,
      currency: purchase.currency,
      redirect_url: PAYMENT_REDIRECT_URL,
      customer: { email: user?.email, phonenumber: user?.phone, name: user?.fullName },
      customizations: { title: "Global Market", description: `Thème "${theme.name}"` },
    }),
  });

  const data = (await response.json()) as FlutterwaveInitResponse;
  if (!response.ok || data.status !== "success" || !data.data) {
    return res.status(502).json({ message: "Échec de l'initialisation du paiement", details: data });
  }

  await prisma.themePurchase.update({ where: { id: purchase.id }, data: { paymentRef: purchase.id } });
  res.json({ paymentLink: data.data.link });
});

// Webhook Flutterwave: confirme le paiement côté serveur avant de marquer la commande payée.
paymentRouter.post("/webhook", async (req, res) => {
  const signature = req.headers["verif-hash"];
  const expectedSecret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;

  if (!expectedSecret || signature !== expectedSecret) {
    return res.status(401).json({ message: "Signature invalide" });
  }

  const { txRef, status, id: transactionId } = {
    txRef: req.body?.data?.tx_ref,
    status: req.body?.data?.status,
    id: req.body?.data?.id,
  };
  if (!txRef || !transactionId) {
    return res.status(400).json({ message: "Payload invalide" });
  }

  // Revérifie la transaction directement auprès de Flutterwave (ne jamais faire confiance au webhook seul).
  const verifyRes = await fetch(`${FLW_BASE_URL}/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` },
  });
  const verifyData = (await verifyRes.json()) as FlutterwaveVerifyResponse;

  if (typeof txRef === "string" && txRef.startsWith("theme_")) {
    const purchaseId = txRef.slice("theme_".length);
    const purchase = await prisma.themePurchase.findUnique({ where: { id: purchaseId } });
    if (!purchase) return res.status(404).json({ message: "Achat de thème introuvable" });

    const isConfirmed =
      verifyData?.data?.status === "successful" &&
      verifyData?.data?.amount >= purchase.amountCents / 100 &&
      verifyData?.data?.currency === purchase.currency;

    await prisma.themePurchase.update({
      where: { id: purchase.id },
      data: { paymentStatus: isConfirmed && status === "successful" ? "PAID" : "FAILED" },
    });

    return res.status(200).json({ received: true });
  }

  const order = await prisma.order.findUnique({ where: { id: txRef } });
  if (!order) return res.status(404).json({ message: "Commande introuvable" });

  const isConfirmed =
    verifyData?.data?.status === "successful" &&
    verifyData?.data?.amount >= order.totalCents / 100 &&
    verifyData?.data?.currency === order.currency;

  if (isConfirmed && status === "successful") {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "PAID", status: "CONFIRMED" },
    });
  } else {
    await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } });
  }

  res.status(200).json({ received: true });
});
