import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>vexogarage.co.uk</Text>
      <Text style={styles.title}>Vexo Garage</Text>
      <Text style={styles.subtitle}>
        Mobile workspace ready — Expo + Supabase.
      </Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1F2A",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  eyebrow: {
    color: "#8FCBB8",
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 12,
    fontWeight: "600",
  },
  title: {
    color: "#F4F7F5",
    fontSize: 40,
    fontWeight: "700",
    marginBottom: 12,
  },
  subtitle: {
    color: "#B7C4BE",
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320,
  },
});
