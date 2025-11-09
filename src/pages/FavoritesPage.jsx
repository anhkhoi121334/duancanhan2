import React from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useFavoritesStore } from '../store/favoritesStore';
import SEO from '../components/SEO';

const FavoritesPage = () => {
  const { favorites, removeFromFavorites, clearFavorites } = useFavoritesStore();
  const { addToCart, showToast } = useCartStore();

  const formatPrice = (price) => {
    return price?.toLocaleString('vi-VN') + ' VND' || '0';
  };

  const removeFavorite = (id) => {
    removeFromFavorites(id);
    showToast('Đã xóa khỏi danh sách yêu thích', 'success');
  };

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: 42, // Default size
      quantity: 1
    });
    showToast('Đã thêm vào giỏ hàng!', 'success');
  };

  if (favorites.length === 0) {
    return (
      <div className="py-10 min-h-[500px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-2xl font-bold mb-8 uppercase text-gray-900">
            YÊU THÍCH
          </h1>
          <div className="bg-white rounded-lg p-12 text-center shadow-sm border">
            <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-lg text-gray-600 mb-6">Danh sách yêu thích của bạn đang trống</p>
            <Link 
              to="/products" 
              className="inline-block bg-[#ff6600] text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition uppercase no-underline"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Sản phẩm yêu thích - ANKH Store"
        description="Danh sách sản phẩm yêu thích của bạn tại ANKH. Xem lại và mua những đôi giày thể thao bạn quan tâm."
        keywords="yêu thích, wishlist, giày thể thao, ANKH"
      />
    <div className="py-8 min-h-screen bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-lg font-bold uppercase text-gray-900">
              DANH MỤC YÊU THÍCH CỦA BẠN
            </h1>
            <span className="text-sm text-gray-600">{favorites.length} sản phẩm</span>
          </div>

          <div className="divide-y">
            {favorites.map((product) => (
              <div 
                key={product.id} 
                className="flex gap-4 p-4 hover:bg-gray-50 transition"
              >
                <input type="checkbox" className="mt-1 flex-shrink-0" />
                <Link to={`/product/${product.slug || product.id}`}>
                  <img 
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded bg-gray-100 flex-shrink-0" 
                  />
                </Link>
                
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${product.slug || product.id}`} className="no-underline">
                    <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2 hover:text-[#ff6600]">
                      {product.name}
                    </h4>
                  </Link>
                  <p className="text-gray-500 text-xs mb-2">{product.color_name || 'Black'}</p>
                  <p className="text-[#ff6600] font-bold text-lg">
                    {formatPrice(product.price)}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600">Size</label>
                      <select className="border border-gray-300 rounded px-2 py-1 text-sm w-16">
                        {[38, 39, 40, 41, 42, 43, 44, 45].map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600">SL</label>
                      <select className="border border-gray-300 rounded px-2 py-1 text-sm w-16">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(qty => (
                          <option key={qty} value={qty}>{qty}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <button 
                    onClick={() => removeFavorite(product.id)}
                    className="text-gray-400 hover:text-red-600 transition"
                    title="Xóa khỏi yêu thích"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="text-xs bg-[#ff6600] text-white px-4 py-2 rounded hover:bg-orange-700 transition whitespace-nowrap"
                  >
                    Còn hàng
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            <button
              onClick={() => {
                clearFavorites();
                showToast('Đã xóa tất cả sản phẩm yêu thích', 'success');
              }}
              className="bg-black text-white px-6 py-2.5 rounded text-sm font-semibold hover:bg-gray-800 transition uppercase"
            >
              XÓA HẾT
            </button>
            <Link
              to="/products"
              className="border-2 border-black text-black px-6 py-2.5 rounded text-sm font-semibold hover:bg-gray-50 transition uppercase no-underline"
            >
              QUAY LẠI MUA HÀNG
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default FavoritesPage;

