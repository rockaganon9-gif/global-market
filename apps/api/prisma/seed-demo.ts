import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const prisma = new PrismaClient();

interface DemoProduct {
  title: string;
  description: string;
  priceCents: number;
  stock: number;
  category: string;
  imageSeed: string;
  /** Vraies photos produit (servies par l'API sous /uploads), remplace imageSeed quand présent. */
  images?: string[];
}

const UPLOADS_BASE = `http://localhost:${process.env.PORT ?? 4000}/uploads`;

function imagesFor(seed: string) {
  return [1, 2, 3].map((n) => `https://picsum.photos/seed/${seed}-${n}/600/600`);
}

interface DemoVendor {
  email: string;
  phone: string;
  fullName: string;
  shopName: string;
  shopSlug: string;
  description: string;
  country: string;
  city: string;
  products: DemoProduct[];
}

const DEMO_VENDORS: DemoVendor[] = [
  {
    email: "boutique@demo.gm",
    phone: "+2250700000001",
    fullName: "Aïcha Koné",
    shopName: "Boutique Aïcha",
    shopSlug: "boutique-aicha",
    description: "Produits locaux de qualité, mode, beauté et artisanat.",
    country: "Côte d'Ivoire",
    city: "Abidjan",
    products: [
      {
        title: "Robe en wax élégante",
        description: "Robe traditionnelle en tissu wax, coupe moderne, taille unique ajustable.",
        priceCents: 1500000,
        stock: 12,
        category: "Mode & Vêtements",
        imageSeed: "wax-dress",
        images: [`${UPLOADS_BASE}/dress-1.jpg`, `${UPLOADS_BASE}/dress-2.jpg`],
      },
      {
        title: "Huile de beauté au karité bio",
        description: "Huile 100% naturelle au beurre de karité, nourrit et hydrate la peau en profondeur.",
        priceCents: 500000,
        stock: 50,
        category: "Beauté & Santé",
        imageSeed: "shea-oil",
        images: [`${UPLOADS_BASE}/oil-1.jpg`, `${UPLOADS_BASE}/oil-2.jpg`, `${UPLOADS_BASE}/oil-3.jpg`],
      },
      {
        title: "Panier tressé artisanal",
        description: "Panier fait main en fibres naturelles, parfait pour la décoration ou le rangement.",
        priceCents: 900000,
        stock: 15,
        category: "Artisanat & Décoration",
        imageSeed: "basket",
        images: [`${UPLOADS_BASE}/basket.jpg`],
      },
    ],
  },
  {
    email: "techhub@demo.gm",
    phone: "+2210700000003",
    fullName: "Moussa Diop",
    shopName: "TechHub Dakar",
    shopSlug: "techhub-dakar",
    description: "Smartphones, accessoires et électronique importés et garantis.",
    country: "Sénégal",
    city: "Dakar",
    products: [
      {
        title: "Smartphone Android 128Go",
        description: "Smartphone double SIM, 128 Go de stockage, appareil photo 48MP, batterie longue durée.",
        priceCents: 8900000,
        stock: 25,
        category: "Téléphones & Accessoires",
        imageSeed: "smartphone",
        images: [`${UPLOADS_BASE}/phone-1.jpg`, `${UPLOADS_BASE}/phone-2.jpg`, `${UPLOADS_BASE}/phone-3.jpg`],
      },
      {
        title: "Écouteurs sans fil",
        description: "Écouteurs Bluetooth avec réduction de bruit et boîtier de charge rapide.",
        priceCents: 1800000,
        stock: 30,
        category: "Électronique",
        imageSeed: "earbuds",
        images: [`${UPLOADS_BASE}/earbuds-1.jpg`, `${UPLOADS_BASE}/earbuds-2.jpg`, `${UPLOADS_BASE}/earbuds-3.jpg`],
      },
    ],
  },
  {
    email: "marchesahel@demo.gm",
    phone: "+2230700000004",
    fullName: "Fatou Traoré",
    shopName: "Marché du Sahel",
    shopSlug: "marche-du-sahel",
    description: "Produits alimentaires et articles pour la maison, prix justes tous les jours.",
    country: "Mali",
    city: "Bamako",
    products: [
      {
        title: "Sac de riz parfumé 25kg",
        description: "Riz parfumé de qualité supérieure, sac de 25kg, idéal pour toute la famille.",
        priceCents: 2200000,
        stock: 40,
        category: "Alimentation",
        imageSeed: "rice-bag",
        images: [`${UPLOADS_BASE}/rice-bags.jpg`],
      },
      {
        title: "Ensemble de casseroles inox",
        description: "Set de 5 casseroles en acier inoxydable, compatible tous feux dont induction.",
        priceCents: 4500000,
        stock: 8,
        category: "Maison & Cuisine",
        imageSeed: "cookware",
        images: [`${UPLOADS_BASE}/cookware-1.jpg`, `${UPLOADS_BASE}/cookware-2.jpg`, `${UPLOADS_BASE}/cookware-3.jpg`],
      },
    ],
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);
  let totalProducts = 0;

  for (const demo of DEMO_VENDORS) {
    const vendorUser = await prisma.user.upsert({
      where: { email: demo.email },
      update: {},
      create: {
        email: demo.email,
        phone: demo.phone,
        passwordHash,
        fullName: demo.fullName,
        role: "VENDOR",
        country: demo.country,
      },
    });

    const vendor = await prisma.vendor.upsert({
      where: { userId: vendorUser.id },
      update: { status: "APPROVED" },
      create: {
        userId: vendorUser.id,
        shopName: demo.shopName,
        shopSlug: demo.shopSlug,
        description: demo.description,
        country: demo.country,
        city: demo.city,
        status: "APPROVED",
      },
    });

    for (const p of demo.products) {
      const category = await prisma.category.findFirst({ where: { name: p.category } });
      if (!category) continue;

      const slug = slugify(p.title, { lower: true, strict: true });
      await prisma.product.upsert({
        where: { slug },
        update: {},
        create: {
          vendorId: vendor.id,
          categoryId: category.id,
          title: p.title,
          slug,
          description: p.description,
          priceCents: p.priceCents,
          currency: "XOF",
          stock: p.stock,
          images: p.images ?? imagesFor(p.imageSeed),
        },
      });
      totalProducts++;
    }

    console.log(`Vendeur démo : ${demo.email} / password123 (${demo.shopName})`);
  }

  await prisma.user.upsert({
    where: { email: "client@demo.gm" },
    update: {},
    create: {
      email: "client@demo.gm",
      phone: "+2250700000002",
      passwordHash,
      fullName: "Client Démo",
      role: "CUSTOMER",
      country: "Côte d'Ivoire",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@demo.gm" },
    update: { role: "ADMIN" },
    create: {
      email: "admin@demo.gm",
      phone: "+2250700000099",
      passwordHash,
      fullName: "Admin Global Market",
      role: "ADMIN",
      country: "Côte d'Ivoire",
    },
  });

  await prisma.platformSettings.upsert({
    where: { id: "global" },
    update: {},
    create: { id: "global", commissionRate: 10 },
  });

  console.log("Client démo : client@demo.gm / password123");
  console.log("Admin démo : admin@demo.gm / password123");
  console.log(`${totalProducts} produits de démo créés au total.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
