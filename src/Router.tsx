import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import ProtectedRoute from './components/ProtectedRoute'

// Add debug logging
const withDebugLogging = (Component: React.ComponentType, name: string) => {
  return function DebugWrapper(props: any) {
    console.log(`Rendering ${name} component`);
    return <Component {...props} />;
  };
};

// Lazy load components with debug logging
const Home = lazy(() => {
  console.log('Loading Home component');
  return import('./pages/Home').then(module => {
    console.log('Home component loaded');
    return { default: withDebugLogging(module.default, 'Home') };
  });
});

const About = lazy(() => {
  console.log('Loading About component');
  return import('./pages/About').then(module => {
    console.log('About component loaded');
    return { default: withDebugLogging(module.default, 'About') };
  });
});

const Login = lazy(() => {
  console.log('Loading Login component');
  return import('./pages/Login').then(module => {
    console.log('Login component loaded');
    return { default: withDebugLogging(module.default, 'Login') };
  });
});
const Register = lazy(() => {
  console.log('Loading Register component');
  return import('./pages/Register').then(module => {
    console.log('Register component loaded');
    return { default: withDebugLogging(module.default, 'Register') };
  });
});
const Squads = lazy(() => {
  console.log('Loading Squads component');
  return import('./pages/Squads').then(module => {
    console.log('Squads component loaded');
    return { default: withDebugLogging(module.default, 'Squads') };
  });
});
const Standings = lazy(() => {
  console.log('Loading Standings component');
  return import('./pages/Standings').then(module => {
    console.log('Standings component loaded');
    return { default: withDebugLogging(module.default, 'Standings') };
  });
});
const Sends = lazy(() => {
  console.log('Loading Sends component');
  return import('./pages/Sends').then(module => {
    console.log('Sends component loaded');
    return { default: withDebugLogging(module.default, 'Sends') };
  });
});
const Sessions = lazy(() => {
  console.log('Loading Sessions component');
  return import('./pages/Sessions').then(module => {
    console.log('Sessions component loaded');
    return { default: withDebugLogging(module.default, 'Sessions') };
  });
});
const Stats = lazy(() => {
  console.log('Loading Stats component');
  return import('./pages/Stats').then(module => {
    console.log('Stats component loaded');
    return { default: withDebugLogging(module.default, 'Stats') };
  });
});
const Profile = lazy(() => {
  console.log('Loading Profile component');
  return import('./pages/Profile').then(module => {
    console.log('Profile component loaded');
    return { default: withDebugLogging(module.default, 'Profile') };
  });
});
const Pricing = lazy(() => {
  console.log('Loading Pricing component');
  return import('./pages/Pricing').then(module => {
    console.log('Pricing component loaded');
    return { default: withDebugLogging(module.default, 'Pricing') };
  });
});
const Feedback = lazy(() => {
  console.log('Loading Feedback component');
  return import('./pages/Feedback').then(module => {
    console.log('Feedback component loaded');
    return { default: withDebugLogging(module.default, 'Feedback') };
  });
});

const Router: React.FC = () => {
  console.log('Router component rendering');
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={
          <Suspense fallback={<LoadingSpinner />}>
            <About />
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

        {/* Semi-Protected Routes (Viewable but with limited functionality) */}
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

        {/* Protected Routes (Require Authentication) */}
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
        <Route path="/home" element={
          <Suspense fallback={<LoadingSpinner />}>
            <Home />
          </Suspense>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default Router