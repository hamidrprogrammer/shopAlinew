import { create } from 'zustand';

// This store will primarily reflect the theme choice and allow UI components
// to react to it or set it (which then gets synced to next-themes by ThemeManager).
// next-themes remains the source of truth for interacting with localStorage and the DOM class.

const useThemeStore = create(
  (set, get) => ({
    theme: 'system', // Default, will be updated by ThemeManager/ThemeStoreSynchronizer from next-themes
                     // 'system' means next-themes will resolve it to 'light' or 'dark' based on OS
    _hasHydrated: false, // To track if Zustand store has been initialized based on next-themes

    setHasHydrated: (hydrated) => {
      set({ _hasHydrated: hydrated });
    },

    // This function is now mainly to set the theme state in Zustand.
    // `next-themes` (via ThemeManager's ThemeStoreSynchronizer) will be responsible for listening to this
    // and applying it to DOM and localStorage if changed from here.
    setTheme: (newTheme) => {
      // console.log('Zustand: setTheme called with:', newTheme);
      set({ theme: newTheme });
    },

    // This function can be called by ThemeStoreSynchronizer to set the initial/current theme
    // based on what next-themes has resolved.
    // It's also important for initially setting the theme when the app loads and next-themes resolves.
    initializeTheme: (initialThemeFromNextThemes) => {
      // console.log('Zustand: initializeTheme called with (from next-themes):', initialThemeFromNextThemes);
      if (initialThemeFromNextThemes) {
        set({ theme: initialThemeFromNextThemes, _hasHydrated: true });
      } else {
        // This case should ideally not be hit if ThemeStoreSynchronizer works correctly,
        // as next-themes should always provide a resolved theme.
        // If it does, we might be initializing before next-themes is ready.
        // console.warn('Zustand: initializeTheme called without an initial theme from next-themes.');
        set({ _hasHydrated: true }); // Mark as hydrated anyway.
      }
    },

    // toggleTheme can be called from UI. ThemeStoreSynchronizer will see 'theme' change and update next-themes.
    toggleTheme: () => {
      set((state) => {
        let newTheme;
        // This toggle logic needs to be smart. If current is 'system', what should it toggle to?
        // It's often better for the UI toggle to directly call next-themes' setTheme('light'/'dark'/'system')
        // or our own setTheme which then syncs.
        // Simple toggle:
        if (state.theme === 'dark') {
          newTheme = 'light';
        } else if (state.theme === 'light') {
          newTheme = 'dark';
        } else { // If theme is 'system' or undefined, default to toggling to dark if system is light, and light if system is dark.
          const systemPrefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
          newTheme = systemPrefersDark ? 'light' : 'dark';
        }
        // console.log('Zustand: toggleTheme. Old:', state.theme, 'New:', newTheme);
        return { theme: newTheme };
      });
    },
  })
);

// To handle initial hydration status correctly, especially if not using persist middleware for this store specifically.
// We want to ensure _hasHydrated is true after the client has mounted and can access localStorage (via next-themes).
// The ThemeStoreSynchronizer handles the initial setting of the theme from next-themes' resolvedTheme.
if (typeof window !== 'undefined' && !useThemeStore.getState()._hasHydrated) {
  // This direct call might be too early or conflict with next-themes initialization.
  // It's better to let ThemeStoreSynchronizer call initializeTheme when next-themes has resolved.
  // For now, we ensure _hasHydrated can be set true by ThemeManager after next-themes has initialized.
  // useThemeStore.getState().setHasHydrated(true); // This might be premature.
}

export default useThemeStore;
