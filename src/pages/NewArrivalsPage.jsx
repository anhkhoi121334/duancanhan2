import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const NewArrivalsPage = () => {
  const navigate = useNavigate();

  // Redirect to products page with new arrivals filter
  useEffect(() => {
    navigate('/products?featured=new', { replace: true });
  }, [navigate]);

  return (
    <>
      <SEO
        title="Hàng Mới Về - New Arrivals | ANKH Store"
        description="Khám phá bộ sưu tập giày mới nhất tại ANKH. Cập nhật liên tục các mẫu giày thể thao, sneaker hot trend từ các thương hiệu hàng đầu. Đặt hàng ngay!"
        keywords="hàng mới về, new arrivals, giày mới, sneaker mới, xu hướng giày, giày hot"
      />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6600]"></div>
          <p className="mt-4 text-gray-600">Đang chuyển hướng...</p>
        </div>
      </div>
    </>
  );
};

export default NewArrivalsPage;

