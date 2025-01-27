import axios from 'axios'

const baseURL = process.env.NODE_ENV === 'production' 
  ? '/api'
  : 'http://localhost:5000'

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
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client