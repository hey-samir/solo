import React from 'react';
import { useNavigate } from 'react-router-dom';
import Error from '../components/Error';
import { ErrorPageProps } from '../types';

const ErrorPage: React.FC<ErrorPageProps> = ({ code, message }) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-solo-purple mb-4">{code}</h1>
        <p className="text-text-primary mb-6">{message}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="btn bg-solo-purple hover:bg-solo-purple-light text-white px-6 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export const NotFound: React.FC = () => (
  <ErrorPage 
    code={404} 
    message="Looks like this route's beta isn't set yet! Let's get you back on track. 🧗‍♂️" 
  />
);

export const ServerError: React.FC<ErrorPageProps> = ({ code, message }) => (
  <ErrorPage 
    code={code || 500} 
    message={message || "Our route setters are working on fixing this problem! Please try again later. 🪢"} 
  />
);

export default ErrorPage;