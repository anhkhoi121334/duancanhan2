import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Color name to hex code mapping
 * Map tên màu tiếng Việt sang mã hex để hiển thị
 */
const COLOR_NAME_TO_HEX = {
  'Đen': '#000000',
  'Đen Bóng': '#1a1a1a',
  'Trắng': '#FFFFFF',
  'Trắng Kem': '#FFF8E7',
  'Xám': '#808080',
  'Xám Nhạt': '#D3D3D3',
  'Xám Đậm': '#505050',
  'Đỏ': '#FF0000',
  'Đỏ Đậm': '#8B0000',
  'Đỏ Bordeaux': '#800020',
  'Hồng': '#FFC0CB',
  'Hồng Pastel': '#FFB6C1',
  'Hồng Đậm': '#FF1493',
  'Cam': '#FFA500',
  'Cam Đậm': '#FF8C00',
  'Vàng': '#FFFF00',
  'Vàng Chanh': '#FFF700',
  'Vàng Gold': '#FFD700',
  'Xanh Dương': '#0000FF',
  'Xanh Navy': '#000080',
  'Xanh Lơ': '#00CED1',
  'Xanh Lá': '#00FF00',
  'Xanh Rêu': '#2F4F2F',
  'Xanh Ngọc': '#40E0D0',
  'Xanh Da Trời': '#87CEEB',
  'Xanh Coban': '#0047AB',
  'Tím': '#800080',
  'Tím Pastel': '#DDA0DD',
  'Tím Than': '#4B0082',
  'Nâu': '#8B4513',
  'Nâu Nhạt': '#D2B48C',
  'Nâu Đậm': '#654321',
  'Be': '#F5F5DC',
  'Kem': '#FFF8DC',
  'Bạc': '#C0C0C0',
  'Chocolate': '#7B3F00',
  'Nude': '#E3BC9A',
  'Camo': '#78866B',
  'Họa Tiết': '#CCCCCC',
  'Multi-Color': '#FF6B6B',
};

/**
 * Featured options configuration
 */
const FEATURED_OPTIONS = [
  { value: 'bestseller', label: 'Top sản phẩm bán chạy' },
  { value: 'new', label: 'Top sản phẩm mới' },
  { value: 'sale', label: 'Flash Sale' },
  { value: 'limited', label: 'Limited Edition' },
];

/**
 * Fallback colors khi chưa có data từ API
 */
const FALLBACK_COLORS = [
  '#ddddda', '#f1f1ef', '#e2e2df', '#cfd9d2',
  '#1b5d58', '#1a606e', '#1f6b63', '#ead9bf',
  '#d9d9d7', '#ececeb', '#f0f0ee', '#f3efe0',
  '#e3f0d4', '#f9e9b3', '#f8efe5', '#a17dad',
  '#e3e3e1', '#d7d7d4', '#f8ead5', '#ffe7b5',
  '#ffd7cf', '#ffb7ac', '#f0512f', '#3e3a39',
];

/**
 * Category options configuration
 */
const CATEGORY_OPTIONS = [
  { value: 'Accessories', labelEn: 'Accessories', labelVi: 'Phụ kiện' },
  { value: 'Footwear', labelEn: 'Footwear', labelVi: 'Lên chân' },
  { value: 'Top', labelEn: 'Top', labelVi: 'Nửa trên' },
];

/**
 * Accessory options configuration
 */
const ACCESSORY_OPTIONS = ['Balo/Túi', 'Tất/Vớ', 'Mũ/Nón', 'Thắt lưng'];

/**
 * Sidebar component - Filter sidebar cho trang danh sách sản phẩm
 * @param {Object} props - Component props
 * @param {Array} props.brands - Danh sách thương hiệu
 * @param {Array} props.colors - Danh sách màu sắc
 * @param {Function} props.onBrandSelect - Handler khi chọn thương hiệu
 * @param {Function} props.onColorSelect - Handler khi chọn màu
 * @param {Function} props.onGenderSelect - Handler khi chọn giới tính
 * @param {Function} props.onCategorySelect - Handler khi chọn category
 * @param {Function} props.onAccessorySelect - Handler khi chọn phụ kiện
 * @param {Function} props.onFeaturedSelect - Handler khi chọn featured
 */
const Sidebar = ({ 
  brands = [], 
  colors = [],
  selectedBrand, 
  onBrandSelect,
  selectedGender,
  onGenderSelect,
  selectedColor,
  onColorSelect,
  selectedCategory,
  onCategorySelect,
  selectedAccessory,
  onAccessorySelect,
  selectedFeatured,
  onFeaturedSelect,
  selectedCategories = [],
  onCategoriesSelect,
  minPrice = '',
  maxPrice = '',
  onPriceChange,
  filters = {},
  dateFilter = '',
  onDateFilterChange,
  dayRange = 30,
  onDayRangeChange,
  selectedPriceRange = '',
  onPriceRangeSelect
}) => {
  /**
   * Map tên màu tiếng Việt sang hex code
   * @param {string} colorName - Tên màu
   * @returns {string} Hex color code
   */
  const colorNameToHex = (colorName) => {
    return COLOR_NAME_TO_HEX[colorName] || '#CCCCCC';
  };

  /**
   * Generic toggle handler for filters
   * @param {string} currentValue - Giá trị hiện tại
   * @param {string} newValue - Giá trị mới
   * @param {Function} setter - Setter function
   */
  const handleToggle = (currentValue, newValue, setter) => {
    setter(currentValue === newValue ? '' : newValue);
  };

  // Filter handlers
  const handleBrandClick = (brandId) => handleToggle(selectedBrand, brandId, onBrandSelect);
  const handleGenderClick = (gender) => handleToggle(selectedGender, gender, onGenderSelect);
  const handleFeaturedClick = (featured) => handleToggle(selectedFeatured, featured, onFeaturedSelect);
  const handleCategoryClick = (category) => handleToggle(selectedCategory, category, onCategorySelect);
  const handleAccessoryClick = (accessory) => handleToggle(selectedAccessory, accessory, onAccessorySelect);
  
  /**
   * Handle color click - convert to string for comparison
   */
  const handleColorClick = (colorId) => {
    const currentColor = String(selectedColor || '');
    const newColor = String(colorId);
    onColorSelect(currentColor === newColor ? '' : newColor);
  };

  /**
   * Handle category checkbox change for multiple selection
   */
  const handleCategoryCheckboxChange = (categoryValue) => {
    if (!onCategoriesSelect) return;
    
    const isSelected = selectedCategories.includes(categoryValue);
    let newCategories;
    
    if (isSelected) {
      newCategories = selectedCategories.filter(cat => cat !== categoryValue);
    } else {
      newCategories = [...selectedCategories, categoryValue];
    }
    
    onCategoriesSelect(newCategories);
  };

  /**
   * Handle price input change
   */
  const handlePriceInputChange = (type, value) => {
    if (onPriceChange) {
      onPriceChange(type, value);
    }
  };

  const handleClearAllFilters = () => {
    onGenderSelect('');
    onBrandSelect('');
    onColorSelect('');
    onCategorySelect('');
    onAccessorySelect('');
    onFeaturedSelect('');
    if (onCategoriesSelect) onCategoriesSelect([]);
    if (onPriceChange) {
      onPriceChange('min', '');
      onPriceChange('max', '');
    }
    if (onDateFilterChange) onDateFilterChange('');
    if (onDayRangeChange) onDayRangeChange(30);
    if (onPriceRangeSelect) onPriceRangeSelect('');
  };

  // Check if any filter is active
  const hasActiveFilters = selectedGender || selectedBrand || selectedColor || selectedCategory || selectedAccessory || selectedFeatured || 
    (selectedCategories && selectedCategories.length > 0) || minPrice || maxPrice || dateFilter || dayRange !== 30 || selectedPriceRange;

  return (
    <aside className="col-span-3 space-y-4 text-[14px] leading-6">

      <section className="bg-white">
        <h3 className="text-[#ff6600] font-bold uppercase tracking-wide text-[13px] text-center mb-3">
          DANH MỤC SẢN PHẨM
        </h3>
        <div className="border-t border-gray-300"></div>
        <div className="mt-3 space-y-3 text-gray-700">
          {CATEGORY_OPTIONS.map((category) => (
            <label key={category.value} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-orange-50 transition-colors">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.value)}
                onChange={() => handleCategoryCheckboxChange(category.value)}
                className="w-4 h-4 text-[#ff6600] border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#ff6600] focus:ring-offset-1 cursor-pointer accent-[#ff6600]"
              />
              <div className="flex items-center gap-2 flex-1">
                <span className={`text-sm font-medium transition-colors ${
                  selectedCategories.includes(category.value)
                    ? 'text-[#ff6600] font-bold' 
                    : 'text-gray-700 group-hover:text-[#ff6600]'
                }`}>
                  {category.labelEn}
                </span>
                <span className="text-gray-300 font-light">|</span>
                <span className={`text-sm transition-colors ${
                  selectedCategories.includes(category.value)
                    ? 'text-[#ff6600] font-semibold' 
                    : 'text-gray-600 group-hover:text-[#ff6600]'
                }`}>
                  {category.labelVi}
                </span>
              </div>
            </label>
          ))}
        </div>
        <div className="mt-3 border-t border-gray-300"></div>
      </section>

      <section>
        <div className="border-t border-dashed border-gray-300 my-2"></div>
        <h3 className="text-[#ff6600] font-bold uppercase tracking-wide text-[13px]">GIỚI TÍNH</h3>
        <div className="mt-3 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-orange-50 transition-colors">
            <input
              type="radio"
              name="gender"
              checked={selectedGender === 'Nam'}
              onChange={() => handleGenderClick('Nam')}
              className="w-4 h-4 text-[#ff6600] border-2 border-gray-300 focus:ring-2 focus:ring-[#ff6600] focus:ring-offset-1 cursor-pointer accent-[#ff6600]"
            />
            <span className={`text-sm font-medium transition-colors ${
              selectedGender === 'Nam' 
                ? 'text-[#ff6600] font-bold' 
                : 'text-gray-700 group-hover:text-[#ff6600]'
            }`}>
              Nam
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-orange-50 transition-colors">
            <input
              type="radio"
              name="gender"
              checked={selectedGender === 'Nữ'}
              onChange={() => handleGenderClick('Nữ')}
              className="w-4 h-4 text-[#ff6600] border-2 border-gray-300 focus:ring-2 focus:ring-[#ff6600] focus:ring-offset-1 cursor-pointer accent-[#ff6600]"
            />
            <span className={`text-sm font-medium transition-colors ${
              selectedGender === 'Nữ' 
                ? 'text-[#ff6600] font-bold' 
                : 'text-gray-700 group-hover:text-[#ff6600]'
            }`}>
              Nữ
            </span>
          </label>
        </div>
      </section>

      <section>
        <div className="border-t border-dashed border-gray-300 my-2"></div>
        <h3 className="text-[#ff6600] font-bold uppercase tracking-wide text-[13px]">DANH SÁCH NỔI BẬT</h3>
        <ul className="mt-2 space-y-1 text-gray-700 list-none pl-0">
          {FEATURED_OPTIONS.map((option) => (
            <li key={option.value}>
              <button
                onClick={() => handleFeaturedClick(option.value)}
                className={`hover:text-[#ff6600] no-underline text-left w-full ${
                  selectedFeatured === option.value 
                    ? 'text-[#ff6600] font-semibold' 
                    : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
          <li><Link to="#" className="hover:text-[#ff6600] no-underline text-gray-700">Mule</Link></li>
        </ul>
      </section>

      <section>
        <div className="border-t border-dashed border-gray-300 my-2"></div>
        <h3 className="text-[#ff6600] font-bold uppercase tracking-wide text-[13px]">THƯƠNG HIỆU</h3>
        <ul className="mt-2 space-y-1 text-gray-700 list-none pl-0">
          {brands.length > 0 ? (
            brands.map((brand) => (
              <li key={brand.id}>
                <button
                  onClick={() => handleBrandClick(brand.id)}
                  className={`hover:text-[#ff6600] no-underline text-left w-full ${
                    selectedBrand === brand.id 
                      ? 'text-[#ff6600] font-semibold' 
                      : 'text-gray-700'
                  }`}
                >
                  {brand.name}
                </button>
              </li>
            ))
          ) : (
            <li className="text-gray-500 text-sm">Đang tải thương hiệu...</li>
          )}
        </ul>
      </section>

      <section>
        <div className="border-t border-dashed border-gray-300 my-2"></div>
        <h3 className="text-[#ff6600] font-bold uppercase tracking-wide text-[13px]">PHỤ KIỆN</h3>
        <ul className="mt-2 space-y-1 text-gray-700 list-none pl-0">
          {ACCESSORY_OPTIONS.map((accessory) => (
            <li key={accessory}>
              <button
                onClick={() => handleAccessoryClick(accessory)}
                className={`hover:text-[#ff6600] no-underline text-left w-full ${
                  selectedAccessory === accessory 
                    ? 'text-[#ff6600] font-semibold' 
                    : 'text-gray-700'
                }`}
              >
                {accessory}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="border-t border-dashed border-gray-300 my-2"></div>
        <h3 className="text-[#ff6600] font-bold uppercase tracking-wide text-[13px]">MÀU SẮC</h3>
        <div className="mt-2 grid grid-cols-8 gap-2">
          {colors.length > 0 ? (
            colors.map((colorItem) => {
              const colorId = String(colorItem.id);
              const isSelected = String(selectedColor || '') === colorId;
              const hexColor = colorItem.hex_code || colorNameToHex(colorItem.type);
              
              return (
                <button
                  key={colorItem.id}
                  onClick={() => handleColorClick(colorItem.id)}
                  className={`w-4 h-4 rounded-sm cursor-pointer hover:scale-110 transition-transform ${
                    isSelected
                      ? 'border-2 border-[#ff6600] ring-2 ring-[#ff6600] ring-offset-1' 
                      : 'border border-gray-300'
                  }`}
                  style={{ backgroundColor: hexColor }}
                  title={colorItem.type}
                />
              );
            })
          ) : (
            // Fallback nếu chưa có colors từ API
            FALLBACK_COLORS.map((fallbackColor, index) => {
              const colorId = String(index + 1);
              const isSelected = String(selectedColor || '') === colorId;
              
              return (
                <button
                  key={index}
                  onClick={() => handleColorClick(index + 1)}
                  className={`w-4 h-4 rounded-sm cursor-pointer hover:scale-110 transition-transform ${
                    isSelected
                      ? 'border-2 border-[#ff6600] ring-2 ring-[#ff6600] ring-offset-1' 
                      : 'border border-gray-300'
                  }`}
                  style={{ backgroundColor: fallbackColor }}
                  title={`Color ${index + 1}`}
                />
              );
            })
          )}
        </div>
      </section>


      {/* Quick Price Range Selection */}
      <section>
        <div className="border-t border-dashed border-gray-300 my-2"></div>
        <h3 className="text-[#ff6600] font-bold uppercase tracking-wide text-[13px]">CHỌN THEO GIÁ</h3>
        <div className="mt-2 space-y-1">
          {[
            { label: 'Dưới 500k', value: '0-500000' },
            { label: '500k - 1tr', value: '500000-1000000' },
            { label: '1tr - 2tr', value: '1000000-2000000' },
            { label: '2tr - 5tr', value: '2000000-5000000' },
            { label: 'Trên 5tr', value: '5000000-999999999' }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => onPriceRangeSelect && onPriceRangeSelect(selectedPriceRange === range.value ? '' : range.value)}
              className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                selectedPriceRange === range.value
                  ? 'bg-[#ff6600] text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-[#fff8f0] hover:text-[#ff6600]'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </section>

      {/* Date Filter for Product Quantity Check */}
      <section>
        <div className="border-t border-dashed border-gray-300 my-2"></div>
        <h3 className="text-[#ff6600] font-bold uppercase tracking-wide text-[13px]">LỌC THEO NGÀY</h3>
        <div className="mt-2 space-y-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Từ ngày:</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => onDateFilterChange && onDateFilterChange(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#ff6600] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Số ngày:</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="365"
                value={dayRange}
                onChange={(e) => onDayRangeChange && onDayRangeChange(parseInt(e.target.value) || 30)}
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#ff6600] focus:border-transparent"
              />
              <span className="text-xs text-gray-500">ngày</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sale & Discount Section */}
      <section>
        <div className="border-t border-dashed border-gray-300 my-2"></div>
        <h3 className="text-[#ff6600] font-bold uppercase tracking-wide text-[13px]">KHUYẾN MÃI</h3>
        <div className="mt-2 space-y-1">
          <button
            onClick={() => onFeaturedSelect && onFeaturedSelect(selectedFeatured === 'sale' ? '' : 'sale')}
            className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors flex items-center gap-2 ${
              selectedFeatured === 'sale'
                ? 'bg-red-500 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-red-50 hover:text-red-600'
            }`}
          >
            <span className="text-sm">🏷️</span>
            <span>Sản phẩm đang Sale</span>
          </button>
          <button
            onClick={() => onFeaturedSelect && onFeaturedSelect(selectedFeatured === 'discount' ? '' : 'discount')}
            className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors flex items-center gap-2 ${
              selectedFeatured === 'discount'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-600'
            }`}
          >
            <span className="text-sm">💸</span>
            <span>Sản phẩm giảm giá</span>
          </button>
          <button
            onClick={() => onFeaturedSelect && onFeaturedSelect(selectedFeatured === 'new' ? '' : 'new')}
            className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors flex items-center gap-2 ${
              selectedFeatured === 'new'
                ? 'bg-green-500 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-green-50 hover:text-green-600'
            }`}
          >
            <span className="text-sm">🆕</span>
            <span>Sản phẩm mới</span>
          </button>
        </div>
      </section>
    </aside>
  );
};

export default Sidebar;

