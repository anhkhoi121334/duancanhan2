import React, { useState, useEffect, useMemo } from 'react';
import { formatPrice } from '@lib/formatters';

/**
 * ProductFilter component - Advanced filtering processor for products
 * @param {Object} props - Component props
 * @param {Array} props.products - Array of products to filter
 * @param {Object} props.filters - Current filter state
 * @param {Function} props.onFilteredProductsChange - Callback when filtered products change
 */
const ProductFilter = ({ 
  products = [], 
  filters = {}, 
  onFilteredProductsChange 
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Price range filter
    if (localFilters.minPrice || localFilters.maxPrice) {
      filtered = filtered.filter(product => {
        const price = product.price_sale || product.price || 0;
        const min = parseFloat(localFilters.minPrice) || 0;
        const max = parseFloat(localFilters.maxPrice) || Infinity;
        return price >= min && price <= max;
      });
    }

    // Date filter - products updated within date range
    if (localFilters.dateFilter && localFilters.dayRange) {
      const filterDate = new Date(localFilters.dateFilter);
      const dayRange = parseInt(localFilters.dayRange) || 30;
      const endDate = new Date(filterDate);
      endDate.setDate(endDate.getDate() + dayRange);

      filtered = filtered.filter(product => {
        if (!product.updated_at) return true;
        const productDate = new Date(product.updated_at);
        return productDate >= filterDate && productDate <= endDate;
      });
    }

    // Sale/Discount filter
    if (localFilters.saleType) {
      switch (localFilters.saleType) {
        case 'sale':
          filtered = filtered.filter(product => product.price_sale);
          break;
        case 'discount':
          filtered = filtered.filter(product => 
            product.price_sale && product.price && product.price > product.price_sale
          );
          break;
        case 'new':
          filtered = filtered.filter(product => product.is_new);
          break;
        default:
          break;
      }
    }

    // Category filter (multiple selection)
    if (localFilters.categories && localFilters.categories.length > 0) {
      filtered = filtered.filter(product => 
        localFilters.categories.some(category => 
          product.category === category || 
          product.categories?.includes(category)
        )
      );
    }

    // Brand filter
    if (localFilters.brandId) {
      filtered = filtered.filter(product => 
        product.brand_id === localFilters.brandId ||
        product.brand?.id === localFilters.brandId
      );
    }

    // Color filter
    if (localFilters.colorId) {
      filtered = filtered.filter(product => 
        product.color_id === localFilters.colorId ||
        product.color?.id === localFilters.colorId
      );
    }

    // Gender filter
    if (localFilters.gender) {
      filtered = filtered.filter(product => 
        product.gender === localFilters.gender
      );
    }

    // Search filter
    if (localFilters.search) {
      const searchTerm = localFilters.search.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.brand?.name?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [products, localFilters]);

  // Sort filtered products
  const sortedProducts = useMemo(() => {
    let sorted = [...filteredProducts];

    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => {
          const priceA = a.price_sale || a.price || 0;
          const priceB = b.price_sale || b.price || 0;
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        sorted.sort((a, b) => {
          const priceA = a.price_sale || a.price || 0;
          const priceB = b.price_sale || b.price || 0;
          return priceB - priceA;
        });
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        sorted.sort((a, b) => {
          const dateA = new Date(a.created_at || a.updated_at || 0);
          const dateB = new Date(b.created_at || b.updated_at || 0);
          return dateB - dateA;
        });
        break;
      case 'discount':
        sorted.sort((a, b) => {
          const discountA = a.price && a.price_sale ? 
            ((a.price - a.price_sale) / a.price) * 100 : 0;
          const discountB = b.price && b.price_sale ? 
            ((b.price - b.price_sale) / b.price) * 100 : 0;
          return discountB - discountA;
        });
        break;
      default:
        // Keep original order
        break;
    }

    return sorted;
  }, [filteredProducts, sortBy]);

  // Update parent component when filtered products change
  useEffect(() => {
    if (onFilteredProductsChange) {
      onFilteredProductsChange(sortedProducts);
    }
  }, [sortedProducts, onFilteredProductsChange]);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Get filter statistics
  const filterStats = useMemo(() => {
    const total = products.length;
    const filtered = filteredProducts.length;
    const saleProducts = filteredProducts.filter(p => p.price_sale).length;
    const newProducts = filteredProducts.filter(p => p.is_new).length;
    
    const priceRange = filteredProducts.reduce((acc, product) => {
      const price = product.price_sale || product.price || 0;
      return {
        min: Math.min(acc.min, price),
        max: Math.max(acc.max, price)
      };
    }, { min: Infinity, max: 0 });

    return {
      total,
      filtered,
      saleProducts,
      newProducts,
      priceRange: priceRange.min === Infinity ? { min: 0, max: 0 } : priceRange
    };
  }, [products, filteredProducts]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Kết quả lọc ({filterStats.filtered} / {filterStats.total})
          </h3>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-3 text-sm text-gray-600">
            {filterStats.saleProducts > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                {filterStats.saleProducts} Sale
              </span>
            )}
            {filterStats.newProducts > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {filterStats.newProducts} Mới
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:border-transparent"
          >
            <option value="default">Sắp xếp mặc định</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
            <option value="name-asc">Tên A-Z</option>
            <option value="name-desc">Tên Z-A</option>
            <option value="newest">Mới nhất</option>
            <option value="discount">Giảm giá nhiều nhất</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm ${
                viewMode === 'grid' 
                  ? 'bg-[#ff6600] text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/>
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm ${
                viewMode === 'list' 
                  ? 'bg-[#ff6600] text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 5h18v2H3V5zm0 6h18v2H3v-2zm0 6h18v2H3v-2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Price Range Info */}
      {filterStats.filtered > 0 && (
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span>
            Khoảng giá: {formatPrice(filterStats.priceRange.min)} - {formatPrice(filterStats.priceRange.max)}
          </span>
        </div>
      )}

      {/* Active Filters */}
      {Object.keys(localFilters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {localFilters.minPrice && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Giá từ: {formatPrice(localFilters.minPrice)}
            </span>
          )}
          {localFilters.maxPrice && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Giá đến: {formatPrice(localFilters.maxPrice)}
            </span>
          )}
          {localFilters.dateFilter && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Từ ngày: {new Date(localFilters.dateFilter).toLocaleDateString('vi-VN')}
            </span>
          )}
          {localFilters.saleType && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {localFilters.saleType === 'sale' ? 'Đang Sale' : 
               localFilters.saleType === 'discount' ? 'Giảm giá' : 'Sản phẩm mới'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductFilter;
