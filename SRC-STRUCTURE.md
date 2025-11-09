# 📂 SRC FOLDER STRUCTURE - ANKH STORE

**Cập nhật:** 26/10/2025  
**Tổng số files:** 60+  
**Tổng số folders:** 8

---

## 🌳 CẤU TRÚC HOÀN CHỈNH

```
src/
│
├── 📁 assets/                                  # Static assets (Images)
│   ├── 📷 category1.jpg                        # Category image 1
│   ├── 📷 category2.jpg                        # Category image 2
│   ├── 📷 category3.jpg                        # Category image 3
│   ├── 📷 collection1.jpg                      # Collection image 1
│   ├── 📷 collection2.jpg                      # Collection image 2
│   ├── 📷 logoankh.png                         # ANKH logo
│   ├── 📷 react.svg                            # React logo
│   └── 📷 subscribebanner01.jpg                # Newsletter banner
│
├── 📁 components/                              # ⭐ React Components
│   ├── 📄 index.js                             # ✅ Barrel export (16 components)
│   │
│   ├── 🧱 BottomNavigation.jsx                 # Mobile bottom navigation
│   │   • Props: None
│   │   • Usage: App.jsx (mobile only)
│   │   • Features: Cart count, active state
│   │
│   ├── 🧱 Cart.jsx                             # Cart dropdown component
│   │   • Props: None
│   │   • Usage: Header.jsx
│   │   • Features: Mini cart preview
│   │
│   ├── 🧱 Footer.jsx                           # Main footer
│   │   • Props: None
│   │   • Usage: App.jsx
│   │   • Features: Links, social media, newsletter
│   │
│   ├── 🧱 Header.jsx                           # Main header
│   │   • Props: None
│   │   • Usage: App.jsx
│   │   • Features: 
│   │     - Navigation menu
│   │     - Search bar (expandable)
│   │     - User menu
│   │     - Cart icon
│   │     - Auth modals
│   │     - Promotions ticker
│   │
│   ├── 🧱 LoginModal.jsx                       # Login modal
│   │   • Props: isOpen, onClose, onSwitchToRegister
│   │   • Usage: Header.jsx
│   │   • Features: Email/password login
│   │
│   ├── 🧱 PageTransition.jsx                   # Page transition wrapper
│   │   • Props: children, location
│   │   • Usage: App.jsx
│   │   • Features: Fade in/out animations
│   │
│   ├── 🧱 ProductCard.jsx                      # Product card
│   │   • Props: product, onAddToCart
│   │   • Usage: Home.jsx, ProductList.jsx
│   │   • Features: Image, name, price, add to cart
│   │
│   ├── 🧱 RegisterModal.jsx                    # Register modal
│   │   • Props: isOpen, onClose, onSwitchToLogin
│   │   • Usage: Header.jsx
│   │   • Features: Full registration form
│   │
│   ├── 🧱 ScrollToTop.jsx                      # Scroll to top button
│   │   • Props: None
│   │   • Usage: App.jsx
│   │   • Features: Appears on scroll, smooth scroll
│   │
│   ├── 🧱 SEO.jsx                              # SEO meta tags
│   │   • Props: title, description, keywords, image, url, type
│   │   • Usage: All pages
│   │   • Features: Dynamic meta tags, Open Graph
│   │
│   ├── 🧱 Sidebar.jsx                          # Filter sidebar (desktop)
│   │   • Props: filters, onFilterChange
│   │   • Usage: ProductList.jsx
│   │   • Features: Category, price, brand filters
│   │
│   ├── 🧱 Toast.jsx                            # Toast notification
│   │   • Props: message, type, onClose, duration
│   │   • Usage: ToastContainer.jsx
│   │   • Features: Success, error, info types
│   │
│   ├── 🧱 ToastContainer.jsx                   # Toast container
│   │   • Props: None
│   │   • Usage: App.jsx
│   │   • Features: Manages multiple toasts
│   │
│   ├── 🧱 TopBar.jsx                           # Top navigation bar
│   │   • Props: None
│   │   • Usage: Header.jsx (legacy)
│   │   • Features: Quick links
│   │
│   ├── 🧱 TypewriterText.jsx                   # Typewriter effect
│   │   • Props: text, speed, delay, onComplete, className
│   │   • Usage: Header.jsx (promotions)
│   │   • Features: Typing animation
│   │
│   └── 🧱 VoucherInput.jsx                     # Voucher input
│       • Props: orderValue, onApply, onRemove, appliedVoucher, showToast
│       • Usage: CartPage.jsx
│       • Features: Apply/remove voucher, validation
│
├── 📁 config/                                  # ⭐ Configuration
│   └── 📄 env.js                               # ✅ Environment config (96 lines)
│       • Exports:
│         - API_URL, API_BASE_URL
│         - APP_NAME, APP_URL, APP_ENV
│         - ENABLE_ANALYTICS, ENABLE_DEBUG
│         - SOCIAL_MEDIA (object)
│         - CONTACT (object)
│         - SEO (object)
│         - ANALYTICS (object)
│         - Helper functions: isDevelopment(), debugLog()
│
├── 📁 constants/                               # ✅ NEW: Constants
│   └── 📄 index.js                             # All app constants (200+ lines)
│       • Exports:
│         - API_ENDPOINTS (15 endpoints)
│         - ROUTES (18 routes)
│         - TOAST_TYPES (4 types)
│         - ORDER_STATUS (6 statuses)
│         - PAYMENT_METHODS (5 methods)
│         - SHIPPING_METHODS (2 methods)
│         - FILTER_OPTIONS (sort & gender)
│         - PAGINATION (defaults)
│         - STORAGE_KEYS (5 keys)
│         - VALIDATION (regex patterns)
│         - UI (durations, delays)
│         - VOUCHER_TYPES (3 types)
│         - PRODUCT_STATUS (3 statuses)
│         - PLACEHOLDERS (3 images)
│         - ERROR_MESSAGES (5 messages)
│         - SUCCESS_MESSAGES (7 messages)
│         - ANIMATIONS (6 classes)
│         - HTTP_STATUS (codes)
│
├── 📁 data/                                    # Static data
│   └── 📄 products.js                          # Sample products (for demo)
│       • 20+ sample products with:
│         - id, name, price, image
│         - category, brand
│         - description
│
├── 📁 hooks/                                   # ✅ NEW: Custom Hooks
│   ├── 📄 index.js                             # ✅ Barrel export (5 hooks)
│   │
│   ├── 🪝 useClickOutside.js                   # Click outside detection
│   │   • Params: ref, callback
│   │   • Usage: Dropdowns, modals
│   │
│   ├── 🪝 useDebounce.js                       # Debounce value
│   │   • Params: value, delay
│   │   • Usage: Search inputs
│   │
│   ├── 🪝 useIntersectionObserver.js           # Viewport detection
│   │   • Params: options
│   │   • Returns: { ref, isIntersecting, hasIntersected }
│   │   • Usage: Scroll animations
│   │
│   ├── 🪝 useLocalStorage.js                   # LocalStorage sync
│   │   • Params: key, initialValue
│   │   • Returns: [storedValue, setStoredValue]
│   │   • Usage: Theme, preferences
│   │
│   └── 🪝 useScrollPosition.js                 # Scroll tracking
│       • Params: threshold
│       • Returns: { scrolled, scrollY }
│       • Usage: Header shadow, scroll effects
│
├── 📁 lib/                                     # ✅ NEW: Utilities
│   ├── 📄 index.js                             # ✅ Barrel export
│   │
│   ├── 🛠️ formatters.js                        # Formatting utilities (11 functions)
│   │   • Functions:
│   │     - formatCurrency(amount)              # → "1,500,000 VND"
│   │     - formatPrice(amount)                 # → "1,500,000 VND"
│   │     - formatDate(date, includeTime)       # → "26/10/2025"
│   │     - formatPhoneNumber(phone)            # → "0123 456 789"
│   │     - truncateText(text, maxLength)       # → "Text..."
│   │     - formatFileSize(bytes)               # → "1.5 MB"
│   │     - formatNumber(num)                   # → "1,500,000"
│   │     - formatDiscount(original, sale)      # → "-33%"
│   │     - capitalize(str)                     # → "Hello"
│   │     - slugToTitle(slug)                   # → "Nike Air Max"
│   │
│   ├── 🛠️ helpers.js                           # General helpers (20 functions)
│   │   • Functions:
│   │     - generateId()                        # Unique ID
│   │     - sleep(ms)                           # Delay
│   │     - debounce(func, wait)                # Debounce function
│   │     - throttle(func, limit)               # Throttle function
│   │     - deepClone(obj)                      # Deep clone
│   │     - isEmpty(obj)                        # Check empty
│   │     - groupBy(array, key)                 # Group array
│   │     - removeDuplicates(array, key)        # Remove dupes
│   │     - sortBy(array, key, order)           # Sort array
│   │     - calculatePercentage(value, total)   # Percentage
│   │     - clamp(num, min, max)                # Clamp number
│   │     - random(min, max)                    # Random number
│   │     - scrollToTop(smooth)                 # Scroll to top
│   │     - scrollToElement(id, smooth)         # Scroll to element
│   │     - copyToClipboard(text)               # Copy to clipboard
│   │     - getUrlParameter(param)              # Get URL param
│   │     - buildQueryString(params)            # Build query string
│   │
│   └── 🛠️ validators.js                        # Validation utilities (6 functions)
│       • Functions:
│         - isValidEmail(email)                 # Email validation
│         - isValidPhone(phone)                 # Phone validation
│         - validatePassword(password)          # Password strength
│         - validateName(name)                  # Name validation
│         - validateRequired(value, fieldName)  # Required field
│         - validateForm(data, rules)           # Full form validation
│         - hasErrors(errors)                   # Check errors
│
├── 📁 pages/                                   # ⭐ Page Components
│   ├── 📄 index.js                             # ✅ Barrel export (16 pages)
│   │
│   ├── 📄 AboutPage.jsx                        # About us page
│   │   • Route: /about
│   │   • Features: Company info, scroll animations
│   │
│   ├── 📄 AccountPage.jsx                      # Account management
│   │   • Route: /account
│   │   • Features: User dashboard, orders, profile
│   │
│   ├── 📄 BrandsPage.jsx                       # Brands listing
│   │   • Route: /brands
│   │   • Features: All brands, scroll animations
│   │
│   ├── 📄 CartPage.jsx                         # Shopping cart
│   │   • Route: /cart
│   │   • Features: Cart items, voucher, checkout button
│   │
│   ├── 📄 CheckoutPage.jsx                     # Checkout
│   │   • Route: /checkout
│   │   • Features: Shipping form, payment, order summary
│   │
│   ├── 📄 FavoritesPage.jsx                    # Favorites/Wishlist
│   │   • Route: /favorites
│   │   • Features: Saved products
│   │
│   ├── 📄 Home.jsx                             # Homepage
│   │   • Route: /
│   │   • Features:
│   │     - Hero banner slider
│   │     - Featured products
│   │     - Collections
│   │     - Newsletter
│   │     - Scroll animations
│   │
│   ├── 📄 NewArrivalsPage.jsx                  # New arrivals
│   │   • Route: /new-arrivals
│   │   • Features: Redirects to /products?featured=new
│   │
│   ├── 📄 NotFoundPage.jsx                     # 404 error page
│   │   • Route: *
│   │   • Features: Animated 404, countdown, links
│   │
│   ├── 📄 OrderSuccessPage.jsx                 # Order confirmation
│   │   • Route: /order-success
│   │   • Features: Order details, thank you message
│   │
│   ├── 📄 OrderTrackingPage.jsx                # Order tracking
│   │   • Route: /orders
│   │   • Features: Track order by code
│   │
│   ├── 📄 ProductDetail.jsx                    # Product detail
│   │   • Route: /product/:slug
│   │   • Features:
│   │     - Product images
│   │     - Size/color selection
│   │     - Add to cart
│   │     - Product description
│   │
│   ├── 📄 ProductList.jsx                      # Product listing
│   │   • Route: /products
│   │   • Features:
│   │     - Product grid
│   │     - Filters (sidebar + mobile)
│   │     - Sorting
│   │     - Pagination
│   │     - Gender filter
│   │     - Scroll animations
│   │
│   ├── 📄 ProfileEditPage.jsx                  # Edit profile
│   │   • Route: /profile/edit
│   │   • Features: Update user info
│   │
│   ├── 📄 ProfilePage.jsx                      # User profile
│   │   • Route: /profile
│   │   • Features: User info, stats
│   │
│   ├── 📄 SalePage.jsx                         # Sale products
│   │   • Route: /sale
│   │   • Features: Redirects to /products?featured=sale
│   │
│   └── 📄 SearchPage.jsx                       # Search results
│       • Route: /search
│       • Features:
│         - Advanced search
│         - Filters (brand, price, gender)
│         - Sorting
│         - Pagination
│         - Recent searches
│
├── 📁 services/                                # ⭐ API Services
│   ├── 📄 api.js                               # Main API service (543 lines)
│   │   • Functions:
│   │     - Authentication:
│   │       * login(credentials)
│   │       * register(userData)
│   │       * logout()
│   │       * getCurrentUser()
│   │     
│   │     - Products:
│   │       * getProducts(params)
│   │       * getProductBySlug(slug)
│   │       * searchProducts(params)
│   │     
│   │     - Categories & Brands:
│   │       * getCategories()
│   │       * getBrands()
│   │     
│   │     - Vouchers:
│   │       * validateVoucher(code, orderValue)
│   │       * getVouchers()
│   │       * getVoucherByCode(code)
│   │     
│   │     - Orders:
│   │       * createOrder(orderData)
│   │       * getOrders()
│   │       * getOrderById(id)
│   │     
│   │     - Promotions:
│   │       * getPromotions()
│   │     
│   │     - Helpers:
│   │       * getToken()
│   │       * getAuthHeaders()
│   │       * handleResponse()
│   │
│   └── 📄 README.md                            # API documentation
│       • Endpoint list
│       • Request/response examples
│       • Error handling guide
│
├── 📁 store/                                   # ⭐ Zustand Stores
│   ├── 📄 index.js                             # ✅ Barrel export (4 stores)
│   │
│   ├── 🗃️ authStore.js                         # Authentication store
│   │   • State:
│   │     - user (object)
│   │     - token (string)
│   │     - isAuthenticated (boolean)
│   │   • Actions:
│   │     - setAuth(user, token)
│   │     - logout()
│   │     - updateUser(data)
│   │   • Persisted: Yes (localStorage)
│   │
│   ├── 🗃️ cartStore.js                         # Shopping cart store
│   │   • State:
│   │     - items (array)
│   │     - toasts (array)
│   │   • Actions:
│   │     - addItem(product)
│   │     - removeItem(productId)
│   │     - updateQuantity(productId, quantity)
│   │     - clearCart()
│   │     - showToast(message, type)
│   │     - removeToast(id)
│   │   • Computed:
│   │     - totalItems
│   │     - totalPrice
│   │   • Persisted: Yes (localStorage)
│   │
│   ├── 🗃️ favoritesStore.js                    # Favorites store
│   │   • State:
│   │     - items (array)
│   │   • Actions:
│   │     - addToFavorites(product)
│   │     - removeFromFavorites(productId)
│   │     - isFavorite(productId)
│   │     - clearFavorites()
│   │   • Persisted: Yes (localStorage)
│   │
│   └── 🗃️ searchStore.js                       # Search store
│       • State:
│         - searchResults (array)
│         - isSearching (boolean)
│         - error (string)
│         - pagination (object)
│         - filters (object)
│         - recentSearches (array)
│       • Actions:
│         - performSearch(keyword, page, filters)
│         - quickSearch(keyword)
│         - setPage(page)
│         - setFilters(filters)
│         - clearFilters()
│         - addRecentSearch(search)
│         - removeRecentSearch(search)
│       • Persisted: Partial (recentSearches only)
│
├── 📁 utils/                                   # Utilities
│   └── 📄 auth.js                              # Auth utilities (72 lines)
│       • Functions:
│         - isAuthenticated()
│         - getUser()
│         - getToken()
│         - setAuthData(user, token)
│         - clearAuthData()
│         - requireAuth(navigate)
│
├── 📄 App.css                                  # App-specific styles
│   • Global app styles
│   • Component overrides
│
├── 📄 App.jsx                                  # ⭐ Main App Component
│   • Features:
│     - React Router setup
│     - Route definitions
│     - Layout wrapper (Header, Footer, BottomNav)
│     - Page transitions
│     - Conditional rendering (404, no layout)
│     - ToastContainer
│     - ScrollToTop button
│
├── 📄 index.css                                # ⭐ Global Styles
│   • Tailwind directives
│   • Custom animations:
│     - fadeIn, fadeOut
│     - slideInRight, slideInLeft
│     - expandSearch, slideDown
│     - fadeInUp, fadeInLeft, fadeInRight
│     - scaleIn, fadeInUpButton
│     - ripple
│   • Scroll animations classes
│   • Custom scrollbar
│   • Radio button styles
│
└── 📄 main.jsx                                 # ⭐ Entry Point
    • React.StrictMode
    • BrowserRouter
    • App component render
```

---

## 📊 STATISTICS

### By Category

| Category | Files | Lines | Description |
|----------|-------|-------|-------------|
| **Components** | 16 files | ~3,500 | React UI components |
| **Pages** | 16 files | ~4,000 | Page components |
| **Stores** | 4 files | ~400 | Zustand state management |
| **Services** | 1 file | ~550 | API layer |
| **Config** | 1 file | ~96 | Environment config |
| **Constants** | 1 file | ~200 | App constants |
| **Hooks** | 5 files | ~150 | Custom React hooks |
| **Lib** | 3 files | ~600 | Utility functions |
| **Utils** | 1 file | ~72 | Auth utilities |
| **Assets** | 8 files | - | Images |
| **Data** | 1 file | ~100 | Static data |
| **Root** | 3 files | ~500 | App.jsx, main.jsx, styles |
| **TOTAL** | **60 files** | **~10,000+** | Complete src folder |

---

## 🎯 KEY FILES

### Must-Know Files

1. **main.jsx** - App entry point
2. **App.jsx** - Main app component, routing
3. **index.css** - Global styles, animations
4. **config/env.js** - Environment configuration
5. **constants/index.js** - All app constants
6. **services/api.js** - All API calls
7. **store/** - State management (4 stores)

### Frequently Modified

- **components/Header.jsx** - Navigation, search, auth
- **components/ProductCard.jsx** - Product display
- **pages/Home.jsx** - Homepage content
- **pages/ProductList.jsx** - Product listing
- **pages/CartPage.jsx** - Shopping cart
- **pages/CheckoutPage.jsx** - Checkout flow

---

## 🔗 IMPORT EXAMPLES

### With Path Aliases

```javascript
// Components
import { 
  Header, 
  Footer, 
  ProductCard, 
  SEO 
} from '@components';

// Pages
import { 
  Home, 
  ProductList, 
  CartPage 
} from '@pages';

// Stores
import { 
  useAuthStore, 
  useCartStore, 
  useSearchStore 
} from '@store';

// Services
import { 
  login, 
  getProducts, 
  createOrder 
} from '@services/api';

// Hooks
import { 
  useDebounce, 
  useScrollPosition 
} from '@hooks';

// Lib
import { 
  formatPrice, 
  isValidEmail, 
  debounce 
} from '@lib';

// Constants
import { 
  ROUTES, 
  TOAST_TYPES, 
  API_ENDPOINTS 
} from '@constants';

// Config
import { 
  API_URL, 
  APP_NAME 
} from '@config/env';

// Assets
import logo from '@assets/logoankh.png';

// Utils
import { isAuthenticated } from '@utils/auth';
```

---

## 📝 NAMING CONVENTIONS

### Files

```
Components:     PascalCase.jsx     (Header.jsx, ProductCard.jsx)
Pages:          PascalCase.jsx     (Home.jsx, ProductList.jsx)
Stores:         camelCase.js       (authStore.js, cartStore.js)
Services:       lowercase.js       (api.js)
Hooks:          camelCase.js       (useDebounce.js)
Lib:            lowercase.js       (formatters.js, helpers.js)
Constants:      lowercase.js       (index.js)
Config:         lowercase.js       (env.js)
Utils:          lowercase.js       (auth.js)
```

### Exports

```javascript
// Components - Default export
export default Header;

// Hooks - Named export
export const useDebounce = () => { ... };

// Lib - Named exports
export const formatPrice = () => { ... };

// Constants - Named exports
export const ROUTES = { ... };

// Stores - Named export (custom)
export const useAuthStore = create(() => { ... });
```

---

## 🎨 COMPONENT STRUCTURE

### Standard Component Pattern

```javascript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Aliases
import { useCartStore } from '@store';
import { formatPrice } from '@lib';
import { ROUTES } from '@constants';

// 2. Component
const MyComponent = ({ prop1, prop2 }) => {
  // 2.1 State
  const [state, setState] = useState();
  
  // 2.2 Store
  const { items, addItem } = useCartStore();
  
  // 2.3 Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 2.4 Handlers
  const handleClick = () => {
    // ...
  };
  
  // 2.5 Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

// 3. Export
export default MyComponent;
```

---

## 📚 FOLDER PURPOSES

```
assets/      → Static images, fonts, files
components/  → Reusable React UI components
config/      → App configuration (env, etc.)
constants/   → App-wide constants
data/        → Static/mock data
hooks/       → Custom React hooks
lib/         → Utility functions (formatters, validators, helpers)
pages/       → Page-level components (routes)
services/    → API calls, external services
store/       → State management (Zustand)
utils/       → Utility functions (auth, etc.)
```

---

## ✅ BENEFITS OF STRUCTURE

### Organized by Feature
- ✅ Easy to find files
- ✅ Logical grouping
- ✅ Scalable structure

### Reusable Code
- ✅ Custom hooks
- ✅ Utility functions
- ✅ Constants
- ✅ Components

### Clean Imports
- ✅ Path aliases
- ✅ Barrel exports
- ✅ Consistent patterns

### Maintainable
- ✅ Clear separation
- ✅ Single responsibility
- ✅ Easy to refactor

---

## 🎯 QUICK REFERENCE

### Need a...

**Component?** → `src/components/`  
**Page?** → `src/pages/`  
**Hook?** → `src/hooks/`  
**Utility?** → `src/lib/`  
**Constant?** → `src/constants/`  
**Store?** → `src/store/`  
**API call?** → `src/services/api.js`  
**Config?** → `src/config/env.js`

---

**📂 Complete src/ structure với 60+ files, 10,000+ lines of code!** 🚀✨

