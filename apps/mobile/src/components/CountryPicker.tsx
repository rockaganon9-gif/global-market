import { Picker } from "@react-native-picker/picker";
import type { Country } from "@global-market/shared";
import { COUNTRIES } from "@global-market/shared";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

interface Props {
  label: string;
  value: string;
  displayValue: string;
  mode: "country" | "dial";
  onSelect: (country: Country) => void;
}

// Sur iOS, le Picker natif n'affiche sa molette qu'à l'intérieur d'une modale.
// Sur Android, il s'ouvre directement en dialogue au clic.
export function CountryPicker({ label, value, displayValue, mode, onSelect }: Props) {
  const [modalVisible, setModalVisible] = useState(false);

  const picker = (
    <Picker
      selectedValue={value}
      onValueChange={(itemValue) => {
        const country = COUNTRIES.find((c) => (mode === "country" ? c.code === itemValue : c.dial === itemValue));
        if (country) onSelect(country);
      }}
    >
      <Picker.Item label={`Choisir : ${label}`} value="" enabled={false} />
      {COUNTRIES.map((c) => (
        <Picker.Item
          key={c.code}
          label={mode === "country" ? `${c.flag} ${c.name}` : `${c.flag} ${c.dial}`}
          value={mode === "country" ? c.code : c.dial}
        />
      ))}
    </Picker>
  );

  if (Platform.OS === "android") {
    return <View style={styles.androidWrap}>{picker}</View>;
  }

  return (
    <>
      <Pressable style={styles.field} onPress={() => setModalVisible(true)}>
        <Text style={value ? styles.fieldText : styles.fieldPlaceholder}>
          {value ? displayValue : label}
        </Text>
      </Pressable>
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Pressable style={styles.modalDone} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalDoneText}>OK</Text>
            </Pressable>
            {picker}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 12, padding: 12, justifyContent: "center" },
  fieldText: { color: "#0a0a0a" },
  fieldPlaceholder: { color: "#999" },
  androidWrap: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 12, overflow: "hidden" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.3)" },
  modalSheet: { backgroundColor: "#fff", borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalDone: { alignItems: "flex-end", padding: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  modalDoneText: { color: "#059669", fontWeight: "700" },
});
