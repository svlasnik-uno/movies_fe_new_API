<template>
  <div class="container-fluid">
    <div class="row align-items-center justify-content-center">
      <div class=" col align-items-center">
        <div class="row align-items-center justify-content-center">
          <div class="col col-12 col-sm-10 col-md-10 col-lg-6">
            <div class="alert alert-danger shadow" role="alert" v-if="showMsg === 'error'">
              Please verify Movie Information
            </div>
            <div class="alert alert-danger shadow" role="alert" v-else-if="showMsg === 'requestError'">
              Please verify Movie Information - data formatted incorrectly
            </div>
            <div class="alert alert-danger shadow" role="alert" v-else-if="showMsg === 'searchError'">
              No results found for that movie title - please try again with a different title or check spelling
            </div>
            <div class="alert alert-danger shadow" role="alert" v-else-if="showMsg === 'noImageError'">
              No image found for movie
            </div>
          </div>
        </div>
        <div class="row align-items-center justify-content-center">
          <div class="col col-12 col-sm-10 col-md-10 col-lg-6 align-items-center">
            <div class="card">
              <div class="card-header">{{ pageTitle }}</div>
              <div class="card-body">
                <form ref="form">
                  <div class="container-fluid">
                    <div class="form-group row justify-content-around py-2">
                      <label class="col-5">Name</label>
                      <div class="col col-7">
                        <input v-model="movie.name" type="text" class="form-control-sm form-control">
                        <div v-if="!isUpdate" type="button" class="btn btn-primary col-4" @click="getMovieAPI">Search
                          for Movie
                        </div>
                      </div>
                    </div>
                    <div class="form-group row justify-content-around py-2">
                      <label class="col-5">Description</label>
                      <div class="col col-7">
                        <input v-model="movie.description" type="text" class="form-control-sm form-control">
                      </div>
                    </div>
                    <div class="form-group row justify-content-around py-2">
                      <label class="col-5">Year</label>
                      <div class="col col-7">
                        <input v-model="movie.year" type="text" class="form-control-sm form-control">
                      </div>
                    </div>
                    <div class="form-group row justify-content-around py-2">
                      <label class="col-5">Rating</label>
                      <div class="col col-7">
                        <input v-model="movie.rating" type="text" class="form-control-sm form-control">
                      </div>
                    </div>

                    <!-- Movie image -->
                    <div class="form-group">
                      <label>{{ isUpdate ? "Update Movie Image" : "Movie Image" }}</label>
                      <input type="file" @change="handleFileUpload" class="form-control" />
                      <!--<div v-if="!movieUpdated">-->
                      <!-- movie image -->
                      <div v-if="movieImagePreview" class="movie-image">
                        <img :src="movieImagePreview" alt="Movie Picture" class="img-thumbnail" />
                      </div>
                      <div v-else class="movie-image">
                        No Image
                      </div>
                      <!-- </div>-->
                    </div>

                    <div class="row justify-content-around">
                      <div v-if="!isUpdate" type="button" class="btn btn-primary col-4" @click="createMovie">Save
                      </div>
                      <div v-if="isUpdate" type="button" class="btn btn-primary col-4" @click="updateMovie">Update
                      </div>
                      <div type="button" class="btn btn-secondary col-4" @click="cancelOperation">Cancel</div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>
<script>
import router from '../router';
import { APIService } from '../http/APIService';
import { API_URL } from "../http/APIService";
const apiService = new APIService();

export default {
  //prevent user from accessing this page if not authorized
  beforeCreate() {
    if (localStorage.getItem("isAuthenticated") &&
      JSON.parse(localStorage.getItem("isAuthenticated")) === true) {
      this.authenticated = true
    }
    else {
      this.authenticated = false
    }
    if (this.authenticated === false) {
      router.push("/auth");
    }
  },
  data() {
    return {
      showError: false,
      movie: {},
      URL: API_URL,
      movieUpdated: false,
      pageTitle: "Add New Movie",
      isUpdate: false,
      showMsg: '',
      authenticated: false,
      movieImagePreview: null, // for displaying the selected or existing movie image as a thumbnail
      // TMDb API configuration
      BASE_URL: "https://api.themoviedb.org/3",
      TMDB_API_KEY: "ba080278e548a56b768590a256a91a47",
      LANGUAGE: "en-US",
      IMAGE_URL: "https://image.tmdb.org//t/p/w500",
    };
  },
  methods: {
    // Handle file selection from the input and store it for upload
    handleFileUpload(event) {
      const file = event.target.files?.[0];
      if (!file) return;
      this.movie.movie_image = file;   // store File for upload
      this.movieUpdated = true;        // signals upload on submit
      this.setPreviewFromMovieImage(); // display thumbnail
    },
    // Set the movie image preview based on the current movie image, handling both File objects and URL strings
    setPreviewFromMovieImage() {
      const img = this.movie?.movie_image;
      // If it's a File (upload or TMDB-downloaded file), create a blob URL
      if (img instanceof File) {
        this.movieImagePreview = URL.createObjectURL(img);
      }
      // If backend returns a string path/url
      else if (typeof img === "string" && img.length) {
        // If it's already absolute, use as-is. If it's relative, prefix API_URL.
        this.movieImagePreview = img.startsWith("http")
          ? img
          : `${this.URL}${img}`; // e.g. API_URL + "/media/....jpg"
      }
      else {
        this.movieImagePreview = null;
        this.showMsg = "noImageError";
      }
    },
    // Create a new movie, including handling image upload logic
    async createMovie() {
      try {
        const formData = new FormData();
        await this.buildFormData(formData);

        const response = await apiService.addNewMovie(formData);
        if (response.status === 201) {
          this.movie = response.data;
          this.showMsg = "";
          router.push("/movie-list/new");
        } else {
          this.showMsg = "error";
        }
      } catch (error) {
        if (error?.response?.status === 401) router.push("/auth");
        else if (error?.response?.status === 400) this.showMsg = "requestError";
        else this.showMsg = "error";
      }
    },
    // Build FormData for both create and update operations, handling movie details and image logic
    async buildFormData(formData) {
      if (this.isUpdate) {
        formData.append("pk", this.movie.pk);
      }
      // - If user selected a file: send it (movieUpdated === true)
      const img = this.movie.movie_image;
      const isFile = img instanceof File;
      if (isFile) {
        // upload selected file
        if (!this.isUpdate || this.movieUpdated) {
          formData.append("movie_image", img);
        }
      }
      formData.append("name", this.movie.name || "");
      formData.append("description", this.movie.description || "");
      formData.append("year", this.movie.year || "");
      formData.append("rating", this.movie.rating ?? "");
    },
    // Cancel and return to movie list without saving
    cancelOperation() {
      router.push("/movie-list");
    },
    // Update movie details, including handling image changes
    async updateMovie() {
      try {
        const formData = new FormData();
        await this.buildFormData(formData);

        const response = await apiService.updateMovie(formData);
        if (response.status === 200) {
          this.movie = response.data;
          router.push("/movie-list/update");
        } else {
          this.showMsg = "error";
        }
      } catch (error) {
        if (error?.response?.status === 401) router.push("/auth");
        else if (error?.response?.status === 400) this.showMsg = "requestError";
        else this.showMsg = "error";
      }
    },
    // Utility to download an image from a URL and convert it to a File object for upload
    async urlToFile(url, filename = "poster.jpg") {
      const res = await fetch(url);
      if (!res.ok) {
        this.showMsg = "noImageError";
        return null;
      }
      else {
        const blob = await res.blob();
        // Try to preserve real content type
        const contentType = blob.type || "image/jpeg";
        const ext =
          contentType === "image/png" ? "png" :
            contentType === "image/webp" ? "webp" :
              contentType === "image/jpeg" ? "jpg" : "img";
        const safeName = filename.includes(".") ? filename : `${filename}.${ext}`;
        console.log(`Downloaded image from ${url} as ${safeName} with content type ${contentType}`);
        return new File([blob], safeName, { type: contentType });
      }
    },
    // Fetch movie details from an API based on the movie name input by the user
    async getMovieAPI() {
      // Use the movie name as the search query to fetch details from TMDb
      const titleInput = this.movie.name;
      // Search for the movie by title
      const searchResults = await apiService.movieAPIGet("/search/movie", { query: titleInput });
      // more than 1 movie could be returned - use the first one (most relevant) to populate the form
      // including downloading the poster image if available
      if (searchResults.total_results > 0 && Array.isArray(searchResults.results) && searchResults.results.length > 0) {
        const result = searchResults.results[0];
        const movieCredits = await apiService.movieAPIGet(`/movie/${result.id}/credits`); // for director info if needed

        this.movie.name = result.title
        this.movie.description = result.overview;
        this.movie.rating = parseInt(result.vote_average);
        this.movie.year = result.release_date.slice(0, 4)
        this.movieUpdated = true;
        const posterUrl = result.poster_path ? `${this.IMAGE_URL}${result.poster_path}` : "";
        if (posterUrl) {
          // Download and store as File so your backend receives a real file
          const file = await this.urlToFile(posterUrl, `${this.movie.name}_poster`);
          if (file) {
            this.movie.movie_image = file;
            this.movieUpdated = true;
            this.setPreviewFromMovieImage(); // display thumbnail
          }
        } else {
          this.showMsg = "noImageError";
        }
      }
      else {
        this.showMsg = "searchError";
        this.movie = {};
      }
    }
  },
  // On component mount, check if we're editing an existing movie (based on route params) and fetch its details if so  
  mounted() {
    if (this.$route.params.pk) {
      this.pageTitle = "Edit Movie";
      this.isUpdate = true;
      apiService.getMovie(this.$route.params.pk).then(response => {
        this.movie = response.data;
        this.setPreviewFromMovieImage(); // display existing image thumbnail
      }).catch(error => {
        if (error.response.status === 401) { // "not authorized"
          router.push("/auth");
        } else {
          this.showMsg = "error";
          router.push("/auth");
        }
      });
    }
  }
}
</script>
<style>
.movie-image img {
  max-width: 200px;
  border-radius: 10px;
  margin-bottom: 20px;
}
</style>
