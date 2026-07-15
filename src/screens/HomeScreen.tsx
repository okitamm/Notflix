import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import HeroBanner from "../components/HeroBanner";
import MovieRow from "../components/MovieRow";
import { Movie } from "../types/Movie";

import {
  getTrendingMovies,
  getPopularMovies,
  getAnime,
  getKDrama,
  getTopRatedMovies,
  getUpcomingMovies,
} from "../services/movieService";

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);

  const [featured, setFeatured] = useState<Movie | null>(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [anime, setAnime] = useState<Movie[]>([]);
  const [kdrama, setKDrama] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);

  useEffect(() => {
    loadHome();
  }, []);

  useEffect(() => {
    if (trending.length === 0) return;

    const interval = setInterval(() => {
      setFeaturedIndex((prev) => {
        const next = (prev + 1) % trending.length;
        setFeatured(trending[next]);
        return next;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [trending]);

  async function loadHome() {
    try {
      const [
        trendingData,
        popularData,
        animeData,
        kdramaData,
        topRatedData,
        upcomingData,
      ] = await Promise.all([
        getTrendingMovies(),
        getPopularMovies(),
        getAnime(),
        getKDrama(),
        getTopRatedMovies(),
        getUpcomingMovies(),
      ]);

      setTrending(trendingData);
      setPopular(popularData);
      setAnime(animeData);
      setKDrama(kdramaData);
      setTopRated(topRatedData);
      setUpcoming(upcomingData);

      const randomIndex = Math.floor(
        Math.random() * trendingData.length
      );

      setFeaturedIndex(randomIndex);
      setFeatured(trendingData[randomIndex]);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#090909",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color="#E50914" size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#090909" }}
      showsVerticalScrollIndicator={false}
    >
      <HeroBanner movie={featured} />

      {/* Continue Watching will go here */}

      <MovieRow title="Trending Now" movies={trending} />

      <MovieRow title="Popular Movies" movies={popular} />

      <MovieRow title="Anime" movies={anime} mediaType="tv" />

      <MovieRow title="K-Drama" movies={kdrama} mediaType="tv" />

      <MovieRow title="Top Rated" movies={topRated} />

      <MovieRow title="New Releases" movies={upcoming} />
    </ScrollView>
  );
}