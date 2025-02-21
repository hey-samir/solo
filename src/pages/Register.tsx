import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';

const Register: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <main className="flex-grow flex items-start justify-center pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-text-primary">
              Join Solo
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Start tracking your climbing journey
            </p>
          </div>
          <SignUp 
            appearance={{
              baseTheme: dark,
              elements: {
                rootBox: "mx-auto",
                card: "bg-bg-secondary rounded-lg shadow-md",
                socialButtonsIconButton: {
                  height: "44px",
                  width: "44px"
                }
              }
            }}
          />
        </div>
      </main>
      <footer className="py-4 text-center text-text-secondary text-sm">
        © {new Date().getFullYear()} Solo. All rights reserved.
      </footer>
    </div>
  );
};

export default Register;