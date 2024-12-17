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
    let nextPageUrl = `${url}`;
    let genres = [];
    let pageCount = 1;

    console.log(`Fetching genres...`);

    // Wrapper to fetch and process all pages using promises
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
                        fetchNextPage(); // Continue fetching the next page
                    } 
                })
                .catch(error => {
                    reject(error);
                });
        }

        fetchNextPage(); // Start fetching the first page
    });
}










function displayBestMovies(movies) {
    const moviesContainer = document.getElementById('movies-container');
    if (!moviesContainer) {
        console.error("Movies container element not found.");
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
                detailsButton.onclick = () => {
                    alert(`Details for: ${movie.original_title}\n\nDescription: ${movie.description}`);
                };
                movieBanner.appendChild(detailsButton);

                movieDiv.appendChild(movieBanner);
                moviesContainer.appendChild(movieDiv);
            });
        })
        .catch(error => {
            console.error("Error fetching detailed movie information:", error);
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

            // Optionally, set the details button action (e.g., open more details or show an alert)
            movieDetailsButton.onclick = () => {
                alert(`Details for: ${firstMovie.title}\n\nDescription: ${firstMovie.description}`);
            };
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
                detailsButton.onclick = () => {
                    alert(`Details for: ${movie.original_title}\n\nDescription: ${movie.description}`);
                };
                movieBanner.appendChild(detailsButton);

                movieDiv.appendChild(movieBanner);
                moviesContainer.appendChild(movieDiv);
            });
        })
        .catch(error => {
            console.error("Error fetching detailed movie information:", error);
        });
}

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




loadAndDisplayMovies();