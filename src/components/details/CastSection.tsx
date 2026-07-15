import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { POSTER_URL } from "../../services/tmdb";

type Props = {
  cast: any[];
};

export default function CastSection({ cast }: Props) {
  if (!cast.length) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Cast</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {cast.map((actor) => (
          <View key={actor.id} style={styles.card}>
            <Image
              source={{
                uri: actor.profile_path
                  ? POSTER_URL + actor.profile_path
                  : "https://via.placeholder.com/100x150",
              }}
              style={styles.image}
            />

            <Text numberOfLines={1} style={styles.name}>
              {actor.name}
            </Text>

            {!!actor.character && (
              <Text numberOfLines={1} style={styles.character}>
                {actor.character}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 28,
  },

  heading: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  card: {
    width: 95,
    marginRight: 14,
  },

  image: {
    width: 95,
    height: 140,
    borderRadius: 12,
    backgroundColor: "#222",
  },

  name: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
    marginTop: 8,
  },

  character: {
    color: "#888",
    fontSize: 11,
    marginTop: 2,
  },
});