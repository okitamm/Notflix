import axios from "axios";

const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;

export const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: {
    api_key: API_KEY,
  },
});

export const IMAGE_URL = "https://image.tmdb.org/t/p/original";

export const POSTER_URL = "https://image.tmdb.org/t/p/w500";