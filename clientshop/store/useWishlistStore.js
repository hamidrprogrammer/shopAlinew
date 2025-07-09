import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Helper function to avoid duplicate items if product already exists (e.g. by ID)
const addItemToWishlist = (items, product) => {
  const existingItem = items.find((item) => item.id === product.id);
  if (existingItem) {
    return items; // Product already in wishlist, do nothing or maybe notify user
  }
  return [...items, { ...product }]; // Add product (ensure it has necessary info like id, name, price, imageUrl, slug)
};

const removeItemFromWishlist = (items, productId) => {
  return items.filter((item) => item.id !== productId);
};

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [], // Array of product objects
      _hasHydrated: false, // For checking if store is rehydrated from localStorage

      setHasHydrated: (hydrated) => {
        set({
          _hasHydrated: hydrated,
        });
      },

      addToWishlist: (product) => {
        if (!product || !product.id) {
          console.error("Wishlist: Product or product ID is missing.");
          return;
        }
        set((state) => ({
          items: addItemToWishlist(state.items, product),
        }));
        // console.log('Added to wishlist:', product.name, get().items);
      },

      removeFromWishlist: (productId) => {
        set((state) => ({
          items: removeItemFromWishlist(state.items, productId),
        }));
        // console.log('Removed from wishlist, ID:', productId, get().items);
      },

      isItemInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId);
      },

      clearWishlist: () => { // Optional: if needed
        set({ items: [] });
      },

      // TODO: When user logs in, merge local wishlist with server wishlist
      // TODO: When user logs out, decide whether to clear local wishlist or keep it for next guest session
      // loadUserWishlist: (userWishlistItems) => set({ items: userWishlistItems }),
    }),
    {
      name: 'wishlist-storage', // Name of the item in localStorage
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHasHydrated(true);
      }
    }
  )
);

// Ensure _hasHydrated is set on initial load if not using onRehydrateStorage or for non-persisted stores
if (typeof window !== 'undefined' && !useWishlistStore.getState()._hasHydrated) {
    useWishlistStore.getState().setHasHydrated(true);
}


export default useWishlistStore;
