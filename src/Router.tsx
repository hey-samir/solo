import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import ProtectedRoute from './components/ProtectedRoute'

// Import pages directly for debugging
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import Squads from './pages/Squads'
import Standings from './pages/Standings'
import Sends from './pages/Sends'
import Sessions from './pages/Sessions'
import Stats from './pages/Stats'
import Profile from './pages/Profile'
import Pricing from './pages/Pricing'
import Feedback from './pages/Feedback'

// Toggle this flag to enable/disable route protection
const ENABLE_ROUTE_PROTECTION = false;

const Router: React.FC = () => {
  console.log('Router rendering...')

  // Wrapper component that conditionally applies protection
  const ProtectedWrapper = ({ children, requireAuth = true }) => {
    if (!ENABLE_ROUTE_PROTECTION) {
      return <>{children}</>
    }
    return (
      <ProtectedRoute requireAuth={requireAuth}>
        {children}
      </ProtectedRoute>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<Navigate to="/about" replace />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/feedback" element={<Feedback />} />

        {/* Semi-Protected Routes */}
        <Route path="/squads" element={
          <ProtectedWrapper requireAuth={false}>
            <Squads />
          </ProtectedWrapper>
        } />
        <Route path="/standings" element={
          <ProtectedWrapper requireAuth={false}>
            <Standings />
          </ProtectedWrapper>
        } />

        {/* Protected Routes */}
        <Route path="/sends" element={
          <ProtectedWrapper>
            <Sends />
          </ProtectedWrapper>
        } />
        <Route path="/sessions" element={
          <ProtectedWrapper>
            <Sessions />
          </ProtectedWrapper>
        } />
        <Route path="/stats" element={
          <ProtectedWrapper>
            <Stats />
          </ProtectedWrapper>
        } />
        <Route path="/profile" element={
          <ProtectedWrapper>
            <Profile />
          </ProtectedWrapper>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default Router