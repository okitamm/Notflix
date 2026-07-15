import { FlatList, StyleSheet, Text, View } from "react-native";
import MovieCard from "./MovieCard";
import { Movie } from "../types/Movie";

type Props = {
  title: string;
  movies: Movie[];
  mediaType?: "movie" | "tv";
};

export default function MovieRow({ title, movies, mediaType = "movie" }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <FlatList
        horizontal
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MovieCard movie={item} mediaType={mediaType} />
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 15,
  },
});