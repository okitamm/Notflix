import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { IMAGE_URL } from "../../services/tmdb";

type Props = {
  backdropPath: string;
  heroHeight: number;
  zoom: Animated.Value;
  onBack: () => void;
  onTrailer: () => void;
  hasTrailer: boolean;
};

export default function HeroSection({
  backdropPath,
  heroHeight,
  zoom,
  onBack,
  onTrailer,
  hasTrailer,
}: Props) {
  return (
    <View style={{ height: heroHeight, overflow: "hidden" }}>
      <Animated.Image
        source={{ uri: IMAGE_URL + backdropPath }}
        resizeMode="cover"
        style={[
          styles.image,
          {
            height: heroHeight,
            transform: [{ scale: zoom }],
          },
        ]}
      />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.4)", "#090909"]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>

      {hasTrailer && (
        <TouchableOpacity style={styles.trailerPill} onPress={onTrailer}>
          <Ionicons name="play" size={14} color="#fff" />
          <Text style={styles.trailerPillText}>Trailer</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
  },

  backButton: {
    position: "absolute",
    top: 44,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  trailerPill: {
    position: "absolute",
    right: 16,
    bottom: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    gap: 6,
  },

  trailerPillText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
});