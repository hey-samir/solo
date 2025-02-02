import React from 'react';

interface ErrorProps {
  message: string;
  type?: 'inline' | 'page';
  retry?: () => void;
}

const Error: React.FC<ErrorProps> = ({ message, type = 'inline', retry }) => {
  if (type === 'page') {
    return (
      <div className="error-page">
        <div className="error-content">
          <i className="material-icons text-red-500 text-4xl mb-4">error</i>
          <h2 className="text-xl font-semibold mb-2">{message}</h2>
          {retry && (
            <button
              onClick={retry}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="error-inline">
      <div className="flex items-center space-x-2 text-red-500">
        <i className="material-icons text-lg">error_outline</i>
        <span>{message}</span>
      </div>
      {retry && (
        <button
          onClick={retry}
          className="text-purple-500 hover:text-purple-600 text-sm mt-2 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default Error;
