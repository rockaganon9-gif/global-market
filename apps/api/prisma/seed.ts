import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

const categories = [
  "Mode & Vêtements",
  "Électronique",
  "Maison & Cuisine",
  "Beauté & Santé",
  "Alimentation",
  "Téléphones & Accessoires",
  "Artisanat & Décoration",
  "Bébé & Enfants",
];

const themes = [
  {
    name: "Classique",
    slug: "classic",
    description: "Le style Global Market par défaut : emerald, propre et efficace.",
    isPremium: false,
    priceCents: 0,
  },
  {
    name: "Minimal",
    slug: "minimal",
    description: "Noir et blanc, épuré, met en avant les photos de vos produits.",
    isPremium: false,
    priceCents: 0,
  },
  {
    name: "Vibrant",
    slug: "vibrant",
    description: "Bandeau dégradé coloré et cartes arrondies, pour une boutique qui attire l'œil.",
    isPremium: false,
    priceCents: 0,
  },
  {
    name: "Prestige",
    slug: "prestige",
    description: "Fond sombre élégant, accents dorés — pour une boutique haut de gamme.",
    isPremium: true,
    priceCents: 500000,
  },
  {
    name: "Boutique Pro",
    slug: "boutique-pro",
    description: "Mise en page magazine, typographie soignée, pour une image professionnelle.",
    isPremium: true,
    priceCents: 800000,
  },
];

async function main() {
  for (const name of categories) {
    const slug = slugify(name, { lower: true, strict: true });
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }
  console.log(`${categories.length} catégories créées.`);

  for (const theme of themes) {
    await prisma.theme.upsert({
      where: { slug: theme.slug },
      update: {},
      create: theme,
    });
  }
  console.log(`${themes.length} thèmes de boutique créés.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
