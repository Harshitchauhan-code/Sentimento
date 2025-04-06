import { createContext, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SocketContext = createContext(null);

// Create socket without initial auth
const socket = io('http://localhost:8080', {
  reconnection: false,
  autoConnect: false,  
  // Don't connect automatically
  transports: ['websocket']
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Configure socket auth and connect
      socket.auth = { token: user.token };
      socket.connect();
      
      // Check account status periodically
      const statusCheck = setInterval(async () => {
        try {
          const response = await axios.get(`http://localhost:8080/api/agents/check/${user.agent._id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          if (!response.data.active) {
            socket.disconnect();
            localStorage.clear();
            logout();
            navigate('/login');
            alert('Your account has been deactivated. Please contact administrator.');
          }
        } catch (error) {
          if (error.response?.status === 404 || error.response?.status === 403) {
            socket.disconnect();
            localStorage.clear();
            logout();
            navigate('/login');
            if (error.response?.data?.message) {
              alert(error.response.data.message);
            }
          }
        }
      }, 3000);

      // Join with user ID
      socket.emit('join', user.agent._id);
      
      // Listen for specific user force logout
      socket.on(`force_logout_${user.agent._id}`, ({ message }) => {
        socket.disconnect();
        localStorage.clear();
        logout();
        navigate('/login');
        alert(message);
      });

      socket.on('disconnect', () => {
        if (user) {
          localStorage.clear();
          logout();
          navigate('/login');
        }
      });

      return () => {
        clearInterval(statusCheck);
        socket.off(`force_logout_${user?.agent?._id}`);
        socket.off('disconnect');
        socket.disconnect();
      };
    }
  }, [user, logout, navigate]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};