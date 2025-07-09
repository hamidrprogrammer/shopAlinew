// store/useAuthStore.js
import {create} from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Helper function to parse JWT. In a real app, you might use a library like jwt-decode.
// This is a very basic parser and assumes the JWT is not encrypted.
const parseJwt = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to parse JWT:", e);
    return null;
  }
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null, // Will store decoded JWT payload (e.g., { id, email, role })
      isAuthenticated: false,
      isLoading: true, // To handle initial check for token

      login: (newToken) => {
        const decodedUser = parseJwt(newToken);
        set({ token: newToken, user: decodedUser, isAuthenticated: !!decodedUser, isLoading: false });
        // In a real app, you might also set up axios headers here or similar
        // Also, potentially redirect or trigger other actions
        console.log("User logged in:", decodedUser);
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
        // In a real app, you would also make an API call to invalidate the token on the server if applicable
        // And clear any other user-related state from other stores
        console.log("User logged out");
      },

      // This would typically be called once when the app loads to check for existing token
      initializeAuth: () => {
        const token = get().token; // Get token from persisted state
        if (token) {
          const decodedUser = parseJwt(token);
          if (decodedUser && decodedUser.exp * 1000 > Date.now()) { // Check expiration
            set({ user: decodedUser, isAuthenticated: true, isLoading: false });
            console.log("User re-authenticated from persisted token:", decodedUser);
          } else {
            // Token is expired or invalid
            set({ token: null, user: null, isAuthenticated: false, isLoading: false });
            console.log("Persisted token is invalid or expired. Logging out.");
          }
        } else {
          set({ isLoading: false });
           console.log("No persisted token found.");
        }
      },

      // Example of how to get user role (assuming role is in JWT payload)
      getUserRole: () => {
        return get().user?.role;
      },

      // Example of how to check if user is admin
      isAdmin: () => {
        return get().user?.role === 'admin';
      }
    }),
    {
      name: 'auth-storage', // name of the item in the storage
      storage: createJSONStorage(() => localStorage), // using localStorage for now
      partialize: (state) => ({ token: state.token }), // Only persist the token
      onRehydrateStorage: () => {
        console.log("Auth store hydration starts");
        return (state, error) => {
          if (error) {
            console.log('An error happened during auth store hydration', error);
            state.isLoading = false;
          } else {
            console.log('Auth store hydration finished, attempting to initialize auth.');
            // state.initializeAuth(); // Call initializeAuth after rehydration
            // Directly calling initializeAuth here might cause issues if `get()` is used inside it before full hydration.
            // It's better to call it from an effect in your app's main component.
          }
        }
      }
    }
  )
);

// Call initializeAuth once the store is created and rehydrated (if applicable)
// This is a common pattern, but for Next.js App Router, it's better to do this in a client component effect.
// For now, let's log a message to remind us to call it.
console.log("AuthStore created. Remember to call initializeAuth() in a useEffect hook in a client component.");

export default useAuthStore;
