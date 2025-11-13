import React from 'react';
import { ColorDots } from '@utils/colorUtils.jsx';

const ColorTest = () => {
  // Sample product data
  const sampleProduct = {
    "id": 34,
    "name": "Adidas Originals Gazelle",
    "price": 2700000,
    "image": null,
    "slug": "adidas-originals-gazelle",
    "brand": {
      "id": 2,
      "name": "Adidas"
    },
    "colors": [
      {
        "id": 1,
        "name": "Đen"
      },
      {
        "id": 2,
        "name": "Trắng"
      }
    ]
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-8">Color Display Test</h1>
      
      {/* Product Card Example */}
      <div className="bg-white rounded-lg p-6 max-w-sm mx-auto shadow-lg">
        <h3 className="text-lg font-semibold mb-4">{sampleProduct.name}</h3>
        
        {/* Color Display Logic - Same as Home.jsx */}
        {sampleProduct.colors && sampleProduct.colors.length > 0 ? (
          <div>
            <p className="text-sm text-gray-600 mb-2">Available Colors (Dots):</p>
            <ColorDots colors={sampleProduct.colors} maxColors={4} />
          </div>
        ) : (
          <p className="text-xs text-gray-500 mb-2">
            {sampleProduct.color_name || sampleProduct.colors?.map(c => c.name).join(', ') || 'Đen, Trắng, Xám'}
          </p>
        )}
        
        {/* Show color names as text for comparison */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600 mb-2">Color Names (Text):</p>
          <p className="text-xs text-gray-500">
            {sampleProduct.colors.map(c => c.name).join(', ')}
          </p>
        </div>
        
        {/* Price */}
        <div className="mt-4">
          <p className="text-lg font-bold text-orange-600">
            {sampleProduct.price.toLocaleString('vi-VN')} VND
          </p>
        </div>
      </div>
      
      {/* Color Mapping Examples */}
      <div className="mt-8 bg-white rounded-lg p-6 max-w-2xl mx-auto shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Color Mapping Examples</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Đen' },
            { name: 'Trắng' },
            { name: 'Xám' },
            { name: 'Đỏ' },
            { name: 'Xanh Dương' },
            { name: 'Xanh Lá' },
            { name: 'Vàng' },
            { name: 'Tím' }
          ].map((color, index) => (
            <div key={index} className="text-center">
              <ColorDots colors={[color]} maxColors={1} />
              <p className="text-xs mt-1">{color.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorTest;
