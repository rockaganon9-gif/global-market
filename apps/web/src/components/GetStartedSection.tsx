"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function GetStartedSection() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({ email, marketing: optIn ? "1" : "0" });
    router.push(`/register?${params.toString()}`);
  }

  return (
    <section className="relative overflow-hidden bg-neutral-950 text-white">
      <div className="absolute inset-0">
        <div
          className="animate-aurora-1 absolute -top-24 -left-24 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-50"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.45), transparent 70%)" }}
        />
        <div
          className="animate-aurora-2 absolute -bottom-32 -right-16 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-40"
          style={{ background: "radial-gradient(circle, rgba(5,150,105,0.4), transparent 70%)" }}
        />
        <div
          className="animate-aurora-3 absolute top-1/3 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle, rgba(52,211,153,0.35), transparent 70%)" }}
        />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-20 sm:py-24 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Votre activité commence avec Global Market
        </h2>
        <p className="mt-4 text-neutral-300 max-w-lg mx-auto">
          Achetez gratuitement. Vendez et ne payez qu&apos;une petite commission sur vos ventes — sans frais fixes
          ni abonnement.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre adresse e-mail"
            className="flex-1 rounded-full px-5 py-3 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            type="submit"
            className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold px-6 py-3 transition-colors whitespace-nowrap"
          >
            Lancez-vous gratuitement
          </button>
        </form>

        <label className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-400 cursor-pointer">
          <input
            type="checkbox"
            checked={optIn}
            onChange={(e) => setOptIn(e.target.checked)}
            className="rounded border-neutral-600 bg-transparent"
          />
          Vous acceptez de recevoir des e-mails marketing.
        </label>
      </div>
    </section>
  );
}
