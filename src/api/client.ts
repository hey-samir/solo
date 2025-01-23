import axios from 'axios'

// In production, API requests will be made to the same origin
// In development, we'll use the provided API URL or default to localhost:5000
const baseURL = process.env.NODE_ENV === 'production' 
  ? '/api'
  : process.env.VITE_API_URL || 'http://localhost:5000/api'

console.log('API base URL:', baseURL)

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Add response interceptor for error handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client