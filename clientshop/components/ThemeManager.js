// components/ThemeManager.js
'use client';

import { ThemeProvider as NextThemesProvider, useTheme as useNextThemeHook } from 'next-themes';
import { useEffect, useCallback } from 'react';
import useThemeStore from '../store/useThemeStore'; // Your Zustand store

// This component syncs next-themes' state with our Zustand store
function ThemeStoreSynchronizer() {
  const { resolvedTheme, setTheme: setNextThemeSystem } = useNextThemeHook(); // from next-themes
  const {
    theme: zustandTheme,
    setTheme: setZustandStoreTheme,
    _hasHydrated: zustandHasHydrated, // Assuming _hasHydrated indicates Zustand is ready
    initializeTheme: initializeZustandTheme // Renamed for clarity
  } = useThemeStore();

  // Initialize Zustand store with the theme from next-themes once both are ready
  useEffect(() => {
    if (resolvedTheme && zustandHasHydrated && zustandTheme !== resolvedTheme) {
      // console.log('ThemeStoreSynchronizer: Initializing/Syncing Zustand with next-themes resolved theme:', resolvedTheme);
      // We use setZustandStoreTheme directly as initialize might have its own logic for first load without specific theme
      setZustandStoreTheme(resolvedTheme);
    }
  }, [resolvedTheme, zustandHasHydrated, zustandTheme, setZustandStoreTheme]);

  // Effect to update next-themes when Zustand store changes
  // (e.g., user clicks a UI toggle that updates Zustand directly)
  useEffect(() => {
    if (zustandHasHydrated && zustandTheme && zustandTheme !== resolvedTheme) {
      // console.log(`ThemeStoreSynchronizer: Syncing Zustand (${zustandTheme}) to next-themes.`);
      setNextThemeSystem(zustandTheme);
    }
  }, [zustandTheme, resolvedTheme, setNextThemeSystem, zustandHasHydrated]);

  return null; // This component does not render anything itself
}

export default function ThemeManager({ children, ...props }) {
  // Props passed from RootLayout (e.g., attribute="class", defaultTheme="system", enableSystem)
  // Ensure `enableSystem` is true if you want system preference to be respected.
  // `storageKey` defaults to 'theme', `attribute` defaults to 'data-theme'. We use 'class'.
  return (
    <NextThemesProvider {...props}>
      <ThemeStoreSynchronizer />
      {children}
    </NextThemesProvider>
  );
}
