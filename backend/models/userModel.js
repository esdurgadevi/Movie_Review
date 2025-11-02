import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // hashed password if email/password login
    googleId: { type: String }, // stores Google auth user ID
    name: { type: String },
    age: { type: Number },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false }, // after OTP verification
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
