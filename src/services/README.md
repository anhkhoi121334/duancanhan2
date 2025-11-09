# API Service Documentation

## Cấu hình

Tạo file `.env` trong thư mục `shoe-store/` với nội dung:

```env
VITE_API_URL=http://localhost:3000/api
```

## Sử dụng

### Import API functions

```javascript
import { getProducts, getProductById, createOrder } from './services/api';
```

## Các API có sẵn

### 1. Products API

#### `getProducts(params)`
Lấy danh sách sản phẩm với filter và phân trang

**Parameters:**
```javascript
{
  page: 1,           // Số trang (default: 1)
  limit: 12,         // Số sản phẩm mỗi trang (default: 12)
  category: 'sneaker', // Danh mục: 'sneaker', 'sport', 'casual'
  search: 'nike',    // Từ khóa tìm kiếm
  sort: 'price_asc', // Sắp xếp: 'price_asc', 'price_desc', 'name_asc', 'name_desc'
  minPrice: 100000,  // Giá tối thiểu
  maxPrice: 500000,  // Giá tối đa
  brand: 'Nike',     // Thương hiệu
  color: 'red'       // Màu sắc
}
```

**Example:**
```javascript
const products = await getProducts({ 
  page: 1, 
  limit: 12, 
  category: 'sneaker' 
});

console.log(products);
// {
//   data: [...], 
//   total: 100,
//   page: 1,
//   totalPages: 9
// }
```

#### `getProductById(id)`
Lấy chi tiết sản phẩm

**Example:**
```javascript
const product = await getProductById(1);
```

#### `getRelatedProducts(id, limit)`
Lấy sản phẩm liên quan

**Example:**
```javascript
const related = await getRelatedProducts(1, 4);
```

#### `getNewProducts(limit)`
Lấy sản phẩm mới nhất

**Example:**
```javascript
const newProducts = await getNewProducts(8);
```

#### `getBestSellerProducts(limit)`
Lấy sản phẩm bán chạy

**Example:**
```javascript
const bestSellers = await getBestSellerProducts(8);
```

#### `getSaleProducts(limit)`
Lấy sản phẩm giảm giá

**Example:**
```javascript
const saleProducts = await getSaleProducts(8);
```

### 2. Categories API

#### `getCategories()`
Lấy danh sách danh mục

**Example:**
```javascript
const categories = await getCategories();
```

### 3. Brands API

#### `getBrands()`
Lấy danh sách thương hiệu

**Example:**
```javascript
const brands = await getBrands();
```

### 4. Orders API

#### `createOrder(orderData)`
Tạo đơn hàng mới

**Example:**
```javascript
const order = await createOrder({
  customerName: 'Nguyễn Văn A',
  phone: '0123456789',
  email: 'test@example.com',
  address: '123 Đường ABC, Quận 1, TP.HCM',
  items: [
    { productId: 1, quantity: 2, size: 42, color: 'red' }
  ],
  totalAmount: 500000,
  paymentMethod: 'COD'
});
```

#### `trackOrder(orderCode, phone)`
Tra cứu đơn hàng

**Example:**
```javascript
const order = await trackOrder('ORD123456', '0123456789');
```

### 5. User API

#### `login(credentials)`
Đăng nhập

**Example:**
```javascript
const user = await login({
  email: 'user@example.com',
  password: 'password123'
});
```

#### `register(userData)`
Đăng ký

**Example:**
```javascript
const user = await register({
  name: 'Nguyễn Văn A',
  email: 'user@example.com',
  password: 'password123',
  phone: '0123456789'
});
```

## Error Handling

Tất cả các function đều throw error khi có lỗi. Nên sử dụng try-catch:

```javascript
try {
  const products = await getProducts({ page: 1 });
  console.log(products);
} catch (error) {
  console.error('Lỗi:', error.message);
  // Xử lý lỗi tại đây
}
```

## Sử dụng trong React Component

```javascript
import { useState, useEffect } from 'react';
import { getProducts } from '../services/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts({ page: 1, limit: 12 });
        setProducts(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
};
```

