import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'

// Lazy load components
const Home = lazy(() => import('./pages/Home'))
const Profile = lazy(() => import('./pages/Profile'))
const Sends = lazy(() => import('./pages/Sends'))
const Sessions = lazy(() => import('./pages/Sessions'))
const Stats = lazy(() => import('./pages/Stats'))
const Standings = lazy(() => import('./pages/Standings'))

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={
          <Suspense fallback={<LoadingSpinner />}>
            <Home />
          </Suspense>
        } />
        <Route path="profile/:username?" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Profile />
          </Suspense>
        } />
        <Route path="sends" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Sends />
          </Suspense>
        } />
        <Route path="sessions" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Sessions />
          </Suspense>
        } />
        <Route path="stats" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Stats />
          </Suspense>
        } />
        <Route path="standings" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Standings />
          </Suspense>
        } />
        <Route path="*" element={
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
          </div>
        } />
      </Route>
    </Routes>
  )
}