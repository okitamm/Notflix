import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { POSTER_URL } from "../../services/tmdb";

type Props = {
  recommendations: any[];
  mediaType: "movie" | "tv";
};

export default function RecommendationsSection({
  recommendations,
  mediaType,
}: Props) {
  const navigation = useNavigation<any>();

  if (!recommendations.length) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>More Like This</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {recommendations.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() =>
              navigation.push("Details", {
                id: item.id,
                mediaType: item.media_type || mediaType,
              })
            }
          >
            <Image
              source={{
                uri: item.poster_path
                  ? POSTER_URL + item.poster_path
                  : "https://via.placeholder.com/130x195",
              }}
              style={styles.poster}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 40,
  },

  heading: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  card: {
    marginRight: 12,
  },

  poster: {
    width: 130,
    height: 195,
    borderRadius: 12,
    backgroundColor: "#222",
  },
});