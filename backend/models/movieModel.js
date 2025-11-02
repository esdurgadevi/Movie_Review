import mongoose from "mongoose";

// Define review schema
const reviewSchema = new mongoose.Schema(
  {
    userId: { type: String,required:true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    reviewedAt: { type: Date, default: Date.now },
  },
  { _id: false } // optional: no separate _id for each review
);

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    releaseDate: { type: Date },
    posterUrl: { type: String },
    trailerUrl: { type: String },
    language: { type: String },
    genre: { type: [String] },
    theme: { type: String },
    actors: { type: [String] },
    director: { type: String },
    duration: { type: Number },
    
    // Reviews array
    reviews: [reviewSchema],
    
    // Aggregated rating info
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Method to recalculate average rating
movieSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.ratingAverage = 0;
    this.ratingCount = 0;
  } else {
    this.ratingCount = this.reviews.length;
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.ratingAverage = sum / this.ratingCount;
  }
};

const Movie = mongoose.model("Movie", movieSchema);
export default Movie;
