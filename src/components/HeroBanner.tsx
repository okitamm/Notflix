import { useEffect, useRef } from "react";
import {
  Animated,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { IMAGE_URL } from "../services/tmdb";
import { Movie } from "../types/Movie";

type Props = {
  movie: Movie | null;
};

export default function HeroBanner({ movie }: Props) {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<any>();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!movie) return;

    opacity.setValue(0);

    Animated.timing(opacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [movie?.id]);

  if (!movie) return null;

  const heroHeight = Math.min(width * 0.75, 420);
  const year = (movie.release_date || movie.first_air_date || "").slice(0, 4);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          const item = movie as any;
          navigation.navigate("Details", {
            id: item.id,
            mediaType: item.media_type || "movie",
          });
        }}
      >
        <Animated.View style={{ opacity }}>
          <ImageBackground
            source={{ uri: IMAGE_URL + movie.backdrop_path }}
            style={[styles.heroImage, { height: heroHeight }]}
            resizeMode="cover"
          >
            <LinearGradient
              colors={[
                "transparent",
                "rgba(0,0,0,0.05)",
                "rgba(0,0,0,0.20)",
                "#090909",
              ]}
              style={styles.gradient}
            />
          </ImageBackground>

          <View style={styles.textContent}>
            <Text numberOfLines={1} style={styles.title}>
              {movie.title || movie.name}
            </Text>

            <Text style={styles.meta}>
              ⭐ {movie.vote_average.toFixed(1)} • {year}
            </Text>
          </View>
        </Animated.View>
      </TouchableOpacity>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.playButton}
          activeOpacity={0.8}
          onPress={() => {
            const item = movie as any;
            navigation.navigate("Player", {
              id: item.id,
              mediaType: item.media_type || "movie",
              title: item.title || item.name || "Unknown Title",
            });
          }}
        >
          <Ionicons name="play" size={20} color="#000" />
          <Text style={styles.playText}>Play</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.iconText}>My List</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#090909",
  },
  heroImage: {
    width: "100%",
  },
  gradient: {
    flex: 1,
  },
  textContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
  },
  meta: {
    color: "#B3B3B3",
    marginTop: 6,
    fontSize: 14,
  },
  buttons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
    gap: 12,
  },
  playButton: {
    flex: 1,
    height: 46,
    backgroundColor: "#fff",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  playText: {
    marginLeft: 6,
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },
  iconButton: {
    flex: 1,
    height: 46,
    backgroundColor: "#232323",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    marginLeft: 6,
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});