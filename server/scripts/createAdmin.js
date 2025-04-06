const mongoose = require('mongoose');
const Agent = require('../models/Agent');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const agentsData = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    department: 'Management',
    active: true
  },
  {
    name: 'Tech Support Agent',
    email: 'tech@example.com',
    password: 'tech123',
    role: 'agent',
    department: 'Technical Support',
    active: true
  },
  {
    name: 'Billing Agent',
    email: 'billing@example.com',
    password: 'billing123',
    role: 'agent',
    department: 'Billing',
    active: true
  }
];

const createAgents = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    for (const agentData of agentsData) {
      const existingAgent = await Agent.findOne({ email: agentData.email });
      if (existingAgent) {
        console.log(`Agent ${agentData.email} already exists`);
        continue;
      }

      const agent = new Agent(agentData);
      await agent.save();
      console.log(`Created agent: ${agentData.email}`);
    }

  } catch (error) {
    console.error('Error creating agents:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createAgents(); 