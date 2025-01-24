import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import { useAuth } from './contexts/AuthContext'

// Lazy load components for better performance
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Profile = lazy(() => import('./pages/Profile'))
const Sends = lazy(() => import('./pages/Sends'))
const Sessions = lazy(() => import('./pages/Sessions'))
const Stats = lazy(() => import('./pages/Stats'))
const Standings = lazy(() => import('./pages/Standings'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Feedback = lazy(() => import('./pages/Feedback'))

const Router: React.FC = () => {
  const { isAuthenticated } = useAuth()

  // Helper component for protected routes
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />
    }
    return <>{children}</>
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route
          path="about"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <About />
            </Suspense>
          }
        />
        <Route
          path="login"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path="signup"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Register />
            </Suspense>
          }
        />

        {/* Protected Routes */}
        <Route
          path="home"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="profile/:username?"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="sends"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <ProtectedRoute>
                <Sends />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="sessions"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <ProtectedRoute>
                <Sessions />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="stats"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <ProtectedRoute>
                <Stats />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="standings"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <ProtectedRoute>
                <Standings />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="feedback"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <ProtectedRoute>
                <Feedback />
              </ProtectedRoute>
            </Suspense>
          }
        />

        {/* Root and fallback routes */}
        <Route index element={<Navigate to="/about" replace />} />
        <Route path="*" element={<Navigate to="/about" replace />} />
      </Route>
    </Routes>
  )
}

export default Router