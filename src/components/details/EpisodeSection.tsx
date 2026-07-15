import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IMAGE_URL } from "../../services/tmdb";

type Props = {
  seasons: any[];
  episodes: any[];
  selectedSeason: number;
  loadingEpisodes: boolean;
  onSeasonChange: (season: number) => void;
};

export default function EpisodeSection({
  seasons,
  episodes,
  selectedSeason,
  loadingEpisodes,
  onSeasonChange,
}: Props) {
  if (!seasons.length) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Episodes</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {seasons.map((season) => (
          <TouchableOpacity
            key={season.id}
            style={[
              styles.seasonButton,
              selectedSeason === season.season_number &&
                styles.seasonButtonActive,
            ]}
            onPress={() => onSeasonChange(season.season_number)}
          >
            <Text
              style={[
                styles.seasonText,
                selectedSeason === season.season_number &&
                  styles.seasonTextActive,
              ]}
            >
              {season.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loadingEpisodes ? (
        <ActivityIndicator color="#E50914" style={{ marginTop: 30 }} />
      ) : (
        episodes.map((episode) => (
          <TouchableOpacity key={episode.id} style={styles.row}>
            <Image
              source={{
                uri: episode.still_path
                  ? IMAGE_URL + episode.still_path
                  : "https://via.placeholder.com/300x170",
              }}
              style={styles.image}
            />

            <View style={styles.info}>
              <Text numberOfLines={1} style={styles.title}>
                {episode.episode_number}. {episode.name}
              </Text>

              <Text numberOfLines={2} style={styles.overview}>
                {episode.overview || "No description available."}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
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

  seasonButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1E1E1E",
    marginRight: 10,
  },

  seasonButtonActive: {
    backgroundColor: "#E50914",
  },

  seasonText: {
    color: "#B3B3B3",
    fontWeight: "600",
  },

  seasonTextActive: {
    color: "#fff",
  },

  row: {
    flexDirection: "row",
    marginTop: 16,
  },

  image: {
    width: 140,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#222",
  },

  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },

  title: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  overview: {
    color: "#999",
    marginTop: 5,
    lineHeight: 17,
    fontSize: 12,
  },
});