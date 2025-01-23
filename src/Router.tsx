import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import { NotFound } from './pages/ErrorPage'

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
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Redirect root to About */}
        <Route index element={<Navigate to="/about" replace />} />

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

        {/* Authenticated Routes */}
        <Route
          path="home"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Home />
            </Suspense>
          }
        />
        <Route
          path="profile/:username?"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Profile />
            </Suspense>
          }
        />
        <Route
          path="sends"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Sends />
            </Suspense>
          }
        />
        <Route
          path="sessions"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Sessions />
            </Suspense>
          }
        />
        <Route
          path="stats"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Stats />
            </Suspense>
          }
        />
        <Route
          path="standings"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Standings />
            </Suspense>
          }
        />
        <Route
          path="feedback"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Feedback />
            </Suspense>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default Router