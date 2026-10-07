import { Router } from "express";
import { prisma } from "../lib/prisma";

export const themeRouter = Router();

themeRouter.get("/", async (_req, res) => {
  const themes = await prisma.theme.findMany({ orderBy: [{ isPremium: "asc" }, { priceCents: "asc" }] });
  res.json(themes);
});
