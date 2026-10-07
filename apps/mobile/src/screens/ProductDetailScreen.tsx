import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { Product } from "@global-market/shared";
import { api, formatPrice } from "../lib/api";
import { useAuth } from "../lib/auth-context";
import { useCart } from "../lib/cart-context";

type ProductWithVendor = Product & { vendor: { shopName: string; shopSlug: string } };

export function ProductDetailScreen({ route, navigation }: any) {
  const { slug } = route.params;
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductWithVendor | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [status, setStatus] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setActiveImage(0);
    api.get<ProductWithVendor>(`/products/${slug}`).then(setProduct).catch(() => setProduct(null));
  }, [slug]);

  async function handleAddToCart() {
    if (!user) {
      navigation.navigate("Login");
      return;
    }
    try {
      await addItem(product!.id, Number(quantity) || 1);
      setStatus("Ajouté au panier !");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Erreur");
    }
  }

  if (!product) return <View style={styles.center}><Text>Chargement...</Text></View>;

  const images = product.images ?? [];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.image}>
        {images[activeImage] && <Image source={{ uri: images[activeImage] }} style={{ width: "100%", height: "100%" }} />}
      </View>

      {images.length > 1 && (
        <View style={styles.thumbRow}>
          {images.map((img, i) => (
            <Pressable key={img + i} onPress={() => setActiveImage(i)} style={[styles.thumb, i === activeImage && styles.thumbActive]}>
              <Image source={{ uri: img }} style={{ width: "100%", height: "100%" }} />
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.content}>
        <Pressable onPress={() => navigation.navigate("Shop", { slug: product.vendor.shopSlug })}>
          <Text style={styles.vendor}>Vendu par {product.vendor.shopName}</Text>
        </Pressable>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.price}>{formatPrice(product.priceCents, product.currency)}</Text>
        <Text style={styles.description}>{product.description}</Text>
        <Text style={styles.stock}>{product.stock > 0 ? `${product.stock} en stock` : "Rupture de stock"}</Text>

        <View style={styles.row}>
          <TextInput
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
            style={styles.qtyInput}
          />
          <Pressable
            onPress={handleAddToCart}
            disabled={product.stock === 0}
            style={[styles.button, product.stock === 0 && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>Ajouter au panier</Text>
          </Pressable>
        </View>
        {status && <Text style={styles.status}>{status}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  image: { aspectRatio: 1, backgroundColor: "#f5f5f5" },
  thumbRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingTop: 10 },
  thumb: { width: 52, height: 52, borderRadius: 8, overflow: "hidden", borderWidth: 2, borderColor: "transparent" },
  thumbActive: { borderColor: "#059669" },
  content: { padding: 16 },
  vendor: { color: "#047857", fontWeight: "500" },
  title: { fontSize: 20, fontWeight: "700", marginTop: 4 },
  price: { fontSize: 20, color: "#047857", fontWeight: "700", marginTop: 8 },
  description: { color: "#555", marginTop: 12, lineHeight: 20 },
  stock: { color: "#999", marginTop: 8, fontSize: 13 },
  row: { flexDirection: "row", gap: 12, marginTop: 20, alignItems: "center" },
  qtyInput: { width: 60, borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 8, padding: 10, textAlign: "center" },
  button: { flex: 1, backgroundColor: "#059669", borderRadius: 8, padding: 12, alignItems: "center" },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "600" },
  status: { marginTop: 8, color: "#555" },
});
