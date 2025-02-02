import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance with development-specific configuration
const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor for API calls
client.interceptors.request.use(
  (config) => {
    console.log('[API Client Request]:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
      timestamp: new Date().toISOString()
    });
    return config;
  },
  (error) => {
    console.error('[API Client Request Error]:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
client.interceptors.response.use(
  (response) => {
    console.log('[API Client Response]:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    return response;
  },
  (error) => {
    console.error('[API Client Error]:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      timestamp: new Date().toISOString()
    });

    // Handle network errors
    if (!error.response) {
      toast.error('Unable to connect to the server. Please check your connection.');
      return Promise.reject(error);
    }

    // Handle authentication errors
    if (error.response.status === 401) {
      window.location.href = '/login';
      return Promise.reject(error);
    }

    const message = error.response?.data?.error || 'An unexpected error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default client;