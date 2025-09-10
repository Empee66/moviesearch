const API_KEY = "cfc710ab";
const BASE_URL = "http://www.omdbapi.com/";
let currentPage = 1;

function searchMovies() {
  const searchTerm = document.getElementById("searchInput").value.trim();

  if (
    !searchTerm ||
    /[<>{}"'();]/g.test(searchTerm) ||
    searchTerm.includes("script")
  ) {
    showError("Invalid search term - please avoid special characters");
    document.getElementById("movieGrid").innerHTML = "";
    return;
  }

  showLoading(true);
  document.getElementById("error").style.display = "none";
  console.log(
    `Fetching search: ${BASE_URL}?s=${encodeURIComponent(
      searchTerm
    )}&apikey=${API_KEY}&page=${currentPage}&type=movie`
  );
  fetch(
    `${BASE_URL}?s=${encodeURIComponent(
      searchTerm
    )}&apikey=${API_KEY}&page=${currentPage}&type=movie`
  )
    .then((response) => {
      if (!response.ok)
        throw new Error("Failed to fetch movies: " + response.status);
      return response.json();
    })
    .then((data) => {
      console.log("Search response:", data);
      if (data.Response === "False") {
        throw new Error(data.Error || "No movies found");
      }
      displayMovies(data.Search || []);
    })
    .catch((err) => {
      showError("Error fetching movies: " + err.message);
      console.error(err);
      document.getElementById("movieGrid").innerHTML = "";
    })
    .finally(() => showLoading(false));
}

function displayMovies(movies) {
  const movieGrid = document.getElementById("movieGrid");
  movieGrid.innerHTML = "";
  movies.forEach((movie) => {
    const movieCard = document.createElement("div");
    movieCard.className = "movie-card";
    movieCard.innerHTML = `
     <div id="movie-info">
      <img src="${
        movie.Poster !== "N/A"
          ? movie.Poster
          : "https://via.placeholder.com/200x300?text=No+Poster"
      }" alt="${movie.Title}" >
     
        <h3>${movie.Title}</h3>
        <p>Year: ${movie.Year}</p>
      </div>
    `;
    movieCard.onclick = () => showMovieDetails(movie);
    movieGrid.appendChild(movieCard);
  });
}

async function showMovieDetails(movie) {
  showLoading(true);
  try {
    console.log(
      `Fetching details: ${BASE_URL}?i=${movie.imdbID}&apikey=${API_KEY}`
    );
    const response = await fetch(
      `${BASE_URL}?i=${movie.imdbID}&apikey=${API_KEY}`
    );
    if (!response.ok)
      throw new Error("Failed to fetch details: " + response.status);
    const data = await response.json();
    console.log("Details response:", data);
    if (data.Response === "False") {
      throw new Error(data.Error || "No details available");
    }
    document.getElementById("modalTitle").textContent = data.Title;
    document.getElementById("modalRelease").textContent = `Release Date: ${
      data.Released || "N/A"
    }`;
    document.getElementById("modalRating").textContent = `Rating: ${
      data.imdbRating || "N/A"
    }/10`;
    document.getElementById("modalOverview").textContent = `Overview: ${
      data.Plot || "No overview available"
    }`;
    document.getElementById("movieModal").style.display = "flex";
  } catch (err) {
    showError("Error fetching movie details: " + err.message);
    console.error(err);
  } finally {
    showLoading(false);
  }
}

function closeModal() {
  document.getElementById("movieModal").style.display = "none";
}

function showLoading(isLoading) {
  document.getElementById("loading").style.display = isLoading
    ? "block"
    : "none";
}

function showError(message) {
  const errorDiv = document.getElementById("error");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
}
