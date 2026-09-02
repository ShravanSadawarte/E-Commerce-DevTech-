# Supabase Integration - Quick Start Guide for Developers

## 5-Minute Setup

### 1. Install Dependencies ✅ (Already Done)

```bash
cd server
npm install @supabase/supabase-js
```

### 2. Configure Environment Variables

Create `server/.env`:

```bash
# Database
SUPABASE_URL=https://REDACTED_SUPABASE_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=REDACTED_SUPABASE_SERVICE_ROLE_KEY

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 3. Deploy Database Schema

1. Open Supabase Dashboard: https://app.supabase.com/projects
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy & paste contents of `server/src/config/supabase-schema.sql`
5. Click **Run**

### 4. Start Server

```bash
cd server
npm start
```

Expected output:
```
[Supabase] ✓ Successfully connected to PostgreSQL
[DB] ✓ Supabase PostgreSQL database connected successfully.
🚀 NEXORA commerce server is running!
📊 Database: Supabase PostgreSQL
📡 URL: http://localhost:5000
```

---

## Service Layer Overview

### 6 Core Services Already Created

**1. UserService** (`server/src/services/userService.js`)
- `createUser()` - Register new user
- `getUserByEmail()` - Find user by email
- `getUserById()` - Fetch user profile
- `verifyPassword()` - Check password hash
- `updateUserProfile()` - Update name, phone, avatar
- `resetPassword()` - Change password securely

**2. ProductService** (`server/src/services/productService.js`)
- `getProducts()` - List with filters, search, sorting, pagination
- `getProductById()` - Fetch product details
- `getProductBySlug()` - URL-friendly lookup
- `createProduct()` - Admin: add product
- `updateProduct()` - Admin: modify product
- `deleteProduct()` - Admin: remove product
- `getFeaturedProducts()` - Homepage featured items
- `checkStockAvailability()` - Validate stock before purchase
- `reduceStock()` - Decrement stock on order

**3. CartService** (`server/src/services/cartService.js`)
- `getCart()` - Fetch user's shopping cart
- `addItemToCart()` - Add product to cart
- `updateCartItemQuantity()` - Change quantity
- `removeCartItem()` - Delete item from cart
- `clearCart()` - Empty cart (called after checkout)
- `getCartTotal()` - Calculate subtotal, tax, shipping

**4. OrderService** (`server/src/services/orderService.js`)
- `createOrder()` - Process checkout (validates, calculates, creates order + payment)
- `getOrderById()` - Fetch order with items
- `getUserOrders()` - List user's orders
- `getAllOrders()` - Admin: list all orders
- `updateOrderStatus()` - Change order status
- `updatePaymentStatus()` - Update payment status
- `getOrderAnalytics()` - Dashboard analytics

**5. CategoryService** (`server/src/services/categoryService.js`)
- `getAllCategories()` - List categories
- `getCategoryBySlug()` - URL-friendly lookup
- `createCategory()` - Admin: add category
- `updateCategory()` - Admin: modify category
- `deleteCategory()` - Admin: remove category

**6. AddressService** (`server/src/services/addressService.js`)
- `getUserAddresses()` - List user's saved addresses
- `createAddress()` - Add new address
- `updateAddress()` - Edit address
- `deleteAddress()` - Remove address
- `setAsDefault()` - Set primary address
- `getDefaultAddress()` - Fetch primary address

**7. WishlistService** (`server/src/services/wishlistService.js`)
- `getWishlist()` - Fetch user's wishlist
- `addToWishlist()` - Save product
- `removeFromWishlist()` - Remove product
- `isInWishlist()` - Check if bookmarked
- `clearWishlist()` - Delete all items

**8. ReviewService** (`server/src/services/reviewService.js`)
- `createReview()` - Post product review
- `getProductReviews()` - Public: approved reviews
- `getUserReviews()` - List user's reviews
- `approveReview()` - Admin: publish review
- `rejectReview()` - Admin: reject review
- `getProductRating()` - Average rating
- `getProductRatingDistribution()` - Rating breakdown

---

## Using Services in Controllers

### Pattern

```javascript
// controller-supabase.js
const Service = require('../services/service');

exports.endpoint = async (req, res, next) => {
  try {
    // Call service
    const data = await Service.method(params);
    
    // Return response
    return successResponse(res, { data }, 'Success message');
  } catch (error) {
    return errorResponse(res, error.message, 400, 'ERROR_CODE');
  }
};
```

### Example: Get Products

```javascript
// Routes call controller
// productRoutes.js
router.get('/products', productController.getProducts);

// Controller uses service
// productController-supabase.js
exports.getProducts = async (req, res, next) => {
  const { categoryId, search, page = 1, limit = 20 } = req.query;
  
  const products = await ProductService.getProducts({
    categoryId,
    search,
    offset: (page - 1) * limit,
    limit,
  });
  
  return successResponse(res, { products });
};

// Service handles database
// productService.js
static async getProducts(filters) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*');
  
  // Apply filters...
  // Execute query...
  // Return results
}
```

---

## Database Schema (23 Tables)

### User Management
- `users` - Customer/admin accounts
- `addresses` - Saved addresses for checkout

### Catalog
- `categories` - Product categories
- `brands` - Product brands
- `products` - Product details
- `product_images` - Product photos
- `product_variants` - Colors, sizes, etc.

### Shopping
- `carts` - Shopping cart (1 per user)
- `cart_items` - Items in cart
- `wishlists` - Saved products
- `wishlist_items` - Bookmarked products

### Orders & Payments
- `orders` - Customer orders
- `order_items` - Items in order
- `payments` - Payment records
- `coupons` - Discount codes

### Features
- `reviews` - Product reviews
- `testimonials` - Customer testimonials
- `bookings` - Booking requests
- `conversations` - Chat threads
- `messages` - Chat messages
- `contact_messages` - Contact form submissions
- `audit_logs` - Activity log

---

## Data Flow: Complete Checkout Example

### 1. Frontend sends checkout request

```javascript
// Frontend: React component
const response = await axios.post('/api/orders', {
  addressId: 'addr-123',
  paymentMethod: 'COD',
  notes: 'Please ring doorbell'
});
```

### 2. Backend controller validates & calls service

```javascript
// Backend: orderController-supabase.js
exports.createOrder = async (req, res, next) => {
  const userId = req.user.id;
  const { addressId, paymentMethod } = req.body;
  
  const order = await OrderService.createOrder(
    userId,
    addressId,
    paymentMethod
  );
};
```

### 3. Service layer handles complex logic

```javascript
// Service: orderService.js
static async createOrder(userId, addressId, paymentMethod) {
  // 1. Get user's cart
  const cart = await CartService.getCartWithItems(userId);
  
  // 2. Validate cart not empty
  if (cart.cart_items.length === 0) throw new Error('Cart empty');
  
  // 3. For each item:
  for (const item of cart.cart_items) {
    // Check stock
    const inStock = await ProductService.checkStockAvailability(...);
    if (!inStock) throw new Error('Out of stock');
    
    // Get current price (not frontend price)
    const product = await ProductService.getProductById(item.product_id);
  }
  
  // 4. Calculate totals server-side
  const subtotal = ...;
  const tax = subtotal * 0.1;
  const shipping = subtotal > 100 ? 0 : 10;
  
  // 5. Create order record
  const order = await supabaseAdmin
    .from('orders')
    .insert({ ... })
    .select()
    .single();
  
  // 6. Create order items with price snapshots
  await supabaseAdmin
    .from('order_items')
    .insert([...]);
  
  // 7. Update product stock
  for (const item of cart.cart_items) {
    await ProductService.reduceStock(...);
  }
  
  // 8. Create payment record
  await supabaseAdmin
    .from('payments')
    .insert({ ... });
  
  // 9. Clear cart
  await CartService.clearCart(userId);
  
  // 10. Return complete order
  return this.getOrderById(order.id);
}
```

### 4. Database enforces RLS security

```sql
-- Supabase automatically applies row-level security
-- User can only see their own orders
SELECT * FROM orders WHERE user_id = auth.uid();

-- Admin can see all orders
SELECT * FROM orders WHERE auth.jwt()->>'role' = 'ADMIN';
```

---

## Testing Services

### Test UserService

```javascript
// server/test-userService.js
const UserService = require('./src/services/userService');

(async () => {
  try {
    // Create user
    const user = await UserService.createUser({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      password: 'SecurePass123',
      role: 'CUSTOMER'
    });
    console.log('✓ User created:', user.id);

    // Get user
    const retrieved = await UserService.getUserByEmail('john@example.com');
    console.log('✓ User retrieved:', retrieved.name);

    // Verify password
    const valid = await UserService.verifyPassword(user.password, 'SecurePass123');
    console.log('✓ Password verified:', valid);

  } catch (error) {
    console.error('✗ Error:', error.message);
  }
})();
```

Run test:
```bash
node server/test-userService.js
```

---

## Troubleshooting

### Error: "Cannot connect to Supabase"

1. Check `.env` has valid credentials
2. Verify `SUPABASE_URL` starts with `https://`
3. Verify `SUPABASE_SERVICE_ROLE_KEY` starts with `sb_secret_`
4. Test connectivity: `ping REDACTED_SUPABASE_PROJECT_ID.supabase.co`

### Error: "Row Level Security policy violation"

1. Go to Supabase Dashboard → **Authentication** → **Policies**
2. Verify RLS policies exist for the table
3. For development, policies can be temporarily disabled
4. Never disable in production - use proper policies instead

### Error: "Table does not exist"

1. Schema hasn't been deployed
2. Execute `server/src/config/supabase-schema.sql` in Supabase SQL Editor
3. Verify all 23 tables exist in **Table Editor**

### Error: "Service role key was exposed"

1. Go to Supabase Dashboard → **Settings** → **API**
2. Click **Rotate** next to Service Role Key
3. Update `.env` with new key immediately
4. Restart server

---

## Next Steps for Developers

1. **Review each service** to understand available methods
2. **Update controllers** to use new services (replace Sequelize calls)
3. **Test each workflow** (register → login → browse → cart → checkout)
4. **Remove old code** (Sequelize models, old controllers)
5. **Deploy to production** with updated environment variables

---

## File Structure

```
server/
├── src/
│   ├── config/
│   │   ├── supabase.js ✅ (Supabase client setup)
│   │   ├── supabase-schema.sql ✅ (Database schema)
│   │   └── database.js (deprecated)
│   │
│   ├── services/ ✅ (New Supabase services)
│   │   ├── userService.js ✅
│   │   ├── productService.js ✅
│   │   ├── cartService.js ✅
│   │   ├── orderService.js ✅
│   │   ├── categoryService.js ✅
│   │   ├── addressService.js ✅
│   │   ├── wishlistService.js ✅
│   │   ├── reviewService.js ✅
│   │   └── (additional services)...
│   │
│   ├── controllers/
│   │   ├── authController-supabase.js ✅ (New controller)
│   │   ├── productController-supabase.js ✅ (New controller)
│   │   ├── cartController-supabase.js ✅ (New controller)
│   │   ├── orderController-supabase.js ✅ (New controller)
│   │   ├── authController.js (old - to be removed)
│   │   ├── productController.js (old - to be removed)
│   │   └── ...
│   │
│   ├── routes/
│   │   ├── authRoutes.js (needs: import authController-supabase)
│   │   ├── productRoutes.js (needs: import productController-supabase)
│   │   ├── cartRoutes.js (needs: import cartController-supabase)
│   │   ├── orderRoutes.js (needs: import orderController-supabase)
│   │   └── ...
│   │
│   └── server.js ✅ (Updated to use Supabase)
│
└── .env ✅ (Updated with Supabase credentials)
```

---

## Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Row Level Security Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **JavaScript Client**: https://supabase.com/docs/reference/javascript/introduction

---

**Version**: 1.0  
**Last Updated**: September 2, 2026  
**Status**: Ready to integrate
