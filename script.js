function fetchBestMoviesWithMinVotes(minVotes = 1000000, targetMoviesCount = 7) {
    const url = "http://localhost:8000/api/v1/titles/";
    const sortBy = "-imdb_score"; // Sorting by IMDb score in descending order
    let nextPageUrl = `${url}?sort_by=${sortBy}`;
    let movies = [];
    let pageCount = 1;

    console.log(`Fetching movies...`);

    // Wrapper to fetch and process all pages using promises
    return new Promise((resolve, reject) => {
        function fetchNextPage() {
            console.log(`Fetching page ${pageCount}...`);

            fetch(nextPageUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP Error: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    const filteredMovies = data.results.filter(movie => movie.votes >= minVotes);
                    movies = movies.concat(filteredMovies);

                    // Check if there is another page
                    if (data.next && movies.length < targetMoviesCount) {
                        nextPageUrl = data.next;
                        pageCount++;
                        fetchNextPage(); // Continue fetching the next page
                    } else {
                        if (movies.length < targetMoviesCount) {
                            reject(new Error("Not enough movies found with the required minimum votes."));
                        } else {
                            resolve(movies.slice(0, targetMoviesCount)); // Return exactly `targetMoviesCount` movies
                        }
                    }
                })
                .catch(error => {
                    reject(error);
                });
        }
        fetchNextPage(); // Start fetching the next page
    });
}

function fetchBestMoviesByGenreWithMinVotes(genre, minVotes = 1000000, targetMoviesCount = 6) {
    const url = "http://localhost:8000/api/v1/titles";
    const sortBy = "-imdb_score"; // Sorting by IMDb score in descending order

    let nextPageUrl = `${url}?genre=${genre}&sort_by=${sortBy}`;
    let movies = [];
    let pageCount = 1;

    console.log(`Fetching movies by genre...`);

    // Wrapper to fetch and process all pages using promises
    return new Promise((resolve, reject) => {
        function fetchNextPage() {
            console.log(`Fetching page ${pageCount}...`);

            fetch(nextPageUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP Error: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    const filteredMovies = data.results.filter(movie => {
                        const votes = Number(movie.votes); // Convert votes to a number
                        return votes >= minVotes;
                    });

                    movies = movies.concat(filteredMovies);

                    // Check if there is another page
                    if (data.next && movies.length < targetMoviesCount) {
                        nextPageUrl = data.next;
                        pageCount++;
                        fetchNextPage(); // Continue fetching the next page
                    } else {
                        if (movies.length < targetMoviesCount) {
                            reject(new Error("Not enough movies found with the required minimum votes."));
                        } else {
                            resolve(movies.slice(0, targetMoviesCount)); // Return exactly `targetMoviesCount` movies
                        }
                    }
                })
                .catch(error => {
                    reject(error);
                });
        }

        fetchNextPage(); // Start fetching the first page
    });
}

function fetchGenres() {
    const url = "http://localhost:8000/api/v1/genres/";
    let nextPageUrl = url;
    let genres = [];
    let pageCount = 1;

    console.log("Fetching genres...");

    return new Promise((resolve, reject) => {
        function fetchNextPage() {
            console.log(`Fetching genre page ${pageCount}...`);

            fetch(nextPageUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP Error: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    genres = genres.concat(data.results);

                    // Check if there is another page
                    if (data.next) {
                        nextPageUrl = data.next;
                        pageCount++;
                        fetchNextPage();
                    } else {
                        resolve(genres); // Resolve the promise when all pages are fetched
                    }
                })
                .catch(error => {
                    console.error("Error fetching genres:", error);
                    reject(error);
                });
        }

        fetchNextPage();
    });
}

function displayFirstMovie(movies) {
    if (movies.length === 0) {
        console.log("No movies to display.");
        return;
    }

    // Get the first movie ID from the list
    const firstMovieId = movies[0].id;

    // Fetch the full details for the first movie
    fetchMovieDetails(firstMovieId)
        .then(firstMovie => {
            // Get the HTML elements
            const movieImage = document.getElementById('best-movie-img');
            const movieTitle = document.getElementById('best-movie-title');
            const movieDescription = document.getElementById('best-movie-description');
            const movieDetailsButton = document.getElementById('best-movie-details');

            if (!movieImage || !movieTitle || !movieDescription || !movieDetailsButton) {
                console.error("Movie elements not found.");
                return;
            }

            // Set movie details in the respective elements
            movieImage.src = firstMovie.image_url || "placeholder.jpg";
            movieTitle.textContent = firstMovie.original_title || "Title not available";
            movieDescription.textContent = firstMovie.long_description || "Description not available";

            // Add event listener to the "Details" button
            movieDetailsButton.addEventListener('click', () => {
                openMovieModal(firstMovieId); // Open the modal with the first movie's details
            });
        })
        .catch(error => {
            console.error("Error fetching first movie details:", error);
        });
}

function displayMovies(movies, containerId) {
    const moviesContainer = document.getElementById(containerId);
    if (!moviesContainer) {
        console.error(`Movies container with ID '${containerId}' not found.`);
        return;
    }

    // Clear the container
    moviesContainer.innerHTML = "";

    // Fetch detailed information for each movie
    const detailPromises = movies.map(movie => fetchMovieDetails(movie.id));

    Promise.all(detailPromises)
        .then(detailedMovies => {
            // Diplay movies
            detailedMovies.forEach(movie => {
                const movieDiv = document.createElement('div');
                movieDiv.classList.add('movie');

                const movieImage = document.createElement('img');
                movieImage.src = movie.image_url || "placeholder.jpg";
                movieImage.classList.add('clickable');
                movieImage.addEventListener('click', () => {
                    openMovieModal(movie.id);
                });

                movieDiv.appendChild(movieImage);

                const movieBanner = document.createElement('div');
                movieBanner.classList.add('movie-banner');

                const movieTitle = document.createElement('h3');
                movieTitle.textContent = movie.original_title || "Title not available";
                movieBanner.appendChild(movieTitle);

                const detailsButton = document.createElement('button');
                detailsButton.textContent = 'Details';
                detailsButton.classList.add('movie-details-btn');
                detailsButton.setAttribute('data-id', movie.id);
                detailsButton.addEventListener('click', () => {
                    openMovieModal(movie.id);
                });

                movieBanner.appendChild(detailsButton);
                movieDiv.appendChild(movieBanner);
                moviesContainer.appendChild(movieDiv);
            });

            // Add "Voir plus" button
            const showMoreBtn = document.createElement('button');
            showMoreBtn.textContent = 'Voir plus';
            showMoreBtn.classList.add('show-more-btn');
            
            showMoreBtn.addEventListener('click', () => {
                moviesContainer.classList.add('show-all');
                showMoreBtn.style.display = 'none';
            });

            // Add the button after the container
            moviesContainer.parentNode.insertBefore(showMoreBtn, moviesContainer.nextSibling);
        })
        .catch(error => {
            console.error("Error fetching detailed movie information:", error);
        });
}

function populateGenreDropdown() {
    const genreList = document.getElementById("genre-list");
    const dropdownButton = document.querySelector(".dropdown-button");

    fetchGenres()
        .then(genres => {
            // Ajouter les genres à la liste déroulante
            genres.forEach(genre => {
                const li = document.createElement("li");
                li.textContent = genre.name;
                li.dataset.value = genre.name;
                genreList.appendChild(li);

                // Gestion du clic sur une option
                li.addEventListener("click", () => {
                    dropdownButton.textContent = genre.name; // Afficher le genre sélectionné
                    genreList.parentNode.classList.remove("active"); // Masquer les options
                    loadMoviesByGenre(genre.name); // Charger les films
                });
            });
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des genres :", error);
        });
}

// Gestion de l'ouverture/fermeture du menu déroulant
document.querySelector(".dropdown-button").addEventListener("click", () => {
    const dropdown = document.querySelector(".custom-dropdown");
    dropdown.classList.toggle("active");
});

// Charger les genres à l'ouverture de la page
document.addEventListener("DOMContentLoaded", populateGenreDropdown);

function loadMoviesByGenre(selectedGenre) {
    const container = document.getElementById("genre-movies-container");

    container.innerHTML = ""; // Vider les résultats précédents

    if (selectedGenre) {
        fetchBestMoviesByGenreWithMinVotes(selectedGenre, 10000, 6)
            .then(movies => {
                displayMovies(movies, "genre-movies-container");
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des films :", error);
                container.innerHTML = "<p>Aucun film trouvé pour ce genre.</p>";
            });
    }
}

function loadAndDisplayMovies() {
    // Fetch movies with the specified minimum votes
    fetchBestMoviesWithMinVotes(1000000, 7)
        .then(movies => {

            // Remove the first movie from the list
            const filteredMovies = movies.slice(1);
            // Display the remaining fetched movies
            displayMovies(filteredMovies, "movies-container-1");

            // Display the first movie
            displayFirstMovie(movies);
        })
        .catch(error => {
            console.error("Error in loadAndDisplayMovies execution:", error);
        });

    fetchBestMoviesByGenreWithMinVotes("Sci-Fi")
        .then(movies => {
            // Display the fetched movies
            displayMovies(movies, "movies-container-2");
        })
        .catch(error => {
            console.error("Error in loadAndDisplayMovies execution:", error);
        });

    fetchBestMoviesByGenreWithMinVotes("Action")
        .then(movies => {
            // Display the fetched movies
            displayMovies(movies, "movies-container-3");
        })
        .catch(error => {
            console.error("Error in loadAndDisplayMovies execution:", error);
        });
}

function fetchMovieDetails(movieId) {
    const url = `http://localhost:8000/api/v1/titles/${movieId}`;
    
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            return response.json();
        });
}

function openMovieModal(movieId) {
    fetchMovieDetails(movieId)
        .then(movie => {
            document.getElementById("movieModalLabel").textContent = movie.original_title;
            document.querySelectorAll(".modal-image img").forEach(image => {
                image.src = movie.image_url || "placeholder.jpg";
            });

            const year = new Date(movie.date_published).getFullYear();
            const genres = movie.genres.join(", ");
            document.getElementById("movie-modal-release-date-genres").textContent = `${year} - ${genres}`;
            
            const countries = movie.countries.join(" / ");
            document.getElementById("movie-modal-rated-duration-countries").textContent = `${movie.rated} - ${movie.duration} min (${countries})`;

            document.getElementById("movie-modal-imdb-score").textContent = `IMDB Score: ${movie.imdb_score}/10`;
            document.getElementById("movie-modal-director").textContent = movie.directors.join(", ");
            document.getElementById("movie-modal-actors").textContent = movie.actors.join(", ");
            document.getElementById("movie-modal-box-office").textContent = movie.worldwide_gross_income
            ? `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(movie.worldwide_gross_income / 1_000_000)} millions $`
            : "Données non disponibles";
            document.getElementById("movie-modal-summary").textContent = movie.long_description;

            const modalElement = document.getElementById("movieModal");
            const modal = new bootstrap.Modal(modalElement);
            modal.show();

            document.getElementById("movieModal").addEventListener('hidden.bs.modal', () => {
                // Vérifie et supprime les backdrops restants
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(backdrop => backdrop.remove());
            
                // Réinitialise la classe de scroll sur le <body>
                document.body.classList.remove('modal-open');
                document.body.style.overflow = ''; // Réinitialise le style overflow
            });
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des détails du film :", error);
            alert("Impossible de charger les détails du film.");
        });
}

// Event listener for the "Details" buttons
document.addEventListener("click", function (event) {
    if (event.target && event.target.matches("button[data-id]")) {
        const movieId = event.target.getAttribute("data-id");
        openMovieModal(movieId);
    }
});

// Load and display movies when the page loads
document.addEventListener("DOMContentLoaded", loadAndDisplayMovies);