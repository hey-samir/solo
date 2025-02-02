import axios from 'axios'

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
  withCredentials: true, // Important for session cookie handling
});

// Add request interceptor for debugging
client.interceptors.request.use(
  (config) => {
    // Add CORS headers
    config.headers['Access-Control-Allow-Credentials'] = 'true';

    console.log('API Request:', {
      method: config.method,
      url: config.url,
      headers: config.headers,
      baseURL: config.baseURL,
      withCredentials: config.withCredentials,
      data: config.data
    });
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
    console.log('API Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config,
      request: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });

    // Handle network errors
    if (!error.response) {
      return Promise.reject({ 
        message: "Unable to connect to the server. Please check your connection and try again.",
        status: 0,
        details: error.message
      });
    }

    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default client;