import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getBanners, getHomeData } from '@services/api';
import { useFavoritesStore, useCartStore } from '@store';
import { SEO, TypewriterText } from '@components';
import { formatPrice } from '@lib/formatters';
import { ColorDots } from '@utils/colorUtils.jsx';
import collection1 from '@assets/collection1.jpg';
import collection2 from '@assets/collection2.jpg';
import category1 from '@assets/category1.jpg';
import category2 from '@assets/category2.jpg';
import category3 from '@assets/category3.jpg';
import subscribeBanner from '@assets/subscribebanner01.jpg';

const Home = () => {
  // API State
  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const [productsHot, setProductsHot] = useState([]);
  const [productsSale, setProductsSale] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Favorites store
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { showToast } = useCartStore();

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
  }, [productsHot, productsSale]); // Re-run when products load

  // Helper function to get product price - memoized
  const getProductPrice = useCallback((product) => {
    return product.price_sale || product.price || product.variants?.[0]?.price_sale || product.variants?.[0]?.price;
  }, []);

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await getBanners();
        setBanners(data || []);
      } catch (err) {
        // Use mock banners as fallback
        const mockBanners = [
          {
            id: 1,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200',
            title: 'ANKH Store - Giày Thể Thao Chính Hãng',
            link: '/products'
          }
        ];
        setBanners(mockBanners);
      }
    };

    fetchBanners();
  }, []);

  // Auto-play banner slider
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prevIndex) =>
          prevIndex === banners.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Change banner every 5 seconds

      return () => clearInterval(interval);
    }
  }, [banners.length]);

  // Fetch home page data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getHomeData();

        setCategories(data.categories || []);
        setProductsHot(data.products_hot || []);
        setProductsSale(data.products_sale || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching home data:', err);
        setError('Không thể tải dữ liệu trang chủ');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Loading State


  // Error State
  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-red-600 text-lg mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-[#ff6600] text-white rounded-lg font-bold hover:bg-orange-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="ANKH - Cửa hàng giày thể thao chính hãng | Giày nam, Giày nữ"
        description="Cửa hàng giày thể thao chính hãng ANKH. Giày nam, giày nữ, giày sneaker với nhiều mẫu mã đẹp, giá tốt, freeship toàn quốc. Ưu đãi hấp dẫn mỗi ngày!"
        keywords="giày thể thao, giày sneaker, giày nam, giày nữ, ANKH, giày chính hãng, mua giày online, giày đẹp, giày vnxk, freeship"
      />
      <div className="w-full">
        {/* Hero Banner Slider */}
        <section className="relative w-full overflow-hidden bg-gray-100">
          {banners.length > 0 ? (
            <div className="relative w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[600px]">
              {/* Banner Images */}
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-700 ${index === currentBannerIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                  <Link
                    to={banner.link || '#'}
                    className="block w-full h-full"
                  >
                    <img
                      src={banner.image || banner.image_url}
                      alt={banner.title || `Banner ${index + 1}`}
                      className="w-full h-full object-cover object-center"
                      style={{ aspectRatio: '16/9', objectFit: 'cover' }}
                    />
                  </Link>
                </div>
              ))}

              {/* Navigation Arrows - Hide on small mobile */}
              {banners.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentBannerIndex(
                      currentBannerIndex === 0 ? banners.length - 1 : currentBannerIndex - 1
                    )}
                    className="hidden sm:flex absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 w-9 h-9 md:w-11 md:h-11 rounded-full shadow-lg items-center justify-center transition-all z-10"
                    aria-label="Previous banner"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    onClick={() => setCurrentBannerIndex(
                      currentBannerIndex === banners.length - 1 ? 0 : currentBannerIndex + 1
                    )}
                    className="hidden sm:flex absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 w-9 h-9 md:w-11 md:h-11 rounded-full shadow-lg items-center justify-center transition-all z-10"
                    aria-label="Next banner"
                  >
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {banners.length > 1 && (
                <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 z-10">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentBannerIndex(index)}
                      className={`h-2 md:h-3 rounded-full transition-all ${index === currentBannerIndex
                        ? 'bg-[#ff6600] w-6 md:w-8'
                        : 'bg-white/60 hover:bg-white w-2 md:w-3'
                        }`}
                      aria-label={`Go to banner ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </section>

        {/* ALL BLACK IN BLACK + OUTLET SALE */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ALL BLACK IN BLACK */}
            <Link to="/products" className="group no-underline scroll-reveal fade-left h-full flex">
              <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-shadow flex flex-col w-full">
                <div className="relative h-[280px] overflow-hidden bg-black">
                  <img
                    src={collection1}
                    alt="All Black"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                  />
                </div>
                <div className="bg-white p-6 flex-1">
                  <h2 className="text-2xl md:text-3xl font-black uppercase mb-2 tracking-tight text-gray-900 group-hover:text-[#ff6600] transition-colors duration-300">
                    ALL BLACK IN BLACK
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors duration-300">
                    Sắc đen luôn mang một vẻ đẹp huyền bí và đầy cá tính.
                    Vừa sang trọng, vừa cuốn hút nhưng vẫn giữ được nét tối giản tinh tế.
                    Dù xuất hiện ở đâu, màu đen cũng tạo nên điểm nhấn khó thay thế.
                  </p>


                </div>
              </div>
            </Link>

            {/* OUTLET SALE */}
            <Link to="/products?featured=sale" className="group no-underline scroll-reveal fade-right delay-200 h-full flex">
              <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-shadow flex flex-col w-full">
                <div className="relative h-[280px] overflow-hidden bg-black">
                  {/* SALE Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="relative">
                      <div className="bg-white rounded-lg px-4 py-2 shadow-xl group-hover:bg-[#ff6600] transition-colors duration-300">
                        <span className="text-2xl font-black uppercase group-hover:text-white transition-colors duration-300" style={{
                          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>SALE</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full group-hover:bg-red-600 transition-colors duration-300">
                        OFF
                      </div>
                    </div>
                  </div>
                  <img
                    src={collection2}
                    alt="Outlet Sale"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                  />
                </div>
                <div className="bg-white p-6 flex-1">
                  <h2 className="text-2xl md:text-3xl font-black uppercase mb-2 tracking-tight text-gray-900 group-hover:text-[#ff6600] transition-colors duration-300">
                    OUTLET SALE
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors duration-300">
                    Danh mục những sản phẩm bán tại "giá tốt hơn" chỉ được bán kênh Online - Online Only, chúng đã từng làm mưa làm gió một thời gian và hiện đang vào giai đoạn bị khai tử.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* DANH MỤC SẢN PHẨM */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-black uppercase text-center mb-12 tracking-tight scroll-reveal fade-up">DANH MỤC SẢN PHẨM</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* GIÀY NAM */}
              <Link to="/products?gender=Nam" className="group relative overflow-hidden rounded-lg h-[280px] no-underline shadow-lg hover:shadow-2xl transition-all scroll-reveal scale-in delay-100">
                <img
                  src={category1}
                  alt="Giày Nam"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30"></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-center items-center text-white text-center">
                  <h3 className="text-3xl font-black uppercase mb-4 tracking-tight">GIÀY NAM</h3>
                  <ul className="space-y-2 text-sm">
                    <li>New Arrivals</li>
                    <li>Best seller</li>
                    <li>Sale off</li>
                  </ul>
                </div>
              </Link>

              {/* GIÀY NỮ */}
              <Link to="/products?gender=Nữ" className="group relative overflow-hidden rounded-lg h-[280px] no-underline shadow-lg hover:shadow-2xl transition-all scroll-reveal scale-in delay-300">
                <img
                  src={category2}
                  alt="Giày Nữ"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30"></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-center items-center text-white text-center">
                  <h3 className="text-3xl font-black uppercase mb-4 tracking-tight">GIÀY NỮ</h3>
                  <ul className="space-y-2 text-sm">
                    <li>New Arrivals</li>
                    <li>Best seller</li>
                    <li>Sale off</li>
                  </ul>
                </div>
              </Link>

              {/* DÒNG SẢN PHẨM */}
              <Link to="/products" className="group relative overflow-hidden rounded-lg h-[280px] no-underline shadow-lg hover:shadow-2xl transition-all scroll-reveal scale-in delay-500">
                <img
                  src={category3}
                  alt="Dòng Sản Phẩm"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30"></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-center items-center text-white text-center">
                  <h3 className="text-3xl font-black uppercase mb-4 tracking-tight">DÒNG SẢN PHẨM</h3>
                  <ul className="space-y-2 text-sm">
                    <li>Basas</li>
                    <li>Vintas</li>
                    <li>Urbas</li>
                    <li>Pattas</li>
                  </ul>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* SẢN PHẨM BÁN CHẠY */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-black uppercase text-center mb-12 tracking-tight scroll-reveal fade-up">SẢN PHẨM BÁN CHẠY</h2>
            {productsHot.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {productsHot.map((product, idx) => (
                  <div key={product.id} className={`group bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 relative scroll-reveal scale-in delay-${Math.min((idx % 4) * 100 + 100, 400)}`}>
                    <Link to={`/product/${product.slug || product.id}`} className="no-underline">
                      <div className="bg-gray-200 aspect-square p-4 relative overflow-hidden">
                        {product.is_limited_edition && (
                          <span className="absolute top-2 left-2 bg-blue-700 text-white text-[10px] px-2.5 py-1 font-bold z-10 uppercase tracking-wide">
                            Limited Edition
                          </span>
                        )}
                        <img
                          src={product.images?.[0] || product.image}
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
                        >
                          <svg
                            className={`w-5 h-5 transition-all ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'fill-white text-orange-500'}`}
                            stroke="currentColor"
                            fill={isFavorite(product.id) ? 'currentColor' : 'white'}
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                      <div className="p-4 bg-white text-center overflow-hidden">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[40px] leading-snug">
                          {product.name}
                        </h3>

                        {/* Show available colors */}
                        {product.colors && product.colors.length > 0 ? (
                          <ColorDots colors={product.colors} maxColors={4} />
                        ) : (
                          <p className="text-xs text-gray-500 mb-2">
                            {product.color_name || product.colors?.map(c => c.name).join(', ') || 'Đen, Trắng, Xám'}
                          </p>
                        )}

                        {formatPrice(getProductPrice(product)) && (
                          <div className="text-base font-bold text-gray-900 break-words overflow-hidden max-w-full mt-2">
                            {formatPrice(getProductPrice(product))}
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Không có sản phẩm bán chạy</p>
              </div>
            )}

            {/* Xem tất cả button */}
            {productsHot.length > 0 && (
              <div className="text-center mt-10">
                <Link
                  to="/products?featured=hot"
                  className="inline-block bg-black text-white px-12 py-3 rounded-full font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors no-underline text-sm"
                >
                  Xem tất cả →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* SẢN PHẨM GIẢM GIÁ */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-black uppercase text-center mb-12 tracking-tight scroll-reveal fade-up">SẢN PHẨM GIẢM GIÁ</h2>
            {productsSale.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {productsSale.map((product, idx) => (
                  <div key={product.id} className={`group bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 relative scroll-reveal scale-in delay-${Math.min((idx % 4) * 100 + 100, 400)}`}>
                    <Link to={`/product/${product.slug || product.id}`} className="no-underline">
                      <div className="bg-gray-200 aspect-square p-4 relative overflow-hidden">
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-2.5 py-1 font-bold z-10 uppercase tracking-wide">
                          Sale-off
                        </span>
                        <img
                          src={product.image || product.images?.[0]}
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
                        >
                          <svg
                            className={`w-5 h-5 transition-all ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'fill-white text-orange-500'}`}
                            stroke="currentColor"
                            fill={isFavorite(product.id) ? 'currentColor' : 'white'}
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                      <div className="p-4 bg-white text-center border-b border-dashed border-gray-300 overflow-hidden">
                        <p className="text-xs text-gray-600 mb-2">Online Only</p>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[40px] leading-snug">
                          {product.name}
                        </h3>

                        {/* Show available colors */}
                        {product.colors && product.colors.length > 0 ? (
                          <ColorDots colors={product.colors} maxColors={4} />
                        ) : (
                          <p className="text-xs text-gray-500 mb-2">
                            {product.color_name || product.colors?.map(c => c.name).join(', ') || 'Đen, Trắng, Xám'}
                          </p>
                        )}

                        {getProductPrice(product) && (
                          <div className="flex items-center justify-center gap-2 flex-wrap overflow-hidden max-w-full mt-3">
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Không có sản phẩm giảm giá</p>
              </div>
            )}

            {/* Xem tất cả button */}
            {productsSale.length > 0 && (
              <div className="text-center mt-10">
                <Link
                  to="/products?featured=sale"
                  className="inline-block bg-black text-white px-12 py-3 rounded-full font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors no-underline text-sm"
                >
                  Xem tất cả →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Banner - Subscribe */}
        <section className="relative overflow-hidden scroll-reveal fade-up">
          <div className="w-full">
            <img
              src={subscribeBanner}
              alt="Subscribe Banner"
              className="w-full h-auto"
            />
          </div>
        </section>

        {/* Newsletter */}
        <section className="bg-white border-t border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 scroll-reveal fade-up">
              <div className="text-center md:text-left w-full md:w-auto">
                <h2 className="text-base sm:text-lg md:text-2xl font-black uppercase tracking-tight md:whitespace-nowrap leading-tight">
                  NHẬN THÔNG TIN KHUYẾN MÃI<br className="md:hidden" /> TỪ CHÚNG TÔI
                </h2>
              </div>
              <div className="flex gap-0 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 md:w-80 lg:w-96 px-4 md:px-5 py-2.5 md:py-3 border-2 border-gray-300 text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 transition-colors text-sm"
                />
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 md:px-10 py-2.5 md:py-3 font-bold uppercase tracking-wide transition-colors text-xs md:text-sm whitespace-nowrap">
                  GỬI
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
