import Link from "next/link";
import type { ReactNode } from "react";

const POLICY_LINKS = [
  { label: "Conditions d'utilisation", href: "/policies/terms" },
  { label: "Politique de confidentialité", href: "/policies/privacy" },
  { label: "Politique de remboursement", href: "/policies/refund" },
  { label: "Politique de livraison", href: "/policies/shipping" },
];

export function PolicyLayout({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <nav className="flex items-center gap-1.5 text-sm text-neutral-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-neutral-900 transition-colors">
          Accueil
        </Link>
        <span className="text-neutral-300">/</span>
        <span className="text-neutral-900 font-medium">{title}</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">{title}</h1>
      <p className="text-sm text-neutral-500 mt-2">Dernière mise à jour : {updatedAt}</p>

      <div className="mt-8 prose-policy space-y-6 text-neutral-700 leading-relaxed">{children}</div>

      <div className="mt-12 pt-6 border-t border-black/10">
        <p className="text-sm font-medium text-neutral-900 mb-3">Autres documents</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {POLICY_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-emerald-700 hover:underline">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
