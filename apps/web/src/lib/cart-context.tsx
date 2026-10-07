"use client";

import type { Product } from "@global-market/shared";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";
import { useAuth } from "./auth-context";

interface CartItemWithProduct {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

interface CartContextValue {
  items: CartItemWithProduct[];
  itemCount: number;
  loading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const cart = await api.get<{ items: CartItemWithProduct[] }>("/cart", token);
      setItems(cart.items);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addItem(productId: string, quantity = 1) {
    if (!token) throw new Error("Connectez-vous pour ajouter au panier");
    const cart = await api.post<{ items: CartItemWithProduct[] }>("/cart/items", { productId, quantity }, token);
    setItems(cart.items);
  }

  async function updateItem(productId: string, quantity: number) {
    if (!token) return;
    const cart = await api.patch<{ items: CartItemWithProduct[] }>(`/cart/items/${productId}`, { quantity }, token);
    setItems(cart.items);
  }

  async function removeItem(productId: string) {
    if (!token) return;
    const cart = await api.delete<{ items: CartItemWithProduct[] }>(`/cart/items/${productId}`, token);
    setItems(cart.items);
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, itemCount, loading, addItem, updateItem, removeItem, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans CartProvider");
  return ctx;
}
