import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { formatPrice } from "../lib/api";
import { useAuth } from "../lib/auth-context";
import { useCart } from "../lib/cart-context";

export function CartScreen({ navigation }: any) {
  const { user, loading: authLoading } = useAuth();
  const { items, updateItem, removeItem } = useCart();

  const total = items.reduce((sum, i) => sum + i.product.priceCents * i.quantity, 0);
  const currency = items[0]?.product.currency ?? "XOF";

  if (!authLoading && !user) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 12 }}>Connectez-vous pour voir votre panier.</Text>
        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Se connecter</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>Votre panier est vide.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.thumb}>
              {item.product.images?.[0] && (
                <Image source={{ uri: item.product.images[0] }} style={{ width: "100%", height: "100%" }} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.product.title}</Text>
              <Text style={styles.itemPrice}>{formatPrice(item.product.priceCents, item.product.currency)}</Text>
            </View>
            <TextInput
              keyboardType="numeric"
              defaultValue={String(item.quantity)}
              onEndEditing={(e) => updateItem(item.productId, Number(e.nativeEvent.text) || 0)}
              style={styles.qtyInput}
            />
            <Pressable onPress={() => removeItem(item.productId)}>
              <Text style={styles.remove}>Suppr.</Text>
            </Pressable>
          </View>
        )}
      />

      {items.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.total}>Total : {formatPrice(total, currency)}</Text>
          <Pressable style={styles.checkoutButton} onPress={() => navigation.navigate("Checkout")}>
            <Text style={styles.checkoutText}>Passer la commande</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  link: { color: "#047857", fontWeight: "600" },
  empty: { textAlign: "center", marginTop: 32, color: "#999" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderColor: "#f0f0f0", paddingBottom: 12, marginBottom: 12 },
  thumb: { width: 56, height: 56, backgroundColor: "#f5f5f5", borderRadius: 6, overflow: "hidden" },
  itemTitle: { fontWeight: "500" },
  itemPrice: { color: "#999", fontSize: 13 },
  qtyInput: { width: 44, borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 6, padding: 6, textAlign: "center" },
  remove: { color: "#dc2626", fontSize: 13 },
  footer: { padding: 16, borderTopWidth: 1, borderColor: "#f0f0f0" },
  total: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  checkoutButton: { backgroundColor: "#059669", borderRadius: 8, padding: 14, alignItems: "center" },
  checkoutText: { color: "#fff", fontWeight: "600" },
});
