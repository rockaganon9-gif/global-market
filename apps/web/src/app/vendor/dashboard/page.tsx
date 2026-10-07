"use client";

import type { Category, Product, Theme, ThemePurchase, VendorOwnRevenue } from "@global-market/shared";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, formatPrice } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const THEME_SWATCH: Record<string, string> = {
  classic: "bg-emerald-600",
  minimal: "bg-gradient-to-br from-white to-neutral-300 border border-black/10",
  vibrant: "bg-gradient-to-br from-fuchsia-600 via-pink-500 to-orange-400",
  prestige: "bg-gradient-to-br from-neutral-950 to-neutral-800",
  "boutique-pro": "bg-gradient-to-br from-neutral-100 to-neutral-300 border border-black/20",
};

interface OrderItemWithOrder {
  id: string;
  title: string;
  priceCents: number;
  quantity: number;
  order: { id: string; status: string; createdAt: string; currency: string };
}

export default function VendorDashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItemWithOrder[]>([]);
  const [revenue, setRevenue] = useState<VendorOwnRevenue | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [themePurchases, setThemePurchases] = useState<ThemePurchase[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [themeActionId, setThemeActionId] = useState<string | null>(null);
  const [themeError, setThemeError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    imageUrl: "",
    type: "PHYSICAL" as "PHYSICAL" | "DIGITAL",
    digitalFileUrl: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const vendor = user?.vendor;

  useEffect(() => {
    if (!token || vendor?.status !== "APPROVED") return;
    api.get<Product[]>("/products/mine/list", token).then(setProducts).catch(() => {});
    api.get<Category[]>("/categories").then(setCategories).catch(() => {});
    api.get<OrderItemWithOrder[]>("/orders/vendor/mine", token).then(setOrderItems).catch(() => {});
    api.get<VendorOwnRevenue>("/vendors/me/revenue", token).then(setRevenue).catch(() => {});
    api.get<Theme[]>("/themes").then(setThemes).catch(() => {});
    api.get<ThemePurchase[]>("/vendors/me/theme-purchases", token).then(setThemePurchases).catch(() => {});
  }, [token, vendor?.status]);

  useEffect(() => {
    setActiveThemeId(vendor?.themeId ?? null);
  }, [vendor?.themeId]);

  async function activateTheme(themeId: string) {
    setThemeError(null);
    setThemeActionId(themeId);
    try {
      await api.patch("/vendors/me/theme", { themeId }, token);
      setActiveThemeId(themeId);
    } catch (err) {
      setThemeError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setThemeActionId(null);
    }
  }

  async function buyTheme(themeId: string) {
    setThemeError(null);
    setThemeActionId(themeId);
    try {
      const { paymentLink } = await api.post<{ paymentLink: string }>(
        "/payments/theme/initialize",
        { themeId },
        token,
      );
      window.location.href = paymentLink;
    } catch (err) {
      setThemeError(err instanceof Error ? err.message : "Erreur");
      setThemeActionId(null);
    }
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const product = await api.post<Product>(
        "/products",
        {
          title: form.title,
          description: form.description,
          priceCents: Math.round(Number(form.price) * 100),
          type: form.type,
          stock: form.type === "DIGITAL" ? 0 : Number(form.stock),
          digitalFileUrl: form.type === "DIGITAL" ? form.digitalFileUrl : undefined,
          categoryId: form.categoryId,
          images: form.imageUrl ? [form.imageUrl] : [],
        },
        token,
      );
      setProducts((prev) => [product, ...prev]);
      setForm({ title: "", description: "", price: "", stock: "", categoryId: "", imageUrl: "", type: "PHYSICAL", digitalFileUrl: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création du produit");
    } finally {
      setCreating(false);
    }
  }

  if (authLoading) return <div className="max-w-4xl mx-auto px-4 py-12">Chargement...</div>;

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <Link href="/login" className="text-emerald-700 font-medium">Se connecter</Link>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="mb-4">Vous n&apos;avez pas encore de boutique.</p>
        <Link href="/vendor/onboarding" className="bg-emerald-600 text-white rounded-xl px-6 py-2 hover:bg-emerald-700">
          Ouvrir ma boutique
        </Link>
      </div>
    );
  }

  if (vendor.status === "PENDING") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-bold mb-2">Boutique en attente d&apos;approbation</h1>
        <p className="text-neutral-500">
          Votre boutique est en cours d&apos;examen par notre équipe. Vous pourrez publier des produits dès son
          approbation.
        </p>
      </div>
    );
  }

  if (vendor.status === "SUSPENDED") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-bold mb-2 text-red-600">Boutique suspendue</h1>
        <p className="text-neutral-500">Contactez le support pour plus d&apos;informations.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      <h1 className="text-xl font-bold">Tableau de bord vendeur</h1>

      {revenue && (
        <section>
          <h2 className="font-semibold mb-3">Mes revenus</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-3">
            <div className="rounded-xl border border-black/10 p-4">
              <p className="text-xs text-neutral-500">Ventes totales</p>
              <p className="text-xl font-bold mt-1">{formatPrice(revenue.salesCents, revenue.currency)}</p>
            </div>
            <div className="rounded-xl border border-black/10 p-4">
              <p className="text-xs text-neutral-500">Déjà reçu</p>
              <p className="text-xl font-bold mt-1">{formatPrice(revenue.paidOutCents, revenue.currency)}</p>
            </div>
            <div className="rounded-xl border border-emerald-600/30 bg-emerald-50 p-4">
              <p className="text-xs text-emerald-700">Reste à recevoir</p>
              <p className="text-xl font-bold mt-1 text-emerald-700">
                {formatPrice(revenue.remainingCents, revenue.currency)}
              </p>
            </div>
          </div>
          <p className="text-xs text-neutral-500 mb-3">
            Commission Global Market déjà déduite : {formatPrice(revenue.commissionCents, revenue.currency)}
          </p>
          {revenue.payouts.length > 0 && (
            <div className="space-y-1.5">
              {revenue.payouts.map((p) => (
                <div key={p.id} className="flex justify-between text-sm border-b border-black/5 py-1.5">
                  <span className="text-neutral-500">
                    {new Date(p.createdAt).toLocaleDateString("fr-FR")} {p.note ? `— ${p.note}` : ""}
                  </span>
                  <span className="font-medium">{formatPrice(p.amountCents, p.currency)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="font-semibold mb-1">Thème de ma boutique</h2>
        <p className="text-sm text-neutral-500 mb-4">
          Choisissez l&apos;apparence de votre page publique.{" "}
          <Link href={`/shops/${vendor.shopSlug}`} target="_blank" className="text-emerald-700 font-medium">
            Voir ma boutique ↗
          </Link>
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {themes.map((t) => {
            const owned = !t.isPremium || themePurchases.some((p) => p.themeId === t.id);
            const isActive = activeThemeId === t.id;
            const busy = themeActionId === t.id;
            return (
              <div key={t.id} className={`border rounded-xl overflow-hidden ${isActive ? "border-emerald-600 ring-1 ring-emerald-600" : "border-black/10"}`}>
                <div className={`h-16 ${THEME_SWATCH[t.slug] ?? "bg-neutral-200"}`} />
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{t.name}</p>
                    {t.isPremium && (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">{t.description}</p>
                  <p className="text-sm font-semibold mt-2">
                    {t.isPremium ? formatPrice(t.priceCents, "XOF") : "Gratuit"}
                  </p>
                  <div className="mt-3">
                    {isActive ? (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full inline-block">
                        ✓ Thème actif
                      </span>
                    ) : owned ? (
                      <button
                        onClick={() => activateTheme(t.id)}
                        disabled={busy}
                        className="text-sm bg-neutral-900 text-white rounded-full px-4 py-1.5 hover:bg-emerald-600 transition-colors disabled:opacity-50"
                      >
                        {busy ? "..." : "Choisir"}
                      </button>
                    ) : (
                      <button
                        onClick={() => buyTheme(t.id)}
                        disabled={busy}
                        className="text-sm bg-amber-600 text-white rounded-full px-4 py-1.5 hover:bg-amber-700 transition-colors disabled:opacity-50"
                      >
                        {busy ? "..." : `Acheter — ${formatPrice(t.priceCents, "XOF")}`}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {themeError && <p className="text-red-600 text-sm mt-3">{themeError}</p>}
      </section>

      <section>
        <h2 className="font-semibold mb-3">Ajouter un produit</h2>
        <form onSubmit={handleCreateProduct} className="grid sm:grid-cols-2 gap-3 border border-black/10 rounded-xl p-4">
          <div className="sm:col-span-2 flex gap-2">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, type: "PHYSICAL" }))}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium border ${form.type === "PHYSICAL" ? "bg-emerald-600 text-white border-emerald-600" : "border-black/10 text-neutral-600"}`}
            >
              📦 Produit physique
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, type: "DIGITAL" }))}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium border ${form.type === "DIGITAL" ? "bg-emerald-600 text-white border-emerald-600" : "border-black/10 text-neutral-600"}`}
            >
              💾 Produit digital
            </button>
          </div>
          <input required placeholder="Titre" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="border border-black/10 rounded-xl px-3 py-2 sm:col-span-2" />
          <textarea required placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="border border-black/10 rounded-xl px-3 py-2 sm:col-span-2" rows={3} />
          <input required type="number" min={0} step="0.01" placeholder="Prix" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="border border-black/10 rounded-xl px-3 py-2" />
          {form.type === "PHYSICAL" ? (
            <input required type="number" min={0} placeholder="Stock" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} className="border border-black/10 rounded-xl px-3 py-2" />
          ) : (
            <div className="border border-dashed border-black/10 rounded-xl px-3 py-2 text-sm text-neutral-400 flex items-center">
              Livraison illimitée par téléchargement
            </div>
          )}
          <select required value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} className="border border-black/10 rounded-xl px-3 py-2 sm:col-span-2">
            <option value="">Choisir une catégorie</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {form.type === "DIGITAL" && (
            <input
              required
              type="url"
              placeholder="Lien de téléchargement (Google Drive, Dropbox...)"
              value={form.digitalFileUrl}
              onChange={(e) => setForm((f) => ({ ...f, digitalFileUrl: e.target.value }))}
              className="border border-black/10 rounded-xl px-3 py-2 sm:col-span-2"
            />
          )}
          <input placeholder="URL de l'image" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} className="border border-black/10 rounded-xl px-3 py-2 sm:col-span-2" />
          {form.type === "DIGITAL" && (
            <p className="sm:col-span-2 text-xs text-neutral-400">
              Ce lien n&apos;est jamais visible publiquement — il n&apos;est révélé à l&apos;acheteur qu&apos;après paiement confirmé.
            </p>
          )}
          {error && <p className="text-red-600 text-sm sm:col-span-2">{error}</p>}
          <button type="submit" disabled={creating} className="sm:col-span-2 bg-emerald-600 text-white rounded-xl py-2 hover:bg-emerald-700 disabled:opacity-50">
            {creating ? "Création..." : "Publier le produit"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Mes produits ({products.length})</h2>
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className="flex justify-between items-center border border-black/10 rounded-xl px-4 py-2">
              <div>
                <p className="font-medium">
                  {p.type === "DIGITAL" && <span className="mr-1.5">💾</span>}
                  {p.title}
                </p>
                <p className="text-sm text-neutral-500">
                  {formatPrice(p.priceCents, p.currency)}
                  {p.type === "PHYSICAL" ? ` · Stock : ${p.stock}` : " · Digital"}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
                {p.isActive ? "En ligne" : "Désactivé"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Commandes reçues</h2>
        <div className="space-y-2">
          {orderItems.length === 0 && <p className="text-neutral-500 text-sm">Aucune commande pour le moment.</p>}
          {orderItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center border border-black/10 rounded-xl px-4 py-2">
              <div>
                <p className="font-medium">{item.quantity} x {item.title}</p>
                <p className="text-sm text-neutral-500">
                  Commande #{item.order.id.slice(-8)} · {new Date(item.order.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-neutral-100">{item.order.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
