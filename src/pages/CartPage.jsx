  import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore } from '@store';
import { VoucherInput, SEO, LoginModal, RegisterModal } from '@components';
import { getCart, updateCartItem, removeFromCartAPI, clearCartAPI } from '@services/api';
import { formatPrice } from '@lib/formatters';

const CartPage = () => {
  const navigate = useNavigate();
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotalPrice, 
    showToast
  } = useCartStore();
  
  const { isAuthenticated } = useAuthStore();

  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  
  // Stock validation state
  const [canCheckout, setCanCheckout] = useState(true);
  const [checkoutMessage, setCheckoutMessage] = useState(null);
  const [invalidItemsCount, setInvalidItemsCount] = useState(0);
  
  // Debounce timer refs cho input quantity
  const debounceTimers = useRef({});

  // Helper function để format items từ API response
  const formatApiItems = (apiItems) => {
    return apiItems.map(apiItem => {
      // Tự động điều chỉnh quantity về stock nếu vượt quá
      let adjustedQuantity = apiItem.quantity || 1;
      if (apiItem.stock !== undefined && adjustedQuantity > apiItem.stock) {
        adjustedQuantity = apiItem.stock;
        console.log(`⚠️ Adjusting quantity for item ${apiItem.id}: ${apiItem.quantity} → ${apiItem.stock} (max stock)`);
      }
      
      return {
        ...apiItem,
        cartItemId: apiItem.id,
        backend_id: apiItem.id,
        id: apiItem.product_id,
        name: apiItem.product_name,
        slug: apiItem.product_slug,
        price: apiItem.price || apiItem.sale_price || apiItem.original_price || 0,
        price_sale: apiItem.sale_price || apiItem.price,
        original_price: apiItem.original_price,
        variant_id: apiItem.variant_id,
        size: apiItem.size?.name || apiItem.size || '42',
        size_id: apiItem.size?.id || apiItem.size_id,
        color: apiItem.color?.name || apiItem.color || 'Black',
        color_id: apiItem.color?.id || apiItem.color_id,
        color_name: apiItem.color?.name || apiItem.color || 'Black',
        quantity: adjustedQuantity,
        stock: apiItem.stock,
        stock_status: apiItem.stock_status || 'available', // 'available', 'insufficient', 'out_of_stock'
        can_checkout: apiItem.can_checkout !== undefined ? apiItem.can_checkout : true,
        stock_warning: apiItem.stock_warning || null,
        in_stock: apiItem.in_stock !== undefined ? apiItem.in_stock : true,
        image: apiItem.image,
        images: apiItem.image ? [apiItem.image] : [],
        brand: apiItem.brand,
        brand_name: apiItem.brand?.name,
        brand_id: apiItem.brand?.id,
        discount: apiItem.discount || 0,
        discount_percent: apiItem.discount_percent || 0,
        subtotal: apiItem.subtotal || ((apiItem.price || apiItem.sale_price || apiItem.original_price || 0) * adjustedQuantity)
      };
    });
  };

  // Debug: Log items khi component mount hoặc items thay đổi
  useEffect(() => {
    console.log('🛒 CartPage - Items from store:', {
      itemsCount: items.length,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        cartItemId: item.cartItemId,
        backend_id: item.backend_id,
        variant_id: item.variant_id
      })),
      isAuthenticated
    });
  }, [items, isAuthenticated]);

  // Đồng bộ giỏ hàng từ backend khi user đã đăng nhập
  useEffect(() => {
    const syncCartFromAPI = async () => {
      if (!isAuthenticated) {
        // Khi chưa đăng nhập, items từ local storage sẽ tự động được load từ zustand persist
        console.log('🛒 CartPage - User not authenticated, using local storage items:', items.length);
        return; // Chỉ sync khi đã đăng nhập
      }

      try {
        const apiCartData = await getCart();
        
        // API trả về object với format: { items: [], total_items: 0, total_amount: 0, count: 0, can_checkout: true, checkout_message: null }
        const apiItems = apiCartData?.items || [];
        
        // Cập nhật stock validation state
        setCanCheckout(apiCartData?.can_checkout !== undefined ? apiCartData.can_checkout : true);
        setCheckoutMessage(apiCartData?.checkout_message || null);
        setInvalidItemsCount(apiCartData?.invalid_items_count || 0);
        
        // Nếu API trả về dữ liệu, ưu tiên dùng API (vì đã đăng nhập)
        if (apiItems && Array.isArray(apiItems) && apiItems.length > 0) {
          // Chuyển đổi format từ API sang format local storage (đã tự động điều chỉnh quantity)
          const formattedItems = formatApiItems(apiItems);
          
          // Khi đã đăng nhập, ưu tiên dùng cart từ API
          // Chỉ giữ các item local không có variant_id (chưa sync) và không trùng với API
          const currentItems = useCartStore.getState().items;
          const localItemsNotInAPI = currentItems.filter(localItem => {
            // Bỏ qua items đã có backend_id (đã sync)
            if (localItem.backend_id) {
              return false;
            }
            // Chỉ giữ items không trùng với API (so sánh theo product_id + variant_id + size)
            const existsInAPI = formattedItems.some(apiItem => {
              const sameProduct = apiItem.id === localItem.id;
              const sameVariant = apiItem.variant_id && localItem.variant_id 
                ? apiItem.variant_id === localItem.variant_id 
                : true;
              const sameSize = apiItem.size === localItem.size || 
                              apiItem.size?.name === localItem.size ||
                              (typeof apiItem.size === 'string' && typeof localItem.size === 'string' && apiItem.size === localItem.size);
              return sameProduct && sameVariant && sameSize;
            });
            return !existsInAPI;
          });

          // Merge: API items trước, local items chưa sync sau
          // Điều chỉnh quantity cho local items nếu có stock info
          const adjustedLocalItems = localItemsNotInAPI.map(item => {
            if (item.stock !== undefined && item.quantity > item.stock) {
              console.log(`⚠️ Auto-adjusting local item quantity: ${item.quantity} → ${item.stock}`);
              return {
                ...item,
                quantity: item.stock
              };
            }
            return item;
          });
          
          const mergedItems = [...formattedItems, ...adjustedLocalItems];

          // Cập nhật store với merged items
          useCartStore.setState({ items: mergedItems });
          
          console.log('✅ Cart synced from API:', {
            apiItems: apiItems.length,
            formattedItems: formattedItems.length,
            localItemsNotInAPI: localItemsNotInAPI.length,
            mergedItems: mergedItems.length,
            total_amount: apiCartData.total_amount,
            can_checkout: apiCartData.can_checkout,
            invalid_items_count: apiCartData.invalid_items_count
          });
        } else if (apiItems && Array.isArray(apiItems) && apiItems.length === 0) {
          // Nếu API trả về empty, xóa tất cả items đã sync (giữ local items chưa sync)
          const currentItems = useCartStore.getState().items;
          const localItemsNotSynced = currentItems.filter(item => !item.backend_id);
          useCartStore.setState({ items: localItemsNotSynced });
          // Reset stock validation state
          setCanCheckout(true);
          setCheckoutMessage(null);
          setInvalidItemsCount(0);
          console.log('✅ Cart cleared from API, kept local items:', localItemsNotSynced.length);
        }
      } catch (error) {
        console.error('Error syncing cart from API:', error);
        // Nếu lỗi, vẫn dùng local storage và reset validation state
        setCanCheckout(true);
        setCheckoutMessage(null);
        setInvalidItemsCount(0);
      }
    };

    syncCartFromAPI();
  }, [isAuthenticated]); // Chỉ chạy khi authentication status thay đổi

  // Auto-refresh stock validation khi items thay đổi (nếu đã đăng nhập)
  useEffect(() => {
    const refreshStockValidation = async () => {
      if (!isAuthenticated || items.length === 0) {
        return;
      }

      // Chỉ refresh nếu có ít nhất 1 item có backend_id (đã sync với API)
      const hasSyncedItems = items.some(item => item.backend_id);
      if (!hasSyncedItems) {
        return; // Chưa có items sync với API, không cần check
      }

      try {
        const apiCartData = await getCart();
        if (apiCartData) {
          setCanCheckout(apiCartData.can_checkout !== undefined ? apiCartData.can_checkout : true);
          setCheckoutMessage(apiCartData.checkout_message || null);
          setInvalidItemsCount(apiCartData.invalid_items_count || 0);
          
          // Cập nhật stock info cho các items từ API response
          if (apiCartData.items && Array.isArray(apiCartData.items) && apiCartData.items.length > 0) {
            const formattedItems = formatApiItems(apiCartData.items);
            const currentItems = useCartStore.getState().items;
            
            // Cập nhật stock info cho items đã sync và điều chỉnh quantity nếu cần
            const updatedItems = currentItems.map(item => {
              if (item.backend_id) {
                const apiItem = formattedItems.find(api => api.backend_id === item.backend_id);
                if (apiItem) {
                  // Nếu quantity hiện tại > stock, điều chỉnh về stock
                  let adjustedQuantity = item.quantity;
                  if (apiItem.stock !== undefined && item.quantity > apiItem.stock) {
                    adjustedQuantity = apiItem.stock;
                    console.log(`⚠️ Auto-adjusting quantity for item ${item.id}: ${item.quantity} → ${apiItem.stock}`);
                  }
                  
                  return {
                    ...item,
                    quantity: adjustedQuantity,
                    stock: apiItem.stock,
                    stock_status: apiItem.stock_status,
                    can_checkout: apiItem.can_checkout,
                    stock_warning: apiItem.stock_warning,
                    in_stock: apiItem.in_stock
                  };
                }
              } else {
                // Với local items chưa sync, cũng kiểm tra và điều chỉnh nếu có stock info
                if (item.stock !== undefined && item.quantity > item.stock) {
                  console.log(`⚠️ Auto-adjusting local item quantity: ${item.quantity} → ${item.stock}`);
                  return {
                    ...item,
                    quantity: item.stock
                  };
                }
              }
              return item;
            });
            
            useCartStore.setState({ items: updatedItems });
          }
        }
      } catch (error) {
        console.error('Error refreshing stock validation:', error);
      }
    };

    // Debounce refresh để tránh gọi quá nhiều
    const timeoutId = setTimeout(() => {
      refreshStockValidation();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [items.length, isAuthenticated]); // Refresh khi items.length thay đổi

  // Khi đăng nhập thành công và có pending checkout, chuyển đến trang checkout
  useEffect(() => {
    if (isAuthenticated && pendingCheckout && items.length > 0 && acceptPolicy) {
      setPendingCheckout(false);
      setShowLoginModal(false);
      setShowRegisterModal(false);
      navigate('/checkout');
    }
  }, [isAuthenticated, pendingCheckout, items.length, acceptPolicy, navigate]);

  // Helper function để xử lý update quantity với optimistic update
  const handleUpdateQuantity = useCallback(async (item, newQty, optimistic = true) => {
    const oldQty = item.quantity || 1;
    
    // Tự động điều chỉnh quantity về stock nếu vượt quá
    let adjustedQty = newQty;
    if (item.stock !== undefined && newQty > item.stock) {
      adjustedQty = item.stock;
      console.log(`⚠️ Adjusting quantity for item ${item.id}: ${newQty} → ${item.stock} (max stock)`);
      if (adjustedQty !== oldQty) {
        showToast(`Số lượng đã được điều chỉnh về ${item.stock} (tối đa trong kho)`, 'warning');
      }
    }
    
    // Optimistic update: Update UI ngay lập tức với quantity đã điều chỉnh
    if (optimistic) {
      updateQuantity(item.cartItemId, adjustedQty);
    }
    
          // Nếu có backend_id, sync với API (background)
    if (isAuthenticated && item.backend_id) {
      try {
        const result = await updateCartItem(item.backend_id, { quantity: adjustedQty });
        
        // Refresh cart để lấy stock validation mới
        const apiCartData = await getCart();
        if (apiCartData) {
          setCanCheckout(apiCartData.can_checkout !== undefined ? apiCartData.can_checkout : true);
          setCheckoutMessage(apiCartData.checkout_message || null);
          setInvalidItemsCount(apiCartData.invalid_items_count || 0);
        }
        
        // Xử lý response từ API
        if (result) {
          // Nếu item bị xóa vì variant không hợp lệ
          if (result.removed === true) {
            showToast('Sản phẩm đã bị xóa vì không còn hợp lệ', 'warning');
            // Đồng bộ lại cart từ API
            if (apiCartData?.items) {
              const formattedItems = formatApiItems(apiCartData.items);
              // Giữ lại local items chưa sync
              const currentItems = useCartStore.getState().items;
              const localItemsNotSynced = currentItems.filter(i => !i.backend_id);
              useCartStore.setState({ items: [...formattedItems, ...localItemsNotSynced] });
            } else {
              // Nếu API trả về empty, chỉ giữ local items chưa sync
              const currentItems = useCartStore.getState().items;
              const localItemsNotSynced = currentItems.filter(i => !i.backend_id);
              useCartStore.setState({ items: localItemsNotSynced });
            }
            return;
          }
          
          // Nếu không đủ hàng, rollback và cập nhật quantity theo stock thực tế
          if (result.available_stock !== undefined && result.available_stock < newQty) {
            const actualQty = result.data?.quantity || result.available_stock;
            showToast(`Chỉ còn ${result.available_stock} sản phẩm trong kho`, 'warning');
            updateQuantity(item.cartItemId, actualQty);
            
            // Cập nhật item từ response
            if (result.data) {
              const updatedItem = {
                ...item,
                quantity: actualQty,
                price: result.data.price || result.data.sale_price || item.price,
                stock: result.data.stock,
                stock_status: result.data.stock_status || 'insufficient',
                can_checkout: result.data.can_checkout !== undefined ? result.data.can_checkout : false,
                stock_warning: result.data.stock_warning || null,
                in_stock: result.data.in_stock
              };
              useCartStore.setState({
                items: useCartStore.getState().items.map(i => 
                  i.cartItemId === item.cartItemId ? updatedItem : i
                )
              });
            }
            return;
          }
          
          // Cập nhật item từ response nếu có (để sync giá, stock, etc.)
          if (result.data) {
            const updatedItem = {
              ...item,
              quantity: result.data.quantity || newQty,
              price: result.data.price || result.data.sale_price || item.price,
              stock: result.data.stock,
              stock_status: result.data.stock_status || 'available',
              can_checkout: result.data.can_checkout !== undefined ? result.data.can_checkout : true,
              stock_warning: result.data.stock_warning || null,
              in_stock: result.data.in_stock
            };
            useCartStore.setState({
              items: useCartStore.getState().items.map(i => 
                i.cartItemId === item.cartItemId ? updatedItem : i
              )
            });
          }
        }
      } catch (error) {
        console.error('Error updating cart item in backend:', error);
        // Rollback về quantity cũ nếu API fail
        if (optimistic) {
          updateQuantity(item.cartItemId, oldQty);
        }
        showToast(error.message || 'Có lỗi xảy ra khi cập nhật số lượng', 'error');
      }
    }
    // Nếu không có backend_id hoặc chưa đăng nhập, chỉ update local (đã update ở trên)
  }, [isAuthenticated, updateQuantity, showToast, formatApiItems]);
  
  // Debounced version cho input onChange
  const handleQuantityInputChange = useCallback((item, newQty) => {
    // Clear previous timer
    if (debounceTimers.current[item.cartItemId]) {
      clearTimeout(debounceTimers.current[item.cartItemId]);
    }
    
    // Tự động điều chỉnh quantity về stock nếu vượt quá
    let adjustedQty = newQty;
    if (item.stock !== undefined && newQty > item.stock) {
      adjustedQty = item.stock;
      if (adjustedQty !== item.quantity) {
        showToast(`Số lượng đã được điều chỉnh về ${item.stock} (tối đa trong kho)`, 'warning');
      }
    }
    
    // Update UI ngay lập tức (optimistic) với quantity đã điều chỉnh
    updateQuantity(item.cartItemId, adjustedQty);
    
    // Debounce API call (500ms)
    debounceTimers.current[item.cartItemId] = setTimeout(() => {
      handleUpdateQuantity(item, adjustedQty, false); // false = đã update UI rồi
      delete debounceTimers.current[item.cartItemId];
    }, 500);
  }, [updateQuantity, handleUpdateQuantity, showToast]);
  
  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  const handleCheckout = () => {
    if (items.length === 0) {
      showToast('Giỏ hàng của bạn đang trống', 'error');
      return;
    }
    if (!acceptPolicy) {
      showToast('Vui lòng đồng ý với điều khoản', 'error');
      return;
    }
    
    // Kiểm tra stock validation
    if (!canCheckout) {
      showToast(checkoutMessage || 'Có sản phẩm không đủ số lượng, vui lòng kiểm tra lại', 'error');
      return;
    }
    
    // Kiểm tra đăng nhập
    if (!isAuthenticated) {
      // Thông báo cần đăng nhập
      showToast('Vui lòng đăng nhập để tiếp tục thanh toán', 'warning');
      // Đánh dấu là đang chờ checkout sau khi đăng nhập
      setPendingCheckout(true);
      // Hiển thị modal đăng nhập
      setShowLoginModal(true);
      return;
    }
    
    // Chuyển sang trang thanh toán
    navigate('/checkout');
  };

  // formatPrice is now imported from @lib/formatters
  // Helper to format price number only (without suffix) for display with custom suffix
  const formatPriceNumber = useCallback((price) => {
    if (!price || isNaN(price) || price === 0) {
      return '0';
    }
    return price.toLocaleString('vi-VN');
  }, []);
  
  // Memoize total price calculation để tránh tính lại không cần thiết
  const totalPrice = useMemo(() => {
    return getTotalPrice();
  }, [items]); // items thay đổi sẽ trigger tính lại
  
  // Memoize total với voucher discount
  const finalTotal = useMemo(() => {
    return totalPrice - (appliedVoucher?.discount_amount || 0);
  }, [totalPrice, appliedVoucher]);

  if (items.length === 0) {
  return (
    <div className="py-10 min-h-[500px]">
      <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-2xl font-bold mb-8 uppercase text-gray-900">
            GIỎ HÀNG CỦA BẠN
        </h1>
          <div className="bg-white rounded-lg p-12 text-center shadow-sm border">
            <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-lg text-gray-600 mb-6">Giỏ hàng của bạn đang trống</p>
            <Link 
              to="/products" 
              className="inline-block bg-[#ff6600] text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition uppercase no-underline"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Giỏ hàng - ANKH Store"
        description="Giỏ hàng của bạn tại ANKH. Xem lại sản phẩm đã chọn, áp dụng mã giảm giá và tiến hành thanh toán."
        keywords="giỏ hàng, cart, mua giày, thanh toán, ANKH"
      />
    <div className="py-6 md:py-8 min-h-screen bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold uppercase text-gray-900">
            Giỏ Hàng
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {items.length} {items.length === 1 ? 'sản phẩm' : 'sản phẩm'} trong giỏ hàng
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* LEFT: Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="flex items-center justify-between p-4 md:p-5 border-b bg-gray-50">
                <h2 className="text-base md:text-lg font-bold uppercase text-gray-900">
                  Sản Phẩm
                </h2>
                {selectedItems.size > 0 && (
                <button
                  onClick={() => {
                      // Delete selected items
                      const itemsToDelete = items.filter(item => selectedItems.has(item.cartItemId));
                      itemsToDelete.forEach(item => {
                        removeFromCart(item.cartItemId);
                        if (isAuthenticated && item.backend_id) {
                          removeFromCartAPI(item.backend_id).catch(console.error);
                        }
                      });
                      setSelectedItems(new Set());
                      showToast(`Đã xóa ${itemsToDelete.length} sản phẩm`, 'success');
                    }}
                    className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Xóa ({selectedItems.size})
                  </button>
                )}
              </div>

              {/* Stock Warning Banner */}
              {!canCheckout && checkoutMessage && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-4 rounded">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-yellow-800">{checkoutMessage}</p>
                      {invalidItemsCount > 0 && (
                        <p className="text-xs text-yellow-700 mt-1">
                          Có {invalidItemsCount} sản phẩm không đủ số lượng trong kho
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b font-semibold text-sm text-gray-700">
                <div className="col-span-5 flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-[#ff6600] border-gray-300 rounded focus:ring-[#ff6600] cursor-pointer"
                    checked={items.length > 0 && items.length === selectedItems.size}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(new Set(items.map(item => item.cartItemId)));
                    } else {
                        setSelectedItems(new Set());
                      }
                    }}
                  />
                  <span>Sản Phẩm ({items.length})</span>
                </div>
                <div className="col-span-2 text-center flex items-center justify-center">Đơn Giá</div>
                <div className="col-span-2 text-center flex items-center justify-center">Số Lượng</div>
                <div className="col-span-2 text-center flex items-center justify-center">Số Tiền</div>
                <div className="col-span-1 text-center flex items-center justify-center">Thao Tác</div>
              </div>

              {/* Cart Items */}
              <div className="divide-y">
                {items.map((item) => {
                  const isInvalidItem = item.can_checkout === false || item.stock_status === 'insufficient' || item.stock_status === 'out_of_stock';
                  const itemPrice = item.price || item.price_sale || item.original_price || 0;
                  const itemSubtotal = itemPrice * (item.quantity || 1);
                  
                  return (
                  <div 
                    key={item.cartItemId} 
                    className={`p-3 md:p-4 transition ${
                      isInvalidItem 
                        ? 'bg-red-50 border-l-4 border-red-400' 
                        : 'hover:bg-gray-50 border-b border-gray-200'
                    }`}
                  >
                    {/* Mobile Layout - Stack */}
                    <div className="md:hidden space-y-3">
                      {/* Top Row: Checkbox + Image + Product Info */}
                      <div className="flex gap-3">
                    <input 
                      type="checkbox" 
                          className="w-5 h-5 mt-1 text-[#ff6600] border-gray-300 rounded focus:ring-[#ff6600] flex-shrink-0 cursor-pointer"
                          checked={selectedItems.has(item.cartItemId)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedItems);
                            if (e.target.checked) {
                              newSelected.add(item.cartItemId);
                            } else {
                              newSelected.delete(item.cartItemId);
                            }
                            setSelectedItems(newSelected);
                          }}
                        />
                        <Link 
                          to={`/product/${item.slug || item.id}`}
                          className="flex-shrink-0"
                        >
                    <img 
                      src={item.image || item.images?.[0]} 
                      alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg bg-gray-100 border border-gray-200" 
                    />
                        </Link>
                    <div className="flex-1 min-w-0">
                          <Link 
                            to={`/product/${item.slug || item.id}`}
                            className="no-underline"
                          >
                            <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                        {item.name}
                      </h4>
                          </Link>
                          
                          {/* Variant Info */}
                          <div className="mb-1 text-xs text-gray-600">
                            <span>Màu: {item.color_name || item.color?.name || item.color || 'Black'}</span>
                            <span className="mx-1">|</span>
                            <span>Size: {item.size?.name || item.size || '42'}</span>
                        </div>
                        
                          {/* Stock Info */}
                          {item.stock !== undefined && (
                            <p className={`text-xs font-medium mb-2 ${
                              item.stock_status === 'insufficient' || item.stock_status === 'out_of_stock'
                                ? 'text-red-600'
                                : item.stock < 5
                                ? 'text-orange-600'
                                : 'text-green-600'
                            }`}>
                              {item.stock_status === 'out_of_stock' 
                                ? '❌ Hết hàng' 
                                : item.stock_status === 'insufficient'
                                ? `⚠️ Chỉ còn ${item.stock}`
                                : item.stock < 5
                                ? `⚡ Còn ${item.stock}`
                                : `✓ Còn ${item.stock}`}
                            </p>
                          )}
                          
                          {/* Price */}
                          <div className="mb-2">
                            {item.original_price && item.original_price > itemPrice && (
                              <span className="text-gray-400 line-through text-xs mr-2">
                                {formatPriceNumber(item.original_price)}₫
                              </span>
                            )}
                            <span className="text-[#ff6600] font-bold text-base">
                              {formatPriceNumber(itemPrice)}₫
                            </span>
                        </div>
                      </div>
                    </div>

                      {/* Bottom Row: Quantity + Subtotal + Delete */}
                      <div className="flex items-center justify-between gap-3 pl-8">
                        {/* Quantity */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 font-medium">SL:</span>
                          <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white">
                            <button 
                              onClick={() => handleUpdateQuantity(item, Math.max(1, (item.quantity || 1) - 1))}
                              className="w-10 h-10 flex items-center justify-center bg-white text-gray-700 active:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-r border-gray-200 touch-manipulation"
                              disabled={item.quantity <= 1}
                              aria-label="Giảm số lượng"
                            >
                              <span className="text-xl leading-none font-medium">−</span>
                            </button>
                            <input 
                              type="number"
                              min="1"
                              max={item.stock !== undefined ? Math.min(99, item.stock) : 99}
                              value={item.quantity || 1}
                              onChange={(e) => {
                                const maxQty = item.stock !== undefined ? Math.min(99, item.stock) : 99;
                                const newQty = Math.max(1, Math.min(maxQty, parseInt(e.target.value) || 1));
                                handleQuantityInputChange(item, newQty);
                              }}
                              className={`w-12 text-center outline-none text-base font-semibold border-x border-gray-200 py-2 bg-white text-gray-900 ${
                                isInvalidItem ? 'text-red-600' : ''
                              }`}
                              aria-label="Số lượng"
                            />
                            <button 
                              onClick={() => {
                                const maxQty = item.stock !== undefined ? Math.min(99, item.stock) : 99;
                                handleUpdateQuantity(item, Math.min(maxQty, (item.quantity || 1) + 1));
                              }}
                              className="w-10 h-10 flex items-center justify-center bg-white text-gray-700 active:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-l border-gray-200 touch-manipulation"
                              disabled={
                                item.quantity >= 99 || 
                                (item.stock !== undefined && item.quantity >= item.stock)
                              }
                              aria-label="Tăng số lượng"
                            >
                              <span className="text-xl leading-none font-medium">+</span>
                            </button>
                          </div>
                        </div>
                        
                        {/* Subtotal */}
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-gray-600">Thành tiền:</span>
                          <span className="text-[#ff6600] font-bold text-base">
                            {formatPriceNumber(itemSubtotal)}₫
                          </span>
                        </div>
                        
                        {/* Delete Button */}
                    <button 
                          onClick={async () => {
                            const productName = item.name;
                            
                            if (isAuthenticated && item.backend_id) {
                              try {
                                const result = await removeFromCartAPI(item.backend_id);
                                removeFromCart(item.cartItemId);
                                
                                const apiCartData = await getCart();
                                if (apiCartData) {
                                  setCanCheckout(apiCartData.can_checkout !== undefined ? apiCartData.can_checkout : true);
                                  setCheckoutMessage(apiCartData.checkout_message || null);
                                  setInvalidItemsCount(apiCartData.invalid_items_count || 0);
                                }
                                
                                if (result) {
                                  if (result.message) {
                                    showToast(result.message, 'success');
                                  } else if (result.product_name) {
                                    showToast(`Đã xóa "${result.product_name}" khỏi giỏ hàng`, 'success');
                                  } else {
                                    showToast(`Đã xóa "${productName}" khỏi giỏ hàng`, 'success');
                                  }
                                } else {
                                  showToast(`Đã xóa "${productName}" khỏi giỏ hàng`, 'success');
                                }
                              } catch (error) {
                                console.error('Error removing cart item from backend:', error);
                                showToast(error.message || 'Có lỗi xảy ra khi xóa sản phẩm', 'error');
                              }
                            } else {
                              removeFromCart(item.cartItemId);
                              showToast(`Đã xóa "${productName}" khỏi giỏ hàng`, 'success');
                            }
                            
                            const newSelected = new Set(selectedItems);
                            newSelected.delete(item.cartItemId);
                            setSelectedItems(newSelected);
                          }}
                          className="p-2 text-red-600 active:bg-red-50 rounded transition"
                          aria-label="Xóa sản phẩm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                    </div>

                    {/* Desktop Layout - Grid */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                      {/* Sản Phẩm Column */}
                      <div className="col-span-5 flex gap-3 items-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-[#ff6600] border-gray-300 rounded focus:ring-[#ff6600] flex-shrink-0 cursor-pointer"
                          checked={selectedItems.has(item.cartItemId)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedItems);
                            if (e.target.checked) {
                              newSelected.add(item.cartItemId);
                            } else {
                              newSelected.delete(item.cartItemId);
                            }
                            setSelectedItems(newSelected);
                          }}
                        />
                        <Link 
                          to={`/product/${item.slug || item.id}`}
                          className="flex-shrink-0"
                        >
                          <img 
                            src={item.image || item.images?.[0]} 
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg bg-gray-100 hover:opacity-90 transition cursor-pointer border border-gray-200" 
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/product/${item.slug || item.id}`}
                            className="no-underline"
                          >
                            <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 hover:text-[#ff6600] transition">
                              {item.name}
                            </h4>
                          </Link>
                          
                          {/* Phân Loại Hàng */}
                          <div className="mb-1 text-xs text-gray-600">
                            <span>Màu: {item.color_name || item.color?.name || item.color || 'Black'}</span>
                            <span className="mx-1">|</span>
                            <span>Size: {item.size?.name || item.size || '42'}</span>
                          </div>
                          
                          {/* Stock Info */}
                          {item.stock !== undefined && (
                            <p className={`text-xs font-medium ${
                              item.stock_status === 'insufficient' || item.stock_status === 'out_of_stock'
                                ? 'text-red-600'
                                : item.stock < 5
                                ? 'text-orange-600'
                                : 'text-green-600'
                            }`}>
                              {item.stock_status === 'out_of_stock' 
                                ? '❌ Hết hàng' 
                                : item.stock_status === 'insufficient'
                                ? `⚠️ Chỉ còn ${item.stock}`
                                : item.stock < 5
                                ? `⚡ Còn ${item.stock}`
                                : `✓ Còn ${item.stock}`}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Đơn Giá Column */}
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          {item.original_price && item.original_price > itemPrice && (
                            <span className="text-gray-400 line-through text-xs">
                              {formatPriceNumber(item.original_price)}₫
                            </span>
                          )}
                          <span className="text-[#ff6600] font-bold text-base">
                            {formatPriceNumber(itemPrice)}₫
                          </span>
                          {item.discount_percent > 0 && (
                            <span className="text-xs text-green-600 font-semibold">
                              -{item.discount_percent}%
                            </span>
                          )}
                        </div>
              </div>

                      {/* Số Lượng Column */}
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white">
                          <button 
                            onClick={() => handleUpdateQuantity(item, Math.max(1, (item.quantity || 1) - 1))}
                            className="w-8 h-8 flex items-center justify-center bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white border-r border-gray-200"
                            disabled={item.quantity <= 1}
                            aria-label="Giảm số lượng"
                          >
                            <span className="text-lg leading-none">−</span>
                          </button>
                          <input 
                            type="number"
                            min="1"
                            max={item.stock !== undefined ? Math.min(99, item.stock) : 99}
                            value={item.quantity || 1}
                            onChange={(e) => {
                              const maxQty = item.stock !== undefined ? Math.min(99, item.stock) : 99;
                              const newQty = Math.max(1, Math.min(maxQty, parseInt(e.target.value) || 1));
                              handleQuantityInputChange(item, newQty);
                            }}
                            className={`w-10 text-center outline-none text-sm font-medium border-x border-gray-200 py-2 bg-white text-gray-900 focus:bg-gray-50 ${
                              isInvalidItem ? 'text-red-600' : ''
                            }`}
                            aria-label="Số lượng"
                          />
                <button
                            onClick={() => {
                              const maxQty = item.stock !== undefined ? Math.min(99, item.stock) : 99;
                              handleUpdateQuantity(item, Math.min(maxQty, (item.quantity || 1) + 1));
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white border-l border-gray-200"
                            disabled={
                              item.quantity >= 99 || 
                              (item.stock !== undefined && item.quantity >= item.stock)
                            }
                            title={
                              item.stock !== undefined && item.quantity >= item.stock
                                ? `Chỉ còn ${item.stock} sản phẩm`
                                : undefined
                            }
                            aria-label="Tăng số lượng"
                          >
                            <span className="text-lg leading-none">+</span>
                </button>
                        </div>
                      </div>

                      {/* Số Tiền Column */}
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          {item.original_price && item.original_price > itemPrice && (
                            <span className="text-gray-400 line-through text-xs">
                              {formatPriceNumber(item.original_price * (item.quantity || 1))}₫
                            </span>
                          )}
                          <span className="text-[#ff6600] font-bold text-base">
                            {formatPriceNumber(itemSubtotal)}₫
                          </span>
                        </div>
                      </div>

                      {/* Thao Tác Column */}
                      <div className="col-span-1 flex items-center justify-center">
                        <button
                          onClick={async () => {
                            const productName = item.name;
                            
                            if (isAuthenticated && item.backend_id) {
                              try {
                                const result = await removeFromCartAPI(item.backend_id);
                                removeFromCart(item.cartItemId);
                                
                                const apiCartData = await getCart();
                                if (apiCartData) {
                                  setCanCheckout(apiCartData.can_checkout !== undefined ? apiCartData.can_checkout : true);
                                  setCheckoutMessage(apiCartData.checkout_message || null);
                                  setInvalidItemsCount(apiCartData.invalid_items_count || 0);
                                }
                                
                                if (result) {
                                  if (result.message) {
                                    showToast(result.message, 'success');
                                  } else if (result.product_name) {
                                    showToast(`Đã xóa "${result.product_name}" khỏi giỏ hàng`, 'success');
                                  } else {
                                    showToast(`Đã xóa "${productName}" khỏi giỏ hàng`, 'success');
                                  }
                                } else {
                                  showToast(`Đã xóa "${productName}" khỏi giỏ hàng`, 'success');
                                }
                              } catch (error) {
                                console.error('Error removing cart item from backend:', error);
                                showToast(error.message || 'Có lỗi xảy ra khi xóa sản phẩm', 'error');
                              }
                            } else {
                              removeFromCart(item.cartItemId);
                              showToast(`Đã xóa "${productName}" khỏi giỏ hàng`, 'success');
                            }
                            
                            const newSelected = new Set(selectedItems);
                            newSelected.delete(item.cartItemId);
                            setSelectedItems(newSelected);
                          }}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded transition text-sm font-medium flex items-center gap-1"
                          title="Xóa sản phẩm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="hidden lg:inline">Xóa</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border sticky top-6">
              <div className="p-4 border-b">
                <h2 className="text-lg font-bold uppercase text-gray-900">
                  THÔNG TIN ĐƠN HÀNG
                </h2>
              </div>

              <div className="p-4 space-y-4">
                {/* Voucher Input Component */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    MÃ GIẢM GIÁ/ QUÀ TẶNG
                  </label>
                  <VoucherInput
                    orderValue={totalPrice}
                    onApply={setAppliedVoucher}
                    onRemove={() => setAppliedVoucher(null)}
                    appliedVoucher={appliedVoucher}
                    showToast={showToast}
                  />
                </div>

                {/* Price Summary */}
                <div className="space-y-3 py-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">TỔNG TIỀN SẢN PHẨM</span>
                    <span className="font-semibold">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">PHÍ GIAO HÀNG</span>
                    <span className="font-semibold">MIỄN PHÍ</span>
                  </div>
                  {appliedVoucher && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">VOUCHER ĐÃ DÙNG</span>
                      <span className="font-semibold text-green-600">-{formatPrice(appliedVoucher.discount_amount)}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center py-4 border-t border-gray-900">
                  <span className="text-sm font-bold text-gray-900">TẠM TÍNH</span>
                  <span className="text-xl font-bold text-[#ff6600]">
                    {formatPrice(finalTotal)}
                  </span>
                </div>

                {/* Policy Checkbox */}
                <div className="space-y-3 py-4 border-t">
                  <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptPolicy}
                      onChange={(e) => setAcceptPolicy(e.target.checked)}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <span>
                      TÔI MUỐN LƯU THÔNG TIN ĐỂ DÙNG SAU
                    </span>
                  </label>

                  <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 flex-shrink-0"
                    />
                    <span>
                      TÔI ĐỒNG Ý VỚI <span className="text-[#ff6600]">CHÍNH SÁCH HOẠT ĐỘNG</span> CỦA ANKH
                    </span>
                  </label>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={!acceptPolicy || items.length === 0 || !canCheckout}
                  className="w-full bg-[#ff6600] text-white py-3 rounded font-bold text-sm hover:bg-orange-700 transition uppercase disabled:bg-gray-300 disabled:cursor-not-allowed"
                  title={!canCheckout ? checkoutMessage : undefined}
                >
                  {items.length === 0 
                    ? 'GIỎ HÀNG TRỐNG' 
                    : !canCheckout 
                    ? 'KHÔNG THỂ THANH TOÁN' 
                    : 'TIẾP TỤC THANH TOÁN'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Login Modal */}
    <LoginModal 
      isOpen={showLoginModal}
      onClose={() => {
        setShowLoginModal(false);
        setPendingCheckout(false);
      }}
      onSwitchToRegister={() => {
        setShowLoginModal(false);
        setShowRegisterModal(true);
      }}
      message={pendingCheckout ? "Vui lòng đăng nhập để tiếp tục thanh toán" : null}
    />

    {/* Register Modal */}
    <RegisterModal 
      isOpen={showRegisterModal}
      onClose={() => setShowRegisterModal(false)}
      onSwitchToLogin={() => {
        setShowRegisterModal(false);
        setShowLoginModal(true);
      }}
    />
    </>
  );
};

export default CartPage;
