import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore, useSearchStore } from '@store';
import { logout as logoutAPI, getPromotions } from '@services/api';
import { LoginModal, RegisterModal, TypewriterText } from '@components';
import { useDebounce, useScrollPosition } from '@hooks';
import logoAnkh from '@assets/logoankh.png';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Search Store
  const { quickSearch } = useSearchStore();
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [currentPromotionIndex, setCurrentPromotionIndex] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const items = useCartStore((state) => state.items);
  const { showToast } = useCartStore();
  const cartCount = items.reduce((total, item) => total + item.quantity, 0);
  
  const { user, isAuthenticated, logout } = useAuthStore();
  
  // Refs
  const searchRef = useRef(null);
  
  // Custom Hooks
  const { scrolled } = useScrollPosition(10); // Scroll threshold 10px
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce 300ms

  const handleLogout = async () => {
    try {
      // Call API logout
      await logoutAPI();
      
      // Clear local auth data
      logout();
      setShowUserMenu(false);
      
      showToast('Đã đăng xuất thành công!', 'success');
      
      // Reload page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if API call fails
      logout();
      setShowUserMenu(false);
      window.location.reload();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
      if (showLoginMenu && !event.target.closest('.login-menu-container')) {
        setShowLoginMenu(false);
      }
      if (showSearchBar && searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchBar(false);
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu, showLoginMenu, showSearchBar]);
  
  // Search products with debounced query (using useDebounce hook)
  useEffect(() => {
    if (!debouncedSearchQuery || debouncedSearchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    const performSearch = async () => {
      setSearchLoading(true);
      try {
        const results = await quickSearch(debouncedSearchQuery);
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Error searching:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };
    
    performSearch();
  }, [debouncedSearchQuery, quickSearch]);

  const handleOpenLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const handleOpenRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  // Fetch promotions from API
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const data = await getPromotions();
        // Sort by position
        const sorted = (data || []).sort((a, b) => a.position - b.position);
        setPromotions(sorted);
      } catch (err) {
        console.error('❌ Error fetching promotions:', err);
        // Use mock data as fallback
        const mockPromotions = [
          {
            id: 1,
            title: '🎉 GIẢM GIÁ 20% - TẤT CẢ SẢN PHẨM',
            link: '/sale',
            position: 1
          },
          {
            id: 2,
            title: '🚚 MIỄN PHÍ VẬN CHUYỂN ĐƠN TỪ 500K',
            link: '/products',
            position: 2
          }
        ];
        setPromotions(mockPromotions);
      }
    };

    fetchPromotions();
  }, []);

  // Auto-rotate promotions
  useEffect(() => {
    if (promotions.length > 1) {
      const interval = setInterval(() => {
        setCurrentPromotionIndex((prevIndex) => 
          prevIndex === promotions.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000); // Change every 4 seconds

      return () => clearInterval(interval);
    }
  }, [promotions.length]);

  // Scroll effect handled by useScrollPosition hook

  const handlePrevPromotion = () => {
    setCurrentPromotionIndex(
      currentPromotionIndex === 0 ? promotions.length - 1 : currentPromotionIndex - 1
    );
  };

  const handleNextPromotion = () => {
    setCurrentPromotionIndex(
      currentPromotionIndex === promotions.length - 1 ? 0 : currentPromotionIndex + 1
    );
  };

  return (
    <header className={`bg-white sticky top-0 z-50 transition-shadow duration-200 will-change-transform ${scrolled ? 'shadow-lg' : ''}`}>
      {/* Main Header */}
      <div className="bg-white border-b border-gray-200 h-20 md:h-24">
        <div className="max-w-7xl mx-auto px-3 md:px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 no-underline h-full py-2">
            <img src={logoAnkh} alt="ANKH Logo" className="h-full w-auto object-contain" />
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8 text-[15px]">
            <Link to="/products" className="font-semibold text-black no-underline hover:text-[#ff6600] transition-colors">
              Sản phẩm ▾
            </Link>
            <Link to="/new-arrivals" className="text-black no-underline hover:text-[#ff6600] transition-colors">
              Sản Phẩm Mới 
            </Link>
            <Link to="/brands" className="text-black no-underline hover:text-[#ff6600] transition-colors">
              Thương hiệu
            </Link>
            <Link to="/blog" className="text-black no-underline hover:text-[#ff6600] transition-colors">
              Blog
            </Link>
            <Link to="/contact" className="text-black no-underline hover:text-[#ff6600] transition-colors">
              Liên hệ
            </Link>
          </nav>

          {/* Desktop right side: Icons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search - có thể expand */}
            <div className="relative" ref={searchRef}>
              {showSearchBar ? (
                <div 
                  className="flex items-center bg-[#f5f5f5] text-gray-600 rounded-full pl-4 pr-4 h-10 shadow-lg border border-gray-200"
                  style={{
                    animation: 'expandSearch 0.3s ease-out forwards',
                    width: '280px'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" className="mr-2 text-[#ff6600]">
                <path fill="currentColor" d="M10 18a8 8 0 1 1 5.293-14.002A8 8 0 0 1 10 18m11.707 2.293l-5.044-5.043A9.96 9.96 0 0 0 20 10a10 10 0 1 0-10 10a9.96 9.96 0 0 0 5.25-1.337l5.043 5.044z"/>
              </svg>
              <input 
                    className="bg-transparent outline-none text-sm w-full placeholder-gray-500 animate-fadeIn" 
                    placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchResults.length > 0) {
                        setShowSearchResults(true);
                      }
                    }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                        setShowSearchResults(false);
                        setShowSearchBar(false);
                        window.location.href = `/search?keyword=${encodeURIComponent(searchQuery)}`;
                      }
                    }}
                    autoFocus
                  />
                  {searchLoading && (
                    <svg className="animate-spin h-4 w-4 text-[#ff6600] mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <button
                    onClick={() => {
                      setShowSearchBar(false);
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }}
                    className="text-gray-400 hover:text-[#ff6600] transition-all hover:rotate-90 transform duration-300"
                    title="Đóng"
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowSearchBar(true)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300 text-gray-700 hover:text-[#ff6600] hover:scale-110 transform"
                  title="Tìm kiếm"
                >
                  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                </button>
              )}
              
              {/* Search Results Dropdown */}
              {showSearchBar && showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-[400px] bg-white rounded-lg shadow-2xl border border-gray-200 z-[100] max-h-[500px] overflow-y-auto animate-slideDown" style={{ right: 0, left: 'auto' }}>
                  <div className="p-2">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.slug || product.id}`}
                        onClick={() => {
                          setShowSearchResults(false);
                          setShowSearchBar(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors no-underline"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded bg-gray-100 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {product.name}
                          </p>
                          {product.brand && (
                            <p className="text-xs text-gray-500">{product.brand.name}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold text-[#ff6600]">
                              {(product.price_sale || product.price)?.toLocaleString('vi-VN')} VND
                            </span>
                            {product.price_sale && (
                              <span className="text-xs text-gray-400 line-through">
                                {product.price?.toLocaleString('vi-VN')} VND
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="border-t p-3 bg-gray-50">
                    <Link
                      to={`/search?keyword=${encodeURIComponent(searchQuery)}`}
                      onClick={() => {
                        setShowSearchResults(false);
                        setShowSearchBar(false);
                        setSearchQuery('');
                      }}
                      className="text-sm text-[#ff6600] hover:text-orange-700 font-medium no-underline flex items-center justify-center gap-1"
                    >
                      Xem tất cả kết quả →
                    </Link>
                  </div>
                </div>
              )}
              
              {/* No Results */}
              {showSearchBar && showSearchResults && searchResults.length === 0 && !searchLoading && searchQuery.length >= 2 && (
                <div className="absolute top-full mt-2 w-[400px] bg-white rounded-lg shadow-2xl border border-gray-200 z-[100] p-4 text-center animate-slideDown" style={{ right: 0, left: 'auto' }}>
                  <p className="text-sm text-gray-500">Không tìm thấy sản phẩm nào</p>
                </div>
              )}
            </div>

            {/* User menu hoặc Login */}
            {isAuthenticated ? (
              <div className="relative user-menu-container">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-200 transition-all duration-200 hover:border-[#ff6600]"
                  title="Menu tài khoản"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className="text-[#ff6600]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-800">
                    {user?.name || 'User'}
                  </span>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" className="text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-2xl border border-gray-200 py-1 z-[100]">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-orange-50 hover:text-[#ff6600] no-underline transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Thông tin cá nhân</span>
                      </div>
                    </Link>
                    <Link 
                      to="/orders" 
                      className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-orange-50 hover:text-[#ff6600] no-underline transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span>Đơn hàng của tôi</span>
                      </div>
                    </Link>
                    <Link 
                      to="/favorites" 
                      className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-orange-50 hover:text-[#ff6600] no-underline transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>Yêu thích</span>
                      </div>
                    </Link>
                    <hr className="my-1 border-gray-200" />
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Đăng xuất</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative login-menu-container">
                <button 
                  onClick={() => setShowLoginMenu(!showLoginMenu)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700 hover:text-[#ff6600]"
                  title="Tài khoản"
                >
                  <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                
                {showLoginMenu && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-44 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-[100]">
                    <button 
                      onClick={() => {
                        setShowLoginMenu(false);
                        handleOpenLogin();
                      }}
                      className="block w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-orange-50 hover:text-[#ff6600] transition-colors border-b border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Đăng nhập</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        setShowLoginMenu(false);
                        handleOpenRegister();
                      }}
                      className="block w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-orange-50 hover:text-[#ff6600] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span className="font-medium">Đăng ký</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Giỏ hàng icon */}
            <Link 
              to="/cart" 
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors no-underline text-gray-700 hover:text-[#ff6600]"
              title="Giỏ hàng"
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ff6600] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile icons: Search + Cart */}
          <div className="flex md:hidden items-center gap-2">
            <button 
              onClick={() => {
                const query = prompt('Tìm kiếm sản phẩm:');
                if (query && query.trim()) {
                  window.location.href = `/search?keyword=${encodeURIComponent(query)}`;
                }
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Tìm kiếm"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors no-underline text-gray-800">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ff6600] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Info strip dưới header (desktop) */}
      <div className="hidden md:block bg-[#f5f5f5] h-14">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between text-base text-gray-800">
          {promotions.length > 1 && (
            <button 
              onClick={handlePrevPromotion}
              className="px-2 hover:text-[#ff6600] hover:scale-125 transition-all duration-200 text-lg"
              aria-label="Previous promotion"
            >
              ‹
            </button>
          )}
          <div className="flex-1 text-center tracking-wide font-medium overflow-hidden">
            {promotions.length > 0 ? (
              <div 
                key={currentPromotionIndex}
                className="flex items-center justify-center gap-2"
              >
                {promotions[currentPromotionIndex].icon && (
                  <img 
                    src={promotions[currentPromotionIndex].icon} 
                    alt="icon"
                    className="w-6 h-6 object-contain"
                  />
                )}
                <TypewriterText 
                  text={`${promotions[currentPromotionIndex].title} - ${promotions[currentPromotionIndex].description}`}
                  speed={60}
                  delay={200}
                  className="uppercase"
                  key={`promo-${currentPromotionIndex}`}
                />
              </div>
            ) : (
              <TypewriterText 
                text="BUY MORE PAY LESS - ÁP DỤNG KHI MUA PHỤ KIỆN" 
                speed={80}
                delay={300}
                className="uppercase"
              />
            )}
          </div>
          {promotions.length > 1 && (
            <button 
              onClick={handleNextPromotion}
              className="px-2 hover:text-[#ff6600] hover:scale-125 transition-all duration-200 text-lg"
              aria-label="Next promotion"
            >
              ›
            </button>
          )}
        </div>
      </div>

      {/* Info strip mobile */}
      <div className="md:hidden text-[13px] text-gray-700 bg-[#f5f5f5] text-center py-2 overflow-hidden">
        {promotions.length > 0 ? (
          <div 
            key={currentPromotionIndex}
            className="flex items-center justify-center gap-1"
          >
            {promotions[currentPromotionIndex].icon && (
              <img 
                src={promotions[currentPromotionIndex].icon} 
                alt="icon"
                className="w-5 h-5 object-contain"
              />
            )}
            <TypewriterText 
              text={`${promotions[currentPromotionIndex].title} – ${promotions[currentPromotionIndex].description}`}
              speed={60}
              delay={200}
              className="uppercase"
              key={`promo-mobile-${currentPromotionIndex}`}
            />
          </div>
        ) : (
          <TypewriterText 
            text="BUY MORE PAY LESS – ÁP DỤNG KHI MUA PHỤ KIỆN" 
            speed={80}
            delay={300}
            className="uppercase"
          />
        )}
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={handleOpenRegister}
      />

      {/* Register Modal */}
      <RegisterModal 
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={handleOpenLogin}
      />
    </header>
  );
};

export default Header;
