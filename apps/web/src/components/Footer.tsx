import Link from "next/link";
import { LogoMark } from "@/components/Logo";

const COLUMNS = [
  {
    title: "Global Market",
    links: [
      { label: "Accueil", href: "/" },
      { label: "Devenir vendeur", href: "/vendor/onboarding" },
    ],
  },
  {
    title: "Acheter",
    links: [
      { label: "Mon panier", href: "/cart" },
      { label: "Mes commandes", href: "/orders" },
    ],
  },
  {
    title: "Vendre",
    links: [
      { label: "Ouvrir ma boutique", href: "/vendor/onboarding" },
      { label: "Tableau de bord", href: "/vendor/dashboard" },
    ],
  },
  {
    title: "Paiement",
    links: [
      { label: "Mobile Money", href: "#" },
      { label: "Carte bancaire", href: "#" },
      { label: "Paiement à la livraison", href: "#" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Conditions d'utilisation", href: "/policies/terms" },
      { label: "Confidentialité", href: "/policies/privacy" },
      { label: "Remboursement", href: "/policies/refund" },
      { label: "Livraison", href: "/policies/shipping" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <span className="inline-flex items-center gap-2">
              <LogoMark size={28} />
              <span className="text-white font-bold text-lg tracking-tight">
                Global <span className="text-emerald-500">Market</span>
              </span>
            </span>
            <p className="mt-3 text-sm leading-relaxed">
              La marketplace qui connecte acheteurs et vendeurs partout en Afrique.
            </p>
          </div>

          {COLUMNS.slice(1).map((col) => (
            <div key={col.title}>
              <p className="text-white text-sm font-semibold mb-3">{col.title}</p>
              <ul className="space-y-2 text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3 justify-between text-xs text-neutral-500">
          <p>&copy; {new Date().getFullYear()} Global Market. Tous droits réservés.</p>
          <p>Fait avec ❤ pour les entrepreneurs africains.</p>
        </div>
      </div>
    </footer>
  );
}
