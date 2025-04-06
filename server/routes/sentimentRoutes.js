const express = require('express');
const router = express.Router();
const { PythonShell } = require('python-shell');
const path = require('path');
const SentimentAnalysis = require('../models/SentimentAnalysis');
const auth = require('../middleware/auth');

// Function to check and install Python dependencies
const checkDependencies = async () => {
  const options = {
    mode: 'json',
    pythonPath: 'python3',
    scriptPath: path.join(__dirname, '../python_services')
  };

  try {
    await PythonShell.run('setup_dependencies.py', options);
  } catch (error) {
    console.error('Error installing dependencies:', error);
  }
};

// Call this once when the server starts
checkDependencies();

router.post('/analyze', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        error: "No text provided",
        sentiment: "neutral",
        score: 0.000,
        emotional_journey: {
          start: {
            score: 0.000,
            state: "neutral"
          },
          end: {
            score: 0.000,
            state: "neutral"
          },
          fluctuation: 0.000,
          stability: 100.000,
          trend: {
            direction: "stable",
            strength: 0.000
          },
          dominant_emotion: "neutral",
          emotional_range: {
            min: 0.000,
            max: 0.000
          }
        },
        confidence: 0.000
      });
    }

    let options = {
      mode: 'json',
      pythonPath: 'python3',
      scriptPath: path.join(__dirname, '../python_services'),
      args: [text]
    };

    try {
      const results = await PythonShell.run('sentiment_service.py', options);
      if (!results || !results[0]) {
        throw new Error('Invalid response from Python script');
      }
      
      const result = results[0];
      
      // Check if there's an error in the result
      if (result.error) {
        return res.status(400).json(result);
      }

      // Store analysis result in database if user is authenticated
      if (req.user && req.user.id) {
        try {
          console.log('Preparing to save analysis for user:', req.user.id);
          
          const analysisData = {
            agent: req.user.id,
            text,
            sentiment: result.sentiment,
            score: result.score,
            confidence: result.confidence,
            createdAt: new Date(),
            emotionalJourney: {
              start: {
                score: result.emotional_journey.start.score,
                state: result.emotional_journey.start.state
              },
              end: {
                score: result.emotional_journey.end.score,
                state: result.emotional_journey.end.state
              },
              fluctuation: result.emotional_journey.fluctuation,
              stability: result.emotional_journey.stability,
              trend: {
                direction: result.emotional_journey.trend.direction,
                strength: result.emotional_journey.trend.strength
              },
              dominantEmotion: result.emotional_journey.dominant_emotion,
              emotionalRange: {
                min: result.emotional_journey.emotional_range.min,
                max: result.emotional_journey.emotional_range.max
              }
            }
          };

          console.log('Analysis data prepared:', JSON.stringify(analysisData, null, 2));

          const analysis = new SentimentAnalysis(analysisData);
          
          // Validate the document before saving
          const validationError = analysis.validateSync();
          if (validationError) {
            console.error('Validation error:', validationError);
            throw new Error('Invalid analysis data: ' + validationError.message);
          }

          const savedAnalysis = await analysis.save();
          
          if (!savedAnalysis) {
            throw new Error('Failed to save analysis - no document returned');
          }
          
          console.log('Analysis saved successfully with ID:', savedAnalysis._id);
          
          // Add the saved analysis data to the result
          result.savedAnalysisId = savedAnalysis._id;
          result.savedAt = savedAnalysis.createdAt;
          result.storedInDb = true;
        } catch (dbError) {
          console.error('Error saving analysis to database:', {
            error: dbError.message,
            stack: dbError.stack,
            validationErrors: dbError.errors
          });
          
          result.storedInDb = false;
          result.storageError = dbError.message || 'Failed to save analysis to database';
        }
      } else {
        console.warn('User not authenticated for analysis storage');
        result.storedInDb = false;
        result.storageError = 'User not authenticated';
      }
      
      res.json(result);
    } catch (pythonError) {
      console.error('Python execution error:', pythonError);
      res.status(500).json({
        error: "Error processing sentiment analysis",
        sentiment: "neutral",
        score: 0.000,
        emotional_journey: {
          start: {
            score: 0.000,
            state: "neutral"
          },
          end: {
            score: 0.000,
            state: "neutral"
          },
          fluctuation: 0.000,
          stability: 100.000,
          trend: {
            direction: "stable",
            strength: 0.000
          },
          dominant_emotion: "neutral",
          emotional_range: {
            min: 0.000,
            max: 0.000
          }
        },
        confidence: 0.000
      });
    }
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({
      error: error.message,
      sentiment: "neutral",
      score: 0.000,
      emotional_journey: {
        start: {
          score: 0.000,
          state: "neutral"
        },
        end: {
          score: 0.000,
          state: "neutral"
        },
        fluctuation: 0.000,
        stability: 100.000,
        trend: {
          direction: "stable",
          strength: 0.000
        },
        dominant_emotion: "neutral",
        emotional_range: {
          min: 0.000,
          max: 0.000
        }
      },
      confidence: 0.000
    });
  }
});

module.exports = router;