import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

export const UserProfile: React.FC = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  React.useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      toast.error('Please sign in to view your profile');
      return;
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Not Signed In</h2>
          <p className="mt-2 text-gray-600">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  const createdAtDate = user.createdAt ? new Date(user.createdAt) : null;
  const formattedDate = createdAtDate ? createdAtDate.toLocaleDateString() : 'N/A';

  return (
    <div className="mx-auto max-w-430px p-4">
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="mb-6 text-center">
          <div className="relative mx-auto mb-4 h-24 w-24">
            <img
              src={user.imageUrl}
              alt={user.fullName || 'Profile'}
              className="rounded-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
          <p className="text-gray-600">{user.primaryEmailAddress?.emailAddress}</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-md bg-gray-50 p-4">
            <h2 className="font-semibold text-gray-900">Profile Information</h2>
            <div className="mt-2 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Username:</span> {user.username || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Created:</span>{' '}
                {formattedDate}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};