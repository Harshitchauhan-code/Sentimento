const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['agent', 'admin'],
    default: 'agent'
  },
  department: {
    type: String,
    enum: [
      'General Support',
      'Technical Support',
      'Billing',
      'Product Support',
      'Account Management',
      'Sales',
      'Customer Retention',
      'Complaints',
      'Management'
    ],
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
agentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
agentSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Agent = mongoose.model('Agent', agentSchema);

module.exports = Agent; 