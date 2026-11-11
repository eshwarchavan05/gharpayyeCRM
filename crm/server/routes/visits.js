import express from 'express';
import mongoose from 'mongoose';
import Visit from '../models/Visit.js';
import Lead from '../models/Lead.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// GET /api/visits - List visits
router.get('/', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection is currently unavailable.' });
    }

    let query = {};
    if (req.user.role === 'agent') {
      query.agentId = req.user._id;
    }

    const visits = await Visit.find(query)
      .populate('leadId', 'name phone email preferredLocation')
      .populate('agentId', 'name email role')
      .sort({ visitDate: 1 });

    res.json(visits);
  } catch (err) {
    console.error('[GET /visits error]', err);
    res.status(500).json({ message: err.message || 'Failed to fetch visits' });
  }
});

// POST /api/visits - Schedule new visit
router.post('/', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection is currently unavailable.' });
    }

    const { leadId, agentId, visitDate, propertyAddress, remarks } = req.body;

    if (!leadId || !visitDate) {
      return res.status(400).json({ message: 'Lead ID and Visit Date are required.' });
    }

    const assignedAgentId = req.user.role === 'agent' ? req.user._id : (agentId || req.user._id);

    const visit = await Visit.create({
      leadId,
      agentId: assignedAgentId,
      visitDate,
      propertyAddress: propertyAddress || '',
      remarks: remarks || '',
      status: 'Scheduled',
    });

    // Update lead status to 'Visit Scheduled'
    await Lead.findByIdAndUpdate(leadId, {
      status: 'Visit Scheduled',
      visitDate,
      updatedAt: new Date()
    });

    await visit.populate(['leadId', 'agentId']);
    res.status(201).json(visit);
  } catch (err) {
    console.error('[POST /visits error]', err);
    res.status(500).json({ message: err.message || 'Failed to schedule visit' });
  }
});

// PUT /api/visits/:id and PATCH /api/visits/:id - Update visit
const updateVisitHandler = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection is currently unavailable.' });
    }

    const existingVisit = await Visit.findById(req.params.id);
    if (!existingVisit) {
      return res.status(404).json({ message: 'Visit not found.' });
    }

    if (req.user.role === 'agent' && existingVisit.agentId && existingVisit.agentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own assigned visits.' });
    }

    const updatedVisit = await Visit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('leadId', 'name phone email')
      .populate('agentId', 'name email role');

    res.json(updatedVisit);
  } catch (err) {
    console.error('[PUT /visits/:id error]', err);
    res.status(500).json({ message: err.message || 'Failed to update visit' });
  }
};

router.put('/:id', auth, updateVisitHandler);
router.patch('/:id', auth, updateVisitHandler);

// DELETE /api/visits/:id - Delete visit
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection is currently unavailable.' });
    }

    const deleted = await Visit.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Visit not found.' });
    }

    res.json({ message: 'Visit deleted successfully', id: req.params.id });
  } catch (err) {
    console.error('[DELETE /visits/:id error]', err);
    res.status(500).json({ message: err.message || 'Failed to delete visit' });
  }
});

export default router;
