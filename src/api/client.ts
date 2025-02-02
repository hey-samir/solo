import axios from 'axios';
import { toast } from 'react-hot-toast';

const isDevelopment = process.env.NODE_ENV === 'development';
const baseURL = isDevelopment 
  ? 'http://localhost:5000/api'
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
    console.error('[API Request Error]:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
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
        baseURL: error.config?.baseURL,
        headers: error.config?.headers
      }
    });

    // Handle network errors
    if (!error.response) {
      toast.error('Unable to connect to the server. Please check your connection.');
      return Promise.reject({ 
        message: "Unable to connect to the server. Please check your connection.",
        status: 0 
      });
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default client;