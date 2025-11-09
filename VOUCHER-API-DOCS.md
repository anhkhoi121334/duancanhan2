# 🎟️ Tài liệu API Voucher

## 📡 API Endpoint

```
POST http://localhost:8000/api/vouchers/validate
```

## 📤 Request Format

```json
{
  "code": "SUMMER2024",
  "order_value": 1000000
}
```

## 📥 Response Format

Backend có thể trả về một trong các format sau:

### Option 1: Direct voucher object
```json
{
  "code": "SUMMER2024",
  "discount_type": "percentage",
  "discount_value": 20,
  "min_order_value": 500000,
  "max_discount_value": 100000,
  "is_valid": true,
  "status": true,
  "quantity": 100
}
```

### Option 2: Wrapped in data
```json
{
  "data": {
    "code": "SUMMER2024",
    ...
  }
}
```

### Option 3: Wrapped in voucher
```json
{
  "voucher": {
    "code": "SUMMER2024",
    ...
  }
}
```

> Frontend tự động xử lý cả 3 formats!

---

## ✅ Validation Rules (Frontend)

1. **is_valid** === `true`
2. **status** === `true`
3. **order_value** >= `min_order_value`
4. **quantity** > 0

---

## 💰 Discount Calculation

### Percentage Type
```javascript
discount = (order_value × discount_value) / 100
if (max_discount_value) {
  discount = Math.min(discount, max_discount_value)
}
```

### Fixed Type
```javascript
discount = discount_value
```

> Discount không bao giờ vượt quá order_value

---

## 🎯 Vouchers Mẫu

| Code | Type | Giảm | Đơn tối thiểu | Max | Valid |
|------|------|------|---------------|-----|-------|
| SUMMER2024 | % | 20% | 500K | 100K | ✅ |
| WELCOME100 | Fixed | 100K | 1M | - | ✅ |
| FREESHIP | Fixed | 30K | 300K | - | ✅ |
| MEGA50 | % | 50% | 2M | 500K | ✅ |
| XMAS2024 | % | 25% | 1M | 100M | ❌ hết hạn |

---

## 📁 Files Structure

### API Service
- **`src/services/api.js`**
  - `validateVoucher()` - POST API validation
  - `getVouchers()` - Lấy tất cả vouchers
  - `getVoucherByCode()` - Lấy voucher theo code

### Components
- **`src/components/VoucherInput.jsx`** ⭐ NEW
  - Reusable voucher input component
  - Validation logic
  - UI state management
  - Can be used in CartPage, CheckoutPage, etc.

### Pages
- **`src/pages/CartPage.jsx`**
  - Uses VoucherInput component
  - Clean and maintainable
  - 70% less code

---

## 🚀 Usage Example

```javascript
import { validateVoucher } from '../services/api';

const response = await validateVoucher({
  code: 'SUMMER2024',
  order_value: 1000000
});

// Response sẽ chứa voucher data để validate và tính discount
```

