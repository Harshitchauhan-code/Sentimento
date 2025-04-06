const mongoose = require('mongoose');
const Agent = require('../models/Agent');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const checkAgents = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const agents = await Agent.find({}).select('-password');
    console.log('\nExisting Agents:');
    agents.forEach(agent => {
      console.log(`\nName: ${agent.name}`);
      console.log(`Email: ${agent.email}`);
      console.log(`Role: ${agent.role}`);
      console.log(`Department: ${agent.department}`);
      console.log(`Active: ${agent.active}`);
      console.log('------------------------');
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

checkAgents(); 