
export const BASE_API_URL = "https://api.themoviedb.org/3";
export const TMDB_API_KEY = "ba080278e548a56b768590a256a91a47";
export const LANGUAGE = "en-US";
import axios from "axios";
import { useAuthStore } from "@/store/AuthStore";

// Change the API_URL to the correct location of the backend API before deploying the app
export const API_URL ='http://localhost:8000' ;
/* 'https://vlasnikuno.pythonanywhere.com' 'http://localhost:8000' http://127.0.0.1:8000/ or 'https://yourPythonAnywhereName.pythonanywhere.com/' */

export class APIService {
  constructor() { }

  getAuthHeaders() {
    const authStore = useAuthStore();
    if (!authStore.access) {
      return {};
    }
    return {
      Authorization: `JWT ${authStore.access}`,
    };
  }

  getMovieList() {
    return axios.get(`${API_URL}/api/movies/`, {
      headers: this.getAuthHeaders(),
    });
  }

  getMovie(param_pk) {
    return axios.get(`${API_URL}/api/movies/${param_pk}`, {
      headers: this.getAuthHeaders(),
    });
  }

  addNewMovie(movie) {
    return axios.post(`${API_URL}/api/movies/`, movie, {
      headers: this.getAuthHeaders(),
    });
  }

  updateMovie(pk, movie) {
    return axios.put(`${API_URL}/api/movies/${pk}`, movie, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteMovie(movie_Pk) {
    return axios.delete(`${API_URL}/api/movies/${movie_Pk}`, {
      headers: this.getAuthHeaders(),
    });
  }

  authenticateLogin(credentials) {
    return axios.post(`${API_URL}/api/`, credentials);
  }

  registerUser(credentials) {
    return axios.post(`${API_URL}/register/`, {
      ...credentials,
      customusername: credentials.username,
    });
  }
  // Make GET requests to TMDb API with proper query parameters and error handling
  async movieAPIGet(path, params = {}) {
    // Build the URL with query parameters
    const url = new URL(`${BASE_API_URL}${path}`);
    url.searchParams.set("api_key", TMDB_API_KEY);
    url.searchParams.set("language", LANGUAGE);
    url.searchParams.set("include_adult", "false");

    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
    const res = await fetch(url);
    if (!res.ok) {
      this.showMsg = "searchError";
      this.movie = {};
      //console.error(`TMDb request failed (${res.status}): ${text || res.statusText}`);
    }
    return res.json();
  }
}
