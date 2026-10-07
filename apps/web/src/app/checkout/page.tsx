"use client";

import type { Order, PaymentMethod } from "@global-market/shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; hint: string }[] = [
  { value: "MOBILE_MONEY", label: "Mobile Money", hint: "Orange Money, MTN MoMo, Airtel Money..." },
  { value: "CARD", label: "Carte bancaire", hint: "Visa / Mastercard" },
  { value: "CASH_ON_DELIVERY", label: "Paiement à la livraison", hint: "Payez en espèces à la réception" },
];

export default function CheckoutPage() {
  const { token } = useAuth();
  const { items, refresh } = useCart();
  const router = useRouter();

  const [address, setAddress] = useState({ fullName: "", phone: "", country: "", city: "", addressLine: "" });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MOBILE_MONEY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasPhysical = items.some((i) => i.product.type !== "DIGITAL");
  const hasDigital = items.some((i) => i.product.type === "DIGITAL");
  const paymentOptions = hasDigital ? PAYMENT_OPTIONS.filter((o) => o.value !== "CASH_ON_DELIVERY") : PAYMENT_OPTIONS;

  useEffect(() => {
    if (hasDigital && paymentMethod === "CASH_ON_DELIVERY") {
      setPaymentMethod("MOBILE_MONEY");
    }
  }, [hasDigital, paymentMethod]);

  function update(field: keyof typeof address) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setAddress((a) => ({ ...a, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const order = await api.post<Order>(
        "/orders",
        { paymentMethod, shippingAddress: hasPhysical ? address : undefined },
        token,
      );
      await refresh();

      if (paymentMethod === "CASH_ON_DELIVERY") {
        router.push(`/orders?created=${order.id}`);
        return;
      }

      const { paymentLink } = await api.post<{ paymentLink: string }>(
        "/payments/initialize",
        { orderId: order.id },
        token,
      );
      window.location.href = paymentLink;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la commande");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return <div className="max-w-2xl mx-auto px-4 py-12 text-center text-neutral-500">Votre panier est vide.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Finaliser la commande</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {hasPhysical ? (
          <div>
            <h2 className="font-medium mb-3">Adresse de livraison</h2>
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="Nom complet" value={address.fullName} onChange={update("fullName")} className="col-span-2 border border-black/10 rounded-xl px-4 py-2" />
              <input required placeholder="Téléphone" value={address.phone} onChange={update("phone")} className="border border-black/10 rounded-xl px-4 py-2" />
              <input required placeholder="Pays" value={address.country} onChange={update("country")} className="border border-black/10 rounded-xl px-4 py-2" />
              <input required placeholder="Ville" value={address.city} onChange={update("city")} className="border border-black/10 rounded-xl px-4 py-2" />
              <input required placeholder="Adresse détaillée" value={address.addressLine} onChange={update("addressLine")} className="border border-black/10 rounded-xl px-4 py-2" />
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-emerald-50 border border-emerald-600/20 px-4 py-3 text-sm text-emerald-800">
            💾 Panier 100% digital — aucune adresse requise. Votre lien de téléchargement sera disponible dans
            « Mes commandes » dès le paiement confirmé.
          </div>
        )}

        <div>
          <h2 className="font-medium mb-3">Mode de paiement</h2>
          <div className="space-y-2">
            {paymentOptions.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer ${
                  paymentMethod === opt.value ? "border-emerald-600 bg-emerald-50" : "border-black/10"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === opt.value}
                  onChange={() => setPaymentMethod(opt.value)}
                />
                <div>
                  <p className="font-medium">{opt.label}</p>
                  <p className="text-sm text-neutral-500">{opt.hint}</p>
                </div>
              </label>
            ))}
          </div>
          {hasDigital && (
            <p className="text-xs text-neutral-400 mt-2">
              Le paiement à la livraison n&apos;est pas disponible pour un panier contenant un produit digital.
            </p>
          )}
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white rounded-xl py-3 font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Traitement..." : "Confirmer la commande"}
        </button>
      </form>
    </div>
  );
}
