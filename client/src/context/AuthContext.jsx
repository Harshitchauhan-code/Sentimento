import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user' && !e.newValue) {
        setUser(null);
        navigate('/login');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const checkInterval = setInterval(checkUserExists, 5000);
    return () => clearInterval(checkInterval);
  }, [user]);

  const checkUserExists = async () => {
    if (!user) return;
    
    try {
      const response = await axios.get(`http://localhost:8080/api/agents/check/${user.agent._id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (!response.data.active) {
        logout();
        navigate('/login');
        alert('Your account has been deactivated by the administrator.');
        return;
      }
    } catch (error) {
      if (error.response?.status === 404) {
        logout();
        navigate('/login');
        alert('Your account has been deleted by the administrator.');
        localStorage.setItem('forceLogout', Date.now().toString());
        setTimeout(() => localStorage.removeItem('forceLogout'), 1000);
      }
    }
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.setItem('forceLogout', Date.now().toString());
    setTimeout(() => localStorage.removeItem('forceLogout'), 1000);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, checkUserExists }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 