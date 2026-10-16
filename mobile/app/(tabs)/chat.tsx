import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";

export default function Chat() {
  return (
    <View style={styles.screen}>
      <Text style={styles.emoji}>💬</Text>
      <Text style={styles.title}>Чат скоро</Text>
      <Text style={styles.text}>
        Переписка с продавцами появится в следующем обновлении. Пока связывайтесь по телефону из
        объявления.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: colors.bg },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "800", color: colors.text, marginBottom: 8 },
  text: { fontSize: 15, color: colors.muted, textAlign: "center", lineHeight: 21 },
});
