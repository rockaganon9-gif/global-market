import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <LinearGradient
      colors={["#10b981", "#047857"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.mark, { width: size, height: size, borderRadius: size * 0.3 }]}
    >
      <Text style={[styles.markText, { fontSize: size * 0.4 }]}>GM</Text>
    </LinearGradient>
  );
}

export function Logo({ size = 28, light = false }: { size?: number; light?: boolean }) {
  return (
    <View style={styles.row}>
      <LogoMark size={size} />
      <Text style={[styles.wordmark, light && styles.wordmarkLight]}>
        Global <Text style={styles.wordmarkAccent}>Market</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  mark: { alignItems: "center", justifyContent: "center" },
  markText: { color: "#fff", fontWeight: "800" },
  wordmark: { fontSize: 17, fontWeight: "700", color: "#0a0a0a" },
  wordmarkLight: { color: "#fff" },
  wordmarkAccent: { color: "#10b981" },
});
