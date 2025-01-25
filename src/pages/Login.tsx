import React from 'react';
import { Link } from 'react-router-dom';
import GoogleSignInButton from '../components/GoogleSignInButton';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Solo
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Track your climbing progress and connect with other climbers
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <GoogleSignInButton />
          </div>
          <div className="text-center">
            <Link to="/about" className="text-indigo-600 hover:text-indigo-500">
              Learn more about Solo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;