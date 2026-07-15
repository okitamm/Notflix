import { tmdb } from "./tmdb";

export const getTrendingMovies = async () => {
  const res = await tmdb.get("/trending/movie/week");
  return res.data.results;
};

export const getPopularMovies = async () => {
  const res = await tmdb.get("/movie/popular");
  return res.data.results;
};

export const getTopRatedMovies = async () => {
  const res = await tmdb.get("/movie/top_rated");
  return res.data.results;
};

export const getUpcomingMovies = async () => {
  const res = await tmdb.get("/movie/upcoming");
  return res.data.results;
};

export const getAnime = async () => {
  const res = await tmdb.get("/discover/tv", {
    params: {
      with_genres: 16,
      with_origin_country: "JP",
      sort_by: "vote_average.desc",
      vote_count_gte: 100,
    },
  });

  return res.data.results;
};

export const getKDrama = async () => {
  const res = await tmdb.get("/discover/tv", {
    params: {
      with_origin_country: "KR",
      sort_by: "popularity.desc",
    },
  });

  return res.data.results;
};

export const getMovieDetails = async (id: number) => {
  const res = await tmdb.get(`/movie/${id}`, {
    params: { append_to_response: "videos,credits,recommendations" },
  });
  return res.data;
};

export const getTVDetails = async (id: number) => {
  const res = await tmdb.get(`/tv/${id}`, {
    params: { append_to_response: "videos,credits,recommendations" },
  });
  return res.data;
};

export const getSeasonDetails = async (tvId: number, seasonNumber: number) => {
  const res = await tmdb.get(`/tv/${tvId}/season/${seasonNumber}`);
  return res.data;
};