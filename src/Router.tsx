import React, { useEffect } from 'react'
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
import Solo from './pages/Solo'
import SoloPro from './pages/Pricing'
import Feedback from './pages/Feedback'

const Router: React.FC = () => {
  const { flags, isLoading, error } = useFeatureFlags()
  const isProduction = config.environment === 'production'

  useEffect(() => {
    console.log('[Router] Current environment:', config.environment)
    console.log('[Router] Feature flags:', flags)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !flags) {
    return <NotFound />
  }

  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route element={isProduction ? <ProductionLayout /> : <Layout />}>
          {/* Public Routes */}
          <Route index element={<Navigate to="/about" replace />} />
          <Route path="about" element={<About />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="solo-pro" element={<SoloPro />} />

          {/* Conditionally render routes based on feature flags */}
          {flags.enableAuth && (
            <>
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Register />} />
            </>
          )}

          {/* Always enable Standings since it's a core feature */}
          <Route path="standings" element={<Standings />} />

          {flags.enableSquads && (
            <Route path="squads" element={<Squads />} />
          )}

          {/* Solo page replaces Settings and Profile */}
          <Route
            path="solo"
            element={
              <ProtectedRoute>
                <Solo />
              </ProtectedRoute>
            }
          />

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

          {/* Error Routes */}
          <Route path="server-error" element={<ServerError code={500} message="Internal Server Error" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </React.Suspense>
  )
}

export default Router