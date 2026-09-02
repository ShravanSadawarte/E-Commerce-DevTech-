# Supabase Integration Migration Guide

## Overview

This document details the complete migration of the NEXORA e-commerce application from **Sequelize + MySQL/SQLite** to **Supabase PostgreSQL** backend infrastructure.

---

## Architecture Overview

### Before Migration (Sequelize)
```
React Frontend (Vite)
    ↓ (Axios/Socket.io)
    ↓
Express.js Backend (Port 5000)
    ↓
Sequelize ORM
    ↓
MySQL (Primary) / SQLite (Fallback)
```

### After Migration (Supabase)
```
React Frontend (Vite)
    ↓ (Axios/Socket.io)
    ↓
Express.js Backend (Port 5000)
    ↓
Supabase Client (Node.js SDK)
    ↓
Supabase PostgreSQL Database
```

**Key Change**: The database layer now uses Supabase's managed PostgreSQL instance via the official JavaScript client, eliminating the need for Sequelize ORM.

---

## Migration Checklist

### Phase 1: Supabase Project Setup
- [x] Supabase project created: https://REDACTED_SUPABASE_PROJECT_ID.supabase.co
- [ ] Database schema imported from `server/src/config/supabase-schema.sql`
- [ ] Row Level Security (RLS) policies verified
- [ ] Storage bucket created for product images (optional)

### Phase 2: Backend Configuration
- [x] Supabase client library installed (`@supabase/supabase-js`)
- [x] Environment variables configured
- [x] Supabase service module created (`config/supabase.js`)
- [x] Database services created (UserService, ProductService, OrderService, CartService, CategoryService)
- [x] New controllers created for Supabase operations
- [x] Server bootstrap updated to use Supabase connection

### Phase 3: Database Schema
- [ ] Execute SQL migration in Supabase SQL Editor
- [ ] Verify all 23 tables created
- [ ] Verify foreign key relationships
- [ ] Verify indexes created for performance
- [ ] Verify RLS policies enabled

### Phase 4: Integration Testing
- [ ] Test user registration
- [ ] Test user login
- [ ] Test product listing
- [ ] Test cart operations
- [ ] Test order creation & checkout
- [ ] Test admin dashboard
- [ ] Test live chat

### Phase 5: Migration Cleanup
- [ ] Remove old Sequelize models (`server/src/models/`)
- [ ] Remove old controllers using Sequelize
- [ ] Remove MySQL/SQLite database configuration
- [ ] Remove Sequelize dependencies from package.json
- [ ] Update API routes to use new Supabase controllers

### Phase 6: Deployment
- [ ] Update production environment variables
- [ ] Configure Supabase project settings
- [ ] Deploy backend to production
- [ ] Test production deployment
- [ ] Monitor error logs

---

## Detailed Setup Instructions

### Step 1: Configure Supabase Credentials

Update `server/.env` with Supabase credentials:

```bash
# ============================================================================
# SUPABASE CONFIGURATION
# ============================================================================
SUPABASE_URL=https://REDACTED_SUPABASE_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=REDACTED_SUPABASE_SERVICE_ROLE_KEY

# Keep existing JWT configuration
JWT_SECRET=your_secure_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Keep existing payment/optional services
RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
RAZORPAY_KEY_SECRET=s9G7Y6F7E3B2A1Z9X8W7V6U5
```

**⚠️ SECURITY WARNING**: Never commit `SUPABASE_SERVICE_ROLE_KEY` to version control. This key has full database access.

### Step 2: Create Database Schema

**Method 1: Via Supabase Dashboard**

1. Log in to Supabase: https://app.supabase.com/projects
2. Select your project: `REDACTED_SUPABASE_PROJECT_ID`
3. Navigate to: **SQL Editor** → **New Query**
4. Copy the complete SQL from `server/src/config/supabase-schema.sql`
5. Paste into the SQL Editor
6. Click **Run**
7. Verify all tables are created (check **Table Editor** section)

**Method 2: Via CLI (if Supabase CLI configured)**

```bash
supabase db push
```

**Method 3: Via psql (if PostgreSQL client available)**

```bash
psql -h db.REDACTED_SUPABASE_PROJECT_ID.supabase.co -U postgres -d postgres < server/src/config/supabase-schema.sql
```

### Step 3: Verify Database Schema

1. Open Supabase Dashboard → **Table Editor**
2. Verify these 23 tables exist:
   - users, addresses
   - categories, brands, products, product_images, product_variants
   - carts, cart_items, wishlists, wishlist_items
   - orders, order_items, payments
   - reviews, testimonials, bookings
   - conversations, messages, contact_messages
   - coupons, audit_logs

3. Verify relationships:
   - Foreign keys visible in table designer
   - Cascading delete rules applied

### Step 4: Test Database Connection

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
```

If connection fails:
1. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`
2. Check Supabase project is active (not paused)
3. Verify firewall allows connections (Supabase allows all by default)
4. Check network connectivity to `supabase.co` domain

---

## API Routes Mapping

### Current Implementation Status

**Auth Routes** (`server/src/routes/authRoutes.js`)
- ⚠️ Still using old Sequelize-based controller
- ✅ New controller available: `authController-supabase.js`
- **Action**: Update route imports to use new controller

**Product Routes** (`server/src/routes/productRoutes.js`)
- ⚠️ Still using old Sequelize-based controller
- ✅ New controller available: `productController-supabase.js`
- **Action**: Update route imports to use new controller

**Cart Routes** (`server/src/routes/cartRoutes.js`)
- ⚠️ Still using old Sequelize-based controller
- ✅ New controller available: `cartController-supabase.js`
- **Action**: Update route imports to use new controller

**Order Routes** (`server/src/routes/orderRoutes.js`)
- ⚠️ Still using old Sequelize-based controller
- ✅ New controller available: `orderController-supabase.js`
- **Action**: Update route imports to use new controller

### Routes That Still Need Migration

- Address routes
- Wishlist routes
- Review routes
- Testimonials routes
- Chat routes
- Admin routes
- Booking routes
- Contact routes
- Payment routes

---

## Service Layer Architecture

The new Supabase integration uses a clean service layer pattern:

```
Routes (Express)
    ↓
Controllers (Business Logic)
    ↓
Services (Data Access)
    ├── UserService (server/src/services/userService.js)
    ├── ProductService (server/src/services/productService.js)
    ├── CartService (server/src/services/cartService.js)
    ├── OrderService (server/src/services/orderService.js)
    ├── CategoryService (server/src/services/categoryService.js)
    └── ...Additional services...
    ↓
Supabase Client (config/supabase.js)
    ↓
PostgreSQL Database
```

**Benefits**:
- Clean separation of concerns
- Reusable database logic
- Easy to test services independently
- Consistent error handling

---

## Database Security (RLS Policies)

All tables are protected with **Row Level Security (RLS)** policies that enforce authorization at the database level:

### Users Table
- Users can only view their own profile (except admins)
- Users can only update their own profile
- Admins can manage all users

### Products Table
- Public users can view active products
- Admins can create/update/delete products
- Inactive products only visible to admins

### Cart & Wishlist
- Users can only access their own cart
- Users cannot view other users' carts

### Orders
- Users can only view their own orders
- Admins can view all orders
- Users cannot modify orders (only admins can update status)

### Conversations & Messages
- Users can only access their own conversations
- Admins can access all conversations

### RLS Policy Verification

1. Open Supabase Dashboard → **Authentication** → **Policies**
2. For each table, verify policies are listed
3. Policies should follow pattern: `[table]_[operation]_[role]`

Example policies shown:
- `users_select_own_data`
- `users_admin_manage_all`
- `products_public_read`
- `products_admin_write`
- `orders_user_own_view`
- `orders_admin_all_access`

---

## Performance Optimization

### Indexes Created

The schema includes strategic indexes for common queries:

```sql
-- User queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Product queries
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);

-- Order queries
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Cart queries
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);

-- etc.
```

### Connection Pooling

Supabase automatically manages connection pooling. No additional configuration needed.

---

## Transaction Handling

Critical operations like order creation use implicit transactions:

```javascript
// OrderService.createOrder() performs these operations atomically:
1. Validate cart contents
2. Create order record
3. Create order items
4. Update product stock
5. Create payment record
6. Clear customer cart
```

If any step fails, the entire operation is rolled back (Supabase handles this).

---

## Environment Variable Reference

### Required (Supabase)
```env
SUPABASE_URL=https://REDACTED_SUPABASE_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=REDACTED_SUPABASE_SERVICE_ROLE_KEY
```

### Required (Authentication)
```env
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

### Required (CORS)
```env
CLIENT_URL=http://localhost:5173
```

### Optional (External Services)
```env
RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
RAZORPAY_KEY_SECRET=s9G7Y6F7E3B2A1Z9X8W7V6U5
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz12345
```

### Deprecated (Remove from .env)
```env
# No longer needed
DB_DIALECT=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=devtech_ecommerce
DB_USER=root
DB_PASSWORD=***
DB_STORAGE=./database.sqlite
```

---

## Testing Checklist

### Unit Testing

Test each service independently:

```javascript
// Example: Test UserService
const user = await UserService.createUser({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  password: 'Password123',
  role: 'CUSTOMER'
});

assert(user.id);
assert(user.email === 'john@example.com');
```

### Integration Testing

Test complete workflows:

```javascript
// Example: Test checkout flow
1. Get/create cart
2. Add product to cart
3. Create order
4. Verify order created
5. Verify payment record created
6. Verify product stock reduced
7. Verify cart cleared
8. Generate receipt
```

### API Testing

Use Postman/Insomnia to test endpoints:

```
POST /api/auth/register
POST /api/auth/login
GET /api/products
GET /api/cart
POST /api/orders
GET /api/orders/:orderId
```

---

## Troubleshooting

### Issue: Connection timeout

**Symptoms**: "Error: Unable to connect to Supabase"

**Solutions**:
1. Verify `SUPABASE_URL` is correct (https, not http)
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is valid (starts with `sb_secret_`)
3. Check network connectivity: `ping REDACTED_SUPABASE_PROJECT_ID.supabase.co`
4. Verify firewall allows outbound HTTPS (port 443)

### Issue: RLS policy blocks operation

**Symptoms**: "new row violates row-level security policy"

**Solutions**:
1. Check RLS policies in Supabase Dashboard
2. Verify user is authenticated
3. Verify policy allows the operation
4. For development: temporarily disable RLS (NOT recommended for production)

### Issue: Service role key exposed

**Symptoms**: Key accidentally committed to Git

**Solutions**:
1. Immediately rotate key in Supabase Dashboard
2. Update `.env` with new key
3. Force push to remove from history (if on private repo)
4. Never commit secrets to Git

### Issue: Query performance slow

**Symptoms**: Database queries taking > 1 second

**Solutions**:
1. Verify indexes are created
2. Check query execution plan in Supabase
3. Optimize N+1 queries using batch operations
4. Add more specific filtering to reduce result sets

---

## Migration Completion Checklist

- [ ] All 23 Supabase tables created
- [ ] All RLS policies enabled
- [ ] All indexes created
- [ ] Supabase client configured in backend
- [ ] All service classes created (User, Product, Cart, Order, Category)
- [ ] All new controllers created
- [ ] Routes updated to use new controllers
- [ ] Authentication tested (register, login, logout)
- [ ] Product operations tested (list, detail, search)
- [ ] Cart operations tested (add, update, remove)
- [ ] Checkout flow tested end-to-end
- [ ] Order creation and receipt generation verified
- [ ] Admin dashboard tested
- [ ] Error handling verified
- [ ] Old Sequelize code removed
- [ ] Dependencies cleaned up
- [ ] Environment variables documented
- [ ] README updated with Supabase info
- [ ] Deployment tested
- [ ] Production RLS policies reviewed for security

---

## Next Steps

1. **Execute database schema**: Copy SQL from `supabase-schema.sql` and run in Supabase editor
2. **Seed development data**: Create seed service to populate test data
3. **Update route imports**: Gradually migrate routes to new controllers
4. **Test each feature**: Verify all workflows work with Supabase
5. **Remove old code**: Delete Sequelize models and old controllers
6. **Deploy to production**: Follow deployment guide in main README

---

## Reference Links

- **Supabase Project**: https://app.supabase.com/projects
- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security
- **JavaScript Client**: https://supabase.com/docs/reference/javascript/introduction

---

## Support

For issues or questions:
1. Check Supabase logs: Dashboard → **Logs**
2. Check backend logs: Server console output
3. Review this guide's troubleshooting section
4. Contact Supabase support: https://supabase.com/support

---

**Migration Guide Last Updated**: September 2, 2026
**Status**: Ready for implementation
