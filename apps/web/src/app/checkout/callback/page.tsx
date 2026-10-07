"use client";

import Link from "next/link";

export default function CheckoutCallbackPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <h1 className="text-xl font-bold mb-3">Paiement en cours de traitement</h1>
      <p className="text-neutral-600 mb-6">
        Nous confirmons votre paiement. Cela peut prendre quelques instants. Vous pouvez suivre le statut de
        votre commande dans &quot;Mes commandes&quot;.
      </p>
      <Link href="/orders" className="bg-emerald-600 text-white rounded-xl px-6 py-2 hover:bg-emerald-700">
        Voir mes commandes
      </Link>
    </div>
  );
}
