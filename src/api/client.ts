import axios from 'axios';
import { toast } from 'react-hot-toast';

const isDevelopment = process.env.NODE_ENV === 'development';
const baseURL = isDevelopment
  ? import.meta.env.VITE_API_URL
  : '/api';

console.log('API client configuration:', {
  environment: process.env.NODE_ENV,
  baseURL,
  origin: window.location.origin
});

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor for debugging
client.interceptors.request.use(
  (config) => {
    // Add CORS headers
    config.headers['Access-Control-Allow-Credentials'] = 'true';
    config.headers['Access-Control-Allow-Origin'] = window.location.origin;

    // Additional logging for feedback-related requests
    if (config.url?.includes('feedback')) {
      console.log('Feedback API Request:', {
        method: config.method,
        url: config.url,
        fullUrl: `${config.baseURL}${config.url}`,
        headers: config.headers,
        data: config.data,
        origin: window.location.origin,
        timestamp: new Date().toISOString()
      });
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
client.interceptors.response.use(
  (response) => {
    if (response.config.url?.includes('feedback')) {
      console.log('Feedback API Response:', {
        status: response.status,
        data: response.data,
        headers: response.headers,
        timestamp: new Date().toISOString()
      });
    }
    return response;
  },
  (error) => {
    // Enhanced error logging for feedback-related errors
    if (error.config?.url?.includes('feedback')) {
      console.error('Feedback API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request: {
          url: error.config?.url,
          fullUrl: `${error.config?.baseURL}${error.config?.url}`,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data,
          origin: window.location.origin
        },
        timestamp: new Date().toISOString()
      });
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({ 
        message: "Unable to connect to the server. Please check your connection and try again.",
        status: 0,
        details: error.message
      });
    }

    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default client;