function fetchBestMoviesWithMinVotes(minVotes = 1000000, targetMoviesCount = 6) {
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

        fetchNextPage(); // Start fetching the first page
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


function fetchMovieDetails(movieId) {
    const url = `http://localhost:8000/api/v1/titles/${movieId}`;
    
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }
                return response.json(); // Parse the JSON response
            })
            .then(data => {
                resolve(data); // Resolve the promise with the movie details
            })
            .catch(error => {
                reject(error); // Reject the promise in case of an error
            });
    });
}
function displayMovies(movies, containerId) {
    const moviesContainer = document.getElementById(containerId);
    if (!moviesContainer) {
        console.error(`Movies container with ID '${containerId}' not found.`);
        return;
    }

    // Clear the container before appending new content
    moviesContainer.innerHTML = "";

    // Fetch detailed information for each movie
    const detailPromises = movies.map(movie => fetchMovieDetails(movie.id));

    Promise.all(detailPromises)
        .then(detailedMovies => {
            // Loop through each detailed movie and display it
            detailedMovies.forEach(movie => {
                const movieDiv = document.createElement('div');
                movieDiv.classList.add('movie');

                const movieImage = document.createElement('img');
                movieImage.src = movie.image_url || "placeholder.jpg"; // Use a placeholder image if none exists
                movieDiv.appendChild(movieImage);

                // Create a banner div to contain title and button
                const movieBanner = document.createElement('div');
                movieBanner.classList.add('movie-banner');

                const movieTitle = document.createElement('h3');
                movieTitle.textContent = movie.original_title || "Title not available";
                movieBanner.appendChild(movieTitle);

                const detailsButton = document.createElement('button');
                detailsButton.textContent = 'Details';
                detailsButton.classList.add('movie-details-btn');
                detailsButton.setAttribute('data-id', movie.id); // Attach the movie ID to the button

                // Attach click event to open the modal with movie details
                detailsButton.addEventListener('click', () => {
                    openMovieModal(movie.id); // Open the modal with movie ID
                });

                movieBanner.appendChild(detailsButton);
                movieDiv.appendChild(movieBanner);
                moviesContainer.appendChild(movieDiv);
            });
        })
        .catch(error => {
            console.error("Error fetching detailed movie information:", error);
        });
}




// Fonction pour récupérer et remplir les genres dans la liste déroulante
function populateGenreDropdown() {
    const genreSelector = document.getElementById("genre-selector");

    fetchGenres()
        .then(genres => {
            // Remplir la liste déroulante avec les genres
            genres.forEach(genre => {
                const option = document.createElement("option");
                option.value = genre.name; // La valeur de l'option sera le nom du genre
                option.textContent = genre.name; // Texte visible de l'option
                genreSelector.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des genres :", error);
        });
}

// Écouteur pour changer de genre et charger les films
document.getElementById("genre-selector").addEventListener("change", (event) => {
    const selectedGenre = event.target.value;
    const container = document.getElementById("genre-movies-container");

    container.innerHTML = ""; // Nettoyer les résultats précédents

    if (selectedGenre) {
        fetchBestMoviesByGenreWithMinVotes(selectedGenre, 10000, 6)
            .then(movies => {
                displayMovies(movies, "genre-movies-container"); // Affiche les films sélectionnés
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des films :", error);
                container.innerHTML = "<p>Aucun film trouvé pour ce genre.</p>";
            });
    }
});

// Charger la liste déroulante des genres dès que la page est prête
document.addEventListener("DOMContentLoaded", () => {
    populateGenreDropdown();
});


function loadAndDisplayMovies() {
    // Fetch movies with the specified minimum votes
    fetchBestMoviesWithMinVotes(1000000, 6)
        .then(movies => {
            // Display the fetched movies
            displayMovies(movies, "movies-container-1");

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










function openMovieModal(movieId) {
    // Fetch the movie details
    fetchMovieDetails(movieId)
        .then(movie => {
            // Update modal content
            document.getElementById("movieModalLabel").textContent = movie.original_title;
            document.getElementById("movie-modal-img").src = movie.image_url || "placeholder.jpg";
            document.getElementById("movie-modal-genres").textContent = movie.genres.join(", ");
            document.getElementById("movie-modal-release-date").textContent = movie.date_published;
            document.getElementById("movie-modal-rating").textContent = movie.rated || "Non classé";
            document.getElementById("movie-modal-imdb-score").textContent = movie.imdb_score;
            document.getElementById("movie-modal-director").textContent = movie.directors.join(", ");
            document.getElementById("movie-modal-actors").textContent = movie.actors.join(", ");
            document.getElementById("movie-modal-duration").textContent = `${movie.duration} minutes`;
            document.getElementById("movie-modal-country").textContent = movie.countries.join(", ");
            document.getElementById("movie-modal-box-office").textContent = movie.worldwide_gross_income
                ? `${movie.worldwide_gross_income} $`
                : "Données non disponibles";
            document.getElementById("movie-modal-summary").textContent = movie.description;

            // Show the modal
            const modalElement = document.getElementById("movieModal");
            const modal = new bootstrap.Modal(modalElement);
            modal.show();

            // Event listener to remove backdrop when modal is hidden
            modalElement.addEventListener('hidden.bs.modal', () => {
                document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
            }, { once: true });
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













loadAndDisplayMovies();