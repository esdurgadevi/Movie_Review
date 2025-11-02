import express from "express";
import {
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  getUserReviewedMovies,
  addReviewedMovie,
  createUser
} from "../controllers/userController.js";

const router = express.Router();
router.post("/", createUser);  
router.get("/", getAllUsers);             // ✅ GET all users
router.get("/:id", getSingleUser);        // ✅ GET single user
router.put("/:id", updateUser);           // ✅ UPDATE user
router.delete("/:id", deleteUser);        // ✅ DELETE user

// Reviewed movies
router.get("/:id/reviews", getUserReviewedMovies);  // ✅ Get reviewed movies
router.post("/:id/reviews", addReviewedMovie);      // ✅ Add new review

export default router;
