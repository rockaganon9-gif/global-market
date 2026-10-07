import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth-context";

export function VendorOnboardingScreen({ navigation }: any) {
  const { token, user } = useAuth();
  const [form, setForm] = useState({ shopName: "", description: "", country: user?.country ?? "", city: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form) {
    return (value: string) => setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      await api.post("/vendors", form, token);
      navigation.replace("VendorDashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ouvrir ma boutique</Text>
      <Text style={styles.subtitle}>Votre boutique sera examinée avant de pouvoir publier des produits.</Text>
      <TextInput placeholder="Nom de la boutique" value={form.shopName} onChangeText={update("shopName")} style={styles.input} />
      <TextInput placeholder="Description" value={form.description} onChangeText={update("description")} style={styles.input} multiline />
      <TextInput placeholder="Pays" value={form.country} onChangeText={update("country")} style={styles.input} />
      <TextInput placeholder="Ville" value={form.city} onChangeText={update("city")} style={styles.input} />
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable onPress={handleSubmit} disabled={loading} style={[styles.button, loading && { opacity: 0.5 }]}>
        <Text style={styles.buttonText}>{loading ? "Création..." : "Créer ma boutique"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { color: "#999", marginTop: 4, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 8, padding: 12, marginBottom: 10 },
  error: { color: "#dc2626", marginBottom: 10 },
  button: { backgroundColor: "#059669", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "600" },
});
