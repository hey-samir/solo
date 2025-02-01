import React from 'react';
import GoogleSignInButton from '../components/GoogleSignInButton';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Login
            </h2>
          </div>
          <div className="mt-8 flex justify-center">
            <GoogleSignInButton />
          </div>
        </div>
      </main>
      <footer className="py-4 text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} Solo. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;