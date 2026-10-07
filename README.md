# Global Market

Marketplace e-commerce multi-vendeurs pensée pour l'Afrique — web + mobile, avec paiement Mobile Money, carte bancaire et paiement à la livraison.

## Architecture

Monorepo npm workspaces :

```
apps/
  api/      API backend (Express + TypeScript + Prisma + PostgreSQL)
  web/      Site web (Next.js + TypeScript + Tailwind)
  mobile/   Application mobile (Expo / React Native + TypeScript)
packages/
  shared/   Types TypeScript partagés entre les 3 apps
```

## Fonctionnalités MVP

- Comptes acheteur / vendeur / admin (JWT)
- Boutiques vendeurs (création, approbation par un admin)
- Catalogue produits par catégorie, recherche
- Panier, commande, suivi de statut
- Paiement : Mobile Money & carte (Flutterwave), paiement à la livraison
- Tableau de bord vendeur (produits, commandes) et admin (approbation des boutiques)

## Démarrage

### 1. Base de données

Installer PostgreSQL (localement ou via un service comme Supabase/Neon/Railway), puis configurer `apps/api/.env` à partir de `apps/api/.env.example`.

### 2. Installation

```powershell
npm install
```

### 3. Base de données (migrations)

```powershell
npm run prisma:migrate --workspace=apps/api
```

### 4. Lancer les apps

```powershell
npm run dev:api      # API sur http://localhost:4000
npm run dev:web      # Web sur http://localhost:3000
npm run dev:mobile   # Mobile via Expo (scanner le QR code avec Expo Go)
```

## Paiement

Le paiement Mobile Money / carte utilise [Flutterwave](https://flutterwave.com), qui couvre la majorité des pays africains (MTN MoMo, Orange Money, Airtel Money, M-Pesa, cartes Visa/Mastercard). Créer un compte Flutterwave, puis renseigner `FLUTTERWAVE_SECRET_KEY` et `FLUTTERWAVE_WEBHOOK_SECRET` dans `apps/api/.env`.

## Prochaines étapes suggérées

- Upload d'images produits (Cloudinary ou S3)
- Notifications SMS/WhatsApp pour le suivi de commande
- Système d'avis/notes vendeurs
- Gestion multi-devises et multi-pays plus fine (taxes, livraison)
