import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ErrorProps {
  message: string;
  type?: 'inline' | 'page';
  retry?: () => void;
}

const Error: React.FC<ErrorProps> = ({ message, type = 'inline', retry }) => {
  const navigate = useNavigate();

  if (type === 'page') {
    return (
      <div className="flash-messages-container">
        <div className="flash-message">
          <div className="flex flex-col items-center">
            <i className="material-icons text-red-500 text-4xl mb-4">error</i>
            <h2 className="text-xl font-semibold mb-4">{message}</h2>
            <div className="flex gap-4">
              {retry && (
                <button
                  onClick={retry}
                  className="btn-solo-purple"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={() => navigate(-1)}
                className="btn-secondary"
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
    <div className="flash-message">
      <div className="flex items-center space-x-2">
        <i className="material-icons text-lg">error_outline</i>
        <span>{message}</span>
      </div>
      {retry && (
        <div className="flex gap-4 mt-4 justify-center">
          <button
            onClick={retry}
            className="btn-solo-purple"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
};

export default Error;