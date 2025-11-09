import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Sidebar, SEO } from '@components';
import { getProducts, getBrands, getColors } from '@services/api';
import { useFavoritesStore, useCartStore } from '@store';
import { formatPrice } from '@lib/formatters';

/**
 * Featured mapping - Map từ URL format sang API format
 */
const FEATURED_URL_TO_API = {
  'hot': 'bestseller',
  'sale': 'sale',
  'new': 'new',
  'limited': 'limited'
};

/**
 * Featured mapping - Map từ API format sang URL format
 */
const FEATURED_API_TO_URL = {
  'bestseller': 'hot',
  'sale': 'sale',
  'new': 'new',
  'limited': 'limited'
};

/**
 * Accessory mapping - Map từ tên hiển thị sang search query
 */
const ACCESSORY_MAP = {
  'Balo/Túi': 'Balo',
  'Tất/Vớ': 'Tất',
  'Mũ/Nón': 'Mũ',
  'Thắt lưng': 'Thắt lưng'
};

/**
 * Product line options
 */
const PRODUCT_LINES = ['Basas', 'Urbas', 'Vintas', 'Pattas'];

/**
 * Style options
 */
const STYLES = ['Low Top', 'High Top', 'Slip on'];

/**
 * ProductList component - Trang danh sách sản phẩm với filter
 */
const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Favorites store
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { showToast } = useCartStore();
  
  // API State
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter State - Initialize from URL params
  const [selectedGender, setSelectedGender] = useState(searchParams.get('gender') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand_id') || '');
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color_id') || '');
  const [selectedFeatured, setSelectedFeatured] = useState(searchParams.get('featured') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || ''); // Accessories, Footwear, Top
  const [selectedAccessory, setSelectedAccessory] = useState(searchParams.get('accessory') || ''); // Balo/Túi, Tất/Vớ, Mũ/Nón, Thắt lưng
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedChip, setSelectedChip] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('is_accessory') === 'true' ? 'acc' : 'all');
  
  // Initialize filters from URL params on mount
  useEffect(() => {
    const gender = searchParams.get('gender');
    const brandId = searchParams.get('brand_id');
    const colorId = searchParams.get('color_id');
    const featured = searchParams.get('featured');
    const category = searchParams.get('category');
    const accessory = searchParams.get('accessory');
    const search = searchParams.get('search');
    const isAccessory = searchParams.get('is_accessory');
    
    if (gender) setSelectedGender(gender);
    if (brandId) setSelectedBrand(brandId);
    if (colorId) setSelectedColor(colorId);
    if (category) setSelectedCategory(category);
    if (accessory) setSelectedAccessory(accessory);
    if (featured) {
      setSelectedFeatured(FEATURED_URL_TO_API[featured] || featured);
    }
    if (search) setSearchQuery(search);
    if (isAccessory === 'true') setActiveTab('acc');
    
    // Reset page when filters change from URL
    setCurrentPage(1);
  }, [searchParams]);

  // Scroll animation effect
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);

    // Observe all elements with scroll-reveal class
    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [products]); // Re-run when products load

  // Fetch brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await getBrands();
        setBrands(data || []);
      } catch (err) {
        console.error('Error fetching brands:', err);
        // Không hiển thị error cho brands vì không critical
      }
    };

    fetchBrands();
  }, []);

  // Fetch colors from API
  useEffect(() => {
    const fetchColors = async () => {
      try {
        const data = await getColors();
        setColors(data || []);
      } catch (err) {
        console.error('Error fetching colors:', err);
        // Không hiển thị error cho colors vì không critical
      }
    };

    fetchColors();
  }, []);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = {
          page: currentPage,
          limit: 12, // 12 sản phẩm mỗi trang
        };
        
        if (selectedGender) params.gender = selectedGender;
        if (selectedBrand) params.brand_id = selectedBrand;
        if (selectedColor) params.color_id = String(selectedColor);
        if (selectedCategory) params.category = selectedCategory;
        if (selectedAccessory) {
          // Use search for accessory name matching
          params.search = ACCESSORY_MAP[selectedAccessory] || selectedAccessory;
        }
        if (selectedFeatured) {
          params.featured = FEATURED_URL_TO_API[selectedFeatured] || selectedFeatured;
        }
        if (searchQuery && !selectedAccessory) params.search = searchQuery;
        if (activeTab === 'acc') params.is_accessory = true;
        if (selectedChip) {
          // Chip có thể là product line hoặc style
          if (PRODUCT_LINES.includes(selectedChip)) {
            params.product_line = selectedChip;
          } else if (STYLES.includes(selectedChip)) {
            params.style = selectedChip;
          }
        }
        
        const response = await getProducts(params);
        
        // Laravel pagination trả về nested data
        const productsData = response.products?.data?.data || response.products?.data || [];
        
        setProducts(productsData);
        setFilters(response.filters || {});
        setTotalPages(response.products?.last_page || 1);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, selectedGender, selectedBrand, selectedColor, selectedCategory, selectedAccessory, selectedFeatured, searchQuery, activeTab, selectedChip]);

  // Sync URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedGender) params.set('gender', selectedGender);
    if (selectedBrand) params.set('brand_id', selectedBrand);
    if (selectedColor) params.set('color_id', selectedColor);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedAccessory) params.set('accessory', selectedAccessory);
    if (selectedFeatured) {
      params.set('featured', FEATURED_API_TO_URL[selectedFeatured] || selectedFeatured);
    }
    if (searchQuery && !selectedAccessory) params.set('search', searchQuery);
    if (activeTab === 'acc') params.set('is_accessory', 'true');
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    // Update URL without navigation
    setSearchParams(params, { replace: true });
  }, [selectedGender, selectedBrand, selectedColor, selectedCategory, selectedAccessory, selectedFeatured, searchQuery, activeTab, currentPage, setSearchParams]);

  // formatPrice is now imported from @lib/formatters
  
  /**
   * Get product price - ưu tiên price_sale, sau đó price, cuối cùng là variant price
   * @param {Object} product - Product object
   * @returns {number|null} Product price
   */
  const getProductPrice = useCallback((product) => {
    return product.price_sale || product.price || product.variants?.[0]?.price_sale || product.variants?.[0]?.price;
  }, []);

  return (
    <>
      <SEO
        title="Danh sách sản phẩm - Giày thể thao ANKH | Giày nam, Giày nữ"
        description="Khám phá bộ sưu tập giày thể thao, giày sneaker đa dạng tại ANKH. Giày nam, giày nữ, nhiều mẫu mã, size đầy đủ, giá tốt nhất. Freeship toàn quốc."
        keywords="danh sách giày, giày thể thao, giày sneaker, sản phẩm ANKH, mua giày online, giày nam nữ"
      />
      {/* DESKTOP */}
      <div className="hidden md:block">
        <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-12 gap-6">
          <Sidebar 
            brands={brands}
            colors={colors}
            selectedBrand={selectedBrand}
            onBrandSelect={setSelectedBrand}
            selectedGender={selectedGender}
            onGenderSelect={setSelectedGender}
            selectedColor={selectedColor}
            onColorSelect={setSelectedColor}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            selectedAccessory={selectedAccessory}
            onAccessorySelect={setSelectedAccessory}
            selectedFeatured={selectedFeatured}
            onFeaturedSelect={setSelectedFeatured}
            filters={filters}
          />

          {/* Main content */}
          <main className="col-span-9">
            {/* Banner */}
            <section className="px-0 scroll-reveal fade-up">
              <div className="relative rounded-xl overflow-hidden shadow-sm">
                <div className="absolute inset-0 bg-[#2FA66B]"></div>
                <div className="relative flex items-center justify-between px-10 py-10 text-[#F4DA55]">
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full ring-2 ring-[#F4DA55]">
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M3 7h10v8H3zM13 9h4l4 4v2h-8z"/>
                        <circle cx="7" cy="17" r="2" fill="currentColor" stroke="none"/>
                        <circle cx="17" cy="17" r="2" fill="currentColor" stroke="none"/>
                      </svg>
                    </span>
                    <span className="text-white/90 text-sm tracking-wide">Ananas.</span>
                  </div>
                  <div className="flex-1 text-center leading-none">
                    <div className="font-extrabold text-[82px] tracking-[0.36em] uppercase text-[#F4DA55]" style={{ fontFamily: 'Anton, sans-serif', transform: 'skewX(-10deg)' }}>FREE</div>
                    <div className="font-extrabold text-[82px] tracking-[0.36em] uppercase text-[#F4DA55] -mt-2" style={{ fontFamily: 'Anton, sans-serif', transform: 'skewX(-10deg)' }}>SHIPPING</div>
                  </div>
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full ring-2 ring-[#F4DA55]">
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M6 9h12l-1 11H7L6 9z"/><path d="M9 9V7a3 3 0 0 1 6 0v2"/>
                      </svg>
                    </span>
                    <span className="text-xs uppercase text-[#F4DA55] tracking-wide text-center leading-3">Với hoá đơn<br/>từ 900k!</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Tabs */}
            <div className="flex items-center gap-6 text-sm mt-6">
              <button 
                className={`font-semibold ${activeTab === 'all' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
                onClick={() => setActiveTab('all')}
              >
                TẤT CẢ
              </button>
              <button 
                className={`font-semibold ${activeTab === 'shoes' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
                onClick={() => setActiveTab('shoes')}
              >
                GIÀY
              </button>
              <button 
                className={`font-semibold ${activeTab === 'acc' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
                onClick={() => setActiveTab('acc')}
              >
                PHỤ KIỆN
              </button>
            </div>
            <div className="border-b mt-2 mb-4"></div>

            {/* Error State */}
            {error && (
              <div className="text-center py-20">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-orange-700"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Empty State */}
            {!error && products.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-600 text-lg">Không tìm thấy sản phẩm nào</p>
              </div>
            )}

            {/* Grid */}
            {!error && products.length > 0 && (
              <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {products.map((product, index) => {
                const isProductFavorite = isFavorite(product.id);
                
                return (
                  <article key={product.id} className={`group overflow-hidden hover:shadow-lg transition-all duration-300 relative scroll-reveal scale-in delay-${Math.min((index % 4) * 100 + 100, 400)}`}>
                    <Link to={`/product/${product.slug || product.id}`} className="no-underline">
                      <div className="aspect-square p-4 relative overflow-hidden">
                        {product.is_limited_edition && (
                          <span className="absolute top-2 left-2 bg-blue-700 text-white text-[10px] px-2.5 py-1 font-bold z-10 uppercase tracking-wide">
                            Limited Edition
                          </span>
                        )}
                        {product.price_sale && (
                          <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-2.5 py-1 font-bold z-10 uppercase tracking-wide">
                            Sale-off
                          </span>
                        )}
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* Heart Icon */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const added = toggleFavorite(product);
                            showToast(
                              added ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích',
                              added ? 'success' : 'info'
                            );
                          }}
                          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all z-30"
                          aria-pressed={isProductFavorite}
                          title="Yêu thích"
                        >
                          <svg 
                            className={`w-5 h-5 transition-all ${isProductFavorite ? 'fill-red-500 text-red-500' : 'fill-white text-orange-500'}`} 
                            stroke="currentColor" 
                            fill={isProductFavorite ? 'currentColor' : 'white'}
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                      <div className="p-3 text-center overflow-hidden">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[40px] leading-snug">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">{product.color_name || 'Black'}</p>
                        {getProductPrice(product) && (
                          <div className="flex items-center justify-center gap-2 flex-wrap overflow-hidden max-w-full">
                            <div className="text-base font-bold text-gray-900 break-words overflow-hidden">
                              {formatPrice(getProductPrice(product))}
                            </div>
                            {product.price && product.price_sale && product.price > product.price_sale && (
                              <span className="text-xs text-gray-400 line-through break-words overflow-hidden">
                                {formatPrice(product.price)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  </article>
                );
              })}
              </section>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ‹
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === i + 1
                        ? 'bg-[#ff6600] text-white'
                        : 'border hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ›
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MOBILE */}
      <div className="md:hidden">
        <main className="max-w-md mx-auto">
          <section className="px-3 mt-3 scroll-reveal fade-up">
            <div className="relative rounded-xl overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-[#2FA66B]"></div>
              <div className="relative flex items-center justify-between px-4 py-6 text-[#F4DA55]">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-[#F4DA55]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 7h10v8H3zM13 9h4l4 4v2h-8z"/>
                    <circle cx="7" cy="17" r="2" fill="currentColor" stroke="none"/>
                    <circle cx="17" cy="17" r="2" fill="currentColor" stroke="none"/>
                  </svg>
                </span>
                <div className="flex-1 text-center leading-none">
                  <div className="font-extrabold text-[40px] tracking-[0.32em] uppercase text-[#F4DA55]" style={{ fontFamily: 'Anton, sans-serif', transform: 'skewX(-10deg)' }}>FREE</div>
                  <div className="font-extrabold text-[40px] tracking-[0.32em] uppercase text-[#F4DA55] -mt-1" style={{ fontFamily: 'Anton, sans-serif', transform: 'skewX(-10deg)' }}>SHIPPING</div>
                </div>
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-[#F4DA55]">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M6 9h12l-1 11H7L6 9z"/><path d="M9 9V7a3 3 0 0 1 6 0v2"/>
                    </svg>
                  </span>
                  <span className="text-[10px] uppercase text-[#F4DA55] tracking-wide text-center leading-3">Với hoá đơn<br/>từ 900k!</span>
                </div>
              </div>
            </div>
          </section>

          {/* Tabs mobile */}
          <section className="mt-4 px-3">
            <div className="flex items-center justify-center gap-6 text-[13px] relative">
              <button 
                onClick={() => setActiveTab('all')}
                className={`relative py-2 ${activeTab === 'all' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}
              >
                TẤT CẢ
                {activeTab === 'all' && <span className="absolute left-0 right-0 -bottom-2 h-[2px] bg-gray-900 rounded"></span>}
              </button>
              <button 
                onClick={() => setActiveTab('shoes')}
                className={`relative py-2 ${activeTab === 'shoes' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}
              >
                GIÀY
                {activeTab === 'shoes' && <span className="absolute left-0 right-0 -bottom-2 h-[2px] bg-gray-900 rounded"></span>}
              </button>
              <button 
                onClick={() => setActiveTab('acc')}
                className={`relative py-2 ${activeTab === 'acc' ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}
              >
                PHỤ KIỆN
                {activeTab === 'acc' && <span className="absolute left-0 right-0 -bottom-2 h-[2px] bg-gray-900 rounded"></span>}
              </button>
            </div>
            <div className="border-b mt-1"></div>
          </section>

          {/* Gender Filter mobile */}
          <section className="px-3 mt-3 scroll-reveal fade-up delay-200">
            <h3 className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">GIỚI TÍNH</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setSelectedGender(selectedGender === 'Nam' ? '' : 'Nam');
                  setCurrentPage(1);
                }}
                className={`flex-1 px-3 py-2 text-[12px] rounded-lg border-2 font-semibold transition-all ${
                  selectedGender === 'Nam' 
                    ? 'bg-[#ff6600] text-white border-[#ff6600]' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#ff6600]'
                }`}
              >
                👨 Nam
              </button>
              <button 
                onClick={() => {
                  setSelectedGender(selectedGender === 'Nữ' ? '' : 'Nữ');
                  setCurrentPage(1);
                }}
                className={`flex-1 px-3 py-2 text-[12px] rounded-lg border-2 font-semibold transition-all ${
                  selectedGender === 'Nữ' 
                    ? 'bg-[#ff6600] text-white border-[#ff6600]' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#ff6600]'
                }`}
              >
                👩 Nữ
              </button>
            </div>
          </section>

          {/* Chips mobile */}
          <section className="px-3 mt-3 scroll-reveal fade-up delay-300">
            <h3 className="text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-2">DÒNG SẢN PHẨM & KIỂU DÁNG</h3>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {selectedChip && (
                <button 
                  onClick={() => {
                    setSelectedChip('');
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 text-[12px] rounded-full border shadow-sm whitespace-nowrap bg-gray-800 text-white hover:bg-gray-700"
                >
                  ✕ Xóa bộ lọc
                </button>
              )}
              {['Low Top', 'High Top', 'Slip on', 'Basas', 'Urbas', 'Vintas'].map((chip) => (
                <button 
                  key={chip} 
                  onClick={() => {
                    if (selectedChip === chip) {
                      setSelectedChip(''); // Bỏ chọn nếu đã chọn
                    } else {
                      setSelectedChip(chip);
                    }
                    setCurrentPage(1); // Reset về trang 1
                  }}
                  className={`px-3 py-1.5 text-[12px] rounded-full border shadow-sm whitespace-nowrap transition-colors ${
                    selectedChip === chip 
                      ? 'bg-[#ff6600] text-white border-[#ff6600]' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </section>

              {/* Loading State Mobile */}
              {loading && (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6600]"></div>
                  <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
              )}

              {/* Error State Mobile */}
              {error && (
                <div className="text-center py-20 px-3">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-[#ff6600] text-white rounded-lg"
                  >
                    Thử lại
                  </button>
                </div>
              )}

              {/* Empty State Mobile */}
              {!loading && !error && products.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-gray-600">Không tìm thấy sản phẩm</p>
                </div>
              )}

              {/* Grid mobile */}
              {!loading && !error && products.length > 0 && (
                <section className="px-3 mt-3 grid grid-cols-2 gap-3 pb-24">
                  {products.map((product, index) => {
              const isProductFavorite = isFavorite(product.id);
              
              return (
                <div key={product.id} className={`group overflow-hidden hover:shadow-lg transition-all duration-300 relative scroll-reveal scale-in delay-${Math.min((index % 2) * 100 + 100, 300)}`}>
                  <Link to={`/product/${product.slug || product.id}`} className="no-underline">
                    <div className="aspect-square p-3 relative overflow-hidden">
                      {product.is_limited_edition && (
                        <span className="absolute top-1 left-1 bg-blue-700 text-white text-[9px] px-2 py-0.5 font-bold z-10 uppercase tracking-wide">
                          Limited
                        </span>
                      )}
                      {product.price_sale && (
                        <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] px-2 py-0.5 font-bold z-10 uppercase tracking-wide">
                          Sale-off
                        </span>
                      )}
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Heart Icon */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const added = toggleFavorite(product);
                          showToast(
                            added ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích',
                            added ? 'success' : 'info'
                          );
                        }}
                        className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all z-30"
                      >
                        <svg 
                          className={`w-4 h-4 transition-all ${isProductFavorite ? 'fill-red-500 text-red-500' : 'fill-white text-orange-500'}`} 
                          stroke="currentColor" 
                          fill={isProductFavorite ? 'currentColor' : 'white'}
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-2 text-center overflow-hidden">
                      <div className="text-[12px] font-semibold leading-4 line-clamp-2 min-h-[32px] text-gray-800">{product.name}</div>
                      <p className="text-[10px] text-gray-500 mt-1">{product.color_name || 'Black'}</p>
                      {getProductPrice(product) && (
                        <div className="flex items-center justify-center gap-1 mt-1 flex-wrap overflow-hidden max-w-full">
                          <div className="text-[12px] font-bold text-gray-900 break-words overflow-hidden">
                            {formatPrice(getProductPrice(product))}
                          </div>
                          {product.price && product.price_sale && product.price > product.price_sale && (
                            <span className="text-[10px] text-gray-400 line-through break-words overflow-hidden">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                  </div>
                );
              })}
                </section>
              )}
          </main>
      </div>
    </>
  );
};

export default ProductList;
