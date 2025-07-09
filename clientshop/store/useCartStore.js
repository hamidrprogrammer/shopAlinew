// store/useCartStore.js
import {create} from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // Array of { product, quantity }
      totalItems: 0,
      totalPrice: 0,

      // Add item to cart or increment quantity if it already exists
      addItem: (product, quantity = 1) => {
        const existingItem = get().items.find(item => item.product._id === product._id);
        let newItems;
        if (existingItem) {
          newItems = get().items.map(item =>
            item.product._id === product._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [...get().items, { product, quantity }];
        }
        set({ items: newItems });
        get().calculateTotals();
      },

      // Remove item from cart
      removeItem: (productId) => {
        const newItems = get().items.filter(item => item.product._id !== productId);
        set({ items: newItems });
        get().calculateTotals();
      },

      // Update quantity of an item
      updateItemQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        const newItems = get().items.map(item =>
          item.product._id === productId ? { ...item, quantity } : item
        );
        set({ items: newItems });
        get().calculateTotals();
      },

      // Clear the entire cart
      clearCart: () => {
        set({ items: [], totalItems: 0, totalPrice: 0 });
      },

      // Calculate total items and price
      calculateTotals: () => {
        const items = get().items;
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        set({ totalItems, totalPrice });
      },

      // Example: Check if an item is in the cart
      isInCart: (productId) => {
        return get().items.some(item => item.product._id === productId);
      },

      // Placeholder for syncing with backend for logged-in users
      syncWithBackend: async () => {
        // This function will be implemented later.
        // It might involve fetching the cart from the server or posting local changes.
        console.log("Attempting to sync cart with backend...");
        // const userId = useUserStore.getState().user?._id; // Example: get user from another store
        // if (userId) {
        //   // API call to get/update server cart
        // }
      }
    }),
    {
      name: 'cart-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      onRehydrateStorage: (state) => {
        console.log("Cart store hydration starts");
        return (state, error) => {
          if (error) {
            console.log('An error happened during cart store hydration', error);
          } else {
            console.log('Cart store hydration finished');
            state.calculateTotals(); // Recalculate totals after hydration
          }
        }
      }
    }
  )
);

export default useCartStore;
