import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@lib/formatters';

const ProductCard = memo(({ product, onAddToCart }) => {
  const productPrice = product.price_sale || product.price || 0;
  const productImage = product.images?.[0] || product.image;
  const productSlug = product.slug || product.id;

  return (
    <div className="group bg-white rounded-xl overflow-hidden relative transition-all shadow-md hover:-translate-y-2 hover:shadow-2xl">
      <Link to={`/product/${productSlug}`}>
        <img 
          src={productImage} 
          alt={product.name}
          className="w-full h-72 object-cover transition-transform group-hover:scale-110" 
          loading="lazy"
        />
        <div className="p-4 text-center">
          <h3 className="text-sm font-bold text-gray-800 uppercase mb-2 leading-tight">
            {product.name}
          </h3>
          <p className="text-brand-orange font-bold text-lg">
            {formatPrice(productPrice)}
          </p>
        </div>
      </Link>
      <button 
        onClick={() => onAddToCart(product)}
        className="absolute left-4 right-4 -bottom-12 bg-brand-orange text-white py-3 px-4 rounded-lg font-bold uppercase transition-all opacity-0 group-hover:bottom-4 group-hover:opacity-100 text-sm hover:bg-orange-600"
        aria-label="Thêm vào giỏ hàng"
      >
        Thêm vào giỏ
      </button>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
