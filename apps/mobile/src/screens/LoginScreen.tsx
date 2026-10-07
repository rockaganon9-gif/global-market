import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Logo } from "../components/Logo";
import { useAuth } from "../lib/auth-context";

export function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient colors={["#022c22", "#06231a", "#0a0a0a"]} style={styles.banner}>
          {navigation.canGoBack() && (
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Retour</Text>
            </Pressable>
          )}
          <Logo light size={26} />
          <Text style={styles.bannerText}>Content de vous revoir sur Global Market.</Text>
        </LinearGradient>

        <View style={styles.form}>
          <Text style={styles.title}>Connexion</Text>
          <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} />
          <TextInput placeholder="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
          {error && <Text style={styles.error}>{error}</Text>}
          <Pressable onPress={handleSubmit} disabled={loading} style={[styles.button, loading && { opacity: 0.5 }]}>
            <Text style={styles.buttonText}>{loading ? "Connexion..." : "Se connecter"}</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text style={styles.link}>Créer un compte</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  banner: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 },
  backButton: { marginBottom: 20 },
  backButtonText: { color: "#d1d5db", fontSize: 14 },
  bannerText: { color: "#d1d5db", marginTop: 16, fontSize: 15, lineHeight: 21, maxWidth: 260 },
  form: { flex: 1, padding: 24, paddingTop: 28 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 20, color: "#0a0a0a" },
  input: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 12, padding: 12, marginBottom: 10 },
  error: { color: "#dc2626", marginBottom: 10 },
  button: { backgroundColor: "#0a0a0a", borderRadius: 999, padding: 14, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "600" },
  link: { color: "#047857", textAlign: "center", marginTop: 16, fontWeight: "500" },
});
