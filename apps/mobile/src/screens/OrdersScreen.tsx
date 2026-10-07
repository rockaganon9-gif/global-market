import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import type { Order } from "@global-market/shared";
import { api, formatPrice } from "../lib/api";
import { useAuth } from "../lib/auth-context";

const STATUS_LABEL: Record<Order["status"], string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export function OrdersScreen({ navigation }: any) {
  const { token, user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.get<Order[]>("/orders", token).then(setOrders).finally(() => setLoading(false));
  }, [token]);

  if (!authLoading && !user) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 12 }}>Connectez-vous pour voir vos commandes.</Text>
        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Se connecter</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
      data={orders}
      keyExtractor={(o) => o.id}
      refreshing={loading}
      ListEmptyComponent={<Text style={styles.empty}>Vous n'avez pas encore de commande.</Text>}
      renderItem={({ item: order }) => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.orderId}>Commande #{order.id.slice(-8)}</Text>
            <Text style={styles.status}>{STATUS_LABEL[order.status]}</Text>
          </View>
          {order.items.map((item) => (
            <Text key={item.productId} style={styles.item}>{item.quantity} x {item.title}</Text>
          ))}
          <Text style={styles.total}>{formatPrice(order.totalCents, order.currency)}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  link: { color: "#047857", fontWeight: "600" },
  empty: { textAlign: "center", marginTop: 32, color: "#999" },
  card: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 10, padding: 12, marginBottom: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  orderId: { fontWeight: "600" },
  status: { color: "#555", fontSize: 13 },
  item: { color: "#555", fontSize: 13 },
  total: { fontWeight: "700", marginTop: 6, color: "#047857" },
});
