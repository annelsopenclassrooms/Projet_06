async function displayBestMovie() {
    try {
        const url = "http://localhost:8000/api/v1/titles/";
        const sortBy = "-imdb_score"; // Field used for sorting
        const fullUrl = `${url}?sort_by=${sortBy}`;

        // Perform the GET request
        const response = await fetch(fullUrl);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        // Ensure results exist
        if (!data.results || data.results.length === 0) {
            throw new Error("No movies found in the results.");
        }

        const bestMovie = data.results[0]; // Get the best movie

        // Update HTML elements
        document.getElementById('best-movie-img').src = bestMovie.image_url || "placeholder.jpg"; // Use a default image if none exists
        document.getElementById('best-movie-title').textContent = bestMovie.title || "Title not available";
        document.getElementById('best-movie-description').textContent = bestMovie.description || "Description not available";

        // Add a click handler to open the movie details
        document.getElementById('best-movie-details').onclick = () => openModal(bestMovie.id);
    } catch (error) {
        console.error("Error in displayBestMovie execution:", error);
    }
}

// Call the function
displayBestMovie();
