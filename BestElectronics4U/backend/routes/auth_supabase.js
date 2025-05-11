// routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { supabase } = require("../supabaseClient");
const authenticateToken = require("./authMiddleware"); // Import the middleware

function isValidPassword(password) {
  return /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(
    password
  );
}

router.post("/signup", async (req, res) => {
  const { user_id, user_name, email, user_password, is_vendor } = req.body;

  if (!isValidPassword(user_password)) {
    return res.status(400).json({
      error:
        "Password must be 8+ chars, include a number, letter & special character.",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(user_password, 10);

    // Insert user into Supabase
    const { error } = await supabase.from("user").insert({
      user_id,
      user_name,
      email,
      user_password: hashedPassword,
      is_vendor: is_vendor ? true : false, // Supabase uses boolean instead of 0/1
    });

    if (error) throw error;

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    res.status(500).json({ error: "Signup failed." });
  }
});

// Password validation regex
const passwordRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

router.post("/register", async (req, res) => {
  const {
    email,
    password,
    username,
    first_name,
    last_name,
    address,
    is_vendor,
  } = req.body;

  // Password validation
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long and include 1 letter, 1 number, and 1 symbol.",
    });
  }

  try {
    // Check if user exists
    const { data: existing, error: queryError } = await supabase
      .from("user")
      .select("*")
      .eq("email", email);

    if (queryError) throw queryError;

    if (existing && existing.length > 0) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a Supabase-style ID (mix of uppercase letters and numbers)
    const randomId = Array.from({ length: 26 }, () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      return chars.charAt(Math.floor(Math.random() * chars.length));
    }).join("");

    const userId = randomId;

    // Insert user
    const { error: insertError } = await supabase.from("user").insert({
      user_id: userId,
      user_name: username,
      email,
      user_password: hashedPassword,
      is_vendor: is_vendor ? true : false,
      first_name,
      last_name,
      address,
    });

    if (insertError) throw insertError;

    // Generate token
    const token = jwt.sign(
      { user_id: userId, email, is_vendor },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    const userPayload = {
      user_id: userId,
      user_name: username,
      email,
      is_vendor,
      first_name,
      last_name,
      address,
    };

    return res.status(200).json({
      token,
      user: userPayload,
      message: "User registered successfully!",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error during registration." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const { data: users, error: queryError } = await supabase
      .from("user")
      .select("*")
      .eq("email", email);

    if (queryError) throw queryError;

    if (!users || users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.user_password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.email,
        is_vendor: user.is_vendor,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        id: user.user_id,
        email: user.email,
        username: user.user_name,
        first_name: user.first_name,
        last_name: user.last_name,
        is_vendor: user.is_vendor,
        paid_user: user.paid_user || false,
        address: user.address,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed due to server error." });
  }
});

// Add the new /verify-token route
router.get("/verify-token", authenticateToken, async (req, res) => {
  // If authenticateToken middleware passes, req.user will be populated with the token payload
  // The token payload from login is: { id: user.user_id, email: user.email, is_vendor: user.is_vendor }
  const userIdFromToken = req.user.id; // This 'id' field in the token holds the actual user_id

  if (!userIdFromToken) {
    return res.status(400).json({ message: "User ID not found in token." });
  }

  try {
    const { data: users, error: queryError } = await supabase
      .from("user")
      .select("*")
      .eq("user_id", userIdFromToken); // Use the user_id from the token

    if (queryError) throw queryError;

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = users[0];

    // Respond with the same user object structure as in /login
    res.json({
      message: "Token verified successfully.",
      user: {
        user_id: user.user_id,
        id: user.user_id,
        email: user.email,
        username: user.user_name,
        first_name: user.first_name,
        last_name: user.last_name,
        is_vendor: user.is_vendor,
        paid_user: user.paid_user || false,
        address: user.address,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Token verification failed due to server error." });
  }
});

module.exports = router;
