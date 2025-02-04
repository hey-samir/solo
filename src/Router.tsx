import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import ProtectedRoute from './components/ProtectedRoute'
import NotFound from './pages/NotFound'
import ServerError from './pages/ErrorPage'

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

const Router: React.FC = () => {
  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route index element={<Navigate to="/about" replace />} />
          <Route path="about" element={<About />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Register />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="feedback" element={<Feedback />} />

          {/* Public Squad Routes */}
          <Route path="squads" element={<Squads />} />
          <Route path="standings" element={<Standings />} />

          {/* Protected Routes */}
          <Route
            path="sends"
            element={
              <ProtectedRoute>
                <Sends />
              </ProtectedRoute>
            }
          />
          <Route
            path="sessions"
            element={
              <ProtectedRoute>
                <Sessions />
              </ProtectedRoute>
            }
          />
          <Route
            path="stats"
            element={
              <ProtectedRoute>
                <Stats />
              </ProtectedRoute>
            }
          />

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