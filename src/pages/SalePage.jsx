import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const SalePage = () => {
  const navigate = useNavigate();

  // Redirect to products page with sale filter
  useEffect(() => {
    navigate('/products?featured=sale', { replace: true });
  }, [navigate]);

  return (
    <>
      <SEO
        title="Sale - Giảm giá đến 50% | ANKH Store"
        description="Khuyến mãi lớn! Giảm giá đến 50% cho hàng ngàn sản phẩm giày thể thao, sneaker chính hãng. Miễn phí ship, đổi trả trong 30 ngày. Mua ngay!"
        keywords="sale giày, giảm giá, khuyến mãi giày, giày sale off, giày giảm giá, outlet"
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

export default SalePage;

