import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useSearchStore } from '../store/searchStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { useCartStore } from '../store/cartStore';
import SEO from '../components/SEO';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get search params from URL
  const keyword = searchParams.get('keyword') || searchParams.get('q') || '';
  const pageParam = searchParams.get('page') || '1';
  
  // Search Store
  const {
    searchResults,
    isSearching,
    error,
    pagination,
    filters,
    recentSearches,
    performSearch,
    setFilters,
    clearFilters,
    removeRecentSearch
  } = useSearchStore();
  
  // Local state for input
  const [searchKeyword, setSearchKeyword] = useState(keyword);
  
  // Favorites & Cart
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { showToast } = useCartStore();
  
  // Perform search when URL params change
  useEffect(() => {
    if (keyword.trim()) {
      const page = parseInt(pageParam) || 1;
      performSearch(keyword, page);
    }
  }, [keyword, pageParam, performSearch]);
  
  // Sync filters from URL
  useEffect(() => {
    const urlFilters = {
      brand_id: searchParams.get('brand_id') || '',
      min_price: searchParams.get('min_price') || '',
      max_price: searchParams.get('max_price') || '',
      gender: searchParams.get('gender') || '',
      sort_by: searchParams.get('sort_by') || '',
      sort_order: searchParams.get('sort_order') || 'desc'
    };
    setFilters(urlFilters);
  }, [searchParams, setFilters]);
  
  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) {
      showToast('Vui lòng nhập từ khóa tìm kiếm', 'error');
      return;
    }
    navigate(`/search?keyword=${encodeURIComponent(searchKeyword.trim())}&page=1`);
  };
  
  // Handle filter change
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const params = new URLSearchParams({
      keyword: keyword,
      page: 1,
      ...newFilters
    });
    
    Object.keys(Object.fromEntries(params)).forEach(key => {
      if (!params.get(key)) params.delete(key);
    });
    
    navigate(`/search?${params.toString()}`);
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    const params = new URLSearchParams({
      keyword: keyword,
      page: newPage,
      ...filters
    });
    
    Object.keys(Object.fromEntries(params)).forEach(key => {
      if (!params.get(key)) params.delete(key);
    });
    
    navigate(`/search?${params.toString()}`);
    window.scrollTo(0, 0);
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    clearFilters();
    navigate(`/search?keyword=${encodeURIComponent(keyword)}&page=1`);
  };
  
  const formatPrice = (price) => {
    return price?.toLocaleString('vi-VN') + ' VND' || 'N/A';
  };
  
  return (
    <>
      <SEO
        title={`Tìm kiếm "${keyword}" - ANKH Store`}
        description={`Kết quả tìm kiếm cho "${keyword}". Tìm thấy ${pagination.totalResults} sản phẩm phù hợp tại ANKH Store.`}
        keywords={`tìm kiếm, ${keyword}, sản phẩm, ANKH`}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Search Header */}
        <section className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-full focus:border-[#ff6600] focus:outline-none text-lg"
                />
                <button
                  type="submit"
                  className="px-10 py-4 bg-[#ff6600] text-white rounded-full font-bold hover:bg-orange-700 transition-colors"
                >
                  Tìm kiếm
                </button>
              </div>
            </form>
            
            {/* Results Count */}
            {keyword && !isSearching && (
              <div className="text-center mb-4">
                <p className="text-lg text-gray-700">
                  Tìm thấy <span className="font-bold text-[#ff6600]">{pagination.totalResults}</span> kết quả cho "{keyword}"
                </p>
              </div>
            )}

            {/* Recent Searches */}
            {!keyword && recentSearches.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">Tìm kiếm gần đây:</h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <div key={index} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                      <button
                        onClick={() => navigate(`/search?keyword=${encodeURIComponent(search)}`)}
                        className="text-gray-700 hover:text-[#ff6600] transition-colors"
                      >
                        {search}
                      </button>
                      <button
                        onClick={() => removeRecentSearch(search)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid md:grid-cols-12 gap-8">
            {/* Filters Sidebar */}
            <aside className="md:col-span-3">
              <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900 uppercase">Bộ Lọc</h2>
                  {(filters.gender || filters.min_price || filters.max_price || filters.sort_by) && (
                    <button
                      onClick={handleClearFilters}
                      className="text-sm text-[#ff6600] hover:underline"
                    >
                      Xóa tất cả
                    </button>
                  )}
                </div>

                {/* Gender Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">Giới tính</h3>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value=""
                        checked={!filters.gender}
                        onChange={() => handleFilterChange('gender', '')}
                        className="mr-2"
                      />
                      <span>Tất cả</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Nam"
                        checked={filters.gender === 'Nam'}
                        onChange={() => handleFilterChange('gender', 'Nam')}
                        className="mr-2"
                      />
                      <span>Nam</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="Nữ"
                        checked={filters.gender === 'Nữ'}
                        onChange={() => handleFilterChange('gender', 'Nữ')}
                        className="mr-2"
                      />
                      <span>Nữ</span>
                    </label>
                  </div>
                </div>

                {/* Sort */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">Sắp xếp</h3>
                  <select
                    value={filters.sort_by || ''}
                    onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#ff6600] focus:outline-none"
                  >
                    <option value="">Mặc định</option>
                    <option value="price">Giá thấp - cao</option>
                    <option value="price_desc">Giá cao - thấp</option>
                    <option value="name">Tên A-Z</option>
                    <option value="newest">Mới nhất</option>
                  </select>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <main className="md:col-span-9">
              {/* Loading */}
              {isSearching && (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6600]"></div>
                  <p className="mt-4 text-gray-600">Đang tìm kiếm...</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="text-center py-20">
                  <p className="text-red-600 mb-4">{error}</p>
                </div>
              )}

              {/* No Results */}
              {!isSearching && !error && searchResults.length === 0 && keyword && (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🔍</div>
                  <h2 className="text-2xl font-bold mb-2">Không tìm thấy sản phẩm</h2>
                  <p className="text-gray-600 mb-6">Thử tìm kiếm với từ khóa khác</p>
                </div>
              )}

              {/* Products */}
              {!isSearching && !error && searchResults.length > 0 && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {searchResults.map((product) => {
                      const isProductFavorite = isFavorite(product.id);
                      
                      return (
                        <div key={product.id} className="group bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 relative">
                          <Link to={`/product/${product.slug || product.id}`} className="no-underline">
                            <div className="bg-gray-200 aspect-square p-4 relative overflow-hidden">
                              {product.is_limited_edition && (
                                <span className="absolute top-2 left-2 bg-blue-700 text-white text-[10px] px-2.5 py-1 font-bold z-10 uppercase">
                                  Limited
                                </span>
                              )}
                              {product.price_sale && (
                                <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-2.5 py-1 font-bold z-10 uppercase">
                                  Sale
                                </span>
                              )}
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <div className="p-4 text-center">
                              <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[40px]">
                                {product.name}
                              </h3>
                              <p className="text-xs text-gray-500 mb-2">{product.color_name || 'Black'}</p>
                              <div className="flex items-center justify-center gap-2">
                                <div className="text-base font-bold text-gray-900">
                                  {formatPrice(product.price_sale || product.price)}
                                </div>
                                {product.price_sale && (
                                  <span className="text-xs text-gray-400 line-through">
                                    {formatPrice(product.price)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                          
                          {/* Favorite Button */}
                          <button
                            onClick={() => {
                              const added = toggleFavorite(product);
                              showToast(
                                added ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích',
                                added ? 'success' : 'info'
                              );
                            }}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
                          >
                            <svg 
                              className={`w-4 h-4 ${isProductFavorite ? 'fill-red-500 text-red-500' : 'fill-none text-orange-500'}`} 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-12">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        ‹ Trước
                      </button>
                      
                      {[...Array(Math.min(pagination.totalPages, 7))].map((_, i) => {
                        let pageNumber;
                        if (pagination.totalPages <= 7) {
                          pageNumber = i + 1;
                        } else if (pagination.currentPage <= 4) {
                          pageNumber = i + 1;
                        } else if (pagination.currentPage >= pagination.totalPages - 3) {
                          pageNumber = pagination.totalPages - 6 + i;
                        } else {
                          pageNumber = pagination.currentPage - 3 + i;
                        }

                        return (
                          <button
                            key={i}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              pagination.currentPage === pageNumber
                                ? 'bg-[#ff6600] text-white'
                                : 'border hover:bg-gray-100'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Sau ›
                      </button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchPage;

