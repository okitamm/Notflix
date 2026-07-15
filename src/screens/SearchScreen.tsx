import { SafeAreaView, Text } from "react-native";

export default function SearchScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: "white", fontSize: 24 }}>Search</Text>
    </SafeAreaView>
  );
}