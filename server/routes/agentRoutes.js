const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const auth = require('../middleware/auth');

// Get all agents (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const agents = await Agent.find().select('-password');
    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new agent (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const agent = new Agent(req.body);
    await agent.save();
    res.status(201).json(agent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update agent (admin only)
router.patch('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');
    res.json(agent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete agent (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    
    await Agent.findByIdAndDelete(req.params.id);
    
    io.emit(`force_logout_${req.params.id}`, {
      reason: 'deleted',
      message: 'Your account has been deleted by the administrator.'
    });
    
    const connectedSockets = await io.fetchSockets();
    connectedSockets.forEach(socket => {
      if (socket.userId === req.params.id) {
        socket.disconnect(true);
      }
    });
    
    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Toggle agent status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    const socketId = userSockets.get(req.params.id);
    
    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { $set: { active: req.body.active } },
      { new: true }
    ).select('-password');
    
    if (!req.body.active) {
      io.emit(`force_logout_${req.params.id}`, {
        reason: 'deactivated',
        message: 'Your account has been deactivated by the administrator.'
      });
      
      const connectedSockets = await io.fetchSockets();
      connectedSockets.forEach(socket => {
        if (socket.userId === req.params.id) {
          socket.disconnect(true);
        }
      });
    }
    
    res.json(agent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Check if agent exists
router.get('/check/:id', auth, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.status(200).json({ 
      exists: true,
      active: agent.active 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Notify user deletion
router.post('/:id/notify-deletion', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    // In a real-world application, you might want to use WebSockets 
    // or a similar technology to notify the client immediately
    res.status(200).json({ message: 'Notification sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Notify user status change
router.post('/:id/notify-status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    // In a real-world application, you might want to use WebSockets 
    // or a similar technology to notify the client immediately
    res.status(200).json({ message: 'Status notification sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 