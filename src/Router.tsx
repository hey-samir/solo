import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import { NotFound } from './pages/ErrorPage'

// Lazy load components
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

console.log('Router component mounting...') // Add mounting log

export default function Router(): React.ReactElement {
  console.log('Router component rendering...') // Add rendering log
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
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

        {/* Make About the index (default) route */}
        <Route
          index
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <About />
            </Suspense>
          }
        />

        {/* Remove duplicate About route since it's now the index */}
        <Route
          path="home"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Home />
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
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}