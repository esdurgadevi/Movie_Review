import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import OTP from "../models/otpModel.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

// Register user
export const registerUser = async (req, res) => {
  const { username, email, password, name, age } = req.body;

  try {
    // Check if email exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email already exists" });

    // Save user as unverified until OTP check (save plain text password)
    const newUser = await User.create({
      username,
      email,
      password, // storing as plain text (NOT secure, only for testing)
      name,
      age,
      isVerified: false,
    });

    // Send OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.create({ email, otp: otpCode });
    await sendVerificationEmail(email, otpCode);

    res.status(201).json({ message: "OTP sent to your email for verification" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpDoc = await OTP.findOne({ email, otp });
    if (!otpDoc) return res.status(400).json({ message: "Invalid or expired OTP" });

    await User.updateOne({ email }, { $set: { isVerified: true } });
    await OTP.deleteOne({ email });

    res.json({ message: "Account verified successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login user (plain text comparison)
// Updated login controller - return userId in response
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (!user.isVerified) return res.status(403).json({ message: "Verify email first" });

    // Plain text password comparison
    if (password !== user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ 
      message: "Login successful", 
      token, 
      role: user.role,
      userId: user._id // Add this line
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
