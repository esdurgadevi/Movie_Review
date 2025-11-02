import express from "express";
import {
  getAllMovies,
  getMovieById,
  createMovie,
  editMovie,
  deleteMovie,
  getHighRatingMovies,
  addReview,
  getMovieByDirector,
  getMovieByGenre,
  getMovieByDuration,
} from "../controllers/movieController.js";

const router = express.Router();

// CRUD
router.get("/", getAllMovies);
router.get("/:id", getMovieById);
router.post("/", createMovie);
router.put("/:id", editMovie);
router.delete("/:id", deleteMovie);

// Reviews
router.post("/:id/review", addReview);

// Filters
router.get("/high-rating/top", getHighRatingMovies);
router.get("/director/:director", getMovieByDirector);
router.get("/genre/:genre", getMovieByGenre);
router.get("/duration/:duration", getMovieByDuration);

export default router;
