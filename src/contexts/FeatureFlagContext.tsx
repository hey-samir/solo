import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FeatureFlags } from '../config/features';

interface FeatureFlagContextType {
  features: FeatureFlags;
  isLoading: boolean;
  error: string | null;
}

const FeatureFlagContext = createContext<FeatureFlagContextType>({
  features: { enableFAQ: false },
  isLoading: true,
  error: null,
});

export const useFeatureFlags = () => useContext(FeatureFlagContext);

export const FeatureFlagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [features, setFeatures] = useState<FeatureFlags>({ enableFAQ: false });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/features')
      .then(res => res.json())
      .then(data => {
        console.log('Loaded features:', data.features);
        setFeatures(data.features);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load features:', err);
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  return (
    <FeatureFlagContext.Provider value={{ features, isLoading, error }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};
