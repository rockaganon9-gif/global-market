import type { ReactNode } from "react";
import { LogoMark } from "@/components/Logo";

const HIGHLIGHTS = [
  "Paiement Mobile Money, carte ou à la livraison",
  "Des vendeurs vérifiés partout en Afrique",
  "Ouvrez votre boutique en quelques minutes",
];

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid lg:grid-cols-2 min-h-[calc(100vh-57px)]">
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-neutral-950 text-white p-12">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(60% 60% at 15% 20%, rgba(16,185,129,0.35), transparent 60%), radial-gradient(50% 50% at 85% 80%, rgba(5,150,105,0.30), transparent 60%), linear-gradient(135deg, #022c22 0%, #06231a 45%, #0a0a0a 100%)",
          }}
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2">
            <LogoMark size={28} />
            <span className="font-bold text-lg tracking-tight">
              Global <span className="text-emerald-400">Market</span>
            </span>
          </span>
          <h2 className="mt-16 text-3xl xl:text-4xl font-bold tracking-tight leading-[1.1] max-w-sm">
            La marketplace qui connecte l&apos;Afrique
          </h2>
        </div>
        <ul className="relative space-y-4">
          {HIGHLIGHTS.map((h) => (
            <li key={h} className="flex items-start gap-3 text-neutral-300">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{title}</h1>
          <p className="mt-1.5 text-neutral-500 text-sm">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
