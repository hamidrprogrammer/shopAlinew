// components/AuthInitializer.js
'use client';

import { useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';

export default function AuthInitializer() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    console.log("AuthInitializer: Attempting to initialize auth state...");
    initializeAuth();
  }, [initializeAuth]);

  // This component doesn't render anything itself,
  // but it ensures that the auth initialization logic runs when the app loads.
  // You might show a global loader based on the isLoading state elsewhere in your app.

  if (isLoading) {
    // Optional: You could return a global loading spinner here if your app structure supports it
    // For now, just logging, as the main app will render regardless.
    console.log("AuthInitializer: Auth state is initializing...");
  }

  return null;
}
