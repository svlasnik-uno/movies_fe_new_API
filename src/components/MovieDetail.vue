<template>
    <div class="container-fluid">
        <div class="row align-items-center justify-content-center">
      <div class=" col align-items-center">
          <div class="col col-12 col-sm-10 col-md-10 col-lg-6">
            <div class="alert alert-danger shadow" role="alert" v-if="showMsg === 'movieNotFoundError'">
              Please verify Movie Information
            </div>
            <div class="alert alert-danger shadow" role="alert" v-else-if="showMsg === 'requestError'">
              Please verify Movie Information - data formatted incorrectly
            </div>
            <div class="alert alert-danger shadow" role="alert" v-else-if="showMsg === 'constribsNotFoundError'">
              No results found for that movie title - please try again with a different title or check spelling
            </div>
            <div class="alert alert-danger shadow" role="alert" v-else-if="showMsg === 'noImageError'">
              No image found for movie
            </div>
          </div>
        </div>
            <div class="card">
                <div class="card-header"><b>{{ pageTitle }}</B></div>
                <div class="card-body">
                    <form ref="form">
                        <div class="container-fluid">
                            <div class="form-group text-center py-2">
                                <label class="d-block"><b>Name</b></label>
                                <div>
                                    {{ movie.name }}
                                </div>
                            </div>
                            <div class="form-group text-center py-2">
                                <label class="d-block"><b>Year</b></label>
                                <div>
                                    {{ movie.year }}
                                </div>
                            </div>
                            <div class="form-group text-center py-2">
                                <label class="d-block"><b>Description</b></label>
                                <div>
                                    {{ movie.description }}
                                </div>
                            </div>
                            <div class="form-group text-center py-2">
                                <label class="d-block"><b>Rating</b></label>
                                <div>
                                    {{ movie.rating }}
                                </div>
                            </div>
                            <div class="form-group text-center py-2">
                                <label class="d-block"><b>Director</b></label>
                                <div>
                                    {{ movie.director }}
                                </div>
                            </div>

                            <!-- Movie image -->
                            <div class="form-group">
                                <!-- movie image -->
                                <div v-if="movieImagePreview" class="movie-image">
                                    <img :src="movieImagePreview" alt="Movie Picture" class="img-thumbnail" />
                                </div>
                                <div v-else class="movie-image">
                                    No Image
                                </div>
                            </div>
                        </div>
                    </form>
                    <div v-if="movie.contributors && movie.contributors.length > 0" class="mt-4">
                        <h5 class="text-center mb-3">Contributors</h5>
                    <table class="table table-hover" style="overflow-y: auto">
                    <thead>
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Role</th>

                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="contrib in movie.contributors" >
                            <td>{{ contrib.firstname }} {{ contrib.lastname }}</td>
                            <td>{{ contrib.role }}</td>
                        </tr>
                    </tbody>
                </table>
                    </div>
                    <div v-else class="text-center mt-3">
                        No contributors found for this movie.
                    </div>
                    <div class="text-center mt-3">
                        <button type="button" class="btn btn-secondary" @click="backOperation">
                            Back to Movies
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>
<script>
import router from '../router';
import { APIService } from '../http/APIService';
const apiService = new APIService();
import { API_URL } from "../http/APIService";
export default {
    name: "MovieDetail",
    data() {
        return {
            movie: {
                name: "",
                description: "",
                rating: "",
                director: "",
                year: "",
                movie_image: null,
                contributors: [],
            },
            showMsg: '',
            pageTitle: "Movie Details",
            movieImagePreview: null,
            URL: API_URL,
            authenticated: false,
        };
    },
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
    methods: {
        backOperation() {
            router.push("/movie-list");
        },
        updateMovie(movie) {
            router.push("/movie-create/" + movie.pk);
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
    },
    mounted() {
        this.authenticated = localStorage.getItem("isAuthenticated")
        if (!this.authenticated || this.authenticated === "false") {
            router.push("/auth");
        }
        else if (this.$route.params.pk) {
            this.pageTitle = "Movie Details";

            apiService.getMovie(this.$route.params.pk).then(response => {
                this.movie = response.data;
                this.setPreviewFromMovieImage(); // display existing image thumbnail
                this.movie.contributors = response.data.contributors || [];
            }).catch(error => {
                if (error.response.status === 404){ 
                    this.showMsg = "movieNotFoundError";
                }
                else if (error.response.status === 401) { // "not authorized"
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