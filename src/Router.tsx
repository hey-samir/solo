import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProductionLayout from './components/ProductionLayout'
import LoadingSpinner from './components/LoadingSpinner'
import ProtectedRoute from './components/ProtectedRoute'
import NotFound from './pages/NotFound'
import ServerError from './pages/ErrorPage'
import { useFeatureFlags } from './contexts/FeatureFlagsContext'
import { config } from './config/environment'

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
  const { flags, isLoading, error } = useFeatureFlags()
  const isProduction = config.environment === 'production'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !flags) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ServerError code={500} message={error || 'Failed to load application configuration'} />
      </div>
    )
  }

  // If showFAQ is false, FAQ route won't be included at all
  const routes = (
    <Routes>
      <Route element={isProduction ? <ProductionLayout /> : <Layout />}>
        {/* Public Routes */}
        <Route index element={<Navigate to="/about" replace />} />
        <Route path="about" element={<About />} />

        {/* Conditionally render routes based on feature flags */}
        {flags.enableAuth && (
          <>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Register />} />
          </>
        )}

        {flags.enablePro && (
          <Route path="pricing" element={<Pricing />} />
        )}

        {flags.enableFeedback && (
          <Route path="feedback" element={<Feedback />} />
        )}

        {flags.enableSquads && (
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

        {flags.enableSessions && (
          <Route
            path="sessions"
            element={
              <ProtectedRoute>
                <Sessions />
              </ProtectedRoute>
            }
          />
        )}

        {flags.enableStats && (
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
        {flags.showFAQ && (
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
  )

  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      {routes}
    </React.Suspense>
  )
}

export default Router