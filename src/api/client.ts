import axios from 'axios'

// In production, API requests will be made to the same origin
// In development, we'll use the Vite dev server proxy
const baseURL = process.env.NODE_ENV === 'production' 
  ? '/api'
  : `http://${window.location.hostname}:5000`

console.log('API base URL:', baseURL)
console.log('Environment:', process.env.NODE_ENV)

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