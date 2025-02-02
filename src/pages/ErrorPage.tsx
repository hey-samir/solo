import React from 'react';
import { useNavigate } from 'react-router-dom';
import Error from '../components/Error';
import { ErrorPageProps } from '../types';

const ErrorPage: React.FC<ErrorPageProps> = ({ code, message }) => {
  return (
    <Error 
      message={`${code}: ${message}`}
      type="page"
    />
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