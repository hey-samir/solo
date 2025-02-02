import axios from 'axios';
import { toast } from 'react-hot-toast';

const isDevelopment = process.env.NODE_ENV === 'development';
const baseURL = isDevelopment 
  ? 'http://localhost:5000'
  : '';

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request interceptor
client.interceptors.request.use(
  (config) => {
    // Ensure API prefix
    if (!config.url?.startsWith('/api')) {
      config.url = `/api${config.url}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      toast.error('Unable to connect to the server');
      return Promise.reject(new Error('Network error'));
    }

    // Handle authentication errors
    if (error.response.status === 401) {
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle other errors
    const message = error.response?.data?.error || error.message;
    toast.error(message);
    return Promise.reject(error);
  }
);

export default client;