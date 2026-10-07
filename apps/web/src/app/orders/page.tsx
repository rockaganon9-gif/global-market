"use client";

import type { Order } from "@global-market/shared";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, formatPrice } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const STATUS_LABEL: Record<Order["status"], string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export default function OrdersPage() {
  const { token, user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api
      .get<Order[]>("/orders", token)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [token]);

  if (!authLoading && !user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="mb-4">Connectez-vous pour voir vos commandes.</p>
        <Link href="/login" className="text-emerald-700 font-medium">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Mes commandes</h1>

      {loading ? (
        <p className="text-neutral-500">Chargement...</p>
      ) : orders.length === 0 ? (
        <p className="text-neutral-500">Vous n&apos;avez pas encore de commande.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-black/10 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Commande #{order.id.slice(-8)}</p>
                  <p className="text-sm text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <span className="text-sm px-2 py-1 rounded-full bg-neutral-100">
                  {STATUS_LABEL[order.status]}
                </span>
              </div>
              <ul className="text-sm text-neutral-600 mt-2 space-y-1">
                {order.items.map((item) => (
                  <li key={item.productId} className="flex items-center justify-between gap-2">
                    <span>
                      {item.quantity} x {item.title}
                    </span>
                    {item.downloadUrl && (
                      <a
                        href={item.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold bg-emerald-600 text-white rounded-full px-3 py-1 hover:bg-emerald-700 transition-colors flex-shrink-0"
                      >
                        💾 Télécharger
                      </a>
                    )}
                    {item.productType === "DIGITAL" && !item.downloadUrl && (
                      <span className="text-xs text-neutral-400 flex-shrink-0">
                        Disponible après paiement
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="font-semibold mt-2">{formatPrice(order.totalCents, order.currency)}</p>
              <p className="text-sm text-neutral-500">
                Paiement : {order.paymentStatus === "PAID" ? "Payé" : "En attente"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
