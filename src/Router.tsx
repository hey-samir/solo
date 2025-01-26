import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import ProtectedRoute from './components/ProtectedRoute'

// Lazy load components
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Squads = lazy(() => import('./pages/Squads'))
const Standings = lazy(() => import('./pages/Standings'))
const Sends = lazy(() => import('./pages/Sends'))
const Sessions = lazy(() => import('./pages/Sessions'))
const Stats = lazy(() => import('./pages/Stats'))
const Profile = lazy(() => import('./pages/Profile'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Feedback = lazy(() => import('./pages/Feedback'))

const Router: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={
          <Suspense fallback={<LoadingSpinner />}>
            <Home />
          </Suspense>
        } />
        <Route path="/about" element={
          <Suspense fallback={<LoadingSpinner />}>
            <About />
          </Suspense>
        } />
        <Route path="/login" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Login />
          </Suspense>
        } />
        <Route path="/signup" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Register />
          </Suspense>
        } />
        <Route path="/pricing" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Pricing />
          </Suspense>
        } />
        <Route path="/feedback" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Feedback />
          </Suspense>
        } />

        {/* Semi-Protected Routes */}
        <Route path="/squads" element={
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute requireAuth={false}>
              <Squads />
            </ProtectedRoute>
          </Suspense>
        } />
        <Route path="/standings" element={
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute requireAuth={false}>
              <Standings />
            </ProtectedRoute>
          </Suspense>
        } />
        <Route path="/sends" element={
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute requireAuth={false}>
              <Sends />
            </ProtectedRoute>
          </Suspense>
        } />

        {/* Protected Routes */}
        <Route path="/sessions" element={
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <Sessions />
            </ProtectedRoute>
          </Suspense>
        } />
        <Route path="/stats" element={
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <Stats />
            </ProtectedRoute>
          </Suspense>
        } />
        <Route path="/profile" element={
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </Suspense>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default Router