import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users - List team members
router.get('/', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection is currently unavailable.' });
    }

    const users = await User.find().select('-password').sort({ name: 1 });
    res.json(users);
  } catch (err) {
    console.error('[GET /users error]', err);
    res.status(500).json({ message: err.message || 'Failed to fetch users' });
  }
});

// POST /api/users - Create new user (Admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection is currently unavailable.' });
    }

    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role || 'agent'
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error('[POST /users error]', err);
    res.status(500).json({ message: err.message || 'Failed to create user' });
  }
});

// DELETE /api/users/:id - Delete user (Admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection is currently unavailable.' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ message: 'User deleted successfully', id: req.params.id });
  } catch (err) {
    console.error('[DELETE /users/:id error]', err);
    res.status(500).json({ message: err.message || 'Failed to delete user' });
  }
});

export default router;
