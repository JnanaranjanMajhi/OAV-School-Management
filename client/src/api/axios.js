import axios from 'axios';

const defaultBaseUrl = typeof window !== 'undefined' 
  ? `${window.location.protocol}//${window.location.hostname}:5000/api`
  : 'http://localhost:5000/api';

const apiUrl = import.meta.env.VITE_API_URL || defaultBaseUrl;
export const SERVER_URL = apiUrl.replace('/api', '');

const api = axios.create({
  baseURL: apiUrl,
  timeout: 30000,
  withCredentials: true,
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Do not redirect on 401 if the request was to /auth/login
    if (err.response?.status === 401 && !err.config.url.includes('/auth/login')) {
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-failed'));
    }
    return Promise.reject(err);
  }
);

export default api;
