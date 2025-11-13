import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore } from '@store';
import { addToCartAPI } from '@services/api';
import { SEO } from '@components';
import { formatPrice } from '@lib/formatters';

const AccordionItem = ({ title, children, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left font-semibold text-sm uppercase hover:text-[#ff6600] transition-colors"
      >
        {title}
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-gray-600 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
};

const ProductDetail = () => {
  const { id: idOrSlug } = useParams(); // API accepts both ID and slug
  const navigate = useNavigate();
  const { addToCart, showToast } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  // API State
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI State
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [displayImages, setDisplayImages] = useState([]);

  // Fetch product details from API
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${API_URL}/products/${idOrSlug}`);

        if (!response.ok) {
          throw new Error('Không thể tải sản phẩm');
        }

        const data = await response.json();

        console.log('Product Detail API Response:', data);

        // Handle both response formats: { product: {...} } or direct product object
        const productData = data.product || data;
        
        if (!productData || !productData.id) {
          throw new Error('Dữ liệu sản phẩm không hợp lệ');
        }

        setProduct(productData);
        setRelatedProducts(data.related_products || []);
        setNewProducts(data.new_products || []);
        
        // Set default images - theo logic backend: lấy ảnh của màu đầu tiên (first_color_id)
        let defaultImages = [];
        let firstColorId = productData.first_color_id;
        
        // Ưu tiên 1: Tìm ảnh theo first_color_id từ backend
        if (firstColorId && productData.images_by_color) {
          const colorImages = productData.images_by_color.find(ic => ic.color_id === firstColorId);
          if (colorImages && colorImages.images && colorImages.images.length > 0) {
            defaultImages = colorImages.images.map(img => 
              typeof img === 'string' ? img : (img.url || img.image_url || img.image)
            ).filter(Boolean);
          }
        }
        
        // Ưu tiên 2: Nếu first_color_id không có ảnh, tìm màu đầu tiên có ảnh
        if (defaultImages.length === 0 && productData.images_by_color && productData.images_by_color.length > 0) {
          const colorWithImages = productData.images_by_color.find(ic => 
            ic.images && Array.isArray(ic.images) && ic.images.length > 0
          );
          if (colorWithImages && colorWithImages.images) {
            defaultImages = colorWithImages.images.map(img => 
              typeof img === 'string' ? img : (img.url || img.image_url || img.image)
            ).filter(Boolean);
          }
        }
        
        // Ưu tiên 3: Fallback về default_images từ backend
        if (defaultImages.length === 0 && productData.default_images && Array.isArray(productData.default_images)) {
          defaultImages = productData.default_images.map(img => 
            typeof img === 'string' ? img : (img.url || img.image_url || img.image)
          ).filter(Boolean);
        }
        
        // Ưu tiên 4: Fallback về product.images
        if (defaultImages.length === 0 && productData.images && Array.isArray(productData.images)) {
          defaultImages = productData.images.map(img => 
            typeof img === 'string' ? img : (img.url || img.image_url || img.image)
          ).filter(Boolean);
        }
        
        // Ưu tiên 5: Fallback về product.image
        if (defaultImages.length === 0 && productData.image) {
          defaultImages = [productData.image];
        }
        
        setDisplayImages(defaultImages);
        
        // Set default variant - ưu tiên variant có ảnh hoặc variant của màu đầu tiên
        if (productData.variants && productData.variants.length > 0) {
          let firstVariant = productData.variants[0];
          
          // Nếu có first_color_id, tìm variant đầu tiên của màu đó
          if (firstColorId) {
            const variantWithFirstColor = productData.variants.find(v => {
              const colorId = typeof v.color === 'object' ? v.color?.id : null;
              return colorId === firstColorId;
            });
            if (variantWithFirstColor) {
              firstVariant = variantWithFirstColor;
            }
          }
          
          // Nếu variant đầu tiên không có ảnh, tìm variant đầu tiên có ảnh
          if (!firstVariant.images || firstVariant.images.length === 0) {
            const variantWithImages = productData.variants.find(v => 
              v.images && Array.isArray(v.images) && v.images.length > 0
            );
            if (variantWithImages) {
              firstVariant = variantWithImages;
            }
          }
          
          setSelectedVariant(firstVariant);
          
          // Xử lý size và color là object {id, name}
          const firstSize = typeof firstVariant.size === 'object' ? firstVariant.size : { id: null, name: firstVariant.size };
          const firstColor = typeof firstVariant.color === 'object' ? firstVariant.color : { id: null, name: firstVariant.color };
          
          setSelectedSize(firstSize);
          setSelectedColor(firstColor);
          
          // Set images for first variant if available (ưu tiên variant.images)
          if (firstVariant.images && firstVariant.images.length > 0) {
            const variantImages = firstVariant.images.map(img => 
              typeof img === 'string' ? img : (img.url || img.image_url || img.image)
            ).filter(Boolean);
            if (variantImages.length > 0) {
              setDisplayImages(variantImages);
            }
          } else if (firstColor.id && productData.images_by_color) {
            // Tìm ảnh theo color_id trong images_by_color
            const colorImages = productData.images_by_color.find(ic => ic.color_id === firstColor.id);
            if (colorImages && colorImages.images && colorImages.images.length > 0) {
              const images = colorImages.images.map(img => 
                typeof img === 'string' ? img : (img.url || img.image_url || img.image)
              ).filter(Boolean);
              if (images.length > 0) {
                setDisplayImages(images);
              }
            }
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching product detail:', err);
        setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [idOrSlug]);

  // Helper function để so sánh size/color (hỗ trợ cả object và string)
  const compareSizeOrColor = (a, b) => {
    if (!a || !b) return false;
    // Nếu cả hai đều là object
    if (typeof a === 'object' && typeof b === 'object') {
      return a.id === b.id || a.name === b.name;
    }
    // Nếu một trong hai là object
    if (typeof a === 'object') {
      return a.id === b || a.name === b;
    }
    if (typeof b === 'object') {
      return a === b.id || a === b.name;
    }
    // Cả hai đều là string
    return a === b;
  };

  // Handle variant selection when size or color changes
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      let variant = null;
      
      // Nếu có cả size và color, tìm variant khớp cả hai
      if (selectedSize && selectedColor) {
        variant = product.variants.find(v => {
          const sizeMatch = compareSizeOrColor(v.size, selectedSize);
          const colorMatch = compareSizeOrColor(v.color, selectedColor);
          return sizeMatch && colorMatch;
        });
        
        // Nếu không tìm thấy variant với size+color hiện tại, thử tìm với color mới và size khác
        if (!variant && selectedColor) {
          variant = product.variants.find(v => compareSizeOrColor(v.color, selectedColor));
          if (variant) {
            // Cập nhật size để khớp với variant mới
            const newSize = typeof variant.size === 'object' ? variant.size : { id: null, name: variant.size };
            setSelectedSize(newSize);
          }
        }
      }
      // Nếu chỉ có color, tìm variant đầu tiên với màu đó
      else if (selectedColor) {
        variant = product.variants.find(v => compareSizeOrColor(v.color, selectedColor));
        // Tự động chọn size của variant đầu tiên tìm được
        if (variant && !selectedSize) {
          const newSize = typeof variant.size === 'object' ? variant.size : { id: null, name: variant.size };
          setSelectedSize(newSize);
        }
      }
      // Nếu chỉ có size, tìm variant đầu tiên với size đó
      else if (selectedSize) {
        variant = product.variants.find(v => compareSizeOrColor(v.size, selectedSize));
        // Tự động chọn color của variant đầu tiên tìm được
        if (variant && !selectedColor) {
          const newColor = typeof variant.color === 'object' ? variant.color : { id: null, name: variant.color };
          setSelectedColor(newColor);
        }
      }
      
      // Cập nhật variant nếu tìm thấy (giá sẽ tự động cập nhật vì selectedVariant thay đổi)
      if (variant) {
        setSelectedVariant(variant);
        
        // Fetch và cập nhật images theo variant/color
        updateImagesForVariant(variant, selectedColor);
      }
    }
  }, [selectedSize, selectedColor, product]);

  // Function to update images based on variant/color
  const updateImagesForVariant = async (variant, color) => {
    try {
      // Ưu tiên 1: Nếu variant có images riêng, dùng luôn
      if (variant.images && variant.images.length > 0) {
        const variantImages = variant.images.map(img => 
          typeof img === 'string' ? img : (img.url || img.image_url || img.image)
        ).filter(Boolean);
        if (variantImages.length > 0) {
          setDisplayImages(variantImages);
          setSelectedImage(0);
          return;
        }
      }

      // Ưu tiên 2: Tìm ảnh từ images_by_color theo color_id
      if (color && product.images_by_color) {
        const colorId = typeof color === 'object' ? color.id : null;
        const colorName = typeof color === 'object' ? color.name : color;
        
        if (colorId) {
          const colorImages = product.images_by_color.find(ic => ic.color_id === colorId);
          if (colorImages && colorImages.images) {
            const images = colorImages.images.map(img => 
              typeof img === 'string' ? img : (img.url || img.image_url || img.image)
            ).filter(Boolean);
            if (images.length > 0) {
              setDisplayImages(images);
              setSelectedImage(0);
              return;
            }
          }
        }
        
        // Fallback: tìm theo color_name
        if (colorName) {
          const colorImages = product.images_by_color.find(ic => 
            ic.color_name === colorName || ic.color_id === colorName
          );
          if (colorImages && colorImages.images) {
            const images = colorImages.images.map(img => 
              typeof img === 'string' ? img : (img.url || img.image_url || img.image)
            ).filter(Boolean);
            if (images.length > 0) {
              setDisplayImages(images);
              setSelectedImage(0);
              return;
            }
          }
        }
      }

      // Ưu tiên 3: Thử fetch images từ API theo product và color (fallback)
      if (product?.id && color) {
        const colorName = typeof color === 'object' ? color.name : color;
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        try {
          const response = await fetch(`${API_URL}/products/${product.id}/images?color=${encodeURIComponent(colorName)}`, {
            headers: {
              'Accept': 'application/json'
            }
          });

          if (response.ok) {
            const imageData = await response.json();
            const images = imageData.images || imageData.data || imageData;
            
            if (Array.isArray(images) && images.length > 0) {
              const imageUrls = images.map(img => 
                typeof img === 'string' ? img : (img.image_url || img.url || img.image)
              ).filter(Boolean);
              
              if (imageUrls.length > 0) {
                setDisplayImages(imageUrls);
                setSelectedImage(0);
                return;
              }
            }
          }
        } catch (apiError) {
          console.log('Could not fetch images from API:', apiError);
        }
      }

      // Fallback 1: Dùng default_images từ backend
      let defaultImages = [];
      if (product.default_images && Array.isArray(product.default_images)) {
        defaultImages = product.default_images.map(img => 
          typeof img === 'string' ? img : (img.url || img.image_url || img.image)
        ).filter(Boolean);
      }
      
      // Fallback 2: Dùng images gốc của product
      if (defaultImages.length === 0 && product.images && Array.isArray(product.images)) {
        defaultImages = product.images.map(img => 
          typeof img === 'string' ? img : (img.url || img.image_url || img.image)
        ).filter(Boolean);
      }
      
      // Fallback 3: Dùng product.image
      if (defaultImages.length === 0 && product.image) {
        defaultImages = [product.image];
      }
      
      if (defaultImages.length > 0) {
        setDisplayImages(defaultImages);
        setSelectedImage(0);
      }
    } catch (error) {
      console.error('Error updating images:', error);
      // Fallback to default images
      let defaultImages = [];
      if (product.default_images && Array.isArray(product.default_images)) {
        defaultImages = product.default_images.map(img => 
          typeof img === 'string' ? img : (img.url || img.image_url || img.image)
        ).filter(Boolean);
      }
      if (defaultImages.length === 0 && product.images && Array.isArray(product.images)) {
        defaultImages = product.images.map(img => 
          typeof img === 'string' ? img : (img.url || img.image_url || img.image)
        ).filter(Boolean);
      }
      if (defaultImages.length === 0 && product.image) {
        defaultImages = [product.image];
      }
      setDisplayImages(defaultImages);
      setSelectedImage(0);
    }
  };

  // formatPrice is now imported from @lib/formatters

  // Get current price (from variant or product) - memoized
  const getCurrentPrice = useMemo(() => {
    // Return default if product is not loaded yet
    if (!product) {
      return {
        original: null,
        sale: 0,
        discount: 0,
        discount_percent: 0
      };
    }

    // Ưu tiên giá từ variant (format mới có original_price, sale_price, price)
    if (selectedVariant) {
      // Format mới: original_price, sale_price, price, discount, discount_percent
      if (selectedVariant.original_price && selectedVariant.sale_price && selectedVariant.original_price > selectedVariant.sale_price) {
        return {
          original: selectedVariant.original_price,
          sale: selectedVariant.sale_price || selectedVariant.price,
          discount: selectedVariant.discount || 0,
          discount_percent: selectedVariant.discount_percent || 0
        };
      }
      // Nếu có price (đã tính sale)
      if (selectedVariant.price) {
        return {
          original: selectedVariant.original_price || null,
          sale: selectedVariant.price,
          discount: selectedVariant.discount || 0,
          discount_percent: selectedVariant.discount_percent || 0
        };
      }
      // Format cũ: price_sale, price
      if (selectedVariant.price_sale && selectedVariant.price_sale < selectedVariant.price) {
        return {
          original: selectedVariant.price,
          sale: selectedVariant.price_sale,
          discount: 0,
          discount_percent: 0
        };
      }
      if (selectedVariant.price) {
        return {
          original: null,
          sale: selectedVariant.price,
          discount: 0,
          discount_percent: 0
        };
      }
    }
    
    // Fallback to product price
    if (product.price_sale && product.price_sale < product.price) {
      return {
        original: product.price,
        sale: product.price_sale,
        discount: 0,
        discount_percent: 0
      };
    }
    return {
      original: null,
      sale: product.price || product.price_sale || 0,
      discount: 0,
      discount_percent: 0
    };
  }, [product, selectedVariant]);

  // Define callbacks before any conditional returns to follow Rules of Hooks
  const handleAddToCart = useCallback(async () => {
    if (!selectedSize) {
      showToast('Vui lòng chọn size!', 'error');
      return;
    }
    if (!selectedVariant) {
      showToast('Biến thể sản phẩm không tồn tại!', 'error');
      return;
    }
    
    // Xác định giá: ưu tiên variant (format mới), fallback về format cũ
    const itemPrice = selectedVariant.sale_price || 
                     selectedVariant.price || 
                     selectedVariant.price_sale || 
                     product.price_sale || 
                     product.price || 
                     0;
    
    // Xử lý size - lấy name nếu là object
    const sizeValue = typeof selectedSize === 'object' ? selectedSize.name : selectedSize;

    // Thêm vào local storage (luôn luôn)
    // Lưu size đã chọn để cố định trong giỏ hàng
    // Thêm 1 lần với quantity thay vì lặp quantity lần
    addToCart({ 
      ...product, 
      price: itemPrice,
      original_price: selectedVariant.original_price,
      price_sale: selectedVariant.sale_price || selectedVariant.price_sale,
      variant_id: selectedVariant.id,
      // Đảm bảo các thông tin cần thiết
      image: displayImages[0] || product.images?.[0] || product.image,
      // Lưu size đã chọn để hiển thị đúng trong giỏ hàng
      selectedSize: sizeValue,
      size: sizeValue,
      quantity: quantity // Truyền quantity vào product object
    }, sizeValue, quantity);

    // Nếu user đã đăng nhập, sync với backend
    if (isAuthenticated && selectedVariant.id) {
      try {
        await addToCartAPI(selectedVariant.id, quantity);
        // API đã được gọi thành công (log trong api.js)
      } catch (error) {
        // Lỗi đã được xử lý trong addToCartAPI, không cần throw
        console.log('Cart saved locally only');
      }
    }
  }, [selectedSize, selectedVariant, quantity, product, displayImages, isAuthenticated, addToCart, showToast]);

  const handleBuyNow = useCallback(async () => {
    if (!selectedSize) {
      showToast('Vui lòng chọn size!', 'error');
      return;
    }
    if (!selectedVariant) {
      showToast('Biến thể sản phẩm không tồn tại!', 'error');
      return;
    }
    
    // Xác định giá: ưu tiên variant (format mới), fallback về format cũ
    const itemPrice = selectedVariant.sale_price || 
                     selectedVariant.price || 
                     selectedVariant.price_sale || 
                     product.price_sale || 
                     product.price || 
                     0;
    
    // Xử lý size - lấy name nếu là object
    const sizeValue = typeof selectedSize === 'object' ? selectedSize.name : selectedSize;

    // Thêm vào local storage (luôn luôn)
    // Lưu size đã chọn để cố định trong giỏ hàng
    // Thêm 1 lần với quantity thay vì lặp quantity lần
    addToCart({ 
      ...product, 
      price: itemPrice,
      original_price: selectedVariant.original_price,
      price_sale: selectedVariant.sale_price || selectedVariant.price_sale,
      variant_id: selectedVariant.id,
      // Đảm bảo các thông tin cần thiết
      image: displayImages[0] || product.images?.[0] || product.image,
      // Lưu size đã chọn để hiển thị đúng trong giỏ hàng
      selectedSize: sizeValue,
      size: sizeValue,
      quantity: quantity // Truyền quantity vào product object
    }, sizeValue, quantity);

    // Nếu user đã đăng nhập, sync với backend
    if (isAuthenticated && selectedVariant.id) {
      try {
        await addToCartAPI(selectedVariant.id, quantity);
      } catch (error) {
        console.log('Cart saved locally only');
      }
    }
    
    // Navigate to checkout page instead of cart
    navigate('/checkout');
  }, [selectedSize, selectedVariant, quantity, product, displayImages, isAuthenticated, addToCart, navigate]);

  // Get available colors - ưu tiên product.colors, fallback từ variants
  const availableColors = (() => {
    if (!product) return [];
    if (product.colors && product.colors.length > 0) {
      return product.colors;
    }
    // Lấy từ variants và loại bỏ duplicate
    const colorMap = new Map();
    product.variants?.forEach(v => {
      const color = v.color;
      if (typeof color === 'object' && color !== null) {
        const key = color.id || color.name;
        if (key && !colorMap.has(key)) {
          colorMap.set(key, color);
        }
      } else if (color) {
        if (!colorMap.has(color)) {
          colorMap.set(color, { id: null, name: color });
        }
      }
    });
    return Array.from(colorMap.values());
  })();
  
  // Get available sizes - ưu tiên product.sizes, fallback từ variants
  const availableSizes = (() => {
    if (!product) return [];
    let sizes = [];
    if (product.sizes && product.sizes.length > 0) {
      sizes = product.sizes;
    } else {
      // Lấy từ variants và loại bỏ duplicate
      const sizeMap = new Map();
      product.variants?.forEach(v => {
        const size = v.size;
        if (typeof size === 'object' && size !== null) {
          const key = size.id || size.name;
          if (key && !sizeMap.has(key)) {
            sizeMap.set(key, size);
          }
        } else if (size) {
          if (!sizeMap.has(size)) {
            sizeMap.set(size, { id: null, name: size });
          }
        }
      });
      sizes = Array.from(sizeMap.values());
    }
    
    // Sắp xếp size theo thứ tự số tăng dần
    return sizes.sort((a, b) => {
      const nameA = typeof a === 'object' ? (a?.name || '') : (a || '');
      const nameB = typeof b === 'object' ? (b?.name || '') : (b || '');
      
      // Kiểm tra null/undefined trước khi xử lý
      if (!nameA && !nameB) return 0;
      if (!nameA) return 1;
      if (!nameB) return -1;
      
      // Extract số từ tên size (ví dụ: "37", "42", "EU 40" -> 37, 42, 40)
      const numA = parseInt(String(nameA).replace(/\D/g, '')) || 0;
      const numB = parseInt(String(nameB).replace(/\D/g, '')) || 0;
      
      // Nếu cả hai đều có số, sắp xếp theo số
      if (numA !== 0 && numB !== 0) {
        return numA - numB;
      }
      
      // Nếu một trong hai không có số, sắp xếp theo tên
      return String(nameA).localeCompare(String(nameB));
    });
  })();

  // Get current price (memoized, only recalculates when product or selectedVariant changes)
  const currentPrice = getCurrentPrice;

  // Error State - after all hooks are defined
  if (error || !product) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-20">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-6">{error || 'Không tìm thấy sản phẩm'}</p>
          <Link to="/products" className="inline-block bg-[#ff6600] text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-700 transition">
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${product.name} - ${product.color_name || 'Đen'} | ANKH Store`}
        description={`Mua ${product.name} ${product.color_name || ''} chính hãng tại ANKH. Giá: ${formatPrice(product.price)}. ${product.description || 'Giày thể thao chất lượng cao, bảo hành chính hãng, freeship toàn quốc.'}`}
        keywords={`${product.name}, ${product.brand_name || 'ANKH'}, giày thể thao, ${product.gender === 'Nam' ? 'giày nam' : product.gender === 'Nữ' ? 'giày nữ' : 'giày unisex'}, giày chính hãng, mua giày online`}
        image={product.images?.[0] || product.image}
        url={window.location.href}
        type="product"
      />
    <div className="max-w-[1200px] mx-auto px-4 py-7">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 pb-4 mb-6 border-b-2 border-black">
        {product.category?.name && (
          <>
            <Link to={`/products?category=${product.category.id}`} className="hover:text-gray-900">
              {product.category.name}
            </Link>
            <span> | </span>
          </>
        )}
        {product.brand?.name && (
          <>
            <Link to={`/products?brand_id=${product.brand.id}`} className="hover:text-gray-900">
              {product.brand.name}
            </Link>
            <span> | </span>
          </>
        )}
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN - Images */}
        <div>
          <h1 className="text-2xl font-extrabold uppercase mb-4 md:hidden">{product.name}</h1>
          <div className="bg-gray-100 rounded border overflow-hidden">
            <img 
              src={displayImages[selectedImage] || displayImages[0] || product.image} 
              alt={product.name}
              className="w-full object-cover h-[520px] max-h-[70vh] transition-all duration-300 hover:scale-105"
            />
          </div>
          <div className="grid grid-cols-5 gap-2.5 mt-3">
            {displayImages.length > 0 ? (
              displayImages.map((img, idx) => (
                <img 
                  key={idx}
                  src={img} 
                  alt={`${product.name} ${idx + 1}`}
                  className={`rounded-md h-16 object-cover w-full border-2 cursor-pointer transition-all ${
                    selectedImage === idx ? 'thumb-active border-[#ff6600]' : 'border-gray-200 hover:border-brand-orange'
                  }`}
                  onClick={() => setSelectedImage(idx)}
                />
              ))
            ) : (
              product.image && (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="rounded-md h-16 object-cover w-full border-2 border-[#ff6600]"
                />
              )
            )}
          </div>
        </div>

        {/* RIGHT COLUMN - Product Info */}
        <div>
          <h2 className="text-xl font-extrabold mb-2 hidden md:block">{product.name}</h2>
          <p className="text-xs text-gray-600 mb-3">
            Mã sản phẩm: <strong>{product.code || `SP${product.id}`}</strong>
          </p>
          
          {/* Price */}
          <div className="mb-4">
            {currentPrice.original ? (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-gray-400 line-through text-lg">
                  {formatPrice(currentPrice.original)}
                </span>
                <span className="text-[#ff6600] font-extrabold text-2xl">
                  {formatPrice(currentPrice.sale)}
                </span>
                {currentPrice.discount_percent > 0 && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                    -{currentPrice.discount_percent}%
                  </span>
                )}
              </div>
            ) : (
              <div className="text-[#ff6600] font-extrabold text-2xl">
                {formatPrice(currentPrice.sale)}
              </div>
            )}
            
            {/* Stock info */}
            {selectedVariant ? (
              <div className="text-sm text-gray-600 mt-2">
                {(selectedVariant.stock || selectedVariant.quantity || 0) > 0 ? (
                  <span className="text-green-600">Còn {selectedVariant.stock || selectedVariant.quantity} sản phẩm</span>
                ) : (
                  <span className="text-red-600">Hết hàng</span>
                )}
              </div>
            ) : product.variants && product.variants.length > 0 ? (
              <p className="text-sm text-gray-600 mt-2">
                <span className="text-gray-500">Vui lòng chọn size để xem giá</span>
              </p>
            ) : null}
          </div>

          {/* Shipping Info */}
          {product.shipping_info && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <div className="flex-1">
                  {product.shipping_info.message && (
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      {product.shipping_info.message}
                    </p>
                  )}
                  <div className="space-y-1 text-xs text-gray-700">
                    {product.shipping_info.estimated_delivery_date && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Ngày dự kiến giao hàng:</span>
                        <span className="text-blue-600 font-semibold">
                          {new Date(product.shipping_info.estimated_delivery_date).toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    {product.shipping_info.estimated_delivery_days_range && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Thời gian:</span>
                        <span>{product.shipping_info.estimated_delivery_days_range} ngày làm việc</span>
                      </div>
                    )}
                    {product.shipping_info.estimated_delivery_date_max && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <span>(Chậm nhất: {new Date(product.shipping_info.estimated_delivery_date_max).toLocaleDateString('vi-VN', {
                          day: 'numeric',
                          month: 'numeric',
                          year: 'numeric'
                        })})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="border-t border-dashed border-gray-300 my-4"></div>

          {/* Colors */}
          {availableColors.length > 0 && (
            <>
              <p className="text-sm font-semibold mb-2">MÀU SẮC:</p>
              <div className="flex flex-wrap gap-3 mb-4">
                {availableColors.map((color, index) => {
                  const colorObj = typeof color === 'object' ? color : { id: null, name: color };
                  const colorKey = colorObj.id || colorObj.name || index;
                  const colorName = colorObj.name || color;
                  const isSelected = selectedColor && (
                    (typeof selectedColor === 'object' && typeof color === 'object' && selectedColor.id === colorObj.id) ||
                    (typeof selectedColor === 'object' && selectedColor.name === colorName) ||
                    (typeof color === 'object' && selectedColor === colorName) ||
                    selectedColor === color
                  );
                  
                  return (
                    <button
                      key={colorKey}
                      className={`px-4 py-2 rounded-md border-2 transition-all text-sm ${
                        isSelected
                          ? 'border-[#ff6600] bg-orange-50 text-[#ff6600] font-semibold' 
                          : 'border-gray-300 hover:border-gray-500'
                      }`}
                      onClick={() => setSelectedColor(colorObj)}
                    >
                      {colorName}
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-dashed border-gray-300 my-4"></div>
            </>
          )}

          {/* Sizes */}
          <p className="text-sm font-semibold mb-2">SIZE:</p>
          <div className="flex flex-wrap gap-3 mb-4">
            {availableSizes.map((size, index) => {
              const sizeObj = typeof size === 'object' ? size : { id: null, name: size };
              const sizeKey = sizeObj.id || sizeObj.name || index;
              const sizeName = sizeObj.name || size;
              
              // Check if this size is available for the selected color
              const isAvailable = product.variants?.some(v => {
                const sizeMatch = compareSizeOrColor(v.size, sizeObj);
                const colorMatch = !selectedColor || compareSizeOrColor(v.color, selectedColor);
                const hasStock = (v.stock || v.quantity || 0) > 0;
                return sizeMatch && colorMatch && hasStock;
              });
              
              const isSelected = selectedSize && (
                (typeof selectedSize === 'object' && typeof size === 'object' && selectedSize.id === sizeObj.id) ||
                (typeof selectedSize === 'object' && selectedSize.name === sizeName) ||
                (typeof size === 'object' && selectedSize === sizeName) ||
                selectedSize === size
              );
              
              return (
                <button
                  key={sizeKey}
                  disabled={!isAvailable}
                  className={`border py-2 px-3 rounded-md cursor-pointer transition ${
                    isSelected
                      ? 'border-gray-900 bg-white shadow-[0_0_0_3px_rgba(242,107,58,0.08)]' 
                      : isAvailable
                      ? 'border-gray-300 bg-white hover:border-gray-900'
                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={() => setSelectedSize(sizeObj)}
                >
                  {sizeName}
                </button>
              );
            })}
          </div>

          {/* Quantity */}
          <div className="mt-4">
            <p className="text-sm font-semibold mb-2">SỐ LƯỢNG:</p>
            <div className="inline-flex items-center border rounded overflow-hidden">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-gray-100 transition"
                disabled={quantity <= 1}
              >
                -
              </button>
              <input 
                type="number"
                min="1"
                value={quantity} 
                onChange={(e) => {
                  const newQty = parseInt(e.target.value) || 1;
                  setQuantity(Math.max(1, newQty));
                }}
                className="w-14 text-center outline-none" 
              />
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 hover:bg-gray-100 transition"
              >
                +
              </button>
            </div>
            {/* Stock warning */}
            {selectedVariant && (() => {
              const maxStock = selectedVariant.stock || selectedVariant.quantity || 0;
              if (maxStock > 0 && quantity > maxStock) {
                return (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    ⚠️ Số lượng bạn chọn ({quantity}) vượt quá số lượng trong kho ({maxStock} sản phẩm). Vui lòng giảm số lượng để tiếp tục.
                  </p>
                );
              }
              return null;
            })()}
          </div>

          {/* Action Buttons */}
          <div className="mt-4">
            {/* Check if quantity exceeds stock */}
            {(() => {
              const maxStock = selectedVariant?.stock || selectedVariant?.quantity || 0;
              const exceedsStock = maxStock > 0 && quantity > maxStock;
              
              return (
                <>
                  <div className="flex gap-3 items-center">
                    <button 
                      onClick={handleAddToCart}
                      disabled={exceedsStock}
                      className={`flex-1 px-3 py-3 rounded-lg font-bold transition uppercase ${
                        exceedsStock
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-gray-800 text-white hover:bg-gray-900'
                      }`}
                      title={exceedsStock ? `Số lượng vượt quá tồn kho (${maxStock} sản phẩm)` : ''}
                    >
                      THÊM VÀO GIỎ HÀNG
                    </button>
                    <button className="w-12 h-12 rounded-md bg-gray-800 text-white hover:bg-gray-900 transition">
                      <i className="fa-regular fa-heart"></i>
                    </button>
                  </div>
                  <button 
                    onClick={handleBuyNow}
                    disabled={exceedsStock}
                    className={`w-full mt-4 px-3 py-3 rounded-lg font-bold transition uppercase ${
                      exceedsStock
                        ? 'bg-orange-300 text-orange-600 cursor-not-allowed'
                        : 'bg-brand-orange text-white hover:bg-orange-600'
                    }`}
                    title={exceedsStock ? `Số lượng vượt quá tồn kho (${maxStock} sản phẩm)` : ''}
                  >
                    MUA NGAY
                  </button>
                </>
              );
            })()}
          </div>

          {/* Description */}

          {/* Accordion Section */}
          <div className="mt-6 border-t border-gray-200">
            <AccordionItem
              title="THÔNG TIN SẢN PHẨM"
              isOpen={openAccordion === 'info'}
              onToggle={() => setOpenAccordion(openAccordion === 'info' ? null : 'info')}
            >
              <div className="space-y-2">
                <p><strong>Tên sản phẩm:</strong> {product.name}</p>
                <p><strong>Mã sản phẩm:</strong> {product.code || `SP${product.id}`}</p>
                {product.brand && <p><strong>Thương hiệu:</strong> {product.brand.name}</p>}
                {product.category && <p><strong>Danh mục:</strong> {product.category.name}</p>}
                {product.description && <p><strong>Mô tả:</strong> {product.description}</p>}
                <p><strong>Chất liệu:</strong> Canvas cao cấp, đế cao su bền bỉ</p>
                <p><strong>Xuất xứ:</strong> Việt Nam</p>
              </div>
            </AccordionItem>

            <AccordionItem
              title="QUI ĐỊNH ĐỔI SẢN PHẨM"
              isOpen={openAccordion === 'exchange'}
              onToggle={() => setOpenAccordion(openAccordion === 'exchange' ? null : 'exchange')}
            >
              <div className="space-y-2">
                <p>• Sản phẩm còn nguyên tem, mác, chưa qua sử dụng</p>
                <p>• Thời gian đổi hàng trong vòng 7 ngày kể từ ngày mua</p>
                <p>• Mang theo hóa đơn mua hàng khi đến đổi</p>
                <p>• Sản phẩm đổi phải có giá trị bằng hoặc cao hơn sản phẩm cũ</p>
                <p>• Không áp dụng đổi với các sản phẩm sale off</p>
                <p><strong>Lưu ý:</strong> Chỉ đổi size và màu, không đổi mẫu</p>
              </div>
            </AccordionItem>

            <AccordionItem
              title="BẢO HÀNH THẾ NÀO"
              isOpen={openAccordion === 'warranty'}
              onToggle={() => setOpenAccordion(openAccordion === 'warranty' ? null : 'warranty')}
            >
              <div className="space-y-2">
                <p><strong>Thời gian bảo hành:</strong> 6 tháng kể từ ngày mua hàng</p>
                <p><strong>Điều kiện bảo hành:</strong></p>
                <p>• Sản phẩm bị lỗi do nhà sản xuất (đế bung, chỉ đứt, hở keo...)</p>
                <p>• Còn trong thời gian bảo hành</p>
                <p>• Có hóa đơn mua hàng hợp lệ</p>
                <p><strong>Không bảo hành:</strong></p>
                <p>• Sản phẩm bị hư hỏng do sử dụng không đúng cách</p>
                <p>• Giày bị mòn, bẩn, hao mòn tự nhiên</p>
                <p>• Sản phẩm đã qua sửa chữa bởi bên thứ ba</p>
              </div>
            </AccordionItem>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-14 border-t pt-8">
          <h3 className="text-lg font-bold uppercase mb-6 text-center">SẢN PHẨM LIÊN QUAN</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map(p => (
              <Link 
                key={p.id} 
                to={`/product/${p.slug || p.id}`}
                className="group bg-white border border-gray-200 rounded overflow-hidden hover:shadow-md transition-all no-underline"
                onClick={() => window.scrollTo(0, 0)}
              >
                <div className="bg-[#f5f5f5] aspect-square p-3 flex items-center justify-center">
                  <img 
                    src={p.image || p.images?.[0]} 
                    alt={p.name}
                    className="w-full h-full object-contain transition-transform group-hover:scale-105" 
                  />
                </div>
                <div className="p-3 bg-white">
                  <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">
                    {p.brand?.name || 'Chính hãng'}
                  </p>
                  <h3 className="text-[13px] font-medium text-gray-800 mb-2 line-clamp-2 min-h-[36px] leading-[18px]">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {p.price_sale && p.price_sale < p.price ? (
                      <>
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(p.price)}
                        </span>
                        <span className="text-sm font-bold text-[#ff6600]">
                          {formatPrice(p.price_sale)}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-bold text-gray-900">
                        {formatPrice(p.price)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New Products */}
      {newProducts.length > 0 && (
        <section className="mt-10 border-t pt-8">
          <h3 className="text-lg font-bold uppercase mb-6 text-center">SẢN PHẨM MỚI NHẤT</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {newProducts.map(p => (
              <Link 
                key={p.id} 
                to={`/product/${p.slug || p.id}`}
                className="group bg-white border border-gray-200 rounded overflow-hidden hover:shadow-md transition-all no-underline"
                onClick={() => window.scrollTo(0, 0)}
              >
                <div className="bg-[#f5f5f5] aspect-square p-3 flex items-center justify-center">
                  <img 
                    src={p.image || p.images?.[0]} 
                    alt={p.name}
                    className="w-full h-full object-contain transition-transform group-hover:scale-105" 
                  />
                </div>
                <div className="p-3 bg-white">
                  <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">
                    {p.brand?.name || 'Chính hãng'}
                  </p>
                  <h3 className="text-[13px] font-medium text-gray-800 mb-2 line-clamp-2 min-h-[36px] leading-[18px]">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {p.price_sale && p.price_sale < p.price ? (
                      <>
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(p.price)}
                        </span>
                        <span className="text-sm font-bold text-[#ff6600]">
                          {formatPrice(p.price_sale)}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-bold text-gray-900">
                        {formatPrice(p.price)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
    </>
  );
};

export default ProductDetail;
