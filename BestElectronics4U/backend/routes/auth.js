// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../db'); // Your MySQL connection

function isValidPassword(password) {
  return /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password);
}

router.post('/signup', async (req, res) => {
  const { user_id, user_name, email, user_password, is_vendor } = req.body;

  if (!isValidPassword(user_password)) {
    return res.status(400).json({ error: 'Password must be 8+ chars, include a number, letter & special character.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(user_password, 10);
    await db.execute(
      `INSERT INTO user (user_id, user_name, email, user_password, is_vendor)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, user_name, email, hashedPassword, is_vendor ? 1 : 0]
    );
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error('❌ Signup Error:', err.message);
    res.status(500).json({ error: 'Signup failed.' });
  }
});



// Password validation regex
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

router.post('/register', async (req, res) => {
  const {
    email,
    password,
    username,
    first_name,
    last_name,
    address,
    is_vendor
  } = req.body;

  // Password validation
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: "Password must be at least 8 characters long and include 1 letter, 1 number, and 1 symbol."
    });
  }

  try {
    // Check if user exists
    const [existing] = await db.execute('SELECT * FROM user WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Date.now().toString(); // Or use uuid

    // Insert user
    await db.execute(
      `INSERT INTO user (
        user_id, user_name, email, user_password, is_vendor,
        first_name, last_name, address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        username,
        email,
        hashedPassword,
        is_vendor ? 1 : 0,
        first_name,
        last_name,
        address
      ]
    );

    // Generate token
    const token = jwt.sign({ user_id: userId, email, is_vendor }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    const userPayload = {
      user_id: userId,
      user_name: username,
      email,
      is_vendor,
      first_name,
      last_name,
      address
    };

    return res.status(200).json({
      token,
      user: userPayload,
      message: 'User registered successfully!'
    });
  } catch (err) {
    console.error('❌ Register Error:', err.message);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
});

  
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.execute('SELECT * FROM user WHERE email = ?', [email]);
    const user = users[0];
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const match = await bcrypt.compare(password, user.user_password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign(
      { user_id: user.user_id, is_vendor: !!user.is_vendor },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // ✅ Include all necessary user info
    const userPayload = {
      user_id: user.user_id,
      user_name: user.user_name,
      email: user.email,
      is_vendor: !!user.is_vendor,
      paid_user: !!user.paid_user, // ✅ Add this line
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      address: user.address || ''
    };
    

    res.json({ token, user: userPayload });
  } catch (err) {
    console.error('❌ Login Error:', err.message);
    res.status(500).json({ error: 'Login failed.' });
  }
});

  
module.exports = router; 
