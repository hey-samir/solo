import axios from 'axios'

const isDevelopment = process.env.NODE_ENV === 'development';
const baseURL = isDevelopment
  ? 'http://localhost:5000/api'
  : '/api';

console.log('API client configuration:')
console.log('- Environment:', process.env.NODE_ENV)
console.log('- Base URL:', baseURL)
console.log('- Origin:', window.location.origin)

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Add request interceptor for debugging
client.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
client.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    // Handle network errors
    if (!error.response) {
      return Promise.reject({ 
        message: "Unable to connect to the server. Please check your connection and try again.",
        status: 0
      });
    }

    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

export default client