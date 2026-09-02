# Supabase Database Deployment Guide

## Overview

This guide explains how to deploy the complete Supabase PostgreSQL database schema to your remote Supabase project. The schema defines 23 tables with relationships, indexes, and Row Level Security (RLS) policies.

**Status**: Schema exists locally but NOT deployed to Supabase yet. This is why you don't see tables in the Supabase dashboard.

---

## Prerequisites

1. ✅ Supabase project created: https://REDACTED_SUPABASE_PROJECT_ID.supabase.co
2. ✅ Backend environment configured with credentials in `server/.env`
3. ✅ SQL schema file prepared: `server/src/config/supabase-schema.sql`

---

## DEPLOYMENT METHOD 1: Supabase Dashboard (Recommended for Development)

### Step 1: Login to Supabase Dashboard
1. Go to https://app.supabase.com
2. Sign in with your credentials
3. Select your project (NEXORA e-commerce)

### Step 2: Open SQL Editor
1. In the left sidebar, click **SQL Editor**
2. Click the **"+ New query"** button or **"New Query"** option
3. You should see an empty SQL editor

### Step 3: Copy the Schema SQL
1. Open the schema file: `server/src/config/supabase-schema.sql`
2. Select ALL content (Ctrl+A or Cmd+A in your editor)
3. Copy the entire content (Ctrl+C or Cmd+C)

### Step 4: Paste in Supabase
1. Click in the SQL editor area
2. Paste the schema (Ctrl+V or Cmd+V)
3. You should see the complete SQL schema in the editor

### Step 5: Execute the Schema
1. Click the **Run** button (▶️ icon) or press **Ctrl+Enter**
2. The query will execute and create all 23 tables

### Step 6: Verify Success
You should see:
- Green checkmark ✅ "Success: 1000+" (or similar message)
- No error messages

In the bottom panel, you should see status messages indicating:
- CREATE TABLE statements executing
- Indexes created
- RLS policies created

### Step 7: Verify Tables Created
1. In the left sidebar, click **Table Editor**
2. You should now see a list of 23 tables:
   - users
   - addresses
   - categories
   - brands
   - products
   - product_images
   - product_variants
   - carts
   - cart_items
   - wishlists
   - wishlist_items
   - orders
   - order_items
   - payments
   - reviews
   - testimonials
   - bookings
   - conversations
   - messages
   - contact_messages
   - coupons
   - audit_logs

If all 23 tables are visible, deployment is **SUCCESSFUL** ✅

---

## DEPLOYMENT METHOD 2: Supabase CLI (For Advanced Users)

### Prerequisites
- Node.js 18+ installed
- Supabase CLI installed: `npm install -g supabase`

### Steps
```bash
# Navigate to project root
cd "c:\Users\Shravan\Documents\E-Commerce(DevTech)"

# Link to Supabase project (if not already linked)
supabase link --project-ref REDACTED_SUPABASE_PROJECT_ID

# Apply migrations
supabase db push

# Verify schema
supabase db execute --file server/src/config/supabase-schema.sql
```

---

## DEPLOYMENT METHOD 3: Supabase Studio - SQL File Upload

If you prefer uploading the entire file:

1. Open Supabase Dashboard → SQL Editor
2. Click **"New query"** → **"Load from file"**
3. Select `server/src/config/supabase-schema.sql`
4. Click **Run**

---

## Post-Deployment Verification

### 1. Check Tables via Dashboard
```
Supabase Dashboard → Table Editor
Expected: 23 tables listed
```

### 2. Test Database Connection
```bash
# In project root
npm run dev

# In another terminal
node server/test-db.js
```

Expected output:
```
✅ Supabase connected successfully
📊 Database schema verified
```

### 3. Verify RLS Policies
```
Supabase Dashboard → Authentication → Policies
Expected: Policies for each table are listed and ENABLED
```

### 4. Test API Endpoints
```bash
# Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"test123"}'

# Expected: 201 Created
# Response: { user: {...}, token: "..." }
```

---

## If Schema Already Exists (Idempotent)

The schema file uses `CREATE TABLE IF NOT EXISTS`, so:
- ✅ Safe to run multiple times
- ✅ Won't duplicate data
- ✅ Won't throw errors on re-execution
- ⚠️ Updates to existing tables must be handled with ALTER TABLE migrations

---

## Tables Created

| Table | Purpose | Records |
|-------|---------|---------|
| users | Customer and admin accounts | Auth primary table |
| addresses | Shipping/billing addresses | User addresses |
| categories | Product categories | e.g., Electronics, Books |
| brands | Product brands | e.g., Apple, Samsung |
| products | Product catalog | e.g., iPhone 15, MacBook |
| product_images | Product photos | 1-10 per product |
| product_variants | Size, color options | Per product |
| carts | Shopping carts | 1 per user |
| cart_items | Products in cart | Cart contents |
| wishlists | Saved favorites | 1 per user |
| wishlist_items | Wishlist contents | Saved products |
| orders | Purchase records | Customer orders |
| order_items | Products in order | Order details |
| payments | Payment transactions | Razorpay integration |
| reviews | Product reviews | Customer feedback |
| testimonials | User testimonials | Marketing content |
| bookings | Service bookings | Features/add-ons |
| conversations | Live chat threads | Support chats |
| messages | Chat messages | Chat content |
| contact_messages | Contact form submissions | Support emails |
| coupons | Discount codes | Promo codes |
| audit_logs | Activity logs | Admin actions |

---

## Data Model (Entity Relationships)

```
users (primary key: id)
  ├─→ addresses (FK: user_id)
  ├─→ orders (FK: user_id)
  │    └─→ order_items (FK: order_id)
  │         └─→ products (FK: product_id - snapshot)
  ├─→ cart (FK: user_id) [1:1]
  │    └─→ cart_items (FK: cart_id)
  │         └─→ products (FK: product_id)
  ├─→ wishlist (FK: user_id) [1:1]
  │    └─→ wishlist_items (FK: wishlist_id)
  │         └─→ products (FK: product_id)
  └─→ reviews (FK: user_id)
       └─→ products (FK: product_id)

categories (primary key: id)
  └─→ products (FK: category_id)

brands (primary key: id)
  └─→ products (FK: brand_id)

products (primary key: id)
  ├─→ product_images
  ├─→ product_variants
  └─→ reviews
```

---

## RLS (Row Level Security) Policies

The schema includes RLS policies ensuring:

**CUSTOMER**:
- ✅ Can read public product/category data
- ✅ Can access own profile
- ✅ Can access own cart/orders
- ✅ Cannot access other users' data
- ❌ Cannot perform admin operations

**ADMIN/SUPER_ADMIN**:
- ✅ Can manage products/categories
- ✅ Can view all orders
- ✅ Can manage users
- ✅ Can view analytics
- ✅ Can moderate reviews

**ANONYMOUS** (unauthenticated):
- ✅ Can read public product/category data
- ❌ Cannot access user data
- ❌ Cannot create orders

---

## Environment Variables

Ensure `server/.env` contains:

```env
# SUPABASE CONFIGURATION
SUPABASE_URL=https://REDACTED_SUPABASE_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=REDACTED_SUPABASE_SERVICE_ROLE_KEY

# Other vars...
PORT=5000
JWT_SECRET=your_jwt_secret
```

**⚠️ SECURITY WARNING**: Never commit `.env` file or credentials to Git. Add to `.gitignore`.

---

## Troubleshooting

### "Error: Permission denied"
- Check that you're using the **service-role key**, not anon key
- Service-role key has admin privileges needed for schema creation

### "Error: Table already exists"
- Schema uses `CREATE TABLE IF NOT EXISTS` - this is safe
- If you need to recreate, use the Supabase dashboard to delete tables first

### "RLS policies not applying"
- Verify in Supabase dashboard: Authentication → Policies
- Ensure RLS is ENABLED on each table (usually default)
- Check that policies are properly scoped (auth.uid() matches user_id)

### "Foreign key constraint failed"
- Ensure parent tables (users, products, categories) exist
- Order of table creation matters - parents before children
- The provided SQL handles this correctly

### Backend still connecting to SQLite/MySQL
- Update `.env` to include Supabase credentials
- Restart server: `npm run dev`
- Check logs for: "✅ Supabase database connection successful"

---

## Next Steps After Deployment

1. ✅ Deploy schema (this step)
2. ⏳ Run end-to-end tests: User registration → Checkout
3. ⏳ Verify RLS policies with actual operations
4. ⏳ Remove old Sequelize code and dependencies
5. ⏳ Deploy to production environment

---

## Production Deployment

For production:

1. **Create separate Supabase project** for production
2. **Update .env.production** with new credentials:
   ```env
   SUPABASE_URL=https://your-production-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_production_key
   ```
3. **Deploy schema** to production project (same steps, different credentials)
4. **Test thoroughly** in production environment
5. **Keep backups** of Supabase data

---

## Support

If you encounter issues:

1. Check Supabase Dashboard → Logs for error messages
2. Verify credentials in `server/.env`
3. Ensure all 23 tables appear in Table Editor
4. Test with `npm run dev` and check console output
5. Review troubleshooting section above

---

**Schema Deployment File**: `server/src/config/supabase-schema.sql`

**Supabase Project**: https://app.supabase.com

**Documentation**: `SUPABASE_MIGRATION.md`

---

Generated: 2026-09-02
Last Updated: Session 3 - Supabase Migration Audit and Setup
