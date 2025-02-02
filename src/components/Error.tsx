import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorProps } from '../types';

const Error: React.FC<ErrorProps> = ({ message, type = 'inline', retry }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    // Navigate to home if there's no previous history
    if (window.history.length <= 2) {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  if (type === 'page') {
    return (
      <div className="error-page">
        <div className="error-content">
          <div className="flex flex-col items-center space-y-4">
            <i className="bi bi-exclamation-triangle text-4xl"></i>
            <h2 className="text-xl font-semibold text-center">{message}</h2>
            <div className="flex gap-4">
              {retry && (
                <button
                  onClick={retry}
                  className="btn btn-primary px-6 py-2 rounded-lg"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={handleBack}
                className="btn btn-secondary px-6 py-2 rounded-lg"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="error-inline">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <i className="bi bi-exclamation-triangle"></i>
          <span>{message}</span>
        </div>
        {retry && (
          <div className="flex gap-4 justify-end">
            <button
              onClick={retry}
              className="btn btn-primary px-4 py-2 rounded-lg text-sm"
            >
              Try Again
            </button>
            <button
              onClick={handleBack}
              className="btn btn-secondary px-4 py-2 rounded-lg text-sm"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Error;