import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorProps } from '../types';

const Error: React.FC<ErrorProps> = ({ message, type = 'inline', retry }) => {
  const navigate = useNavigate();

  if (type === 'page') {
    return (
      <div className="error-page">
        <div className="error-content">
          <div className="flex flex-col items-center space-y-4">
            <i className="material-icons error-icon text-4xl">error_outline</i>
            <h2 className="text-xl font-semibold text-center">{message}</h2>
            <div className="flex gap-4">
              {retry && (
                <button
                  onClick={() => retry()}
                  className="btn-solo-purple px-6 py-2 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={() => navigate(-1)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
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
          <i className="material-icons text-error">error_outline</i>
          <span className="text-error">{message}</span>
        </div>
        {retry && (
          <div className="flex gap-4 justify-end">
            <button
              onClick={() => retry()}
              className="btn-solo-purple px-4 py-2 rounded-lg text-sm"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
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