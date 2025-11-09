import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      toast: null,

      showToast: (message, type = 'success') => {
        set({ toast: { message, type, id: Date.now() } });
      },

      hideToast: () => {
        set({ toast: null });
      },

      addToCart: (product, size = '42', quantity = 1) => {
        const { items, showToast } = get();
        // Tìm item theo id, size và variant_id (nếu có) để tránh duplicate
        const existingItem = items.find(
          (item) => {
            const sameProduct = item.id === product.id;
            const sameSize = item.size === size || item.size?.name === size;
            const sameVariant = product.variant_id ? item.variant_id === product.variant_id : true;
            return sameProduct && sameSize && sameVariant;
          }
        );

        if (existingItem) {
          // Cập nhật quantity của item hiện có
          const newQuantity = (existingItem.quantity || 1) + quantity;
          set({
            items: items.map((item) =>
              item.cartItemId === existingItem.cartItemId
                ? { ...item, quantity: newQuantity }
                : item
            ),
          });
          showToast(`Đã cập nhật số lượng sản phẩm trong giỏ hàng! (+${quantity})`, 'success');
        } else {
          // Thêm item mới với quantity được chỉ định
          const newItem = { 
            ...product, 
            quantity: quantity || 1, 
            size: size || product.selectedSize || '42', 
            cartItemId: Date.now() + Math.random(), // Đảm bảo unique ID
            sizes: product.sizes || product.variants?.map(v => v.size).filter((v, i, a) => a.indexOf(v) === i) || [38, 39, 40, 41, 42, 43, 44, 45]
          };
          set({
            items: [...items, newItem],
          });
          showToast(`Đã thêm "${product.name}" vào giỏ hàng! (${quantity} sản phẩm)`, 'success');
        }
      },


      updateQuantity: (cartItemId, newQuantity) => {
        if (newQuantity <= 0) {
          get().removeFromCart(cartItemId);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
          ),
        });
      },

      updateSize: (cartItemId, newSize) => {
        set({
          items: get().items.map((item) =>
            item.cartItemId === cartItemId ? { ...item, size: newSize } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },
      
      removeFromCart: (cartItemId) => {
        set({
          items: get().items.filter((item) => item.cartItemId !== cartItemId),
        });
      },

      getTotalPrice: () => {
        const { items } = get();
        
        return items.reduce(
          (total, item) => {
            const price = parseFloat(item.price || item.price_sale || 0);
            const quantity = parseInt(item.quantity || 1);
            if (isNaN(price) || isNaN(quantity)) {
              return total;
            }
            return total + price * quantity;
          },
          0
        );
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

