import { useEffect, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { Product, Vendor } from "@global-market/shared";
import { api, formatPrice } from "../lib/api";

export function ShopScreen({ route, navigation }: any) {
  const { slug } = route.params;
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.get<Vendor>(`/vendors/${slug}`).then(setVendor).catch(() => setVendor(null));
    api.get<Product[]>(`/vendors/${slug}/products`).then(setProducts).catch(() => {});
  }, [slug]);

  if (!vendor) return <View style={styles.center}><Text>Boutique introuvable.</Text></View>;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
      data={products}
      keyExtractor={(p) => p.id}
      numColumns={2}
      columnWrapperStyle={{ gap: 12 }}
      ListHeaderComponent={
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.title}>{vendor.shopName}</Text>
          {vendor.description && <Text style={styles.description}>{vendor.description}</Text>}
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>Aucun produit pour le moment.</Text>}
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => navigation.navigate("ProductDetail", { slug: item.slug })}>
          <View style={styles.image}>
            {item.images?.[0] && <Image source={{ uri: item.images[0] }} style={{ width: "100%", height: "100%" }} />}
          </View>
          <Text numberOfLines={1} style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardPrice}>{formatPrice(item.priceCents, item.currency)}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "700" },
  description: { color: "#555", marginTop: 4 },
  empty: { textAlign: "center", marginTop: 32, color: "#999" },
  card: { flex: 1, borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 10, overflow: "hidden", marginBottom: 12 },
  image: { aspectRatio: 1, backgroundColor: "#f5f5f5" },
  cardTitle: { paddingHorizontal: 8, paddingTop: 6, fontWeight: "500" },
  cardPrice: { paddingHorizontal: 8, paddingBottom: 8, color: "#047857", fontWeight: "600" },
});
