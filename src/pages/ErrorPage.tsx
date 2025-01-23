import React from 'react';
import { Link } from 'react-router-dom';
import { ErrorPageProps } from '../types';

const ErrorPage: React.FC<ErrorPageProps> = ({ code, message }) => {
  return (
    <div className="container">
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <h1 className="display-1 fw-bold mb-4" style={{ color: 'var(--solo-purple)' }}>{code}</h1>
        <h4 className="mb-4 text-white">{message}</h4>
        <Link to="/" className="btn nav-link active bg-solo-purple px-4">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export const NotFound: React.FC = () => (
  <ErrorPage code={404} message="Looks like we haven't set this route yet." />
);

export const ServerError: React.FC = () => (
  <ErrorPage code={500} message="Something went wrong on our end. We're working on it!" />
);

export default ErrorPage;