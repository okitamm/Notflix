import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import {
  getMovieDetails,
  getTVDetails,
  getSeasonDetails,
} from "../services/movieService";

import HeroSection from "../components/details/HeroSection";
import InfoSection from "../components/details/InfoSection";
import EpisodeSection from "../components/details/EpisodeSection";
import CastSection from "../components/details/CastSection";
import RecommendationsSection from "../components/details/RecommendationsSection";
import TrailerPopup from "../components/details/TrailerPopup";

type Props = {
  route: any;
};

export default function DetailsScreen({ route }: Props) {
  const { id, mediaType } = route.params;
  const { width } = useWindowDimensions();
  const navigation = useNavigation<any>();

  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const [trailerOpen, setTrailerOpen] = useState(false);

  const zoom = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    load();
  }, [id, mediaType]);

  useEffect(() => {
    if (mediaType === "tv" && details) {
      loadEpisodes(selectedSeason);
    }
  }, [selectedSeason, details]);

  useEffect(() => {
    zoom.setValue(1);
    Animated.timing(zoom, {
      toValue: 1.08,
      duration: 8000,
      useNativeDriver: true,
    }).start();
  }, [id]);

  async function load() {
    setLoading(true);
    try {
      const data =
        mediaType === "tv"
          ? await getTVDetails(id)
          : await getMovieDetails(id);
      setDetails(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadEpisodes(season: number) {
    setLoadingEpisodes(true);
    try {
      const data = await getSeasonDetails(id, season);
      setEpisodes(data.episodes || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingEpisodes(false);
    }
  }

  if (loading || !details) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#E50914" size="large" />
      </View>
    );
  }

  const heroHeight = width * 0.6;
  const trailer = details.videos?.results?.find(
    (v: any) => v.type === "Trailer" && v.site === "YouTube"
  );

  const title = details.title || details.name;
  const year = (details.release_date || details.first_air_date || "").slice(0, 4);
  const runtime = details.runtime
    ? `${details.runtime} min`
    : details.number_of_seasons
    ? `${details.number_of_seasons} Season${details.number_of_seasons > 1 ? "s" : ""}`
    : null;
  const genres = details.genres?.map((g: any) => g.name).join(" • ") || "";
  const cast = details.credits?.cast?.slice(0, 6) || [];
  const recommendations = details.recommendations?.results?.slice(0, 12) || [];
  const seasons = details.seasons?.filter((s: any) => s.season_number > 0) || [];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeroSection
          backdropPath={details.backdrop_path}
          heroHeight={heroHeight}
          zoom={zoom}
          onBack={() => navigation.goBack()}
          onTrailer={() => setTrailerOpen(true)}
          hasTrailer={!!trailer}
        />

        <InfoSection
          title={title}
          rating={details.vote_average || 0}
          year={year}
          runtime={runtime}
          genres={genres}
          overview={details.overview}
          onPlay={() => navigation.navigate("Player", { 
            id, 
            mediaType, 
            title
          })}
        />

        {mediaType === "tv" && (
          <EpisodeSection
            seasons={seasons}
            episodes={episodes}
            selectedSeason={selectedSeason}
            loadingEpisodes={loadingEpisodes}
            onSeasonChange={setSelectedSeason}
          />
        )}

        <CastSection cast={cast} />

        <RecommendationsSection
          recommendations={recommendations}
          mediaType={mediaType}
        />
      </ScrollView>

      <TrailerPopup
        visible={trailerOpen}
        trailerKey={trailer?.key}
        width={width}
        onClose={() => setTrailerOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090909",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#090909",
    justifyContent: "center",
    alignItems: "center",
  },
});