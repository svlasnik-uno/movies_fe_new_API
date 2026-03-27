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
            <div class="alert alert-danger shadow" role="alert" v-else-if="showMsg === 'uniqueError'">
              A movie with that name and year already exists - please change the name or year
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
                      </div>
                    </div>
                    <div class="form-group row justify-content-around py-2">
                      <label class="col-5">Year</label>
                      <div class="col col-7">
                        <input v-model="movie.year" type="text" class="form-control-sm form-control">
                      </div>
                    </div>
                    <div v-if="!isUpdate" type="button" class="btn btn-primary col-4" @click="getMovieAPI">Search
                      for Movie
                    </div>
                    <div class="form-group row justify-content-around py-2">
                      <label class="col-5">Description</label>
                      <div class="col col-7">
                        <input v-model="movie.description" type="text" class="form-control-sm form-control">
                      </div>
                    </div>
                    <div class="form-group row justify-content-around py-2">
                      <label class="col-5">Rating</label>
                      <div class="col col-7">
                        <input v-model="movie.rating" type="text" class="form-control-sm form-control">
                      </div>
                    </div>
                    <div class="form-group row justify-content-around py-2">
                      <label class="col-5">Director</label>
                      <div class="col col-7">
                        <input v-model="movie.director" type="text" class="form-control-sm form-control">
                      </div>
                    </div>
                    <!-- Contributors -->
                    <div class="form-group mt-3">
                      <label class="fw-bold">Contributors ({{ (movie.contributors?.length || 0) }}/10)</label>

                      <!-- Add/Edit one contributor at a time -->
                      <div class="card p-2 mb-2">
                        <div class="row g-2">
                          <div class="col-12 col-md-4">
                            <input v-model.trim="contributorDraft.firstname" type="text"
                              class="form-control form-control-sm" placeholder="First name" />
                          </div>

                          <div class="col-12 col-md-4">
                            <input v-model.trim="contributorDraft.lastname" type="text"
                              class="form-control form-control-sm" placeholder="Last name" />
                          </div>

                          <div class="col-12 col-md-4">
                            <input v-model.trim="contributorDraft.role" type="text" class="form-control form-control-sm"
                              placeholder="Role (e.g., Actor, Producer)" />
                          </div>
                        </div>

                        <div class="d-flex gap-2 mt-2">
                          <button type="button" class="btn btn-sm btn-primary" @click="upsertContributor"
                            :disabled="!canUpsertContributor">
                            {{ editingContributorIndex === null ? "Add contributor" : "Update contributor" }}
                          </button>

                          <button v-if="editingContributorIndex !== null" type="button" class="btn btn-sm btn-secondary"
                            @click="cancelContributorEdit">
                            Cancel
                          </button>

                          <div class="ms-auto small text-muted align-self-center">
                            Add one at a time (max 10)
                          </div>
                        </div>
                      </div>

                      <!-- Contributors table -->
                      <div v-if="movie.contributors && movie.contributors.length" class="table-responsive">
                        <table class="table table-sm table-striped align-middle">
                          <thead>
                            <tr>
                              <th style="width: 40%;">Name</th>
                              <th style="width: 45%;">Role</th>
                              <th style="width: 15%;">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(c, idx) in movie.contributors"
                              :key="`${c.firstname}-${c.lastname}-${c.role}-${idx}`">
                              <td>{{ c.firstname }} {{ c.lastname }}</td>
                              <td>{{ c.role }}</td>
                              <td>
                                <button type="button" class="btn btn-sm btn-outline-primary me-1"
                                  @click="startContributorEdit(idx)" title="Edit">
                                  <i class="bi bi-pencil"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-danger"
                                  @click="deleteContributor(idx)" title="Delete">
                                  <i class="bi bi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div v-else class="small text-muted">No contributors yet.</div>
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
import { useAuthStore } from "../store/AuthStore";
const apiService = new APIService();

export default {
  data() {
    return {
      showError: false,
      movie: {},
      movieCredits: [], // for storing movie credits info from API (e.g. director)
      URL: API_URL,
      movieUpdated: false,
      pageTitle: "Add New Movie",
      isUpdate: false,
      showMsg: '',
      movieImagePreview: null, // for displaying the selected or existing movie image as a thumbnail
      // TMDb API configuration
      IMAGE_URL: "https://image.tmdb.org//t/p/w500",
      contributorDraft: { firstname: "", lastname: "", role: "" },
      editingContributorIndex: null,
      MAX_CONTRIBUTORS: 10,
    };
  },
  computed: {
    authenticated() {
      return this.authStore.isAuthenticated;
    },
    authStore() {
      return useAuthStore();
    },
    canUpsertContributor() {
      const next = {
        firstname: (this.contributorDraft.firstname || "").trim(),
        lastname: (this.contributorDraft.lastname || "").trim(),
        role: (this.contributorDraft.role || "").trim(),
      };

      const hasAllFields = next.firstname && next.lastname && next.role;
      const list = this.movie.contributors || [];

      // Allow update even when list is already at max
      const underLimit =
        this.editingContributorIndex !== null || list.length < this.MAX_CONTRIBUTORS;

      return Boolean(hasAllFields && underLimit);
    }
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
      formData.append("director", this.movie.director ?? "");
      formData.append("contributors", JSON.stringify(this.movie.contributors || []));
    },
    // Cancel and return to movie list without saving
    cancelOperation() {
      this.$router.back();
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
      }
    },
    // Create a new movie, including handling image upload logic
    async createMovie() {
      this.isUpdate = false;

      try {
        const formData = new FormData();

        // if no contributors set to empty list
        if (!this.movie.contributors || this.movie.contributors.length === 0) {
          this.movie.contributors = [];
        }
        await this.buildFormData(formData);
        const response = await apiService.addNewMovie(formData);
        if (response.status === 201) {
          this.movie = response.data;
          this.showMsg = "";
          this.$router.push("/movie-list/new");
        } else {
          this.showMsg = "error";
        }
      } catch (error) {

        if (error?.response?.status === 401) {
          router.push("/auth");
          this.authStore.clearAuth();
        } else if (error?.response?.status === 400) {
          const nonField = error.response.data.non_field_errors?.[0];
          if (nonField?.includes("must make a unique set")) {
            this.showMsg = "uniqueError";
          }
          else this.showMsg = "error";
        }
      }
    },
    // Update movie details, including handling image changes
    async updateMovie() {
      try {
        const formData = new FormData();
        await this.buildFormData(formData);

        const response = await apiService.updateMovie(this.movie.pk, formData);
        if (response.status === 200) {
          this.movie = response.data;
          this.$router.push("/movie-list/update");
        } else {
          this.showMsg = "error";
        }
      } catch (error) {
        if (error?.response?.status === 401) {
          router.push("/auth");
          this.authStore.clearAuth();
        }
        else if (error?.response?.status === 400) {
          const nonField = error.response.data.non_field_errors?.[0];
          if (nonField?.includes("must make a unique set")) {
            this.showMsg = "uniqueError";
          }
          else this.showMsg = "error";
        }
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
        //console.log(`Downloaded image from ${url} as ${safeName} with content type ${contentType}`);
        return new File([blob], safeName, { type: contentType });
      }
    },
    // Fetch movie details from an API based on the movie name input by the user
    async getMovieAPI() {
      // Use the movie name as the search query to fetch details from TMDb
      const movieTitle = this.movie.name; // start with just the name for search
      // Search for the movie by title and year if available
      let searchResults = "";
      if (this.movie.year) {
        searchResults = await apiService.movieAPIGet("/search/movie", { query: movieTitle, year: this.movie.year });
      }
      else {
        searchResults = await apiService.movieAPIGet("/search/movie", { query: movieTitle });
      }
      // more than 1 movie could be returned - use the first one (most relevant) to populate the form
      // including downloading the poster image if available
      if (searchResults.total_results > 0 && Array.isArray(searchResults.results) && searchResults.results.length > 0) {
        const result = searchResults.results[0];

        // get director
        this.movieCredits = await apiService.movieAPIGet(`/movie/${result.id}/credits`); // for director info if needed
        this.movie.director = this.movieCredits.crew.find(person => person.job === "Director")?.name || "N/A";

        this.movie.contributors = this.movieCredits.cast.slice(0, 10)
          .map(person => ({
            firstname: person.name.split(" ")[0],
            lastname: person.name.split(" ").slice(1).join(" "),
            role: person.known_for_department
          }));
        this.movie.name = result.title
        this.movie.description = result.overview;
        this.movie.rating = parseInt(result.vote_average);
        this.movie.year = result.release_date.slice(0, 4)
        this.movieUpdated = true;
        const posterUrl = result.poster_path ? `${this.IMAGE_URL}${result.poster_path}` : "";
        if (posterUrl) {
          // Download and store as File so your backend receives a real file upload, 
          // allowing you to reuse the same image handling logic for both TMDb-imported and user-uploaded images
          // remove any special characters from filename to avoid issues with file handling on backend
          const filename = `${this.movie.name}_poster`.trim().replace(/[^a-zA-Z0-9_]/g, '');
          const file = await this.urlToFile(posterUrl, `${filename}_poster`);
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
    },
    normalizeContributor(c) {
      return {
        firstname: (c.firstname || "").trim(),
        lastname: (c.lastname || "").trim(),
        role: (c.role || "").trim(),
      };
    },
    resetContributorDraft() {
      this.contributorDraft.firstname = "";
      this.contributorDraft.lastname = "";
      this.contributorDraft.role = "";
    },
    upsertContributor() {
      // Ensure array exists
      if (!this.movie.contributors) this.movie.contributors = [];

      const next = this.normalizeContributor(this.contributorDraft);
      const hasAllFields = next.firstname && next.lastname && next.role;

      const underLimit =
        this.editingContributorIndex !== null ||
        this.movie.contributors.length < this.MAX_CONTRIBUTORS;

      if (!hasAllFields || !underLimit) return;

      if (this.editingContributorIndex === null) {
        // Add new (one at a time)
        this.movie.contributors.push(next);
      } else {
        // Update existing
        this.movie.contributors.splice(this.editingContributorIndex, 1, next);
      }

      this.editingContributorIndex = null;
      this.resetContributorDraft();
    },
    startContributorEdit(index) {
      const c = this.movie.contributors[index];
      this.contributorDraft.firstname = c.firstname;
      this.contributorDraft.lastname = c.lastname;
      this.contributorDraft.role = c.role;
      this.editingContributorIndex = index;
    },
    cancelContributorEdit() {
      this.editingContributorIndex = null;
      this.resetContributorDraft();
    },
    deleteContributor(index) {
      this.movie.contributors.splice(index, 1);

      // If deleting the item being edited, reset the editor.
      if (this.editingContributorIndex === index) {
        this.cancelContributorEdit();
      } else if (this.editingContributorIndex !== null && this.editingContributorIndex > index) {
        // Keep editing the same logical item after indices shift
        this.editingContributorIndex -= 1;
      }
    },
  },
  // On component mount, check if we're editing an existing movie (based on route params) and fetch its details if so  
  mounted() {
    if (!this.authenticated) {
      router.push("/auth");
    }

    if (this.$route.params.pk) {
      this.pageTitle = "Edit Movie";
      this.isUpdate = true;

      apiService.getMovie(this.$route.params.pk).then(response => {
        this.movie = response.data;
        this.setPreviewFromMovieImage(); // display existing image thumbnail
        this.movie.contributors = response.data.contributors || [];
      }).catch(error => {
        if (error.response && error.response.status === 401) {
          this.authStore.clearAuth();
          router.push("/auth");
        } else {
          console.error("getMovie failed:", error);
        }
      });
    }
          // get the current list of movies to avoid duplicates
    apiService.getMovieList().then((response) => {
      this.movies = response.data.data || [];
      this.movieSize = this.movies.length;
    })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          this.auth.clearAuth();
          router.push("/auth");
        } else {
          console.error("getMovies failed:", error);
        }
      });
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
