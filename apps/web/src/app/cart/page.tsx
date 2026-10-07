"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, loading, updateItem, removeItem } = useCart();
  const router = useRouter();

  const total = items.reduce((sum, i) => sum + i.product.priceCents * i.quantity, 0);
  const currency = items[0]?.product.currency ?? "XOF";

  if (!authLoading && !user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="mb-4">Connectez-vous pour voir votre panier.</p>
        <Link href="/login" className="text-emerald-700 font-medium">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Mon panier</h1>

      {loading ? (
        <p className="text-neutral-500">Chargement...</p>
      ) : items.length === 0 ? (
        <p className="text-neutral-500">Votre panier est vide.</p>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 border-b border-black/10 pb-4">
                <div className="w-16 h-16 bg-neutral-100 rounded flex-shrink-0 overflow-hidden">
                  {item.product.images?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <Link href={`/products/${item.product.slug}`} className="font-medium hover:underline">
                    {item.product.title}
                  </Link>
                  <p className="text-sm text-neutral-500">
                    {formatPrice(item.product.priceCents, item.product.currency)}
                  </p>
                </div>
                <input
                  type="number"
                  min={0}
                  value={item.quantity}
                  onChange={(e) => updateItem(item.productId, Number(e.target.value))}
                  className="w-16 border border-black/10 rounded px-2 py-1"
                />
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-red-600 text-sm hover:underline"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-lg font-semibold">Total : {formatPrice(total, currency)}</p>
            <button
              onClick={() => router.push("/checkout")}
              className="bg-emerald-600 text-white rounded-xl px-6 py-2 hover:bg-emerald-700"
            >
              Passer la commande
            </button>
          </div>
        </>
      )}
    </div>
  );
}
