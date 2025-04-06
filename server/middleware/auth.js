const jwt = require('jsonwebtoken');
const Agent = require('../models/Agent');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const agent = await Agent.findById(decoded.id).select('+active');

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Check if agent is active
    if (!agent.active) {
      const io = req.app.get('io');
      const userSockets = req.app.get('userSockets');
      const socketId = userSockets.get(agent._id.toString());
      
      if (socketId) {
        io.to(socketId).emit('force_logout', {
          reason: 'inactive',
          message: 'Your account has been deactivated'
        });
      }
      return res.status(403).json({ message: 'Account is inactive' });
    }

    req.user = agent;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid authentication' });
  }
};

module.exports = auth; 