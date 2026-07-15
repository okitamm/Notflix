import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { POSTER_URL } from "../services/tmdb";
import { Movie } from "../types/Movie";

type Props = {
  movie: Movie;
  mediaType?: "movie" | "tv";
};

export default function MovieCard({ movie, mediaType = "movie" }: Props) {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.container}
      onPress={() =>
        navigation.navigate("Details", {
          id: movie.id,
          mediaType,
        })
      }
    >
      <Image
        source={{ uri: POSTER_URL + movie.poster_path }}
        style={styles.poster}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
  },
  poster: {
    width: 130,
    height: 195,
    borderRadius: 14,
    backgroundColor: "#222",
  },
});