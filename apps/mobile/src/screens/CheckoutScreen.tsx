import { useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { Order, PaymentMethod } from "@global-market/shared";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth-context";
import { useCart } from "../lib/cart-context";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; hint: string }[] = [
  { value: "MOBILE_MONEY", label: "Mobile Money", hint: "Orange Money, MTN MoMo, Airtel Money..." },
  { value: "CARD", label: "Carte bancaire", hint: "Visa / Mastercard" },
  { value: "CASH_ON_DELIVERY", label: "Paiement à la livraison", hint: "Payez en espèces à la réception" },
];

export function CheckoutScreen({ navigation }: any) {
  const { token } = useAuth();
  const { refresh } = useCart();

  const [address, setAddress] = useState({ fullName: "", phone: "", country: "", city: "", addressLine: "" });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MOBILE_MONEY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof typeof address) {
    return (value: string) => setAddress((a) => ({ ...a, [field]: value }));
  }

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      const order = await api.post<Order>("/orders", { paymentMethod, shippingAddress: address }, token);
      await refresh();

      if (paymentMethod === "CASH_ON_DELIVERY") {
        navigation.navigate("MainTabs", { screen: "Orders" });
        return;
      }

      const { paymentLink } = await api.post<{ paymentLink: string }>(
        "/payments/initialize",
        { orderId: order.id },
        token,
      );
      await Linking.openURL(paymentLink);
      navigation.navigate("MainTabs", { screen: "Orders" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la commande");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.sectionTitle}>Adresse de livraison</Text>
      <TextInput placeholder="Nom complet" value={address.fullName} onChangeText={update("fullName")} style={styles.input} />
      <TextInput placeholder="Téléphone" value={address.phone} onChangeText={update("phone")} style={styles.input} />
      <TextInput placeholder="Pays" value={address.country} onChangeText={update("country")} style={styles.input} />
      <TextInput placeholder="Ville" value={address.city} onChangeText={update("city")} style={styles.input} />
      <TextInput placeholder="Adresse détaillée" value={address.addressLine} onChangeText={update("addressLine")} style={styles.input} />

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Mode de paiement</Text>
      {PAYMENT_OPTIONS.map((opt) => (
        <Pressable
          key={opt.value}
          onPress={() => setPaymentMethod(opt.value)}
          style={[styles.option, paymentMethod === opt.value && styles.optionActive]}
        >
          <Text style={styles.optionLabel}>{opt.label}</Text>
          <Text style={styles.optionHint}>{opt.hint}</Text>
        </Pressable>
      ))}

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable onPress={handleSubmit} disabled={loading} style={[styles.submit, loading && { opacity: 0.5 }]}>
        <Text style={styles.submitText}>{loading ? "Traitement..." : "Confirmer la commande"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  sectionTitle: { fontWeight: "600", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 8, padding: 12, marginBottom: 10 },
  option: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 8, padding: 12, marginBottom: 8 },
  optionActive: { borderColor: "#059669", backgroundColor: "#ecfdf5" },
  optionLabel: { fontWeight: "600" },
  optionHint: { color: "#999", fontSize: 13, marginTop: 2 },
  error: { color: "#dc2626", marginTop: 8 },
  submit: { backgroundColor: "#059669", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 16 },
  submitText: { color: "#fff", fontWeight: "600" },
});
