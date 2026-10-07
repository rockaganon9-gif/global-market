"use client";

import type { Product } from "@global-market/shared";
import Link from "next/link";
import { formatPrice } from "@/lib/api";

export function ProductCard({
  product,
  wrapClass = "rounded-xl shadow-sm hover:shadow-lg",
  bgClass = "bg-white",
  titleClass = "text-neutral-900",
  metaClass = "text-neutral-500",
}: {
  product: Product & { vendor?: { shopName: string } };
  wrapClass?: string;
  bgClass?: string;
  titleClass?: string;
  metaClass?: string;
}) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className={`group overflow-hidden border border-black/5 hover:-translate-y-0.5 transition-all duration-200 ${bgClass} ${wrapClass}`}
    >
      <div className="relative aspect-square bg-neutral-100 flex items-center justify-center overflow-hidden">
        {product.type === "DIGITAL" && (
          <span className="absolute top-2 left-2 z-10 text-xs font-semibold bg-white/90 text-neutral-900 px-2 py-1 rounded-full">
            💾 Digital
          </span>
        )}
        {product.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-neutral-400 text-sm">Pas d&apos;image</span>
        )}
      </div>
      <div className="p-3.5">
        <p className={`text-xs truncate ${metaClass}`}>{product.vendor?.shopName}</p>
        <h3 className={`font-medium truncate mt-0.5 ${titleClass}`}>{product.title}</h3>
        <p className="text-emerald-600 font-bold mt-1.5">
          {formatPrice(product.priceCents, product.currency)}
        </p>
      </div>
    </Link>
  );
}
