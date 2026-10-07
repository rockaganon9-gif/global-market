import { Router } from "express";
import slugify from "slugify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";

export const productRouter = Router();

// Champs publics: digitalFileUrl n'est jamais exposé avant l'achat.
export const PUBLIC_PRODUCT_SELECT = {
  id: true,
  vendorId: true,
  categoryId: true,
  title: true,
  slug: true,
  description: true,
  priceCents: true,
  currency: true,
  type: true,
  stock: true,
  images: true,
  isActive: true,
  createdAt: true,
} as const;

productRouter.get("/", async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(50, Number(req.query.pageSize) || 20);
  const search = typeof req.query.q === "string" ? req.query.q : undefined;
  const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;

  const where = {
    isActive: true,
    ...(search ? { title: { contains: search, mode: "insensitive" as const } } : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { ...PUBLIC_PRODUCT_SELECT, vendor: { select: { shopName: true, shopSlug: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({ items, total, page, pageSize });
});

productRouter.get("/mine/list", requireAuth, requireRole("VENDOR"), async (req, res) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
  if (!vendor) return res.status(403).json({ message: "Aucune boutique associée à ce compte" });

  const products = await prisma.product.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(products);
});

productRouter.get("/:slug", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    select: {
      ...PUBLIC_PRODUCT_SELECT,
      vendor: { select: { shopName: true, shopSlug: true, status: true } },
      category: { select: { name: true, slug: true } },
    },
  });
  if (!product || !product.isActive) {
    return res.status(404).json({ message: "Produit introuvable" });
  }
  res.json(product);
});

const productFieldsSchema = z.object({
  categoryId: z.string(),
  title: z.string().min(2),
  description: z.string().min(10),
  priceCents: z.number().int().positive(),
  currency: z.string().default("XOF"),
  type: z.enum(["PHYSICAL", "DIGITAL"]).default("PHYSICAL"),
  stock: z.number().int().min(0).default(0),
  digitalFileUrl: z.string().url().optional(),
  images: z.array(z.string().url()).default([]),
});

const createProductSchema = productFieldsSchema.refine(
  (data) => data.type !== "DIGITAL" || !!data.digitalFileUrl,
  { message: "Un lien de téléchargement est requis pour un produit digital", path: ["digitalFileUrl"] },
);

// Un produit digital a un "stock" illimité: pas de gestion de rupture.
const UNLIMITED_DIGITAL_STOCK = 999_999;

productRouter.post("/", requireAuth, requireRole("VENDOR"), async (req, res) => {
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Données invalides", details: parsed.error.flatten() });
  }

  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
  if (!vendor) return res.status(403).json({ message: "Aucune boutique associée à ce compte" });
  if (vendor.status !== "APPROVED") {
    return res.status(403).json({ message: "Votre boutique doit être approuvée avant de publier des produits" });
  }

  const baseSlug = slugify(parsed.data.title, { lower: true, strict: true });
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const { digitalFileUrl, ...rest } = parsed.data;
  const product = await prisma.product.create({
    data: {
      ...rest,
      stock: parsed.data.type === "DIGITAL" ? UNLIMITED_DIGITAL_STOCK : parsed.data.stock,
      digitalFileUrl: parsed.data.type === "DIGITAL" ? digitalFileUrl : null,
      slug,
      vendorId: vendor.id,
    },
  });
  res.status(201).json(product);
});

const updateProductSchema = productFieldsSchema.partial().extend({
  isActive: z.boolean().optional(),
});

productRouter.patch("/:id", requireAuth, requireRole("VENDOR"), async (req, res) => {
  const parsed = updateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Données invalides" });
  }

  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!vendor || !product || product.vendorId !== vendor.id) {
    return res.status(403).json({ message: "Accès refusé" });
  }

  const updated = await prisma.product.update({
    where: { id: req.params.id },
    data: parsed.data,
  });
  res.json(updated);
});

productRouter.delete("/:id", requireAuth, requireRole("VENDOR"), async (req, res) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!vendor || !product || product.vendorId !== vendor.id) {
    return res.status(403).json({ message: "Accès refusé" });
  }

  await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.status(204).send();
});
