import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Auto redirect after countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <SEO
        title="404 - Trang không tồn tại | ANKH Store"
        description="Rất tiếc, trang bạn đang tìm kiếm không tồn tại. Quay lại trang chủ ANKH để khám phá những sản phẩm giày thể thao chính hãng."
        keywords="404, page not found, trang không tìm thấy, ANKH"
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating Circles */}
          <div 
            className="absolute top-10 left-10 w-72 h-72 bg-[#ff6600] opacity-10 rounded-full blur-3xl animate-pulse"
            style={{
              transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          />
          <div 
            className="absolute bottom-10 right-10 w-96 h-96 bg-orange-500 opacity-10 rounded-full blur-3xl animate-pulse"
            style={{
              transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
              transition: 'transform 0.3s ease-out',
              animationDelay: '1s',
            }}
          />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-red-500 opacity-5 rounded-full blur-3xl animate-pulse" 
            style={{ animationDelay: '2s' }}
          />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-4xl w-full text-center">
            
            {/* 404 Number - Animated */}
            <div className="mb-8 relative">
              <h1 
                className="text-[180px] md:text-[280px] font-black leading-none mb-0 select-none"
                style={{
                  background: 'linear-gradient(135deg, #ff6600 0%, #ff8833 50%, #ffaa66 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 80px rgba(255, 102, 0, 0.3)',
                  transform: `perspective(1000px) rotateX(${mousePosition.y * 0.1}deg) rotateY(${mousePosition.x * 0.1}deg)`,
                  transition: 'transform 0.3s ease-out',
                }}
              >
                404
              </h1>
              
              {/* Glitch Effect Lines */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-[180px] md:text-[280px] font-black leading-none text-red-500 opacity-20 blur-sm animate-pulse">
                  404
                </div>
              </div>
            </div>

            {/* Shoe Icon */}
            <div className="mb-8 flex justify-center animate-bounce">
              <svg className="w-24 h-24 text-[#ff6600]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.71 13.79c-.45.45-1.17.45-1.62 0l-.71-.71V11c0-.55-.45-1-1-1s-1 .45-1 1v2.09l-2.29-2.29c-.45-.45-1.17-.45-1.62 0-.45.45-.45 1.17 0 1.62L16.17 15H13c-.55 0-1 .45-1 1s.45 1 1 1h3.17l-2.71 2.71c-.45.45-.45 1.17 0 1.62.22.22.52.33.82.33s.6-.11.82-.33l2.29-2.29V21c0 .55.45 1 1 1s1-.45 1-1v-2.09l.71.71c.22.22.52.33.82.33s.6-.11.82-.33c.45-.45.45-1.17 0-1.62l-2.71-2.71 2.71-2.71c.45-.45.45-1.17 0-1.62zM3 11h8c.55 0 1-.45 1-1s-.45-1-1-1H3c-.55 0-1 .45-1 1s.45 1 1 1zm0 4h4c.55 0 1-.45 1-1s-.45-1-1-1H3c-.55 0-1 .45-1 1s.45 1 1 1z"/>
              </svg>
            </div>

            {/* Main Message */}
            <h2 className="text-4xl md:text-6xl font-black uppercase mb-4 tracking-tight">
              Oops! Lost in Space
            </h2>
            
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển. 
              <br className="hidden md:block" />
              Đừng lo, chúng tôi sẽ đưa bạn về <span className="text-[#ff6600] font-bold">nhà</span>!
            </p>

            {/* Countdown */}
            <div className="mb-10">
              <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-8 py-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-[#ff6600] flex items-center justify-center">
                    <span className="text-3xl font-black text-[#ff6600]">{countdown}</span>
                  </div>
                  <svg className="absolute inset-0 w-16 h-16 -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="rgba(255, 102, 0, 0.2)"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray="176"
                      strokeDashoffset={176 - (176 * countdown) / 10}
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-400 uppercase tracking-wide">Tự động chuyển về</p>
                  <p className="text-lg font-bold">Trang chủ</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/"
                className="group relative inline-flex items-center gap-2 bg-[#ff6600] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition-all transform hover:scale-105 hover:shadow-2xl no-underline overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="relative z-10">Về trang chủ</span>
              </Link>

              <Link
                to="/products"
                className="group relative inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 hover:border-white/30 transition-all transform hover:scale-105 no-underline"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Xem sản phẩm</span>
              </Link>
            </div>

            {/* Popular Links */}
            <div className="mt-16 pt-8 border-t border-white/10">
              <p className="text-sm text-gray-400 mb-4 uppercase tracking-wider">Trang phổ biến</p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {[
                  { name: 'Trang chủ', path: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                  { name: 'Sản phẩm', path: '/products', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
                  { name: 'Giỏ hàng', path: '/cart', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
                  { name: 'Yêu thích', path: '/favorites', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
                ].map((link, index) => (
                  <Link
                    key={index}
                    to={link.path}
                    className="group flex items-center gap-2 text-sm text-gray-400 hover:text-[#ff6600] transition-colors no-underline"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon} />
                    </svg>
                    <span className="group-hover:underline">{link.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Fun Facts */}
            <div className="mt-12 text-center">
              <p className="text-xs text-gray-500 italic">
                💡 <span className="text-gray-400">Thực tế thú vị:</span> Lỗi 404 được đặt tên theo số phòng tại CERN nơi máy chủ web đầu tiên được đặt.
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ff6600] to-transparent opacity-50" />
      </div>
    </>
  );
};

export default NotFoundPage;

