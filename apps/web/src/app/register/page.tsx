"use client";

import { COUNTRIES } from "@global-market/shared";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { CountrySelect } from "@/components/CountrySelect";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [dialCode, setDialCode] = useState("");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleCountryChange(code: string) {
    setCountryCode(code);
    const country = COUNTRIES.find((c) => c.code === code);
    if (country) setDialCode(country.dial);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const country = COUNTRIES.find((c) => c.code === countryCode);
    if (!country || !dialCode) {
      setError("Merci de choisir votre pays.");
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName,
        email,
        password,
        country: country.name,
        phone: `${dialCode}${phoneLocal.replace(/^0+/, "")}`,
      });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full border border-black/10 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600";

  return (
    <AuthLayout title="Créer un compte" subtitle="Rejoignez des milliers d'acheteurs et de vendeurs.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          placeholder="Nom complet"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={inputClass}
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />

        <CountrySelect mode="country" value={countryCode} placeholder="Choisir votre pays" onSelect={(c) => handleCountryChange(c.code)} />

        <div className="flex gap-2">
          <CountrySelect
            mode="dial"
            value={dialCode}
            placeholder="Indicatif"
            onSelect={(c) => setDialCode(c.dial)}
            className="flex items-center gap-2 border border-black/10 rounded-xl px-3 py-2.5 bg-white w-32 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
          />
          <input
            required
            type="tel"
            inputMode="tel"
            placeholder="Numéro de téléphone"
            value={phoneLocal}
            onChange={(e) => setPhoneLocal(e.target.value)}
            className={`${inputClass} flex-1`}
          />
        </div>

        <input
          type="password"
          required
          minLength={6}
          placeholder="Mot de passe (min. 6 caractères)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-neutral-900 text-white rounded-full py-2.5 font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </form>
      <p className="text-sm text-neutral-500 mt-6">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-emerald-700 font-medium">
          Se connecter
        </Link>
      </p>
    </AuthLayout>
  );
}
