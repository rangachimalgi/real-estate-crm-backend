import express from 'express';
import SiteVisit from '../models/SiteVisit.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const newVisit = new SiteVisit(req.body);
    await newVisit.save();
    res.status(201).json({ success: true, message: 'Site visit request submitted!' });
  } catch (err) {
    console.error('❌ Error saving site visit:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const visits = await SiteVisit.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json(visits);
  } catch (err) {
    console.error('❌ Error fetching site visits:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
