const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Agent = require('../models/Agent');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email });

    // Find agent by email
    const agent = await Agent.findOne({ email });
    console.log('Agent found:', agent ? 'Yes' : 'No');

    if (!agent) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if agent is active
    if (!agent.active) {
      console.log('Agent account is inactive');
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Verify password
    const isMatch = await agent.comparePassword(password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    agent.lastLogin = new Date();
    await agent.save();

    // Create JWT token
    const token = jwt.sign(
      { 
        id: agent._id,
        email: agent.email,
        role: agent.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for:', email);

    // Send response
    res.json({
      token,
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        role: agent.role,
        department: agent.department
      }
    });

  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current agent profile
router.get('/profile', async (req, res) => {
  try {
    const agent = await Agent.findById(req.user.id).select('-password');
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.json(agent);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 