"use client";

import type { User } from "@global-market/shared";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";

interface AuthContextValue {
  user: (User & { vendor?: { shopSlug: string; status: string; themeId?: string | null } | null }) | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; phone: string; password: string; fullName: string; country: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("gm_token");
    if (stored) {
      setToken(stored);
      api
        .get<AuthContextValue["user"]>("/auth/me", stored)
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("gm_token");
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post<{ token: string }>("/auth/login", { email, password });
    localStorage.setItem("gm_token", res.token);
    setToken(res.token);
    setUser(await api.get("/auth/me", res.token));
  }

  async function register(data: { email: string; phone: string; password: string; fullName: string; country: string }) {
    const res = await api.post<{ token: string }>("/auth/register", data);
    localStorage.setItem("gm_token", res.token);
    setToken(res.token);
    setUser(await api.get("/auth/me", res.token));
  }

  function logout() {
    localStorage.removeItem("gm_token");
    setToken(null);
    setUser(null);
  }

  async function refreshUser() {
    if (!token) return;
    setUser(await api.get("/auth/me", token));
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
