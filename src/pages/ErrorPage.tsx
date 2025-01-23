import React from 'react';
import { Link } from 'react-router-dom';
import { ErrorPageProps } from '../types';

const ErrorPage: React.FC<ErrorPageProps> = ({ code, message }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
        <h1 className="text-6xl font-bold mb-4 text-purple-600">{code}</h1>
        <h4 className="text-xl mb-6 text-gray-200">{message}</h4>
        <Link 
          to="/" 
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export const NotFound: React.FC = () => (
  <ErrorPage 
    code={404} 
    message="Oops! This route hasn't been set yet. Let's get you back on track." 
  />
);

export const ServerError: React.FC = () => (
  <ErrorPage 
    code={500} 
    message="Something went wrong on our end. Our team has been notified and we're working on it!" 
  />
);

export default ErrorPage;