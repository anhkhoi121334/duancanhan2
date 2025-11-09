import React from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

const TopBar = () => {
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="hidden md:block bg-[#333] text-white">
      <div className="max-w-6xl mx-auto px-6 h-10 flex items-center justify-center gap-8 text-[13px]">
        <Link to="/orders" className="flex items-center gap-2 text-white no-underline hover:text-[#ff6600] transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.5 6.5 12 2 3.5 6.5v11L12 22l8.5-4.5v-11Zm-8.5 13-6-3.18V8.44L12 11v8.5Zm.5-10.6L7.1 6.24 12 3.7l4.9 2.54L12.5 8.9Zm1 10.6V11l6-2.56v7.88L13.5 19.5Z"/>
          </svg>
          <span>Tra cứu đơn hàng</span>
        </Link>
        <Link to="/stores" className="flex items-center gap-2 text-white no-underline hover:text-[#ff6600] transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/>
          </svg>
          <span>Tìm cửa hàng</span>
        </Link>
        <Link to="/favorites" className="flex items-center gap-2 text-white no-underline hover:text-[#ff6600] transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21s-6.7-4.15-9.2-7.2C1 11.63 1.3 8.9 3.1 7.3c1.63-1.44 4.21-1.33 5.83.24L12 10.5l3.07-2.96c1.62-1.57 4.2-1.68 5.83-.24 1.81 1.6 2.11 4.33.29 6.5C18.7 16.85 12 21 12 21Z"/>
          </svg>
          <span>Yêu thích</span>
        </Link>
        <div className="flex-1"></div>
        <Link to="/login" className="flex items-center gap-2 text-white no-underline hover:text-[#ff6600] transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"/>
          </svg>
          <span>BÌNH AN</span>
        </Link>
        <Link to="/cart" className="flex items-center gap-2 text-white no-underline hover:text-[#ff6600] transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 4h-2l-1 2H1v2h1l3.6 7.59a2 2 0 0 0 1.8 1.16h9a2 2 0 0 0 1.9-1.37L21 8H6.42l-.7-1.4L5.2 6h13.3v-2H7Zm3 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/>
          </svg>
          <span>Giỏ hàng ({cartCount})</span>
        </Link>
      </div>
    </div>
  );
};

export default TopBar;
