const express = require('express');
const router = express.Router();
const SentimentAnalysis = require('../models/SentimentAnalysis');
const auth = require('../middleware/auth');

// Get all analysis history for the authenticated agent
router.get('/', auth, async (req, res) => {
  try {
    // req.user.id comes from auth middleware
    const analyses = await SentimentAnalysis.find({ agent: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to most recent 50 analyses

    res.json(analyses);
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get analysis history with pagination and filters
router.get('/search', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, sentiment, startDate, endDate, sortBy = 'createdAt', sortOrder = -1 } = req.query;
    
    const query = { agent: req.user.id };
    
    // Add sentiment filter if provided
    if (sentiment) {
      query.sentiment = sentiment;
    }
    
    // Add date range filter if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Create sort object
    const sort = {};
    sort[sortBy] = parseInt(sortOrder);
    
    // Execute query with pagination
    const analyses = await SentimentAnalysis.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await SentimentAnalysis.countDocuments(query);
    
    res.json({
      analyses,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error searching analysis history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific analysis by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const analysis = await SentimentAnalysis.findOne({ 
      _id: req.params.id,
      agent: req.user.id
    });
    
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }
    
    res.json(analysis);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin route - Get all analyses with pagination
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Check if user is admin (this would be handled by middleware in practice)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { page = 1, limit = 20 } = req.query;
    
    const analyses = await SentimentAnalysis.find()
      .populate('agent', 'name email department')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    
    const total = await SentimentAnalysis.countDocuments();
    
    res.json({
      analyses,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching all analyses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an analysis (can only delete own analyses)
router.delete('/:id', auth, async (req, res) => {
  try {
    const analysis = await SentimentAnalysis.findOneAndDelete({
      _id: req.params.id,
      agent: req.user.id
    });
    
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }
    
    res.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 