import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("ADMIN"));

export async function getCommissionRate() {
  const settings = await prisma.platformSettings.upsert({
    where: { id: "global" },
    update: {},
    create: { id: "global" },
  });
  return settings.commissionRate;
}

adminRouter.get("/settings", async (_req, res) => {
  const settings = await prisma.platformSettings.upsert({
    where: { id: "global" },
    update: {},
    create: { id: "global" },
  });
  res.json(settings);
});

const updateSettingsSchema = z.object({
  commissionRate: z.number().min(0).max(100),
});

adminRouter.patch("/settings", async (req, res) => {
  const parsed = updateSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Données invalides", details: parsed.error.flatten() });
  }
  const settings = await prisma.platformSettings.upsert({
    where: { id: "global" },
    update: { commissionRate: parsed.data.commissionRate },
    create: { id: "global", commissionRate: parsed.data.commissionRate },
  });
  res.json(settings);
});

// Chiffre d'affaires et commission de la plateforme, agrégés et par boutique.
// Une commande est comptée comme "encaissée" si elle est payée (Mobile Money / carte)
// ou livrée en paiement à la livraison (l'argent est alors réputé collecté).
adminRouter.get("/stats", async (_req, res) => {
  const items = await prisma.orderItem.findMany({
    where: {
      order: {
        OR: [{ paymentStatus: "PAID" }, { paymentMethod: "CASH_ON_DELIVERY", status: "DELIVERED" }],
      },
    },
    include: {
      order: { select: { currency: true, createdAt: true } },
    },
  });

  const byVendor = new Map<
    string,
    { vendorId: string; salesCents: number; commissionCents: number; orderCount: Set<string> }
  >();

  let totalRevenueCents = 0;
  let totalCommissionCents = 0;

  for (const item of items) {
    const lineTotal = item.priceCents * item.quantity;
    totalRevenueCents += lineTotal;
    totalCommissionCents += item.commissionCents;

    const entry = byVendor.get(item.vendorId) ?? {
      vendorId: item.vendorId,
      salesCents: 0,
      commissionCents: 0,
      orderCount: new Set<string>(),
    };
    entry.salesCents += lineTotal;
    entry.commissionCents += item.commissionCents;
    entry.orderCount.add(item.orderId);
    byVendor.set(item.vendorId, entry);
  }

  const vendorIds = Array.from(byVendor.keys());
  const vendors = await prisma.vendor.findMany({
    where: { id: { in: vendorIds } },
    select: { id: true, shopName: true, shopSlug: true },
  });
  const vendorNameById = new Map(vendors.map((v) => [v.id, v]));

  const paidOutGroups = await prisma.payout.groupBy({
    by: ["vendorId"],
    where: { vendorId: { in: vendorIds } },
    _sum: { amountCents: true },
  });
  const paidOutByVendor = new Map(paidOutGroups.map((g) => [g.vendorId, g._sum.amountCents ?? 0]));

  const vendorStats = Array.from(byVendor.values())
    .map((v) => {
      const payoutCents = v.salesCents - v.commissionCents;
      const paidOutCents = paidOutByVendor.get(v.vendorId) ?? 0;
      return {
        vendorId: v.vendorId,
        shopName: vendorNameById.get(v.vendorId)?.shopName ?? "Boutique supprimée",
        shopSlug: vendorNameById.get(v.vendorId)?.shopSlug ?? null,
        salesCents: v.salesCents,
        commissionCents: v.commissionCents,
        payoutCents,
        paidOutCents,
        remainingCents: payoutCents - paidOutCents,
        orderCount: v.orderCount.size,
      };
    })
    .sort((a, b) => b.salesCents - a.salesCents);

  const totalPayoutCents = totalRevenueCents - totalCommissionCents;
  const totalPaidOutCents = vendorStats.reduce((sum, v) => sum + v.paidOutCents, 0);

  res.json({
    totalRevenueCents,
    totalCommissionCents,
    totalPayoutCents,
    totalPaidOutCents,
    totalRemainingCents: totalPayoutCents - totalPaidOutCents,
    currency: items[0]?.order.currency ?? "XOF",
    vendors: vendorStats,
  });
});

const createPayoutSchema = z.object({
  vendorId: z.string(),
  amountCents: z.number().int().positive(),
  note: z.string().optional(),
});

// Enregistre un reversement effectué à un vendeur (virement, Mobile Money...).
adminRouter.post("/payouts", async (req, res) => {
  const parsed = createPayoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Données invalides", details: parsed.error.flatten() });
  }

  const vendor = await prisma.vendor.findUnique({ where: { id: parsed.data.vendorId } });
  if (!vendor) return res.status(404).json({ message: "Boutique introuvable" });

  const payout = await prisma.payout.create({
    data: {
      vendorId: parsed.data.vendorId,
      amountCents: parsed.data.amountCents,
      note: parsed.data.note,
    },
  });
  res.status(201).json(payout);
});

adminRouter.get("/payouts", async (req, res) => {
  const vendorId = typeof req.query.vendorId === "string" ? req.query.vendorId : undefined;
  const payouts = await prisma.payout.findMany({
    where: vendorId ? { vendorId } : undefined,
    include: { vendor: { select: { shopName: true, shopSlug: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(payouts);
});
