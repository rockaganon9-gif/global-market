"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function VendorOnboardingPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ shopName: "", description: "", country: user?.country ?? "", city: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/vendors", form, token);
      router.push("/vendor/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-xl font-bold mb-2">Ouvrir ma boutique</h1>
      <p className="text-neutral-500 text-sm mb-6">
        Votre boutique sera examinée par notre équipe avant de pouvoir publier des produits.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required placeholder="Nom de la boutique" value={form.shopName} onChange={update("shopName")} className="w-full border border-black/10 rounded-xl px-4 py-2" />
        <textarea placeholder="Description" value={form.description} onChange={update("description")} className="w-full border border-black/10 rounded-xl px-4 py-2" rows={3} />
        <input required placeholder="Pays" value={form.country} onChange={update("country")} className="w-full border border-black/10 rounded-xl px-4 py-2" />
        <input placeholder="Ville" value={form.city} onChange={update("city")} className="w-full border border-black/10 rounded-xl px-4 py-2" />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white rounded-xl py-2 hover:bg-emerald-700 disabled:opacity-50">
          {loading ? "Création..." : "Créer ma boutique"}
        </button>
      </form>
    </div>
  );
}
