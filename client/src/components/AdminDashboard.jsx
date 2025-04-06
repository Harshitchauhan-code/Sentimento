import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Alert,
  Tooltip,
  Fab,
  Tabs,
  Tab,
  TablePagination,
  Avatar,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AddIcon from '@mui/icons-material/Add';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { styled, keyframes } from '@mui/material/styles';
import { format } from 'date-fns';

const buttonGlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const AddAgentButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)',
  backgroundSize: '200% 200%',
  color: 'white',
  padding: '8px 24px',
  borderRadius: '8px',
  fontWeight: 600,
  '&:hover': {
    animation: `${buttonGlow} 3s ease infinite`,
    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
  }
}));

const CreateAgentButton = styled(Button)({
  background: 'linear-gradient(270deg, #3b82f6, #2563eb, #1d4ed8)',
  backgroundSize: '200% 200%',
  color: 'white',
  padding: '8px 20px',
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '0.875rem',
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
    boxShadow: '0 6px 10px -1px rgba(59, 130, 246, 0.3)',
    animation: `${buttonGlow} 3s ease infinite`,
    '&::before': {
      left: '100%',
    }
  },

  '&:active': {
    boxShadow: '0 2px 4px -1px rgba(59, 130, 246, 0.2)',
  },
});

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [agents, setAgents] = useState([]);
  const [editAgent, setEditAgent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isNewAgent, setIsNewAgent] = useState(false);
  const { user } = useAuth();

  const [analyses, setAnalyses] = useState([]);
  const [analysesPage, setAnalysesPage] = useState(0);
  const [analysesRowsPerPage, setAnalysesRowsPerPage] = useState(10);
  const [analysesTotal, setAnalysesTotal] = useState(0);
  const [loadingAnalyses, setLoadingAnalyses] = useState(false);

  const initialAgentState = {
    name: '',
    email: '',
    password: '',
    department: 'General Support',
    role: 'agent',
    active: true
  };

  const departments = [
    'General Support',
    'Technical Support',
    'Billing',
    'Product Support',
    'Account Management',
    'Sales',
    'Customer Retention',
    'Complaints',
    'Management'
  ];

  const axiosAuth = axios.create({
    headers: {
      'Authorization': `Bearer ${user.token}`
    }
  });

  const fetchAgents = async () => {
    try {
      const response = await axiosAuth.get('http://localhost:8080/api/agents');
      setAgents(response.data);
    } catch (error) {
      setError('Failed to fetch agents: ' + error.message);
    }
  };

  const fetchAllAnalyses = async () => {
    setLoadingAnalyses(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/analysis-history/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          page: analysesPage + 1,
          limit: analysesRowsPerPage
        }
      });
      
      setAnalyses(response.data.analyses);
      setAnalysesTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching analysis data:', error);
      setError('Failed to fetch sentiment analyses');
    } finally {
      setLoadingAnalyses(false);
    }
  };

  useEffect(() => {
    if (activeTab === 0) {
      fetchAgents();
    } else if (activeTab === 2) {
      fetchAllAnalyses();
    }
  }, [activeTab, analysesPage, analysesRowsPerPage]);

  const handleAddNewClick = () => {
    setIsNewAgent(true);
    setEditAgent(initialAgentState);
    setOpenDialog(true);
  };

  const handleEditClick = (agent) => {
    setIsNewAgent(false);
    setEditAgent({ ...agent, password: '' }); // Clear password when editing
    setOpenDialog(true);
  };

  const handleDeleteClick = async (agentId) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await axiosAuth.delete(`http://localhost:8080/api/agents/${agentId}`);
        setSuccess('Agent deleted successfully');
        fetchAgents();
      } catch (error) {
        setError('Failed to delete agent: ' + error.message);
      }
    }
  };

  const handleStatusToggle = async (agentId, currentStatus) => {
    try {
      await axiosAuth.patch(`http://localhost:8080/api/agents/${agentId}/status`, {
        active: !currentStatus
      });
      setSuccess(`Agent ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchAgents();
    } catch (error) {
      setError('Failed to update agent status: ' + error.message);
    }
  };

  const handleSaveEdit = async () => {
    try {
      if (isNewAgent) {
        await axiosAuth.post('http://localhost:8080/api/agents', editAgent);
        setSuccess('Agent created successfully');
      } else {
        // For edit, don't send empty password
        const agentData = editAgent.password ? editAgent : { ...editAgent, password: undefined };
        await axiosAuth.put(`http://localhost:8080/api/agents/${editAgent._id}`, agentData);
        setSuccess('Agent updated successfully');
      }
      setOpenDialog(false);
      fetchAgents();
    } catch (error) {
      setError('Failed to save agent: ' + error.message);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditAgent(null);
    setIsNewAgent(false);
    setError('');
  };

  const handleAnalysesPageChange = (event, newPage) => {
    setAnalysesPage(newPage);
  };

  const handleAnalysesRowsPerPageChange = (event) => {
    setAnalysesRowsPerPage(parseInt(event.target.value, 10));
    setAnalysesPage(0);
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
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

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Agents" />
          <Tab label="Statistics" />
          <Tab label="Sentiment Analyses" icon={<AnalyticsIcon />} iconPosition="start" />
        </Tabs>

        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                Agent Management
              </Typography>
              <AddAgentButton 
                variant="contained" 
                onClick={handleAddNewClick}
                startIcon={<AddIcon />}
              >
                Add New Agent
              </AddAgentButton>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow key={agent._id}>
                      <TableCell>{agent.name}</TableCell>
                      <TableCell>{agent.email}</TableCell>
                      <TableCell>{agent.department}</TableCell>
                      <TableCell>
                        <Chip 
                          label={agent.role}
                          color={agent.role === 'admin' ? 'error' : 'primary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={agent.active ? 'Active' : 'Inactive'}
                          color={agent.active ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {agent.lastLogin ? new Date(agent.lastLogin).toLocaleString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton 
                            color="primary"
                            onClick={() => handleEditClick(agent)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={agent.active ? 'Deactivate' : 'Activate'}>
                          <IconButton
                            color={agent.active ? 'error' : 'success'}
                            onClick={() => handleStatusToggle(agent._id, agent.active)}
                          >
                            <BlockIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(agent._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {agents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">No agents found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5">
              Statistics Dashboard (Coming soon)
            </Typography>
          </Box>
        )}

        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              All Sentiment Analyses
            </Typography>
            
            {loadingAnalyses ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Agent</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Text</TableCell>
                        <TableCell>Sentiment</TableCell>
                        <TableCell>Score</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analyses.map((analysis) => (
                        <TableRow key={analysis._id}>
                          <TableCell>{formatDate(analysis.createdAt)}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar 
                                sx={{ 
                                  width: 28, 
                                  height: 28,
                                  bgcolor: 'primary.main',
                                  fontSize: '0.75rem' 
                                }}
                              >
                                {analysis.agent?.name ? analysis.agent.name.charAt(0).toUpperCase() : 'U'}
                              </Avatar>
                              {analysis.agent?.name}
                            </Box>
                          </TableCell>
                          <TableCell>{analysis.agent?.department}</TableCell>
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
                        </TableRow>
                      ))}
                      {analyses.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            No analyses found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50]}
                  component="div"
                  count={analysesTotal}
                  rowsPerPage={analysesRowsPerPage}
                  page={analysesPage}
                  onPageChange={handleAnalysesPageChange}
                  onRowsPerPageChange={handleAnalysesRowsPerPageChange}
                />
              </>
            )}
          </Box>
        )}
      </Paper>

      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isNewAgent ? 'Add New Agent' : 'Edit Agent'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" sx={{ mt: 2 }}>
            <Stack spacing={2}>
              <TextField
                label="Name"
                name="name"
                value={editAgent?.name || ''}
                onChange={(e) => setEditAgent({ ...editAgent, name: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={editAgent?.email || ''}
                onChange={(e) => setEditAgent({ ...editAgent, email: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label={isNewAgent ? "Password" : "Password (leave blank to keep current)"}
                name="password"
                type="password"
                value={editAgent?.password || ''}
                onChange={(e) => setEditAgent({ ...editAgent, password: e.target.value })}
                fullWidth
                required={isNewAgent}
              />
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  name="department"
                  value={editAgent?.department || ''}
                  onChange={(e) => setEditAgent({ ...editAgent, department: e.target.value })}
                  label="Department"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={editAgent?.role || 'agent'}
                  onChange={(e) => setEditAgent({ ...editAgent, role: e.target.value })}
                  label="Role"
                >
                  <MenuItem value="agent">Agent</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="active"
                  value={editAgent?.active === undefined ? true : editAgent.active}
                  onChange={(e) => setEditAgent({ ...editAgent, active: e.target.value })}
                  label="Status"
                >
                  <MenuItem value={true}>Active</MenuItem>
                  <MenuItem value={false}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <CreateAgentButton onClick={handleSaveEdit}>
            {isNewAgent ? 'Create Agent' : 'Save Changes'}
          </CreateAgentButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard; 