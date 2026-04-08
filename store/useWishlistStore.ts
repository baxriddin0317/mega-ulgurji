import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  wishlistItems: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistItems: [],

      toggleWishlist: (productId: string) => {
        set((state) => {
          const exists = state.wishlistItems.includes(productId);
          if (exists) {
            return { wishlistItems: state.wishlistItems.filter((id) => id !== productId) };
          } else {
            return { wishlistItems: [...state.wishlistItems, productId] };
          }
        });
      },

      isInWishlist: (productId: string) => {
        return get().wishlistItems.includes(productId);
      },

      clearWishlist: () => {
        set({ wishlistItems: [] });
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);

export default useWishlistStore;
