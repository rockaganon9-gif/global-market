"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";

export function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 bg-white/80 backdrop-blur-md z-10 transition-shadow duration-200 ${
        scrolled ? "shadow-[0_1px_12px_rgba(0,0,0,0.08)] border-b border-transparent" : "border-b border-black/5"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 py-3.5">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="flex items-center gap-5 text-sm text-neutral-700">
          <Link href="/" className="hover:text-neutral-950 transition-colors hidden sm:inline">
            Accueil
          </Link>
          <Link href="/cart" className="relative hover:text-neutral-950 transition-colors">
            Panier
            {itemCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-emerald-600 text-white text-xs w-5 h-5">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link href="/orders" className="hover:text-neutral-950 transition-colors hidden sm:inline">
                Mes commandes
              </Link>
              {user.role === "VENDOR" ? (
                <Link href="/vendor/dashboard" className="hover:text-neutral-950 transition-colors hidden sm:inline">
                  Ma boutique
                </Link>
              ) : (
                <Link href="/vendor/onboarding" className="hover:text-neutral-950 transition-colors hidden sm:inline">
                  Devenir vendeur
                </Link>
              )}
              {user.role === "ADMIN" && (
                <Link href="/admin" className="hover:text-neutral-950 transition-colors hidden sm:inline">
                  Admin
                </Link>
              )}
              <Link href="/settings" className="hover:text-neutral-950 transition-colors hidden sm:inline">
                Paramètres
              </Link>
              <button onClick={logout} className="text-neutral-400 hover:text-neutral-950 transition-colors">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-neutral-950 transition-colors">
                Connexion
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-neutral-900 text-white px-4 py-2 font-medium hover:bg-emerald-600 transition-colors"
              >
                Créer un compte
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
