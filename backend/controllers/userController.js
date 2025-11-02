import User from "../models/userModel.js";

// ✅ Create a new user
export const createUser = async (req, res) => {
  try {
    const { user_id, user_name, phone_no, email, password } = req.body;

    if (!user_id || !user_name || !phone_no || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if user with same email or user_id exists
    const existingUser = await User.findOne({ $or: [{ email }, { user_id }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const newUser = await User.create({
      user_id,
      user_name,
      phone_no,
      email,
      password
    });

    res.status(201).json({ success: true, message: "User created", data: newUser });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating user", error: err.message });
  }
};
// ✅ Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching users", error: err.message });
  }
};

// ✅ Get single user by ID
export const getSingleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching user", error: err.message });
  }
};

// ✅ Update user details
export const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, message: "User updated", data: updatedUser });
  } catch (err) {
    res.status(400).json({ success: false, message: "Error updating user", error: err.message });
  }
};

// ✅ Delete user
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting user", error: err.message });
  }
};

// ✅ Get all reviewed movies of a user
export const getUserReviewedMovies = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("reviewedMovies");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, data: user.reviewedMovies });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching reviewed movies", error: err.message });
  }
};

// ✅ Add a new reviewed movie for a user
export const addReviewedMovie = async (req, res) => {
  try {
    const { movie_id, rating, comment } = req.body;

    if (!movie_id || !rating) {
      return res.status(400).json({ success: false, message: "movie_id and rating are required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.reviewedMovies.push({ movie_id, rating, comment });
    await user.save();

    res.status(201).json({ success: true, message: "Review added", data: user.reviewedMovies });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error adding review", error: err.message });
  }
};
