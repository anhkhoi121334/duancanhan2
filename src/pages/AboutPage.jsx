import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import logoAnkh from '../assets/logoankh.png';

const AboutPage = () => {
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
  }, []);

  return (
    <>
      <SEO
        title="Về Chúng Tôi - About ANKH Store | Câu Chuyện Thương Hiệu"
        description="ANKH Store - Hệ thống bán lẻ giày sneaker, giày thể thao chính hãng uy tín tại Việt Nam. Đa dạng mẫu mã, giá tốt nhất, phục vụ tận tâm."
        keywords="về ANKH, giới thiệu, câu chuyện thương hiệu, cửa hàng giày, ANKH Store"
      />
      
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-600 rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <div className="scroll-reveal fade-up mb-8">
              <img 
                src={logoAnkh} 
                alt="ANKH Logo" 
                className="h-24 md:h-32 mx-auto object-contain"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tight scroll-reveal fade-up delay-200">
              Về ANKH Store
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed scroll-reveal fade-up delay-300">
              Chúng tôi là hệ thống bán lẻ giày sneaker và thể thao chính hãng uy tín hàng đầu Việt Nam, 
              mang đến cho khách hàng những sản phẩm chất lượng cao với giá cả hợp lý nhất.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Mission */}
              <div className="bg-white p-8 rounded-2xl shadow-lg scroll-reveal scale-in delay-100">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-[#ff6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black uppercase mb-4 text-gray-900">Sứ Mệnh</h3>
                <p className="text-gray-600 leading-relaxed">
                  Mang đến cho mọi người những đôi giày chất lượng cao, phong cách và thoải mái, 
                  giúp bạn tự tin thể hiện cá tính riêng của mình.
                </p>
              </div>

              {/* Vision */}
              <div className="bg-white p-8 rounded-2xl shadow-lg scroll-reveal scale-in delay-300">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-[#ff6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black uppercase mb-4 text-gray-900">Tầm Nhìn</h3>
                <p className="text-gray-600 leading-relaxed">
                  Trở thành hệ thống bán lẻ giày thể thao hàng đầu Việt Nam, 
                  được khách hàng tin tưởng và lựa chọn số 1.
                </p>
              </div>

              {/* Values */}
              <div className="bg-white p-8 rounded-2xl shadow-lg scroll-reveal scale-in delay-500">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-[#ff6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black uppercase mb-4 text-gray-900">Giá Trị</h3>
                <p className="text-gray-600 leading-relaxed">
                  Chất lượng, uy tín, tận tâm. Chúng tôi luôn đặt lợi ích khách hàng lên hàng đầu 
                  và không ngừng cải thiện dịch vụ.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-black uppercase text-center mb-16 scroll-reveal fade-up">
              Tại Sao Chọn ANKH?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center scroll-reveal fade-up delay-100">
                <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">✓</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Chính Hãng 100%</h3>
                <p className="text-gray-600">
                  Cam kết sản phẩm chính hãng, có nguồn gốc xuất xứ rõ ràng
                </p>
              </div>

              <div className="text-center scroll-reveal fade-up delay-200">
                <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">🚚</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Giao Hàng Nhanh</h3>
                <p className="text-gray-600">
                  Freeship toàn quốc, giao hàng trong 2-3 ngày
                </p>
              </div>

              <div className="text-center scroll-reveal fade-up delay-300">
                <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">🔄</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Đổi Trả Dễ Dàng</h3>
                <p className="text-gray-600">
                  Đổi trả miễn phí trong 30 ngày nếu có vấn đề
                </p>
              </div>

              <div className="text-center scroll-reveal fade-up delay-400">
                <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">💰</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Giá Tốt Nhất</h3>
                <p className="text-gray-600">
                  Cam kết giá tốt nhất thị trường, nhiều ưu đãi
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="scroll-reveal scale-in delay-100">
                <div className="text-5xl font-black mb-3">10K+</div>
                <div className="text-white/90">Khách Hàng</div>
              </div>
              <div className="scroll-reveal scale-in delay-200">
                <div className="text-5xl font-black mb-3">5K+</div>
                <div className="text-white/90">Sản Phẩm</div>
              </div>
              <div className="scroll-reveal scale-in delay-300">
                <div className="text-5xl font-black mb-3">50+</div>
                <div className="text-white/90">Thương Hiệu</div>
              </div>
              <div className="scroll-reveal scale-in delay-400">
                <div className="text-5xl font-black mb-3">99%</div>
                <div className="text-white/90">Hài Lòng</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center scroll-reveal fade-up">
            <h2 className="text-3xl md:text-4xl font-black uppercase mb-6">
              Sẵn Sàng Mua Sắm?
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Khám phá hàng ngàn sản phẩm giày thể thao chính hãng với giá tốt nhất
            </p>
            <Link
              to="/products"
              className="inline-block bg-[#ff6600] hover:bg-orange-700 text-white px-12 py-4 rounded-full font-bold uppercase tracking-wide transition-colors no-underline text-lg"
            >
              Mua Sắm Ngay
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;

