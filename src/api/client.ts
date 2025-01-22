import axios from 'axios'

const baseURL = process.env.NODE_ENV === 'production' 
  ? '/api'
  : process.env.VITE_API_URL || 'http://localhost:5000/api'

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
    if (error.response?.status === 401) {
      // Redirect to login page
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client