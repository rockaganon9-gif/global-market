"use client";

import type { Category, Paginated, Product } from "@global-market/shared";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GetStartedSection } from "@/components/GetStartedSection";
import { ProductCard } from "@/components/ProductCard";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const STATS = [
  { value: "500+", label: "Vendeurs actifs" },
  { value: "15", label: "Pays couverts" },
  { value: "100%", label: "Mobile Money & livraison" },
];

const CATEGORY_ICONS: Record<string, string> = {
  "Mode & Vêtements": "👗",
  "Électronique": "💻",
  "Maison & Cuisine": "🏠",
  "Beauté & Santé": "💄",
  Alimentation: "🍚",
  "Téléphones & Accessoires": "📱",
  "Artisanat & Décoration": "🧺",
  "Bébé & Enfants": "🍼",
};

function categoryIcon(name: string) {
  return CATEGORY_ICONS[name] ?? "🛍️";
}

const AVATAR_COLORS = [
  "bg-emerald-600",
  "bg-amber-600",
  "bg-sky-600",
  "bg-rose-600",
  "bg-violet-600",
  "bg-teal-600",
];

function avatarColor(name: string) {
  const hash = name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

interface FeaturedVendor {
  id: string;
  shopName: string;
  shopSlug: string;
  logoUrl: string | null;
  country: string;
  city: string | null;
  _count: { products: number };
}

const FEATURES = [
  {
    icon: "🛡️",
    title: "Vendeurs vérifiés",
    description: "Chaque boutique est examinée par notre équipe avant de pouvoir publier des produits.",
  },
  {
    icon: "💳",
    title: "Paiement adapté à l'Afrique",
    description: "Mobile Money, carte bancaire ou paiement à la livraison — choisissez ce qui vous convient.",
  },
  {
    icon: "🚚",
    title: "Suivi de commande",
    description: "Suivez chaque commande du panier à la livraison, où que vous soyez.",
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredVendors, setFeaturedVendors] = useState<FeaturedVendor[]>([]);
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Category[]>("/categories").then(setCategories).catch(() => {});
    api.get<FeaturedVendor[]>("/vendors/public/featured").then(setFeaturedVendors).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoryId) params.set("categoryId", categoryId);
    if (search) params.set("q", search);

    api
      .get<Paginated<Product>>(`/products?${params.toString()}`)
      .then((res) => setProducts(res.items))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [categoryId, search]);

  function goToCategory(id: string | undefined) {
    setCategoryId(id);
    document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-neutral-950 text-white">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 60% at 15% 20%, rgba(16,185,129,0.4), transparent 60%), radial-gradient(50% 50% at 85% 80%, rgba(5,150,105,0.3), transparent 60%), linear-gradient(90deg, rgba(2,20,15,0.85) 0%, rgba(4,26,19,0.6) 50%, rgba(6,20,16,0.45) 100%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-16 sm:pt-14 sm:pb-20">
          <p className="uppercase tracking-widest text-xs font-semibold text-emerald-400 mb-4">
            La marketplace africaine
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05] max-w-3xl">
            Achetez et vendez <span className="text-emerald-400">partout en Afrique</span>
          </h1>
          <p className="mt-4 text-xl sm:text-2xl font-semibold text-neutral-100 max-w-xl">
            Créez, vendez et encaissez vos produits physiques et digitaux
          </p>
          <p className="mt-6 text-lg text-neutral-300 max-w-xl">
            Mobile Money, paiement à la livraison ou carte bancaire — trouvez ce qu&apos;il vous faut auprès de
            vendeurs locaux, ou ouvrez votre boutique en quelques minutes.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#catalogue"
              className="rounded-full bg-white text-neutral-900 font-semibold px-6 py-3 hover:bg-neutral-200 transition-colors"
            >
              Explorer les produits
            </a>
            <Link
              href={user ? "/vendor/dashboard" : "/vendor/onboarding"}
              className="rounded-full border border-white/30 text-white font-semibold px-6 py-3 hover:bg-white/10 transition-colors"
            >
              Devenir vendeur
            </Link>
          </div>

          <dl className="mt-16 grid grid-cols-3 gap-6 max-w-xl border-t border-white/10 pt-8">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-2xl sm:text-3xl font-bold">{s.value}</dd>
                <dd className="text-sm text-neutral-400 mt-1">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Explorer par catégorie */}
      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-14">
          <p className="uppercase tracking-widest text-xs font-semibold text-emerald-600 mb-2">Catégories</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">Explorer par catégorie</h2>

          <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => goToCategory(c.id)}
                className="group rounded-xl border border-black/5 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 p-5 text-left"
              >
                <span className="text-3xl">{categoryIcon(c.name)}</span>
                <p className="mt-3 font-medium text-neutral-900 group-hover:text-emerald-700 transition-colors">
                  {c.name}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Vendeurs à la une */}
      {featuredVendors.length > 0 && (
        <section className="border-t border-black/5">
          <div className="max-w-6xl mx-auto px-4 py-14">
            <p className="uppercase tracking-widest text-xs font-semibold text-emerald-600 mb-2">
              Vendeurs à la une
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              Ils vendent déjà sur Global Market
            </h2>

            <div className="mt-7 flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3">
              {featuredVendors.map((v) => (
                <Link
                  key={v.id}
                  href={`/shops/${v.shopSlug}`}
                  className="group flex-shrink-0 w-64 sm:w-auto rounded-xl border border-black/5 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 p-5 flex items-center gap-4"
                >
                  <span
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${avatarColor(v.shopName)}`}
                  >
                    {initials(v.shopName)}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-900 truncate group-hover:text-emerald-700 transition-colors">
                      {v.shopName}
                    </p>
                    <p className="text-sm text-neutral-500 truncate">
                      {v.city ? `${v.city}, ` : ""}
                      {v.country}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">{v._count.products} produits</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Catalogue */}
      <div id="catalogue" className="max-w-6xl mx-auto px-4 py-10 scroll-mt-16 border-t border-black/5">
        <div className="flex flex-col sm:flex-row gap-3 mb-6 pt-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            className="flex-1 border border-black/10 rounded-full px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
          />
        </div>

        <div className="flex gap-2 flex-wrap mb-8">
          <button
            onClick={() => setCategoryId(undefined)}
            className={`px-3.5 py-1.5 rounded-full text-sm border transition-colors ${
              !categoryId
                ? "bg-emerald-600 text-white border-emerald-600"
                : "border-black/10 text-neutral-600 hover:border-emerald-600/40"
            }`}
          >
            Toutes les catégories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={`px-3.5 py-1.5 rounded-full text-sm border transition-colors ${
                categoryId === c.id
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "border-black/10 text-neutral-600 hover:border-emerald-600/40"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-neutral-500">Chargement...</p>
        ) : products.length === 0 ? (
          <p className="text-neutral-500">Aucun produit trouvé.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      {/* Pourquoi Global Market */}
      <section className="bg-neutral-50 border-y border-black/5 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <p className="uppercase tracking-widest text-xs font-semibold text-emerald-600 mb-2">
            Pourquoi Global Market
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 max-w-lg">
            Pensé pour le commerce en Afrique
          </h2>

          <div className="mt-10 grid sm:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="relative overflow-hidden rounded-xl bg-white border border-black/5 p-6"
              >
                <div
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-70"
                  style={{ background: "radial-gradient(circle, rgba(16,185,129,0.18), transparent 70%)" }}
                />
                <div className="relative">
                  <span className="text-3xl">{f.icon}</span>
                  <h3 className="mt-4 font-semibold text-neutral-900">{f.title}</h3>
                  <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignage */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="rounded-2xl bg-white border border-black/5 shadow-sm p-8 sm:p-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="text-5xl leading-none text-emerald-200 font-serif">&ldquo;</div>
          <div>
            <p className="text-lg sm:text-xl text-neutral-800 leading-relaxed">
              Depuis que j&apos;ai ouvert ma boutique sur Global Market, je vends à des clients que je n&apos;aurais
              jamais pu toucher seule. Le paiement Mobile Money a tout changé.
            </p>
            <p className="mt-4 text-sm text-neutral-500 font-medium">
              Aïcha Koné — Boutique Aïcha, Abidjan
            </p>
          </div>
        </div>
      </section>

      {/* Lancez-vous gratuitement */}
      <GetStartedSection />
    </div>
  );
}
