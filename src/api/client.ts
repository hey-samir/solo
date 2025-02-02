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

// Add response interceptor for error handling
client.interceptors.response.use(
  (response) => {
    console.log('API Response:', response);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);

    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error);
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