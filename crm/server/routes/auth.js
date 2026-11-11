import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { auth, getJwtSecret } from '../middleware/auth.js';
import { isValidEmail, isValidPassword, isValidName } from '../utils/validation.js';

const router = express.Router();

// GET /api/auth/me - Verify token and get current authenticated user profile
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar || '',
        createdAt: req.user.createdAt
      }
    });
  } catch (err) {
    console.error('[auth/me]', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/signup - Register new user account
router.post('/signup', async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    name = typeof name === 'string' ? name.trim() : '';
    email = typeof email === 'string' ? email.trim().toLowerCase() : '';

    // 1. Strict Input Validation (runs before DB operations)
    if (!isValidName(name)) {
      return res.status(400).json({
        message: 'Invalid name. Must be at least 3 alphabetic characters and not a generic placeholder.'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: 'Invalid or disposable email address. Please use a valid email.'
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character.'
      });
    }

    if (role && !['admin', 'agent'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be admin or agent.' });
    }

    // 2. Database Connection Check
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: 'Database is currently offline. Please ensure MongoDB is running and MONGO_URI is set.'
      });
    }

    // 3. Duplicate check & User Creation
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'agent'
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('[signup error]', err);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    res.status(500).json({ message: err.message || 'Internal server error while creating account.' });
  }
});

// POST /api/auth/login - Authenticate existing user
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;

    email = typeof email === 'string' ? email.trim().toLowerCase() : '';

    // 1. Input Presence Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // 2. Database Connection Check
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: 'Database is currently offline. Please ensure MongoDB is running and MONGO_URI is set.'
      });
    }

    // 3. User verification
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('[login error]', err);
    res.status(500).json({ message: err.message || 'Internal server error during login.' });
  }
});

export default router;
