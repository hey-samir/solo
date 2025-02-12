import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorProps } from '../types';

// Climbing-themed error messages
const getClimbingErrorMessage = (message: string): string => {
  // Default climbing-themed messages for common errors
  const defaultMessages: Record<string, string> = {
    'Network Error': "Looks like we've hit a rough patch! Our rope got tangled in the server cables 🧗‍♂️",
    'Not Found': "Whoops! This route seems to have been retired. Let's find you a better one! 🗺️",
    '401': "Hold up! You'll need to chalk up and log in first! 🧊",
    '403': "This route is currently closed for maintenance. Time to project something else! 🚧",
    '500': "Our server took a whipper! Our team is working on the recovery 🔧",
    'default': "Oops! Looks like we've encountered a technical crux 🤔"
  };

  // Check if it's a known error message
  for (const [errorType, friendlyMessage] of Object.entries(defaultMessages)) {
    if (message.toLowerCase().includes(errorType.toLowerCase())) {
      return friendlyMessage;
    }
  }

  return defaultMessages.default;
};

const Error: React.FC<ErrorProps> = ({ message, type = 'inline', retry }) => {
  const navigate = useNavigate();
  const friendlyMessage = getClimbingErrorMessage(message);

  const handleBack = () => {
    if (window.history.length <= 2) {
      navigate('/');
    } else {
      navigate(-1);
    }
  };


  if (type === 'page') {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="error-content bg-bg-card rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="text-6xl mb-4">🧗‍♂️</div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              {friendlyMessage}
            </h2>
            <div className="text-text-muted text-sm mb-6">
              Don't worry, even the best climbers take falls sometimes!
            </div>
            <div className="flex justify-center gap-4 w-full">
              {retry && (
                <button
                  onClick={retry}
                  className="flex-1 max-w-[200px] btn-solo-purple px-6 py-3 rounded-md text-sm font-medium"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={handleBack}
                className="flex-1 max-w-[200px] bg-bg-card text-text-primary px-6 py-3 rounded-md hover:bg-opacity-80 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Inline error variant
  return (
    <div className="bg-bg-card rounded-lg p-4 my-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-3 text-text-primary">
          <span className="text-xl">🪢</span>
          <span className="text-sm">{friendlyMessage}</span>
        </div>
        {retry && (
          <div className="flex gap-3 justify-end">
            <button
              onClick={retry}
              className="btn-solo-purple px-4 py-1.5 rounded-full text-xs font-medium"
            >
              Try Again
            </button>
            <button
              onClick={handleBack}
              className="bg-bg-kpi-card text-text-primary px-4 py-1.5 rounded-full text-xs font-medium hover:bg-opacity-80 transition-colors"
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