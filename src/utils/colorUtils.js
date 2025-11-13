import React from 'react';

// Color name to hex mapping for Vietnamese color names
export const COLOR_NAME_TO_HEX = {
  'Đen': '#000000',
  'Trắng': '#FFFFFF',
  'Xám': '#808080',
  'Xám Đậm': '#4A4A4A',
  'Xám Nhạt': '#D3D3D3',
  'Đỏ': '#FF0000',
  'Xanh Dương': '#0000FF',
  'Xanh Lá': '#008000',
  'Vàng': '#FFFF00',
  'Cam': '#FFA500',
  'Tím': '#800080',
  'Hồng': '#FFC0CB',
  'Nâu': '#A52A2A',
  'Be': '#F5F5DC',
  'Navy': '#000080',
  'Maroon': '#800000',
  'Olive': '#808000',
  'Lime': '#00FF00',
  'Aqua': '#00FFFF',
  'Teal': '#008080',
  'Silver': '#C0C0C0',
  'Fuchsia': '#FF00FF',
  'Black': '#000000',
  'White': '#FFFFFF',
  'Gray': '#808080',
  'Red': '#FF0000',
  'Blue': '#0000FF',
  'Green': '#008000',
  'Yellow': '#FFFF00',
  'Orange': '#FFA500',
  'Purple': '#800080',
  'Pink': '#FFC0CB',
  'Brown': '#A52A2A'
};

/**
 * Get hex color from color name
 * @param {string} colorName - Color name in Vietnamese or English
 * @returns {string} Hex color code
 */
export const getColorHex = (colorName) => {
  if (!colorName) return '#CCCCCC';
  
  // Direct hex color
  if (colorName.startsWith('#')) {
    return colorName;
  }
  
  // Look up in mapping
  const hex = COLOR_NAME_TO_HEX[colorName];
  if (hex) {
    return hex;
  }
  
  // Try case-insensitive lookup
  const normalizedName = Object.keys(COLOR_NAME_TO_HEX).find(
    key => key.toLowerCase() === colorName.toLowerCase()
  );
  
  if (normalizedName) {
    return COLOR_NAME_TO_HEX[normalizedName];
  }
  
  // Default fallback
  return '#CCCCCC';
};

/**
 * Component to display color dots for a product
 * @param {Array} colors - Array of color objects with name property
 * @param {number} maxColors - Maximum number of colors to show (default: 4)
 * @returns {JSX.Element}
 */

export const ColorDots = ({ colors = [], maxColors = 4 }) => {
  if (!colors || colors.length === 0) return null;
  
  const displayColors = colors.slice(0, maxColors);
  const remainingCount = colors.length - maxColors;
  
  return (
    <div className="flex items-center justify-center gap-1 mt-2">
      {displayColors.map((color, index) => {
        const colorName = typeof color === 'string' ? color : color.name;
        const hexColor = getColorHex(colorName);
        
        return (
          <div
            key={index}
            className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0 shadow-sm"
            style={{ backgroundColor: hexColor }}
            title={colorName}
          />
        );
      })}
      {remainingCount > 0 && (
        <span className="text-xs text-gray-500 ml-1 font-medium">+{remainingCount}</span>
      )}
    </div>
  );
};
