import Movie from "../models/movieModel.js";

// Get all movies
export const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get movie by ID
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a movie
export const createMovie = async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json(movie);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Edit movie
export const editMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete movie
export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json({ message: "Movie deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get high rating movies
export const getHighRatingMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ ratingAverage: -1 }).limit(10);
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add review to movie
export const addReview = async (req, res) => {
  try {
    const { userId, rating, comment } = req.body;
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    // Check if user already reviewed
    const existingReview = movie.reviews.find(
      (r) => r.userId.toString() === userId
    );
    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
      existingReview.reviewedAt = new Date();
    } else {
      movie.reviews.push({ userId, rating, comment });
    }

    // Update average rating
    movie.updateRating();
    await movie.save();

    res.json(movie);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get movie by director
export const getMovieByDirector = async (req, res) => {
  try {
    const movies = await Movie.find({ director: req.params.director });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get movies by genre
export const getMovieByGenre = async (req, res) => {
  try {
    const movies = await Movie.find({ genre: req.params.genre });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get movies by duration (less than or equal to specified duration)
export const getMovieByDuration = async (req, res) => {
  try {
    const duration = Number(req.params.duration);
    const movies = await Movie.find({ duration: { $lte: duration } });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
