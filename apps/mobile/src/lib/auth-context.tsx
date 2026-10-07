import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "@global-market/shared";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";

type VendorInfo = { shopSlug: string; status: "PENDING" | "APPROVED" | "SUSPENDED" } | null;

interface AuthContextValue {
  user: (User & { vendor?: VendorInfo }) | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; phone: string; password: string; fullName: string; country: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "gm_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(TOKEN_KEY).then(async (stored) => {
      if (stored) {
        setToken(stored);
        try {
          setUser(await api.get("/auth/me", stored));
        } catch {
          await AsyncStorage.removeItem(TOKEN_KEY);
          setToken(null);
        }
      }
      setLoading(false);
    });
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post<{ token: string }>("/auth/login", { email, password });
    await AsyncStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(await api.get("/auth/me", res.token));
  }

  async function register(data: { email: string; phone: string; password: string; fullName: string; country: string }) {
    const res = await api.post<{ token: string }>("/auth/register", data);
    await AsyncStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(await api.get("/auth/me", res.token));
  }

  async function logout() {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
