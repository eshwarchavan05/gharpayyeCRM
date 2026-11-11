import axios from 'axios';
import toast from 'react-hot-toast';

// Determine the API base URL: works in local dev proxy and production deployments
const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
  if (!envUrl) return '/api';
  const clean = envUrl.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor: always attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'demo-token' && token !== 'null' && token !== 'undefined') {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token expiration and forbidden actions
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    const isCredentialRequest =
      url.includes('/auth/login') ||
      url.includes('/auth/signup') ||
      url.includes('/auth/me');

    // If unauthorized on protected resource, clear invalid credentials and revert to guest mode
    if (err.response?.status === 401 && !isCredentialRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      toast.error('Session expired. Switched to Guest / Demo Mode.');
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }

    if (err.response?.status === 403) {
      toast.error('Access Denied: You do not have permission for this action.');
    }

    return Promise.reject(err);
  }
);

export default api;
