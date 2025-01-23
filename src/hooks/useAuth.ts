import { useState, useEffect } from 'react'
import client from '../api/client'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: any | null
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await client.get('/auth/check')
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: response.data
        })
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null
        })
      }
    }

    checkAuth()
  }, [])

  return authState
}
