import React from 'react'
import { Routes, Route } from 'react-router-dom'
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
import FAQ from './pages/FAQ'

const StagingRouter: React.FC = () => {
  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      {/* Environment Indicator */}
      <div 
        className="text-white text-center py-1 text-sm font-bold" 
        style={{ backgroundColor: 'black' }}
      >
        Staging Environment
      </div>

      <Routes>
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route index element={<About />} />
          <Route path="about" element={<About />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Register />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="faq" element={<FAQ />} />

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

export default StagingRouter