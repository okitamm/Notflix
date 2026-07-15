import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;
  rating: number;
  year: string;
  runtime: string | null;
  genres: string;
  overview: string;
  onPlay: () => void; // <-- Added this
};

export default function InfoSection({
  title,
  rating,
  year,
  runtime,
  genres,
  overview,
  onPlay, // <-- Added this
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.meta}>
        ⭐ {rating.toFixed(1)} • {year}
        {runtime ? ` • ${runtime}` : ""}
      </Text>

      {!!genres && <Text style={styles.genres}>{genres}</Text>}

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.playButton} onPress={onPlay}>
          <Ionicons name="play" size={20} color="#000" />
          <Text style={styles.playText}>Play</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.listButton}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.listText}>My List</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.heading}>Overview</Text>

      <Text style={styles.overview}>{overview}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 10 },
  title: { color: "#fff", fontSize: 30, fontWeight: "800" },
  meta: { marginTop: 8, color: "#B3B3B3", fontSize: 14 },
  genres: { marginTop: 5, color: "#8E8E8E", fontSize: 13 },
  buttons: { flexDirection: "row", gap: 12, marginTop: 22 },
  playButton: { flex: 1, height: 48, backgroundColor: "#fff", borderRadius: 12, justifyContent: "center", alignItems: "center", flexDirection: "row" },
  playText: { marginLeft: 6, color: "#000", fontWeight: "700", fontSize: 16 },
  listButton: { flex: 1, height: 48, backgroundColor: "#232323", borderRadius: 12, justifyContent: "center", alignItems: "center", flexDirection: "row" },
  listText: { marginLeft: 6, color: "#fff", fontWeight: "600", fontSize: 15 },
  heading: { color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 28, marginBottom: 10 },
  overview: { color: "#D0D0D0", fontSize: 14, lineHeight: 22 },
});