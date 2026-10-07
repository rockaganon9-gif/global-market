import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { Category, Product } from "@global-market/shared";
import { api, formatPrice } from "../lib/api";
import { useAuth } from "../lib/auth-context";

interface OrderItemWithOrder {
  id: string;
  title: string;
  quantity: number;
  order: { id: string; status: string; createdAt: string };
}

export function VendorDashboardScreen({ navigation }: any) {
  const { user, token } = useAuth();
  const vendor = user?.vendor;
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItemWithOrder[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    type: "PHYSICAL" as "PHYSICAL" | "DIGITAL",
    digitalFileUrl: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!token || vendor?.status !== "APPROVED") return;
    api.get<Product[]>("/products/mine/list", token).then(setProducts).catch(() => {});
    api.get<Category[]>("/categories").then(setCategories).catch(() => {});
    api.get<OrderItemWithOrder[]>("/orders/vendor/mine", token).then(setOrderItems).catch(() => {});
  }, [token, vendor?.status]);

  async function handleCreate() {
    setError(null);
    setCreating(true);
    try {
      const product = await api.post<Product>(
        "/products",
        {
          title: form.title,
          description: form.description,
          priceCents: Math.round(Number(form.price) * 100),
          type: form.type,
          stock: form.type === "DIGITAL" ? 0 : Number(form.stock),
          digitalFileUrl: form.type === "DIGITAL" ? form.digitalFileUrl : undefined,
          categoryId: form.categoryId,
          images: [],
        },
        token,
      );
      setProducts((prev) => [product, ...prev]);
      setForm({ title: "", description: "", price: "", stock: "", categoryId: "", type: "PHYSICAL", digitalFileUrl: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setCreating(false);
    }
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Se connecter</Text>
        </Pressable>
      </View>
    );
  }

  if (!vendor) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 12 }}>Vous n'avez pas encore de boutique.</Text>
        <Pressable style={styles.button} onPress={() => navigation.navigate("VendorOnboarding")}>
          <Text style={styles.buttonText}>Ouvrir ma boutique</Text>
        </Pressable>
      </View>
    );
  }

  if (vendor.status === "PENDING") {
    return (
      <View style={styles.center}>
        <Text style={styles.pendingTitle}>Boutique en attente d'approbation</Text>
        <Text style={styles.pendingText}>Votre boutique est en cours d'examen par notre équipe.</Text>
      </View>
    );
  }

  if (vendor.status === "SUSPENDED") {
    return (
      <View style={styles.center}>
        <Text style={[styles.pendingTitle, { color: "#dc2626" }]}>Boutique suspendue</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.sectionTitle}>Ajouter un produit</Text>

      <View style={styles.typeRow}>
        <Pressable
          onPress={() => setForm((f) => ({ ...f, type: "PHYSICAL" }))}
          style={[styles.typeButton, form.type === "PHYSICAL" && styles.typeButtonActive]}
        >
          <Text style={[styles.typeButtonText, form.type === "PHYSICAL" && styles.typeButtonTextActive]}>
            📦 Produit physique
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setForm((f) => ({ ...f, type: "DIGITAL" }))}
          style={[styles.typeButton, form.type === "DIGITAL" && styles.typeButtonActive]}
        >
          <Text style={[styles.typeButtonText, form.type === "DIGITAL" && styles.typeButtonTextActive]}>
            💾 Produit digital
          </Text>
        </Pressable>
      </View>

      <TextInput placeholder="Titre" value={form.title} onChangeText={(v) => setForm((f) => ({ ...f, title: v }))} style={styles.input} />
      <TextInput placeholder="Description" value={form.description} onChangeText={(v) => setForm((f) => ({ ...f, description: v }))} style={styles.input} multiline />
      <TextInput placeholder="Prix" keyboardType="numeric" value={form.price} onChangeText={(v) => setForm((f) => ({ ...f, price: v }))} style={styles.input} />
      {form.type === "PHYSICAL" ? (
        <TextInput placeholder="Stock" keyboardType="numeric" value={form.stock} onChangeText={(v) => setForm((f) => ({ ...f, stock: v }))} style={styles.input} />
      ) : (
        <>
          <TextInput
            placeholder="Lien de téléchargement (Google Drive, Dropbox...)"
            keyboardType="url"
            autoCapitalize="none"
            value={form.digitalFileUrl}
            onChangeText={(v) => setForm((f) => ({ ...f, digitalFileUrl: v }))}
            style={styles.input}
          />
          <Text style={styles.hint}>
            Ce lien n&apos;est jamais visible publiquement — révélé à l&apos;acheteur qu&apos;après paiement confirmé.
          </Text>
        </>
      )}

      <View style={styles.categoryRow}>
        {categories.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => setForm((f) => ({ ...f, categoryId: c.id }))}
            style={[styles.chip, form.categoryId === c.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, form.categoryId === c.id && styles.chipTextActive]}>{c.name}</Text>
          </Pressable>
        ))}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable onPress={handleCreate} disabled={creating} style={[styles.button, creating && { opacity: 0.5 }]}>
        <Text style={styles.buttonText}>{creating ? "Création..." : "Publier le produit"}</Text>
      </Pressable>

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Mes produits ({products.length})</Text>
      {products.map((p) => (
        <View key={p.id} style={styles.listRow}>
          <Text style={{ fontWeight: "500" }}>
            {p.type === "DIGITAL" ? "💾 " : ""}
            {p.title}
          </Text>
          <Text style={{ color: "#999", fontSize: 13 }}>
            {formatPrice(p.priceCents, p.currency)}
            {p.type === "PHYSICAL" ? ` · Stock ${p.stock}` : " · Digital"}
          </Text>
        </View>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Commandes reçues</Text>
      {orderItems.length === 0 && <Text style={{ color: "#999" }}>Aucune commande pour le moment.</Text>}
      {orderItems.map((item) => (
        <View key={item.id} style={styles.listRow}>
          <Text style={{ fontWeight: "500" }}>{item.quantity} x {item.title}</Text>
          <Text style={{ color: "#999", fontSize: 13 }}>Commande #{item.order.id.slice(-8)} · {item.order.status}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  link: { color: "#047857", fontWeight: "600" },
  pendingTitle: { fontSize: 17, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  pendingText: { color: "#999", textAlign: "center" },
  sectionTitle: { fontWeight: "700", marginBottom: 10, fontSize: 16 },
  input: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 8, padding: 12, marginBottom: 10 },
  hint: { color: "#999", fontSize: 12, marginTop: -6, marginBottom: 10 },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  typeButton: { flex: 1, borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  typeButtonActive: { backgroundColor: "#059669", borderColor: "#059669" },
  typeButtonText: { fontSize: 13, fontWeight: "600", color: "#333" },
  typeButtonTextActive: { color: "#fff" },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "#e5e5e5" },
  chipActive: { backgroundColor: "#059669", borderColor: "#059669" },
  chipText: { fontSize: 13 },
  chipTextActive: { color: "#fff" },
  error: { color: "#dc2626", marginBottom: 10 },
  button: { backgroundColor: "#059669", borderRadius: 8, padding: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
  listRow: { borderWidth: 1, borderColor: "#f0f0f0", borderRadius: 8, padding: 10, marginBottom: 8 },
});
