import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SentimentAnalyzer from './components/SentimentAnalyzer';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import AnalysisHistory from './components/AnalysisHistory';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Navbar from './components/Navbar';
import { SocketProvider } from './context/SocketContext';
import AnimatedBackground from './components/AnimatedBackground';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#7c3aed',
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          color: '#1e293b',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          }
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0'
        }
      }
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          minWidth: '200px',
          borderRadius: '8px',
          marginTop: '8px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
        }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          padding: '8px 16px'
        }
      }
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", "Segoe UI", "Roboto", "Arial", sans-serif',
        }
      }
    },
  },
});

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.agent?.role === 'admin' ? children : <Navigate to="/" />;
};

function AppContent() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <Navbar />
        <Box 
          sx={{ 
            backgroundColor: 'transparent',
            minHeight: '100vh', 
            py: 2,
            mt: 0,
            position: 'relative'
          }}
        >
          <Routes>
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <SentimentAnalyzer />
                </PrivateRoute>
              }
            />
            <Route
              path="/history"
              element={
                <PrivateRoute>
                  <AnalysisHistory />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
          </Routes>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AnimatedBackground />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <AppContent />
          </Box>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
