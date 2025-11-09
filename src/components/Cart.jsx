import React from 'react';
import { useCartStore } from '../store/cartStore';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, updateSize, getTotalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-md text-center">
        <p className="text-gray-600 text-lg">Giỏ hàng trống</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <h2 className="text-xl font-bold mb-5 text-gray-900">Giỏ hàng</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div 
            key={item.cartItemId} 
            className="flex items-center gap-5 p-5 border border-gray-200 rounded-lg transition-shadow hover:shadow-md"
          >
            <img 
              src={item.image || item.images?.[0]} 
              alt={item.name}
              className="w-24 h-24 object-cover rounded-md bg-gray-100" 
            />
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-2">{item.name}</h4>
              <p className="text-[#ff6600] font-bold text-lg mb-2">
                {item.price.toLocaleString('vi-VN')} VND
              </p>
              <p className="text-sm text-gray-600">Size: {item.size}</p>
            </div>
            <div className="flex items-center gap-3 border border-gray-300 rounded-md p-1">
              <button 
                onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-800 hover:text-white rounded transition font-bold"
              >
                -
              </button>
              <span className="min-w-[40px] text-center font-semibold">{item.quantity}</span>
              <button 
                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-800 hover:text-white rounded transition font-bold"
              >
                +
              </button>
            </div>
            <button 
              onClick={() => removeFromCart(item.cartItemId)}
              className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition"
            >
              Xóa
            </button>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-5 border-t-2 border-gray-200 text-right">
        <h3 className="text-2xl font-extrabold text-gray-900">
          Tổng cộng: {getTotalPrice().toLocaleString('vi-VN')} VND
        </h3>
      </div>
    </div>
  );
};

export default Cart;
