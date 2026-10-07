"use client";

import type { Product } from "@global-market/shared";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, formatPrice } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";

type ProductWithVendor = Product & {
  vendor: { shopName: string; shopSlug: string };
  category?: { name: string; slug: string };
};

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductWithVendor | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setActiveImage(0);
    api
      .get<ProductWithVendor>(`/products/${slug}`)
      .then(setProduct)
      .catch(() => setProduct(null));
  }, [slug]);

  async function handleAddToCart() {
    if (!user) {
      router.push("/login");
      return;
    }
    setStatus(null);
    try {
      await addItem(product!.id, quantity);
      setStatus("Ajouté au panier !");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Erreur");
    }
  }

  if (!product) return <div className="max-w-6xl mx-auto px-4 py-12">Chargement...</div>;

  const images = product.images?.length ? product.images : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-neutral-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-neutral-900 transition-colors">
          Accueil
        </Link>
        {product.category && (
          <>
            <span className="text-neutral-300">/</span>
            <span>{product.category.name}</span>
          </>
        )}
        <span className="text-neutral-300">/</span>
        <span className="text-neutral-900 font-medium truncate max-w-[200px]">{product.title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-neutral-100 rounded-xl overflow-hidden flex items-center justify-center">
            {images.length ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={images[activeImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-neutral-400">Pas d&apos;image</span>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === activeImage ? "border-emerald-600" : "border-transparent hover:border-black/10"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-neutral-500">
            Vendu par{" "}
            <Link href={`/shops/${product.vendor.shopSlug}`} className="text-emerald-700 font-medium">
              {product.vendor.shopName}
            </Link>
          </p>
          <h1 className="text-2xl font-bold mt-1 flex items-center gap-2">
            {product.title}
            {product.type === "DIGITAL" && (
              <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                💾 Digital
              </span>
            )}
          </h1>
          <p className="text-2xl text-emerald-700 font-semibold mt-3">
            {formatPrice(product.priceCents, product.currency)}
          </p>
          <p className="text-neutral-600 mt-4 whitespace-pre-line">{product.description}</p>
          <p className="text-sm text-neutral-500 mt-2">
            {product.type === "DIGITAL"
              ? "Livraison instantanée par téléchargement après paiement"
              : product.stock > 0
                ? `${product.stock} en stock`
                : "Rupture de stock"}
          </p>

          <div className="flex items-center gap-3 mt-6">
            <input
              type="number"
              min={1}
              max={product.type === "PHYSICAL" ? product.stock : undefined}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-20 border border-black/10 rounded-xl px-3 py-2"
            />
            <button
              onClick={handleAddToCart}
              disabled={product.type === "PHYSICAL" && product.stock === 0}
              className="bg-emerald-600 text-white rounded-xl px-6 py-2 hover:bg-emerald-700 disabled:opacity-50"
            >
              Ajouter au panier
            </button>
          </div>
          {status && <p className="text-sm mt-2 text-neutral-600">{status}</p>}
        </div>
      </div>
    </div>
  );
}
