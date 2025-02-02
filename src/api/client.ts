import axios from 'axios';
import { toast } from 'react-hot-toast';

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
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
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