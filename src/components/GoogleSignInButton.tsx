import React from 'react';

const GoogleSignInButton: React.FC = () => {
  const handleGoogleSignIn = () => {
    // Use window.location.origin to get the current domain
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://gosolo.nyc/auth/google'
      : `${window.location.origin}/api/auth/google`;

    window.location.href = apiUrl;
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="btn-google"
      type="button"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
        />
      </svg>
      Sign in with Google
    </button>
  );
};

export default GoogleSignInButton;