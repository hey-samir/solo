import axios from 'axios';
import { toast } from 'react-hot-toast';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor for API calls
client.interceptors.request.use(
  (config) => {
    console.log('[API Request]:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL
    });
    return config;
  },
  (error) => {
    console.error('[Request Error]:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
client.interceptors.response.use(
  (response) => {
    console.log('[API Response]:', {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  (error) => {
    console.error('[API Error]:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    // Handle network errors
    if (!error.response) {
      toast.error('Connection error. Please try again.');
      return Promise.reject(error);
    }

    // Handle authentication errors
    if (error.response.status === 401) {
      window.location.href = '/login';
      return Promise.reject(error);
    }

    const message = error.response?.data?.error || 'Something went wrong';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default client;