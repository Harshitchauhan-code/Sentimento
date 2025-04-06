import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Paper, 
  TableContainer, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell, 
  TablePagination,
  Chip,
  IconButton,
  Grid,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { ViewList, Delete } from '@mui/icons-material';
import { format } from 'date-fns';

const AnalysisHistory = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      };

      // Get token from user object
      const token = user?.token;
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await axios.get('http://localhost:8080/api/analysis-history/search', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        params
      });

      setAnalyses(response.data.analyses);
      setTotalCount(response.data.total);
      setError(null);
    } catch (err) {
      console.error('Error fetching analysis history:', err);
      if (err.response?.status === 403) {
        setError('Access denied. Please log in again.');
      } else if (err.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else {
        setError('Failed to load analysis history. Please try again later.');
      }
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (analysis) => {
    setSelectedAnalysis(analysis);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  const handleDeleteAnalysis = async (id) => {
    try {
      // Get token from user object
      const token = user?.token;
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      await axios.delete(`http://localhost:8080/api/analysis-history/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Refresh the analyses list after deletion
      fetchAnalyses();
    } catch (err) {
      console.error('Error deleting analysis:', err);
      if (err.response?.status === 403) {
        setError('Access denied. Please log in again.');
      } else if (err.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else {
        setError('Failed to delete analysis. Please try again later.');
      }
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return '#4caf50';
      case 'negative':
        return '#f44336';
      case 'neutral':
        return '#9e9e9e';
      case 'mixed':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Sentiment Analysis History
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Text</TableCell>
                    <TableCell>Sentiment</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analyses.map((analysis) => (
                    <TableRow key={analysis._id}>
                      <TableCell>{formatDate(analysis.createdAt)}</TableCell>
                      <TableCell>{truncateText(analysis.text)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)} 
                          size="small"
                          sx={{ 
                            backgroundColor: getSentimentColor(analysis.sentiment),
                            color: 'white'
                          }}
                        />
                      </TableCell>
                      <TableCell>{analysis.score.toFixed(3)}</TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => handleViewDetails(analysis)}>
                            <ViewList fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteAnalysis(analysis._id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {analyses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No analysis history found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Analysis Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        {selectedAnalysis && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              Analysis Details
            </DialogTitle>
            <Box sx={{ px: 3, pb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {formatDate(selectedAnalysis.createdAt)}
              </Typography>
            </Box>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold">Input Text</Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography>{selectedAnalysis.text}</Typography>
                </Paper>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Sentiment Analysis</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography>Overall Sentiment:</Typography>
                      <Chip 
                        label={selectedAnalysis.sentiment.charAt(0).toUpperCase() + selectedAnalysis.sentiment.slice(1)} 
                        size="small"
                        sx={{ 
                          backgroundColor: getSentimentColor(selectedAnalysis.sentiment),
                          color: 'white'
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography>Sentiment Score:</Typography>
                      <Typography fontWeight="bold">{selectedAnalysis.score.toFixed(3)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Confidence:</Typography>
                      <Typography fontWeight="bold">{selectedAnalysis.confidence.toFixed(3)}</Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Emotional Journey</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography>Starting Emotion:</Typography>
                      <Chip 
                        label={selectedAnalysis.emotionalJourney.start.state} 
                        size="small"
                        sx={{ 
                          backgroundColor: getSentimentColor(selectedAnalysis.emotionalJourney.start.state),
                          color: 'white'
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography>Ending Emotion:</Typography>
                      <Chip 
                        label={selectedAnalysis.emotionalJourney.end.state} 
                        size="small"
                        sx={{ 
                          backgroundColor: getSentimentColor(selectedAnalysis.emotionalJourney.end.state),
                          color: 'white'
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography>Emotional Fluctuation:</Typography>
                      <Typography fontWeight="bold">{selectedAnalysis.emotionalJourney.fluctuation.toFixed(2)}%</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography>Emotional Stability:</Typography>
                      <Typography fontWeight="bold">{selectedAnalysis.emotionalJourney.stability.toFixed(2)}%</Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AnalysisHistory; 