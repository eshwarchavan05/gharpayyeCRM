import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api',
  timeout: 8000,
});

api.interceptors.response.use(
  res => res,
  err => {
    const url = err.config?.url || '';
    const isCredentialRequest =
      url.includes('/auth/login') || url.includes('/auth/signup');

    // Do not treat failed login/signup (401/400) as an expired session.
    if (err.response?.status === 401 && !isCredentialRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    if (err.response?.status === 403) {
      toast.error('Access Denied: You do not have permission for this action.');
    }
    return Promise.reject(err);
  }
);

export default api;
