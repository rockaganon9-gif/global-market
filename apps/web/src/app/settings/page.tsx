"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { user, token, loading: authLoading, refreshUser, logout } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName);
    setPhone(user.phone);
    setCountry(user.country);
  }, [user]);

  const inputClass =
    "w-full border border-black/10 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600";

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileSaved(false);
    setSavingProfile(true);
    try {
      await api.patch("/auth/me", { fullName, phone, country }, token);
      await refreshUser();
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSaved(false);
    setSavingPassword(true);
    try {
      await api.patch("/auth/me/password", { currentPassword, newPassword }, token);
      setCurrentPassword("");
      setNewPassword("");
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2500);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Erreur lors du changement de mot de passe");
    } finally {
      setSavingPassword(false);
    }
  }

  if (authLoading) return <div className="max-w-2xl mx-auto px-4 py-12">Chargement...</div>;

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="mb-4">Connectez-vous pour accéder à vos paramètres.</p>
        <Link href="/login" className="text-emerald-700 font-medium">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">
      <h1 className="text-xl font-bold">Paramètres du compte</h1>

      <section>
        <h2 className="font-semibold mb-3">Informations personnelles</h2>
        <form onSubmit={saveProfile} className="space-y-4 border border-black/10 rounded-xl p-4">
          <div>
            <label className="text-sm text-neutral-500 mb-1 block">Nom complet</label>
            <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-sm text-neutral-500 mb-1 block">Email</label>
            <input value={user.email} disabled className={`${inputClass} bg-neutral-50 text-neutral-400`} />
            <p className="text-xs text-neutral-400 mt-1">L&apos;email ne peut pas être modifié pour le moment.</p>
          </div>
          <div>
            <label className="text-sm text-neutral-500 mb-1 block">Téléphone</label>
            <input required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-sm text-neutral-500 mb-1 block">Pays</label>
            <input required value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
          </div>
          {profileError && <p className="text-red-600 text-sm">{profileError}</p>}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={savingProfile}
              className="bg-neutral-900 text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {savingProfile ? "Enregistrement..." : "Enregistrer"}
            </button>
            {profileSaved && <span className="text-sm text-emerald-600">Mis à jour ✓</span>}
          </div>
        </form>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Mot de passe</h2>
        <form onSubmit={savePassword} className="space-y-4 border border-black/10 rounded-xl p-4">
          <div>
            <label className="text-sm text-neutral-500 mb-1 block">Mot de passe actuel</label>
            <input
              required
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm text-neutral-500 mb-1 block">Nouveau mot de passe</label>
            <input
              required
              type="password"
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          {passwordError && <p className="text-red-600 text-sm">{passwordError}</p>}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={savingPassword}
              className="bg-neutral-900 text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {savingPassword ? "Enregistrement..." : "Changer le mot de passe"}
            </button>
            {passwordSaved && <span className="text-sm text-emerald-600">Mis à jour ✓</span>}
          </div>
        </form>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Session</h2>
        <button
          onClick={logout}
          className="text-sm text-red-600 border border-red-200 rounded-full px-5 py-2 hover:bg-red-50 transition-colors"
        >
          Se déconnecter
        </button>
      </section>
    </div>
  );
}
