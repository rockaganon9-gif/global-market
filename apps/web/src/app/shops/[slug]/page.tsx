"use client";

import type { Product, Vendor } from "@global-market/shared";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { api } from "@/lib/api";
import { getShopTheme } from "@/lib/shop-themes";

export default function ShopPage() {
  const { slug } = useParams<{ slug: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.get<Vendor>(`/vendors/${slug}`).then(setVendor).catch(() => setVendor(null));
    api.get<Product[]>(`/vendors/${slug}/products`).then(setProducts).catch(() => {});
  }, [slug]);

  if (!vendor) return <div className="max-w-6xl mx-auto px-4 py-12">Boutique introuvable.</div>;

  const theme = getShopTheme(vendor.theme?.slug);

  return (
    <div className={theme.pageClass}>
      <div className={theme.heroClass}>
        <div className="max-w-6xl mx-auto px-4">
          <p className={`mb-2 ${theme.eyebrowClass}`}>Boutique</p>
          <h1 className={`text-2xl sm:text-3xl font-bold ${theme.titleClass}`}>{vendor.shopName}</h1>
          {vendor.description && <p className={`mt-2 max-w-xl ${theme.descriptionClass}`}>{vendor.description}</p>}
          <p className={`text-sm mt-2 ${theme.metaClass}`}>
            {vendor.country}
            {vendor.city ? `, ${vendor.city}` : ""}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <p className="text-neutral-500">Aucun produit pour le moment.</p>
        ) : (
          <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 ${theme.gridGapClass}`}>
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                wrapClass={theme.card.wrapClass}
                bgClass={theme.card.bgClass}
                titleClass={theme.card.titleClass}
                metaClass={theme.card.metaClass}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
