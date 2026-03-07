import axios from "axios";
// Change the API_URL to the correct location of the backend API before deploying the app
export const API_URL =
  "http://localhost:8000"; /*'https://vlasnikuno.pythonanywhere.com'; 'http://localhost:8000' http://127.0.0.1:8000 or  'https://yourPythonAnywhereName.pythonanywhere.com'*/
export const BASE_API_URL = "https://api.themoviedb.org/3";
export const TMDB_API_KEY = "ba080278e548a56b768590a256a91a47";
export const LANGUAGE = "en-US";

export class APIService {
  constructor() {}
  //
  getMovie(param_pk) {
    const url = `${API_URL}/api/movies/${param_pk}`;
    let jwtToken = localStorage.getItem("access");
    const headers = { Authorization: `JWT ${jwtToken}` };
    return axios.get(url, { headers: headers });
  }
  //
  getMovieList() {
    const url = `${API_URL}/api/movies/`;
    let jwtToken = localStorage.getItem("access");
    const headers = { Authorization: `JWT ${jwtToken}` };
    return axios.get(url, { headers: headers });
  }
  //
  addNewMovie(movie) {
    const url = `${API_URL}/api/movies/`;
    let jwtToken = localStorage.getItem("access");
    const headers = { Authorization: `JWT ${jwtToken}` };
    return axios.post(url, movie, { headers: headers });
  }
  // update a saved movie with new form data (including file upload if needed)
  updateMovie(formData) {
    const url = `${API_URL}/api/movies/${formData.get("pk")}`;
    let jwtToken = localStorage.getItem("access");
    const headers = { Authorization: `JWT ${jwtToken}` };
    return axios.put(url, formData, { headers: headers });
  }
  // delete a saved movie from the database
  deleteMovie(movie_Pk) {
    const url = `${API_URL}/api/movies/${movie_Pk}`;
    let jwtToken = localStorage.getItem("access");
    const headers = { Authorization: `JWT ${jwtToken}` };
    return axios.delete(url, { headers: headers });
  }

  // authenticate user login with backend
  authenticateLogin(credentials) {
    const url = `${API_URL}/api/`;
    return axios.post(url, credentials);
  }
  // register user with backend
  registerUser(credentials) {
    const url = `${API_URL}/register/`;
    credentials.customusername = credentials.username;
    return axios.post(url, credentials);
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
