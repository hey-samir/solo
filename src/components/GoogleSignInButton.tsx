import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const GoogleSignInButton: React.FC = () => {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        console.log('Google login successful, sending token to backend...');
        const result = await fetch('/api/auth/google/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            access_token: response.access_token,
          }),
          credentials: 'include'  // Important for session cookie handling
        });

        if (!result.ok) {
          throw new Error(`HTTP error! status: ${result.status}`);
        }

        const data = await result.json();
        console.log('Backend response:', data);

        if (data.success) {
          if (data.isNewUser || data.needsProfile) {
            // Always redirect to register for new users or incomplete profiles
            const params = new URLSearchParams({
              email: data.user.email,
              name: data.user.name || '',
              picture: data.user.picture || '',
              isNewUser: data.isNewUser.toString()
            });
            navigate(`/register?${params.toString()}`);
          } else {
            // Only redirect to profile if user exists and has complete profile
            console.log('User has complete profile, redirecting...');
            navigate('/profile');
          }
        } else {
          console.error('Authentication failed:', data.error);
        }
      } catch (error) {
        console.error('Error during authentication:', error);
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
    },
    flow: 'implicit'
  });

  return (
    <button
      onClick={() => login()}
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