import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { COUNTRIES } from "@global-market/shared";
import { CountryPicker } from "../components/CountryPicker";
import { Logo } from "../components/Logo";
import { useAuth } from "../lib/auth-context";

export function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [countryName, setCountryName] = useState("");
  const [dialCode, setDialCode] = useState("");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!countryCode || !dialCode) {
      setError("Merci de choisir votre pays.");
      return;
    }
    setLoading(true);
    try {
      await register({
        fullName,
        email,
        password,
        country: countryName,
        phone: `${dialCode}${phoneLocal.replace(/^0+/, "")}`,
      });
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
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
          <Text style={styles.bannerText}>Rejoignez des milliers d&apos;acheteurs et de vendeurs.</Text>
        </LinearGradient>

        <View style={styles.form}>
          <Text style={styles.title}>Créer un compte</Text>
          <TextInput placeholder="Nom complet" value={fullName} onChangeText={setFullName} style={styles.input} />
          <TextInput
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />

          <View style={styles.countryFieldWrap}>
            <CountryPicker
              label="Choisir votre pays"
              mode="country"
              value={countryCode}
              displayValue={countryName ? `${COUNTRIES.find((c) => c.code === countryCode)?.flag} ${countryName}` : ""}
              onSelect={(c) => {
                setCountryCode(c.code);
                setCountryName(c.name);
                setDialCode(c.dial);
              }}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.dialFieldWrap}>
              <CountryPicker
                label="Indicatif"
                mode="dial"
                value={dialCode}
                displayValue={dialCode}
                onSelect={(c) => setDialCode(c.dial)}
              />
            </View>
            <TextInput
              placeholder="Numéro de téléphone"
              keyboardType="phone-pad"
              value={phoneLocal}
              onChangeText={setPhoneLocal}
              style={[styles.input, styles.phoneField]}
            />
          </View>

          <TextInput
            placeholder="Mot de passe (min. 6 caractères)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <Pressable onPress={handleSubmit} disabled={loading} style={[styles.button, loading && { opacity: 0.5 }]}>
            <Text style={styles.buttonText}>{loading ? "Création..." : "Créer mon compte"}</Text>
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
  countryFieldWrap: { marginBottom: 10 },
  row: { flexDirection: "row", gap: 8, marginBottom: 10 },
  dialFieldWrap: { width: 110, flexShrink: 0 },
  phoneField: { flex: 1, marginBottom: 0 },
  error: { color: "#dc2626", marginBottom: 10 },
  button: { backgroundColor: "#0a0a0a", borderRadius: 999, padding: 14, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "600" },
});
