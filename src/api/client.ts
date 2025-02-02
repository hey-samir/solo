import axios from 'axios';
import { toast } from 'react-hot-toast';

const isDevelopment = process.env.NODE_ENV === 'development';
const baseURL = isDevelopment 
  ? 'http://localhost:5000'
  : '';

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor for API calls
client.interceptors.request.use(
  (config) => {
    // Ensure API prefix
    if (!config.url?.startsWith('/api')) {
      config.url = `/api${config.url}`;
    }

    // Log request for debugging
    console.log('[API Request]:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      fullUrl: `${config.baseURL}${config.url}`,
      data: config.data,
      headers: config.headers
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
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('[API Error]:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      request: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    });

    // Handle network errors
    if (!error.response) {
      const message = 'Unable to connect to the server. Please check your connection.';
      toast.error(message);
      return Promise.reject(new Error(message));
    }

    // Handle authentication errors
    if (error.response.status === 401) {
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle other errors
    const message = error.response?.data?.error || error.message || 'An unexpected error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default client;