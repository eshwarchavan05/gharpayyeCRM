import express from 'express';
import mongoose from 'mongoose';
import Lead from '../models/Lead.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// GET /api/leads/stats - Analytics data (Admin or Agent)
router.get('/stats', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection is currently unavailable.' });
    }

    let filter = {};
    if (req.user.role === 'agent') {
      filter.assignedTo = req.user._id;
    }

    const total = await Lead.countDocuments(filter);
    const byStatus = await Lead.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const byTemp = await Lead.aggregate([
      { $match: filter },
      { $group: { _id: '$leadTemperature', count: { $sum: 1 } } }
    ]);
    const bySource = await Lead.aggregate([
      { $match: filter },
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);
    const booked = byStatus.find(s => s._id === 'Booked')?.count || 0;

    res.json({
      total,
      conversionRate: total ? Number(((booked / total) * 100).toFixed(1)) : 0,
      byStatus,
      byTemp,
      bySource,
    });
  } catch (err) {
    console.error('[leads/stats error]', err);
    res.status(500).json({ message: err.message || 'Failed to fetch lead stats' });
  }
});

// GET /api/leads - List leads with filters, search, and pagination
router.get('/', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection is currently unavailable.' });
    }

    const { status, location, agent, search, page = 1, limit = 50 } = req.query;
    let query = {};

    if (req.user.role === 'agent') {
      query.assignedTo = req.user._id;
    } else if (agent) {
      query.assignedTo = agent;
    }

    if (status) query.status = status;
    if (location) query.preferredLocation = new RegExp(location, 'i');
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const total = await Lead.countDocuments(query);
    const parsedLimit = Math.min(Number(limit) || 50, 100);
    const parsedPage = Math.max(Number(page) || 1, 1);

    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email role')
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit);

    res.json({
      leads,
      total,
      page: parsedPage,
      pages: Math.ceil(total / parsedLimit) || 1,
    });
  } catch (err) {
    console.error('[GET /leads error]', err);
    res.status(500).json({ message: err.message || 'Failed to fetch leads' });
  }
});

// POST /api/leads - Create new lead
router.post('/', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection is currently unavailable.' });
    }

    const leadData = { ...req.body };

    if (!leadData.name || !leadData.phone) {
      return res.status(400).json({ message: 'Lead name and phone are required.' });
    }

    if (req.user.role === 'agent') {
      leadData.assignedTo = req.user._id;
    } else if (!leadData.assignedTo) {
      leadData.assignedTo = req.user._id;
    }

    const score = Number(leadData.score) || 0;
    leadData.score = score;
    leadData.leadTemperature = score >= 70 ? 'HOT' : score >= 40 ? 'WARM' : 'COLD';
    leadData.updatedAt = new Date();

    const lead = await Lead.create(leadData);
    await lead.populate('assignedTo', 'name email role');
    res.status(201).json(lead);
  } catch (err) {
    console.error('[POST /leads error]', err);
    res.status(500).json({ message: err.message || 'Failed to create lead' });
  }
});

// PUT /api/leads/:id and PATCH /api/leads/:id - Update lead
const updateLeadHandler = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection is currently unavailable.' });
    }

    const existingLead = await Lead.findById(req.params.id);
    if (!existingLead) {
      return res.status(404).json({ message: 'Lead not found.' });
    }

    // Role-based authorization
    if (req.user.role === 'agent') {
      if (existingLead.assignedTo && existingLead.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden: You can only edit leads assigned to you.' });
      }
      if (req.body.assignedTo && req.body.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden: Agents cannot reassign leads.' });
      }
    }

    const updatePayload = { ...req.body, updatedAt: new Date() };

    if (typeof updatePayload.score !== 'undefined') {
      const score = Number(updatePayload.score);
      updatePayload.leadTemperature = score >= 70 ? 'HOT' : score >= 40 ? 'WARM' : 'COLD';
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email role');

    res.json(updatedLead);
  } catch (err) {
    console.error('[PUT /leads/:id error]', err);
    res.status(500).json({ message: err.message || 'Failed to update lead' });
  }
};

router.put('/:id', auth, updateLeadHandler);
router.patch('/:id', auth, updateLeadHandler);

// DELETE /api/leads/:id - Delete lead (Admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection is currently unavailable.' });
    }

    const deleted = await Lead.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Lead not found.' });
    }
    res.json({ message: 'Lead deleted successfully', id: req.params.id });
  } catch (err) {
    console.error('[DELETE /leads/:id error]', err);
    res.status(500).json({ message: err.message || 'Failed to delete lead' });
  }
});

export default router;
