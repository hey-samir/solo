import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import ProtectedRoute from './components/ProtectedRoute'
import NotFound from './pages/NotFound'
import ServerError from './pages/ErrorPage'
import { useFeatureFlags } from './config/environment'

// Import pages
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
import FAQ from './pages/FAQ'

const Router: React.FC = () => {
  const features = useFeatureFlags()

  // Log feature flags for debugging
  React.useEffect(() => {
    console.log('Current feature flags:', features)
  }, [features])

  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route element={<Layout features={features} />}>
          {/* Public Routes */}
          <Route index element={<Navigate to="/about" replace />} />
          <Route path="about" element={<About />} />

          {/* Conditionally render routes based on feature flags */}
          {features.enableAuth && (
            <>
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Register />} />
            </>
          )}

          {features.enablePro && (
            <Route path="pricing" element={<Pricing />} />
          )}

          {features.enableFeedback && (
            <Route path="feedback" element={<Feedback />} />
          )}

          {features.enableSquads && (
            <>
              <Route path="squads" element={<Squads />} />
              <Route path="standings" element={<Standings />} />
            </>
          )}

          {/* Protected Routes */}
          <Route
            path="sends"
            element={
              <ProtectedRoute>
                <Sends />
              </ProtectedRoute>
            }
          />

          {features.enableSessions && (
            <Route
              path="sessions"
              element={
                <ProtectedRoute>
                  <Sessions />
                </ProtectedRoute>
              }
            />
          )}

          {features.enableStats && (
            <Route
              path="stats"
              element={
                <ProtectedRoute>
                  <Stats />
                </ProtectedRoute>
              }
            />
          )}

          {/* FAQ Route - Only show if enabled */}
          {features.showFAQ && (
            <Route path="faq" element={<FAQ />} />
          )}

          {/* Profile Routes */}
          <Route path="profile">
            <Route index element={<Profile />} />
            <Route path=":username" element={<Profile />} />
          </Route>

          {/* Error Routes */}
          <Route path="server-error" element={<ServerError code={500} message="Internal Server Error" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </React.Suspense>
  )
}

export default Router