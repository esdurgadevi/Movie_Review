import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import movieRoutes from "./routes/movieRoutes.js"
import authRoutes from "./routes/authRoutes.js"

dotenv.config(); // Load .env variables

const app = express();

// ✅ Connect Database
connectDB();

// ✅ Middlewares
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON request body

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/movies",movieRoutes);
app.use("/api/auth",authRoutes);
// ✅ Health Check Route
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
