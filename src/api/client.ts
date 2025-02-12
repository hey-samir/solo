import axios from 'axios';
import { toast } from 'react-hot-toast';

const client = axios.create({
  // Remove the /api prefix since it's added by the server router
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Simple request interceptor
client.interceptors.request.use(
  (config) => {
    console.log('[API Client] Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('[API Client] Request Error:', error);
    return Promise.reject(error);
  }
);

// Simple response interceptor
client.interceptors.response.use(
  (response) => {
    console.log('[API Client] Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('[API Client] Response Error:', error.message);

    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    const message = error.response?.data?.error || 'An unexpected error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default client;