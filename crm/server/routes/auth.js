import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET_KEY } from '../middleware/auth.js';
import { isValidEmail, isValidPassword, isValidName } from '../utils/validation.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    let { name, email, password, role } = req.body;
    
    // Sanitize input
    name = typeof name === 'string' ? name.trim() : '';
    email = typeof email === 'string' ? email.trim().toLowerCase() : '';
    
    // Strict Validation
    if (!isValidName(name)) {
      return res.status(400).json({ message: 'Invalid name. Use only alphabets (min 3 chars). generic strings not allowed.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid or disposable email address.' });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 chars + 1 uppercase + 1 lowercase + 1 number + 1 special char.' });
    }
    if (role && !['admin', 'agent'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already exists' });

    // Prevent duplicate full names if required (optional, let's just make sure it's fairly unique or not duplicate in the system for admin/agent, let's just enforce email uniqueness)
    const user = await User.create({ name, email, password, role: role || 'agent' });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET_KEY, { expiresIn: '7d' });
    
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('[signup]', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    
    email = typeof email === 'string' ? email.trim().toLowerCase() : '';
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET_KEY, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('[login]', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
