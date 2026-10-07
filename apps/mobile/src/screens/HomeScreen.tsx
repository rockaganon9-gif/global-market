import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { Category, Paginated, Product } from "@global-market/shared";
import { api, formatPrice } from "../lib/api";

const STATS = [
  { value: "500+", label: "Vendeurs" },
  { value: "15", label: "Pays" },
  { value: "100%", label: "Mobile Money" },
];

const CATEGORY_ICONS: Record<string, string> = {
  "Mode & Vêtements": "👗",
  "Électronique": "💻",
  "Maison & Cuisine": "🏠",
  "Beauté & Santé": "💄",
  Alimentation: "🍚",
  "Téléphones & Accessoires": "📱",
  "Artisanat & Décoration": "🧺",
  "Bébé & Enfants": "🍼",
};

const AVATAR_COLORS = ["#059669", "#d97706", "#0284c7", "#e11d48", "#7c3aed", "#0d9488"];

function avatarColor(name: string) {
  const hash = name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

interface FeaturedVendor {
  id: string;
  shopName: string;
  shopSlug: string;
  country: string;
  city: string | null;
  _count: { products: number };
}

// La navigation vers l'écran ProductDetail (pile racine) est résolue à l'exécution
// par React Navigation même si ce screen vit dans le tab navigator imbriqué.
export function HomeScreen({ navigation }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredVendors, setFeaturedVendors] = useState<FeaturedVendor[]>([]);
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Category[]>("/categories").then(setCategories).catch(() => {});
    api.get<FeaturedVendor[]>("/vendors/public/featured").then(setFeaturedVendors).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoryId) params.set("categoryId", categoryId);
    if (search) params.set("q", search);

    api
      .get<Paginated<Product>>(`/products?${params.toString()}`)
      .then((res) => setProducts(res.items))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [categoryId, search]);

  const header = (
    <View>
      <LinearGradient colors={["#022c22", "#06231a", "#0a0a0a"]} style={styles.hero}>
        <Text style={styles.heroEyebrow}>LA MARKETPLACE AFRICAINE</Text>
        <Text style={styles.heroTitle}>
          Achetez et vendez <Text style={styles.heroTitleAccent}>partout en Afrique</Text>
        </Text>
        <Text style={styles.heroSubtitle}>Mobile Money, livraison ou carte bancaire.</Text>

        <View style={styles.statsRow}>
          {STATS.map((s) => (
            <View key={s.label}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.section}>
        <TextInput
          placeholder="Rechercher un produit..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
        <Pressable
          onPress={() => setCategoryId(undefined)}
          style={[styles.chip, !categoryId && styles.chipActive]}
        >
          <Text style={[styles.chipText, !categoryId && styles.chipTextActive]}>Tout</Text>
        </Pressable>
        {categories.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => setCategoryId(categoryId === c.id ? undefined : c.id)}
            style={[styles.chip, categoryId === c.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, categoryId === c.id && styles.chipTextActive]}>
              {CATEGORY_ICONS[c.name] ?? "🛍️"} {c.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {featuredVendors.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vendeurs à la une</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredVendors.map((v) => (
              <Pressable
                key={v.id}
                style={styles.vendorCard}
                onPress={() => navigation.navigate("Shop", { slug: v.shopSlug })}
              >
                <View style={[styles.avatar, { backgroundColor: avatarColor(v.shopName) }]}>
                  <Text style={styles.avatarText}>{initials(v.shopName)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={styles.vendorName}>{v.shopName}</Text>
                  <Text style={styles.vendorMeta}>{v._count.products} produits</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      <Text style={[styles.sectionTitle, styles.section]}>Produits</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          numColumns={2}
          ListHeaderComponent={header}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate("ProductDetail", { slug: item.slug })}
            >
              <View style={styles.cardImage}>
                {item.images?.[0] && <Image source={{ uri: item.images[0] }} style={styles.image} />}
              </View>
              <Text numberOfLines={1} style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardPrice}>{formatPrice(item.priceCents, item.currency)}</Text>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Aucun produit trouvé.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  hero: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 28 },
  heroEyebrow: { color: "#34d399", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  heroTitle: { color: "#fff", fontSize: 26, fontWeight: "800", marginTop: 10, lineHeight: 32 },
  heroTitleAccent: { color: "#34d399" },
  heroSubtitle: { color: "#d1d5db", marginTop: 10, fontSize: 14 },
  statsRow: { flexDirection: "row", gap: 24, marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" },
  statValue: { color: "#fff", fontSize: 18, fontWeight: "800" },
  statLabel: { color: "#9ca3af", fontSize: 11, marginTop: 2 },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10, color: "#0a0a0a" },
  search: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 999, padding: 10, paddingHorizontal: 16 },
  categoryList: { marginTop: 14, paddingHorizontal: 16 },
  chip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "#e5e5e5", marginRight: 8 },
  chipActive: { backgroundColor: "#059669", borderColor: "#059669" },
  chipText: { fontSize: 13, color: "#333" },
  chipTextActive: { color: "#fff" },
  vendorCard: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: "#eee", borderRadius: 12, padding: 10, marginRight: 10, width: 190 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  vendorName: { fontWeight: "600", fontSize: 13 },
  vendorMeta: { color: "#999", fontSize: 11, marginTop: 1 },
  grid: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  card: { flex: 1, borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 12, overflow: "hidden", marginBottom: 12 },
  cardImage: { aspectRatio: 1, backgroundColor: "#f5f5f5" },
  image: { width: "100%", height: "100%" },
  cardTitle: { paddingHorizontal: 8, paddingTop: 6, fontWeight: "500" },
  cardPrice: { paddingHorizontal: 8, paddingBottom: 8, color: "#047857", fontWeight: "600" },
  empty: { textAlign: "center", marginTop: 32, color: "#999" },
});
