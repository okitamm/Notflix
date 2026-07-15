import { Animated, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import YoutubePlayer from "react-native-youtube-iframe";

type Props = {
  visible: boolean;
  trailerKey?: string;
  width: number;
  onClose: () => void;
};

export default function TrailerPopup({
  visible,
  trailerKey,
  width,
  onClose,
}: Props) {
  const scale = new Animated.Value(0.92);
  const opacity = new Animated.Value(0);

  if (!visible || !trailerKey) return null;

  Animated.parallel([
    Animated.timing(opacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }),
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }),
  ]).start();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
        },
      ]}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <Animated.View
        style={[
          styles.card,
          {
            width: width * 0.92,
            transform: [{ scale }],
          },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <YoutubePlayer
          width={width * 0.92}
          height={(width * 0.92) * 0.5625}
          play
          videoId={trailerKey}
          initialPlayerParams={{
            modestbranding: true,
            rel: false,
          }}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.82)",
  },

  card: {
    backgroundColor: "#111",
    borderRadius: 22,
    overflow: "hidden",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",

    elevation: 30,

    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 30,
    shadowOffset: {
      width: 0,
      height: 12,
    },
  },

  header: {
    alignItems: "flex-end",
    padding: 14,
  },
});