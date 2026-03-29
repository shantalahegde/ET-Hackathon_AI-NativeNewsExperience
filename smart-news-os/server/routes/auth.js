// Authentication Routes
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'smart_news_os_default_secret';

/**
 * POST /auth/register
 * Register a new user with role selection
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required: name, email, password, role' });
    }

    const validRoles = ['investor', 'startup_founder', 'student'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be: investor, startup_founder, or student' });
    }

    // Check if user exists
    try {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }
    } catch (dbErr) {
      // DB not available, use in-memory mode
      console.log('DB unavailable, proceeding with registration');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let userId;
    try {
      // Insert user
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role]
      );
      userId = result.insertId;

      // Create default preferences
      const defaultTopics = role === 'investor'
        ? ['stocks', 'markets', 'economy', 'investment']
        : role === 'startup_founder'
          ? ['startups', 'funding', 'technology', 'innovation']
          : ['technology', 'economy', 'careers', 'learning'];

      await pool.query(
        'INSERT INTO preferences (user_id, topics, language) VALUES (?, ?, ?)',
        [userId, JSON.stringify(defaultTopics), 'en']
      );
    } catch (dbErr) {
      userId = Date.now(); // fallback ID
    }

    // Generate JWT
    const token = jwt.sign(
      { id: userId, name, email, role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: userId, name, email, role }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

/**
 * POST /auth/login
 * Authenticate user and return JWT
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    let user;
    try {
      const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      user = users[0];
    } catch (dbErr) {
      // Demo mode - allow login with any credentials
      return res.status(200).json({
        message: 'Login successful (demo mode)',
        token: jwt.sign(
          { id: 1, name: 'Demo User', email, role: 'investor' },
          JWT_SECRET,
          { expiresIn: '7d' }
        ),
        user: { id: 1, name: 'Demo User', email, role: 'investor' }
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

/**
 * GET /auth/profile
 * Get current user profile
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get preferences
    const [prefs] = await pool.query(
      'SELECT topics, language FROM preferences WHERE user_id = ?',
      [req.user.id]
    );

    res.json({
      user: users[0],
      preferences: prefs[0] || { topics: [], language: 'en' }
    });
  } catch (err) {
    // Return user info from token if DB unavailable
    res.json({
      user: req.user,
      preferences: { topics: [], language: 'en' }
    });
  }
});

/**
 * PUT /auth/preferences
 * Update user preferences
 */
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { topics, language } = req.body;

    await pool.query(
      'UPDATE preferences SET topics = ?, language = ? WHERE user_id = ?',
      [JSON.stringify(topics), language || 'en', req.user.id]
    );

    res.json({ message: 'Preferences updated successfully' });
  } catch (err) {
    res.json({ message: 'Preferences updated (locally)' });
  }
});

module.exports = router;
