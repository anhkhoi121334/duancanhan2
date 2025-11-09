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
  filters = {}
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

  const handleClearAllFilters = () => {
    onGenderSelect('');
    onBrandSelect('');
    onColorSelect('');
    onCategorySelect('');
    onAccessorySelect('');
    onFeaturedSelect('');
  };

  // Check if any filter is active
  const hasActiveFilters = selectedGender || selectedBrand || selectedColor || selectedCategory || selectedAccessory || selectedFeatured;

  return (
    <aside className="col-span-3 space-y-6 text-[14px] leading-6">
      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="bg-[#fff8f0] border border-[#ff6600] rounded-lg p-3">
          <button
            onClick={handleClearAllFilters}
            className="w-full text-[#ff6600] font-semibold text-sm hover:bg-[#ff6600] hover:text-white transition-colors py-2 px-3 rounded"
          >
            ✕ Xóa tất cả bộ lọc
          </button>
        </div>
      )}

      <section className="bg-white">
        <h3 className="text-[#ff6600] font-bold uppercase tracking-wide text-[13px] text-center mb-3">
          HỢP TÁC
        </h3>
        <div className="border-t border-gray-300"></div>
        <div className="mt-3 grid grid-cols-2 gap-y-2 text-gray-700">
          {CATEGORY_OPTIONS.map((category) => (
            <React.Fragment key={category.value}>
              <div className="flex items-center justify-between pr-2">
                <button 
                  onClick={() => handleCategoryClick(category.value)}
                  className={`hover:text-[#ff6600] no-underline text-left ${
                    selectedCategory === category.value 
                      ? 'text-[#ff6600] font-semibold' 
                      : 'text-gray-700'
                  }`}
                >
                  {category.labelEn}
                </button>
                <span className="text-gray-400">|</span>
              </div>
              <button 
                onClick={() => handleCategoryClick(category.value)}
                className={`hover:text-[#ff6600] pl-2 no-underline text-left ${
                  selectedCategory === category.value 
                    ? 'text-[#ff6600] font-semibold' 
                    : 'text-gray-700'
                }`}
              >
                {category.labelVi}
              </button>
            </React.Fragment>
          ))}
        </div>
        <div className="mt-3 border-t border-gray-300"></div>
      </section>

      <section>
        <div className="border-t border-dashed border-gray-300 my-3"></div>
        <h3 className="text-[#ff6600] font-bold uppercase tracking-wide text-[13px]">GIỚI TÍNH</h3>
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="gender"
              checked={selectedGender === 'Nam'}
              onChange={() => handleGenderClick('Nam')}
              className="w-4 h-4 text-[#ff6600] border-gray-300 focus:ring-[#ff6600] cursor-pointer"
            />
            <span className={`text-sm transition-colors ${
              selectedGender === 'Nam' 
                ? 'text-[#ff6600] font-semibold' 
                : 'text-gray-700 group-hover:text-[#ff6600]'
            }`}>
              Nam
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="gender"
              checked={selectedGender === 'Nữ'}
              onChange={() => handleGenderClick('Nữ')}
              className="w-4 h-4 text-[#ff6600] border-gray-300 focus:ring-[#ff6600] cursor-pointer"
            />
            <span className={`text-sm transition-colors ${
              selectedGender === 'Nữ' 
                ? 'text-[#ff6600] font-semibold' 
                : 'text-gray-700 group-hover:text-[#ff6600]'
            }`}>
              Nữ
            </span>
          </label>
        </div>
      </section>

      <section>
        <div className="border-t border-dashed border-gray-300 my-3"></div>
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
        <div className="border-t border-dashed border-gray-300 my-3"></div>
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
        <div className="border-t border-dashed border-gray-300 my-3"></div>
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
        <div className="border-t border-dashed border-gray-300 my-3"></div>
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
    </aside>
  );
};

export default Sidebar;

