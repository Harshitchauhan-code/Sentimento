const express = require('express');
const router = express.Router();
const { PythonShell } = require('python-shell');
const path = require('path');

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

router.post('/analyze', async (req, res) => {
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