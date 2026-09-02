import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    const errorCode = error.response?.data?.errorCode || 'UNKNOWN_ERROR';
    
    // Auto logout on token expiration if unauthorized on user endpoint
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      if (error.response?.data?.errorCode === 'TOKEN_EXPIRED') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    return Promise.reject({
      message,
      errorCode,
      statusCode: error.response?.status,
      errors: error.response?.data?.errors,
    });
  }
);

export default api;
