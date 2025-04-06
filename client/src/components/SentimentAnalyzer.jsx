import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Grid,
  Chip,
  useTheme,
  Fade,
  IconButton,
  Alert,
  Tooltip,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import axios from 'axios';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useAuth } from '../context/AuthContext';

const AppContainer = styled(Box)({
  minHeight: '100vh',
  background: '#ffffff',
  padding: '2rem',
});

const ContentWrapper = styled(Box)({
  maxWidth: 1000,
  margin: '0 auto',
});

const InputCard = styled(Box)({
  background: '#ffffff',
  borderRadius: '16px',
  padding: '2rem',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    '& fieldset': {
      borderColor: '#e2e8f0',
    },
    '&:hover fieldset': {
      borderColor: '#2563eb',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2563eb',
      borderWidth: 1,
    }
  }
});

// Add these keyframes for button animations
const buttonGlow = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const loadingSpinner = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Update the AnalyzeButton styling
const AnalyzeButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(270deg, #3b82f6, #2563eb, #1d4ed8)',
  backgroundSize: '200% 200%',
  color: 'white',
  padding: '12px 32px',
  borderRadius: '12px',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 600,
  boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'all 0.5s ease',
  },

  '&:hover': {
    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
    animation: `${buttonGlow} 3s ease infinite`,

    '&::before': {
      left: '100%',
    }
  },

  '&:active': {
    boxShadow: '0 2px 4px -1px rgba(59, 130, 246, 0.2)',
  },

  '&:disabled': {
    background: '#94a3b8',
    transform: 'none',
    boxShadow: 'none',
    animation: 'none',
    
    '&::before': {
      display: 'none'
    }
  },

  // Custom loading spinner
  '& .MuiCircularProgress-root': {
    animation: `${loadingSpinner} 1s linear infinite`,
    marginRight: '8px'
  }
}));

const MetricCard = styled(Box)({
  background: '#ffffff',
  borderRadius: '16px',
  padding: '1.5rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  border: '1px solid #f1f5f9',
});

const SENTIMENT_COLORS = {
  'extremely positive': '#15803d',    // Forest Green
  'very positive': '#16a34a',         // Deep Green
  'moderately positive': '#22c55e',   // Vibrant Green
  'slightly positive': '#4ade80',     // Fresh Green
  'neutral': '#6b7280',               // Gray-500
  'factual': '#3b82f6',              // Blue-500
  'mixed': '#f59e0b',                // Amber-500
  'slightly negative': '#f87171',     // Red-400
  'moderately negative': '#ef4444',   // Red-500
  'very negative': '#dc2626',         // Red-600
  'extremely negative': '#b91c1c'     // Red-700
};

const ScoreChip = styled(Chip)(({ sentiment, score }) => {
  const getColor = () => {
    if (!sentiment) {
      if (score > 75) return SENTIMENT_COLORS['extremely positive'];
      if (score > 50) return SENTIMENT_COLORS['very positive'];
      if (score > 25) return SENTIMENT_COLORS['moderately positive'];
      if (score > 0) return SENTIMENT_COLORS['slightly positive'];
      if (score === 0) return SENTIMENT_COLORS['neutral'];
      if (score > -25) return SENTIMENT_COLORS['slightly negative'];
      if (score > -50) return SENTIMENT_COLORS['moderately negative'];
      if (score > -75) return SENTIMENT_COLORS['very negative'];
      return SENTIMENT_COLORS['extremely negative'];
    }
    return SENTIMENT_COLORS[sentiment.toLowerCase()] || SENTIMENT_COLORS['neutral'];
  };

  return {
    backgroundColor: getColor(),
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '0.875rem',
    height: 32,
    boxShadow: `0 2px 4px ${getColor()}40`,
    '& .MuiChip-label': {
      padding: '0 16px',
    }
  };
});

const StatBox = styled(Box)(({ value }) => {
  const getBackgroundColor = () => {
    if (value > 75) return `${SENTIMENT_COLORS['extremely positive']}15`;
    if (value > 50) return `${SENTIMENT_COLORS['very positive']}15`;
    if (value > 25) return `${SENTIMENT_COLORS['moderately positive']}15`;
    return '#f8fafc';
  };

  const getTextColor = () => {
    if (value > 75) return SENTIMENT_COLORS['extremely positive'];
    if (value > 50) return SENTIMENT_COLORS['very positive'];
    if (value > 25) return SENTIMENT_COLORS['moderately positive'];
    return '#334155';
  };

  return {
    padding: '1.25rem',
    borderRadius: '12px',
    backgroundColor: getBackgroundColor(),
    textAlign: 'center',
    border: '1px solid',
    borderColor: value > 25 ? `${getTextColor()}15` : '#e2e8f0',
    '& .MuiTypography-h6': {
      color: getTextColor(),
      fontWeight: 600
    }
  };
});

// Add this component for consistent tooltip styling
const InfoTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  '& .MuiTooltip-tooltip': {
    backgroundColor: '#1e293b',
    color: '#fff',
    padding: '12px 16px',
    fontSize: '0.875rem',
    borderRadius: '8px',
    maxWidth: 300,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  }
});

const SentimentAnalyzer = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const { checkUserExists } = useAuth();

  useEffect(() => {
    // Check user existence every 30 seconds
    const checkInterval = setInterval(checkUserExists, 30000);
    return () => clearInterval(checkInterval);
  }, []);

  const analyzeSentiment = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await axios.post('http://localhost:8080/api/sentiment/analyze', { text });
      setResult(response.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Error analyzing sentiment');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setResult(null);
    setError(null);
  };

  return (
    <AppContainer>
      <ContentWrapper>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            color: '#1e293b',
            mb: 2,
            fontSize: { xs: '2rem', md: '2.5rem' }
          }}>
            Sentiment Analyzer
          </Typography>
          <Typography sx={{ 
            color: '#64748b', 
            fontSize: '1.125rem',
            maxWidth: 500,
            mx: 'auto'
          }}>
            Analyze emotions across multiple Indiana languages
          </Typography>
        </Box>

        {/* Input Section */}
        <InputCard>
          <StyledTextField
            fullWidth
            multiline
            rows={4}
            placeholder="Enter your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            variant="outlined"
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
            {text && (
              <IconButton onClick={handleClear} sx={{ color: '#94a3b8' }}>
                <DeleteOutlineIcon />
              </IconButton>
            )}
            <AnalyzeButton
              onClick={analyzeSentiment}
              disabled={!text.trim() || loading}
              sx={{
                minWidth: '160px',  // Ensure consistent width during loading
                position: 'relative'
              }}
            >
              {loading ? (
                <>
                  <CircularProgress 
                    size={16}
                    thickness={4}
                    sx={{ 
                      color: 'inherit',
                      position: 'absolute',
                      left: '20px'
                    }} 
                  />
                  <span style={{ marginLeft: '8px' }}>Analyzing...</span>
                </>
              ) : (
                'Analyze Sentiment'
              )}
            </AnalyzeButton>
          </Box>
        </InputCard>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 3,
              borderRadius: '12px',
            }}
          >
            {error}
          </Alert>
        )}

        {/* Results */}
        {result && (
          <Fade in timeout={500}>
            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Main Score Card */}
              <MetricCard>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={5}>
                    <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle1" color="#64748b" gutterBottom>
                            Score 
                          </Typography>
                      <Typography variant="h2" sx={{ 
                        fontWeight: 700, 
                        color: SENTIMENT_COLORS[result.sentiment.toLowerCase()],
                        mb: 1,
                        fontSize: '3rem'
                      }}>
                        {result.score.toFixed(2)}
                      </Typography>
                      <ScoreChip 
                        label={result.sentiment} 
                        sentiment={result.sentiment}
                        score={result.score}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <MetricCard>
                          <Typography variant="subtitle1" color="#64748b" gutterBottom>
                            Starting Emotion
                          </Typography>
                          <Typography variant="h4" sx={{ 
                            color: SENTIMENT_COLORS[result.emotional_journey.start.state.toLowerCase()],
                            fontWeight: 600,
                            mb: 1
                          }}>
                            {(result.emotional_journey.start.score * 100).toFixed(2)}
                          </Typography>
                          <ScoreChip 
                            label={result.emotional_journey.start.state}
                            sentiment={result.emotional_journey.start.state}
                            score={result.emotional_journey.start.score * 100}
                          />
                        </MetricCard>
                      </Grid>
                      <Grid item xs={6}>
                        <MetricCard>
                          <Typography variant="subtitle1" color="#64748b" gutterBottom>
                            Ending Emotion
                          </Typography>
                          <Typography variant="h4" sx={{ 
                            color: SENTIMENT_COLORS[result.emotional_journey.end.state.toLowerCase()],
                            fontWeight: 600,
                            mb: 1
                          }}>
                            {(result.emotional_journey.end.score * 100).toFixed(2)}
                          </Typography>
                          <ScoreChip 
                            label={result.emotional_journey.end.state}
                            sentiment={result.emotional_journey.end.state}
                            score={result.emotional_journey.end.score * 100}
                          />
                        </MetricCard>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </MetricCard>
            </Box>
          </Fade>
        )}
      </ContentWrapper>
    </AppContainer>
  );
};

export default SentimentAnalyzer;