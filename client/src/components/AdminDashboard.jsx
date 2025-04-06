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
  Fab
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { styled, keyframes } from '@mui/material/styles';

const buttonGlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const AddAgentButton = styled(Button)({
  background: 'linear-gradient(270deg, #3b82f6, #2563eb, #1d4ed8)',
  backgroundSize: '200% 200%',
  color: 'white',
  padding: '12px 24px',
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
  const [agents, setAgents] = useState([]);
  const [editAgent, setEditAgent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isNewAgent, setIsNewAgent] = useState(false);
  const { user } = useAuth();

  const initialAgentState = {
    name: '',
    email: '',
    password: '',
    department: '',
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

  useEffect(() => {
    fetchAgents();
  }, []);

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
      setSuccess('Agent status updated successfully');
      fetchAgents();
    } catch (error) {
      setError('Failed to update agent status: ' + error.message);
    }
  };

  const handleSaveEdit = async () => {
    try {
      if (isNewAgent) {
        await axiosAuth.post('http://localhost:8080/api/agents', editAgent);
        setSuccess('New agent created successfully');
      } else {
        await axiosAuth.patch(`http://localhost:8080/api/agents/${editAgent._id}`, editAgent);
        setSuccess('Agent updated successfully');
      }
      setOpenDialog(false);
      fetchAgents();
    } catch (error) {
      console.error('Save error:', error.response?.data || error.message);
      setError('Failed to save agent: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditAgent(null);
    setIsNewAgent(false);
    setError('');
  };

  return (
    <Box sx={{ p: 3 }}>
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Agent Management
        </Typography>
        <AddAgentButton 
          variant="contained" 
          onClick={handleAddNewClick}
        >
          Add New Agent
        </AddAgentButton>
      </Box>

      <TableContainer component={Paper}>
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
                      {agent.active ? <BlockIcon /> : <BlockIcon />}
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
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isNewAgent ? 'Add New Agent' : 'Edit Agent'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={editAgent?.name || ''}
              onChange={(e) => setEditAgent({ ...editAgent, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Email"
              value={editAgent?.email || ''}
              onChange={(e) => setEditAgent({ ...editAgent, email: e.target.value })}
            />
            {isNewAgent && (
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={editAgent?.password || ''}
                onChange={(e) => setEditAgent({ ...editAgent, password: e.target.value })}
              />
            )}
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={editAgent?.department || ''}
                label="Department"
                onChange={(e) => setEditAgent({ ...editAgent, department: e.target.value })}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={editAgent?.role || 'agent'}
                label="Role"
                onChange={(e) => setEditAgent({ ...editAgent, role: e.target.value })}
              >
                <MenuItem value="agent">Agent</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <CreateAgentButton 
            onClick={handleSaveEdit} 
            variant="contained"
          >
            {isNewAgent ? 'Create Agent' : 'Save Changes'}
          </CreateAgentButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard; 