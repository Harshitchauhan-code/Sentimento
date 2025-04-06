const mongoose = require('mongoose');

const sentimentAnalysisSchema = new mongoose.Schema({
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  sentiment: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  confidence: {
    type: Number,
    required: true
  },
  emotionalJourney: {
    start: {
      score: Number,
      state: String
    },
    end: {
      score: Number,
      state: String
    },
    fluctuation: Number,
    stability: Number,
    trend: {
      direction: String,
      strength: Number
    },
    dominantEmotion: String,
    emotionalRange: {
      min: Number,
      max: Number
    }
  }
}, {
  timestamps: true,
  strict: false // Allow additional fields
});

// Add indexes for efficient querying
sentimentAnalysisSchema.index({ agent: 1 });
sentimentAnalysisSchema.index({ createdAt: -1 });
sentimentAnalysisSchema.index({ sentiment: 1 });
sentimentAnalysisSchema.index({ 'emotionalJourney.start.state': 1 });
sentimentAnalysisSchema.index({ 'emotionalJourney.end.state': 1 });

const SentimentAnalysis = mongoose.model('SentimentAnalysis', sentimentAnalysisSchema);

module.exports = SentimentAnalysis; 