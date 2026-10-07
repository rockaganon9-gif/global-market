import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { hashPassword, signToken, verifyPassword } from "../lib/auth";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(6),
  password: z.string().min(6),
  fullName: z.string().min(2),
  country: z.string().min(2),
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Données invalides", details: parsed.error.flatten() });
  }
  const { email, phone, password, fullName, country } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });
  if (existing) {
    return res.status(409).json({ message: "Un compte existe déjà avec cet email ou ce téléphone" });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, phone, passwordHash, fullName, country },
  });

  const token = signToken({ userId: user.id, role: user.role });
  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Données invalides" });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ message: "Email ou mot de passe incorrect" });
  }

  const token = signToken({ userId: user.id, role: user.role });
  res.json({
    token,
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
  });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { vendor: true },
  });
  if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

  const { passwordHash, ...safeUser } = user;
  res.json(safeUser);
});

const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(6).optional(),
  country: z.string().min(2).optional(),
});

authRouter.patch("/me", requireAuth, async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Données invalides", details: parsed.error.flatten() });
  }

  if (parsed.data.phone) {
    const existing = await prisma.user.findUnique({ where: { phone: parsed.data.phone } });
    if (existing && existing.id !== req.user!.userId) {
      return res.status(409).json({ message: "Ce numéro de téléphone est déjà utilisé" });
    }
  }

  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: parsed.data,
    include: { vendor: true },
  });
  const { passwordHash, ...safeUser } = user;
  res.json(safeUser);
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

authRouter.patch("/me/password", requireAuth, async (req, res) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Données invalides" });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user || !(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
    return res.status(401).json({ message: "Mot de passe actuel incorrect" });
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  res.json({ message: "Mot de passe mis à jour" });
});
