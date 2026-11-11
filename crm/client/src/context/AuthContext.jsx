import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUserStr = localStorage.getItem('user');

      // If token is the legacy dummy demo token, clear it so visitor starts in proper Guest Mode
      if (token === 'demo-token' || !token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setLoading(false);
        return;
      }

      // Try verifying existing token with backend /auth/me
      try {
        const { data } = await api.get('/auth/me', { timeout: 4000 });
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else if (savedUserStr) {
          setUser(JSON.parse(savedUserStr));
        }
      } catch (err) {
        // If backend returned 401/403, token is expired or invalid
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        } else if (savedUserStr) {
          // If server is unreachable/offline, still restore user from cache so offline mode works
          try {
            setUser(JSON.parse(savedUserStr));
          } catch {
            setUser(null);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for custom expiration event
    const handleExpired = () => setUser(null);
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const signup = async (name, email, password, role) => {
    const { data } = await api.post('/auth/signup', { name, email, password, role });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Signed out. You are now in Guest / Demo Mode.');
  }, []);

  const isAuthenticated = Boolean(user && user.id && user.id !== 'demo' && user.id !== 'guest');
  const isGuest = !isAuthenticated;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isGuest,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
