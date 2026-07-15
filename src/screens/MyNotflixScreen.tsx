import { SafeAreaView, Text } from "react-native";

export default function SettingsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: "white", fontSize: 24 }}>My Notflix</Text>
    </SafeAreaView>
  );
}