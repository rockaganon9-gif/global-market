import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../lib/auth-context";

export function AccountScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <View style={styles.center}>
        <Pressable style={styles.button} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.buttonText}>Connexion</Text>
        </Pressable>
        <Pressable style={styles.buttonOutline} onPress={() => navigation.navigate("Register")}>
          <Text style={styles.buttonOutlineText}>Créer un compte</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user.fullName}</Text>
      <Text style={styles.email}>{user.email}</Text>

      {user.role === "VENDOR" ? (
        <Pressable style={styles.row} onPress={() => navigation.navigate("VendorDashboard")}>
          <Text style={styles.rowText}>Ma boutique</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.row} onPress={() => navigation.navigate("VendorOnboarding")}>
          <Text style={styles.rowText}>Devenir vendeur</Text>
        </Pressable>
      )}

      <Pressable style={styles.row} onPress={logout}>
        <Text style={[styles.rowText, { color: "#dc2626" }]}>Déconnexion</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 16 },
  name: { fontSize: 18, fontWeight: "700" },
  email: { color: "#999", marginBottom: 20 },
  row: { paddingVertical: 14, borderBottomWidth: 1, borderColor: "#f0f0f0" },
  rowText: { fontSize: 15 },
  button: { backgroundColor: "#059669", borderRadius: 8, padding: 14, width: "100%", alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
  buttonOutline: { borderWidth: 1, borderColor: "#059669", borderRadius: 8, padding: 14, width: "100%", alignItems: "center" },
  buttonOutlineText: { color: "#059669", fontWeight: "600" },
});
