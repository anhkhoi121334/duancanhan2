import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      favorites: [],

      // Thêm sản phẩm vào yêu thích
      addToFavorites: (product) => {
        const { favorites } = get();
        const exists = favorites.find(item => item.id === product.id);
        
        if (!exists) {
          set({ favorites: [...favorites, product] });
          return true;
        }
        return false;
      },

      // Xóa sản phẩm khỏi yêu thích
      removeFromFavorites: (productId) => {
        set({ favorites: get().favorites.filter(item => item.id !== productId) });
      },

      // Kiểm tra sản phẩm có trong yêu thích không
      isFavorite: (productId) => {
        return get().favorites.some(item => item.id === productId);
      },

      // Toggle favorite (thêm/xóa)
      toggleFavorite: (product) => {
        const { favorites } = get();
        const exists = favorites.find(item => item.id === product.id);
        
        if (exists) {
          set({ favorites: favorites.filter(item => item.id !== product.id) });
          return false; // Đã xóa
        } else {
          set({ favorites: [...favorites, product] });
          return true; // Đã thêm
        }
      },

      // Xóa tất cả
      clearFavorites: () => {
        set({ favorites: [] });
      },

      // Lấy số lượng sản phẩm yêu thích
      getFavoritesCount: () => {
        return get().favorites.length;
      },
    }),
    {
      name: 'favorites-storage',
    }
  )
);


