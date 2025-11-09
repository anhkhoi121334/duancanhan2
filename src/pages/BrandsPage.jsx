import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBrands } from '../services/api';
import SEO from '../components/SEO';

const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await getBrands();
        setBrands(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching brands:', error);
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

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

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [brands]);

  return (
    <>
      <SEO
        title="Thương Hiệu - Brands | ANKH Store"
        description="Khám phá các thương hiệu giày thể thao hàng đầu tại ANKH: Nike, Adidas, Puma, New Balance, Vans, Converse và nhiều hơn nữa. Chính hãng 100%."
        keywords="thương hiệu giày, brands, Nike, Adidas, Puma, Vans, Converse, New Balance"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-6 text-center scroll-reveal fade-up">
            <h1 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tight">
              Thương Hiệu Giày
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Khám phá bộ sưu tập từ các thương hiệu giày thể thao hàng đầu thế giới
            </p>
          </div>
        </section>

        {/* Brands Grid */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6600]"></div>
              <p className="mt-4 text-gray-600">Đang tải thương hiệu...</p>
            </div>
          ) : brands.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {brands.map((brand, index) => (
                <Link
                  key={brand.id}
                  to={`/products?brand_id=${brand.id}`}
                  className={`group bg-white rounded-xl p-8 hover:shadow-2xl transition-all duration-300 no-underline text-center scroll-reveal scale-in delay-${Math.min((index % 4) * 100 + 100, 400)}`}
                >
                  {brand.logo ? (
                    <img 
                      src={brand.logo} 
                      alt={brand.name}
                      className="w-full h-24 object-contain mb-4 group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-24 flex items-center justify-center mb-4 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                      <span className="text-3xl font-black text-gray-400 group-hover:text-gray-600">
                        {brand.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#ff6600] transition-colors uppercase tracking-wide">
                    {brand.name}
                  </h3>
                  {brand.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {brand.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">Không có thương hiệu nào</p>
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="bg-white py-16">
          <div className="max-w-4xl mx-auto px-6 text-center scroll-reveal fade-up">
            <h2 className="text-3xl font-black uppercase mb-6">
              Không Tìm Thấy Thương Hiệu Bạn Muốn?
            </h2>
            <p className="text-gray-600 mb-8">
              Chúng tôi liên tục cập nhật các thương hiệu mới. Liên hệ với chúng tôi để biết thêm thông tin!
            </p>
            <Link
              to="/contact"
              className="inline-block bg-[#ff6600] hover:bg-orange-700 text-white px-12 py-4 rounded-full font-bold uppercase tracking-wide transition-colors no-underline"
            >
              Liên Hệ Ngay
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default BrandsPage;

