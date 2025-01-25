import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'

// Lazy load components for better performance
const Home = lazy(() => import('@/pages/Home'))
const About = lazy(() => import('@/pages/About'))
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const Squads = lazy(() => import('@/pages/Squads'))
const Standings = lazy(() => import('@/pages/Standings'))
const Sends = lazy(() => import('@/pages/Sends'))
const Sessions = lazy(() => import('@/pages/Sessions'))
const Stats = lazy(() => import('@/pages/Stats'))
const Profile = lazy(() => import('@/pages/Profile'))

const Router: React.FC = () => {
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
        <Route
          path="home"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Home />
            </Suspense>
          }
        />

        {/* Bottom Nav Routes */}
        <Route
          path="squads"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Squads />
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
          path="profile"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Profile />
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