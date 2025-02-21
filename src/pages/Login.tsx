import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-text-primary text-center mb-8">
          Login
        </h1>
        <SignIn 
          appearance={{
            baseTheme: dark,
            elements: {
              card: "bg-bg-secondary shadow-xl rounded-xl",
              rootBox: "w-full",
              formButtonPrimary: "bg-solo-purple hover:bg-solo-purple-light",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsIconButton: {
                height: "44px",
                width: "44px"
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default Login;