"use client";

import type { AdminStats, Payout, PlatformSettings, Vendor } from "@global-market/shared";
import { Fragment, useEffect, useState } from "react";
import { api, formatPrice } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function AdminPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [rateInput, setRateInput] = useState("");
  const [savingRate, setSavingRate] = useState(false);
  const [rateSaved, setRateSaved] = useState(false);

  const [payoutFormVendorId, setPayoutFormVendorId] = useState<string | null>(null);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutNote, setPayoutNote] = useState("");
  const [payoutSaving, setPayoutSaving] = useState(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  function loadStats() {
    api.get<AdminStats>("/admin/stats", token).then(setStats).catch(() => {});
    api.get<Payout[]>("/admin/payouts", token).then(setPayouts).catch(() => {});
  }

  useEffect(() => {
    if (user?.role !== "ADMIN" || !token) return;
    api.get<Vendor[]>("/vendors", token).then(setVendors).catch(() => {});
    loadStats();
    api
      .get<PlatformSettings>("/admin/settings", token)
      .then((s) => setRateInput(String(s.commissionRate)))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  async function updateStatus(id: string, status: Vendor["status"]) {
    const updated = await api.patch<Vendor>(`/vendors/${id}/status`, { status }, token);
    setVendors((prev) => prev.map((v) => (v.id === id ? updated : v)));
  }

  async function saveRate(e: React.FormEvent) {
    e.preventDefault();
    setSavingRate(true);
    setRateSaved(false);
    try {
      await api.patch<PlatformSettings>("/admin/settings", { commissionRate: Number(rateInput) }, token);
      setRateSaved(true);
      setTimeout(() => setRateSaved(false), 2000);
    } finally {
      setSavingRate(false);
    }
  }

  function openPayoutForm(vendorId: string, remainingCents: number) {
    setPayoutFormVendorId(vendorId);
    setPayoutAmount(String(Math.max(0, remainingCents) / 100));
    setPayoutNote("");
    setPayoutError(null);
  }

  async function submitPayout(vendorId: string) {
    setPayoutError(null);
    const amountCents = Math.round(Number(payoutAmount) * 100);
    if (!amountCents || amountCents <= 0) {
      setPayoutError("Montant invalide");
      return;
    }
    setPayoutSaving(true);
    try {
      await api.post("/admin/payouts", { vendorId, amountCents, note: payoutNote || undefined }, token);
      setPayoutFormVendorId(null);
      loadStats();
    } catch (err) {
      setPayoutError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setPayoutSaving(false);
    }
  }

  if (authLoading) return <div className="max-w-4xl mx-auto px-4 py-12">Chargement...</div>;

  if (user?.role !== "ADMIN") {
    return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-neutral-500">Accès réservé aux administrateurs.</div>;
  }

  const currency = stats?.currency ?? "XOF";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
      <div>
        <h1 className="text-xl font-bold mb-6">Revenus</h1>

        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div className="rounded-xl border border-black/10 p-4">
            <p className="text-xs text-neutral-500">Chiffre d&apos;affaires encaissé</p>
            <p className="text-xl font-bold mt-1">{formatPrice(stats?.totalRevenueCents ?? 0, currency)}</p>
          </div>
          <div className="rounded-xl border border-emerald-600/30 bg-emerald-50 p-4">
            <p className="text-xs text-emerald-700">Ma commission</p>
            <p className="text-xl font-bold mt-1 text-emerald-700">
              {formatPrice(stats?.totalCommissionCents ?? 0, currency)}
            </p>
          </div>
          <div className="rounded-xl border border-black/10 p-4">
            <p className="text-xs text-neutral-500">Reste à reverser</p>
            <p className="text-xl font-bold mt-1">{formatPrice(stats?.totalRemainingCents ?? 0, currency)}</p>
          </div>
        </div>
        <p className="text-xs text-neutral-500 mb-6">
          Déjà reversé : {formatPrice(stats?.totalPaidOutCents ?? 0, currency)} sur{" "}
          {formatPrice(stats?.totalPayoutCents ?? 0, currency)} dus au total.
        </p>

        <form onSubmit={saveRate} className="flex items-center gap-3 mb-8">
          <label className="text-sm text-neutral-600">Taux de commission plateforme</label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={rateInput}
            onChange={(e) => setRateInput(e.target.value)}
            className="w-24 border border-black/10 rounded-lg px-3 py-1.5"
          />
          <span className="text-sm text-neutral-500">%</span>
          <button
            type="submit"
            disabled={savingRate}
            className="bg-neutral-900 text-white text-sm rounded-full px-4 py-1.5 hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {savingRate ? "..." : "Enregistrer"}
          </button>
          {rateSaved && <span className="text-sm text-emerald-600">Mis à jour ✓</span>}
        </form>

        <h2 className="font-semibold mb-3">Par boutique</h2>
        {!stats || stats.vendors.length === 0 ? (
          <p className="text-neutral-500 text-sm">Aucune vente encaissée pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-neutral-500 border-b border-black/10">
                  <th className="py-2 pr-4">Boutique</th>
                  <th className="py-2 pr-4">Ventes</th>
                  <th className="py-2 pr-4">Ma commission</th>
                  <th className="py-2 pr-4">Déjà reversé</th>
                  <th className="py-2 pr-4">Reste dû</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {stats.vendors.map((v) => (
                  <Fragment key={v.vendorId}>
                    <tr className="border-b border-black/5">
                      <td className="py-2 pr-4 font-medium">{v.shopName}</td>
                      <td className="py-2 pr-4">{formatPrice(v.salesCents, currency)}</td>
                      <td className="py-2 pr-4 text-emerald-700">{formatPrice(v.commissionCents, currency)}</td>
                      <td className="py-2 pr-4 text-neutral-500">{formatPrice(v.paidOutCents, currency)}</td>
                      <td className="py-2 pr-4 font-medium">{formatPrice(v.remainingCents, currency)}</td>
                      <td className="py-2">
                        {v.remainingCents > 0 && (
                          <button
                            onClick={() => openPayoutForm(v.vendorId, v.remainingCents)}
                            className="text-xs bg-neutral-900 text-white rounded-full px-3 py-1.5 hover:bg-emerald-600 transition-colors"
                          >
                            Reverser
                          </button>
                        )}
                      </td>
                    </tr>
                    {payoutFormVendorId === v.vendorId && (
                      <tr className="bg-neutral-50">
                        <td colSpan={6} className="py-3 px-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              value={payoutAmount}
                              onChange={(e) => setPayoutAmount(e.target.value)}
                              className="w-32 border border-black/10 rounded-lg px-3 py-1.5"
                            />
                            <span className="text-neutral-500 text-xs">{currency}</span>
                            <input
                              placeholder="Note (optionnel, ex: virement du 16/09)"
                              value={payoutNote}
                              onChange={(e) => setPayoutNote(e.target.value)}
                              className="flex-1 min-w-[180px] border border-black/10 rounded-lg px-3 py-1.5"
                            />
                            <button
                              onClick={() => submitPayout(v.vendorId)}
                              disabled={payoutSaving}
                              className="text-sm bg-emerald-600 text-white rounded-full px-4 py-1.5 hover:bg-emerald-700 disabled:opacity-50"
                            >
                              Confirmer
                            </button>
                            <button
                              onClick={() => setPayoutFormVendorId(null)}
                              className="text-sm text-neutral-500 px-2"
                            >
                              Annuler
                            </button>
                          </div>
                          {payoutError && <p className="text-red-600 text-xs mt-2">{payoutError}</p>}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Historique des reversements</h2>
        {payouts.length === 0 ? (
          <p className="text-neutral-500 text-sm">Aucun reversement enregistré pour le moment.</p>
        ) : (
          <div className="space-y-2">
            {payouts.map((p) => (
              <div key={p.id} className="flex justify-between items-center border border-black/10 rounded-xl px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{p.vendor?.shopName ?? "Boutique"}</p>
                  <p className="text-neutral-500 text-xs mt-0.5">
                    {new Date(p.createdAt).toLocaleDateString("fr-FR")} {p.note ? `— ${p.note}` : ""}
                  </p>
                </div>
                <p className="font-semibold">{formatPrice(p.amountCents, p.currency)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="text-xl font-bold mb-6">Boutiques</h1>
        <div className="space-y-3">
          {vendors.map((v) => (
            <div key={v.id} className="flex justify-between items-center border border-black/10 rounded-xl px-4 py-3">
              <div>
                <p className="font-medium">{v.shopName}</p>
                <p className="text-sm text-neutral-500">{v.country}{v.city ? `, ${v.city}` : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-neutral-100">{v.status}</span>
                {v.status !== "APPROVED" && (
                  <button onClick={() => updateStatus(v.id, "APPROVED")} className="text-sm bg-emerald-600 text-white rounded px-3 py-1.5 hover:bg-emerald-700">
                    Approuver
                  </button>
                )}
                {v.status !== "SUSPENDED" && (
                  <button onClick={() => updateStatus(v.id, "SUSPENDED")} className="text-sm bg-red-600 text-white rounded px-3 py-1.5 hover:bg-red-700">
                    Suspendre
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
