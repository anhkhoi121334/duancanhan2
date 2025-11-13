import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@lib/formatters';

/**
 * ProductListView component - Beautiful list view for filtered products
 * @param {Object} props - Component props
 * @param {Array} props.products - Array of products to display
 * @param {Function} props.onToggleFavorite - Handler for favorite toggle
 * @param {Function} props.isFavorite - Function to check if product is favorite
 * @param {Function} props.showToast - Function to show toast messages
 */
const ProductListView = ({ 
  products = [], 
  onToggleFavorite, 
  isFavorite, 
  showToast,
  loading = false 
}) => {
  /**
   * Get product price - prioritize price_sale, then price, then variant price
   */
  const getProductPrice = (product) => {
    return product.price_sale || product.price || product.variants?.[0]?.price_sale || product.variants?.[0]?.price;
  };

  /**
   * Calculate discount percentage
   */
  const getDiscountPercentage = (product) => {
    if (product.price && product.price_sale && product.price > product.price_sale) {
      return Math.round(((product.price - product.price_sale) / product.price) * 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
            <div className="flex gap-6">
              <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20C20.55 4 21 4.45 21 5S20.55 6 20 6H19V19C19 20.1 18.1 21 17 21H7C5.9 21 5 20.1 5 19V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H15V3H9ZM7 6V19H17V6H7Z"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
        <p className="text-gray-500">Thử điều chỉnh bộ lọc để xem thêm sản phẩm</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product, index) => {
        const isProductFavorite = isFavorite ? isFavorite(product.id) : false;
        const discountPercentage = getDiscountPercentage(product);
        
        return (
          <article 
            key={product.id} 
            className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group scroll-reveal fade-up delay-${Math.min(index * 100 + 100, 600)}`}
          >
            <div className="p-6">
              <div className="flex gap-6">
                {/* Product Image */}
                <div className="relative flex-shrink-0">
                  <Link to={`/product/${product.slug || product.id}`}>
                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-50">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  </Link>
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.is_limited_edition && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        Limited
                      </span>
                    )}
                    {product.price_sale && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        Sale {discountPercentage}%
                      </span>
                    )}
                    {product.is_new && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        Mới
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <Link to={`/product/${product.slug || product.id}`} className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-[#ff6600] transition-colors line-clamp-2 leading-tight">
                        {product.name}
                      </h3>
                    </Link>
                    
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onToggleFavorite) {
                          const added = onToggleFavorite(product);
                          if (showToast) {
                            showToast(
                              added ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích',
                              added ? 'success' : 'info'
                            );
                          }
                        }
                      }}
                      className="ml-4 w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-all"
                      aria-pressed={isProductFavorite}
                      title="Yêu thích"
                    >
                      <svg 
                        className={`w-5 h-5 transition-all ${isProductFavorite ? 'fill-red-500 text-red-500' : 'fill-white text-gray-400 hover:text-red-500'}`} 
                        stroke="currentColor" 
                        fill={isProductFavorite ? 'currentColor' : 'white'}
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Màu sắc: <span className="font-medium">{product.color_name || 'Đen'}</span>
                    </p>
                    
                    {product.brand && (
                      <p className="text-sm text-gray-600">
                        Thương hiệu: <span className="font-medium">{product.brand.name || product.brand}</span>
                      </p>
                    )}

                    {product.description && (
                      <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}

                    {/* Product Features */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {product.category && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {product.category}
                        </span>
                      )}
                      {product.style && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.style}
                        </span>
                      )}
                      {product.product_line && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {product.product_line}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex flex-col items-end justify-between">
                  {getProductPrice(product) && (
                    <div className="text-right mb-4">
                      <div className="text-xl font-bold text-gray-900">
                        {formatPrice(getProductPrice(product))}
                      </div>
                      {product.price && product.price_sale && product.price > product.price_sale && (
                        <div className="text-sm text-gray-500 line-through">
                          {formatPrice(product.price)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 w-full max-w-[120px]">
                    <Link 
                      to={`/product/${product.slug || product.id}`}
                      className="w-full bg-[#ff6600] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors text-center"
                    >
                      Xem chi tiết
                    </Link>
                    
                    {/* Quick Add to Cart - if you have this functionality */}
                    <button className="w-full border border-[#ff6600] text-[#ff6600] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#ff6600] hover:text-white transition-colors">
                      Thêm giỏ hàng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default ProductListView;
