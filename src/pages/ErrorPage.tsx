import React from 'react';
import { Link } from 'react-router-dom';
import { ErrorPageProps } from '../types';

const ErrorPage: React.FC<ErrorPageProps> = ({ code, message }) => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <h1 className="display-1">{code}</h1>
          <p className="lead">{message}</p>
          <Link to="/" className="btn btn-primary">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export const NotFound: React.FC = () => (
  <ErrorPage code={404} message="Page not found" />
);

export const ServerError: React.FC = () => (
  <ErrorPage code={500} message="Internal server error" />
);

export default ErrorPage;
