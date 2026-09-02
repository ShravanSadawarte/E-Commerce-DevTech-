# NEXORA | Everything you need. One place.

A premium full-stack commerce experience designed for modern shoppers, combining a polished storefront, curated product discovery, personalized booking, live support chat, secure checkout, and a high-control admin dashboard.

---

## 📑 Table of Contents
1. [Tech Stack](#-tech-stack)
2. [Key Features](#-key-features)
3. [Architecture & Data Flow](#-architecture--data-flow)
4. [Folder Structure](#-folder-structure)
5. [Database ER Relationships](#-database-er-relationships)
6. [Environment Variables](#-environment-variables)
7. [MySQL & Database Setup](#-mysql--database-setup)
8. [Local Development](#-local-development)
9. [API Documentation](#-api-documentation)
10. [Payment Gateway (Razorpay)](#-payment-gateway-razorpay)
11. [Deployment Guide](#-deployment-guide)
12. [Production Checklist](#-production-checklist)

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS (Minimal wireframe palette, Slate/Navy dark accents, responsive layouts)
- **Icons**: Lucide React
- **State Management**: Redux Toolkit & React-Redux
- **Routing**: React Router v6 with Role Guards & Protected Routes
- **API Client**: Axios with JWT Interceptors & error handlers
- **Real-Time**: Socket.IO Client

### Backend
- **Runtime**: Node.js & Express.js REST API
- **ORM & Database**: Sequelize ORM with MySQL support (and embedded SQLite dual-mode)
- **Authentication**: JSON Web Tokens (JWT) & bcrypt password hashing
- **Security**: Helmet, CORS, Express-Rate-Limit, Cookie-Parser
- **Payment Processing**: Razorpay Node SDK with backend HMAC-SHA256 signature verification
- **Real-Time Sockets**: Socket.IO for customer-to-admin live support chat

---

## ✨ Key Features

### 🛍️ Customer Storefront
- **Modern Minimalist UI**: Clean white card aesthetics, curated typography (Outfit & Inter), subtle shadows, and responsive multi-column layouts.
- **Dynamic Catalog**: 32+ realistic products across 9 categories with multiple high-res gallery shots and variant matrix (Colors, Sizes, Stock).
- **Search & Filters**: Debounced instant search, price slider, brand filter, size pills, color swatches, customer ratings, and server-side pagination.
- **Shopping Cart & Wishlist**: Server-calculated totals (tax, shipping, discount, total), variant selection, stock validation, and direct move-to-cart.
- **3-Step Checkout**:
  1. Shipping Address selector & New Address form
  2. Payment Method selection (Razorpay Online vs COD)
  3. Order Review, snapshot creation, and Razorpay modal integration
- **Stylist Booking / Calendar**: Interactive appointment date picker, time slot collision prevention (10:00 AM, 11:00 AM, 01:00 PM, etc.), and confirmation.
- **Live Support Chat**: Real-time concierge messaging powered by Socket.IO with REST message history persistence.
- **User Profile Dashboard**: My Orders with 6-stage delivery timeline status tracker, Saved Addresses CRUD, and Wishlist management.

### 🛡️ Administrative Console
- **Dashboard Analytics**: Total Revenue, Total Orders, Customers, Catalog count, Low-Stock alerts, Daily revenue chart, and recent orders.
- **Product Inventory Management**: Data table with live search, stock indicators, product creation & edit with multi-image URLs and variant matrices.
- **Category Taxonomy Management**: Organize slugs, thumbnails, and descriptions with deletion safety checks.
- **Order Fulfillment**: Change order states (`Pending` ➔ `Confirmed` ➔ `Processing` ➔ `Shipped` ➔ `Out for Delivery` ➔ `Delivered`) and audit payment statuses.
- **User Role Management**: Manage user permissions (`CUSTOMER`, `SUPPORT`, `ADMIN`, `SUPER_ADMIN`) and account activation.
- **Review Moderation**: Approve or remove customer product reviews.
- **Appointment Schedule**: Confirm, cancel, or complete stylist bookings.
- **Live Support Console**: Multi-customer chat dialogue and reply console.

---

## 🔄 Architecture & Data Flow

```
React (Vite + Tailwind + Redux)
   │ (Axios HTTP / Socket.IO)
   ▼
Express.js REST API (Port 5000)
   ├── Middleware (Helmet, CORS, RateLimit, AuthGuard, RoleGuard)
   ├── Controllers (Business Logic & Response Handlers)
   ├── Services (Transactional Order Processing, Stock Decrement)
   └── Sequelize ORM
         │
         ▼
MySQL Database (Users, Catalog, Carts, Orders, Payments, Reviews, Chats)
```

---

## 📂 Folder Structure

```
ecommerce/
├── client/                      # React Frontend
│   ├── src/
│   │   ├── components/          # Navbar, Footer, ProductCard, Pagination, FloatingChatWidget
│   │   ├── layouts/             # CustomerLayout, AdminLayout, ProfileLayout
│   │   ├── pages/               # 32+ Pages (Home, Category, ProductDetails, Cart, Checkout, etc.)
│   │   ├── services/            # Axios API client, Socket client
│   │   ├── store/               # Redux Toolkit root store & slices
│   │   ├── App.jsx              # Central router configuration
│   │   ├── index.css            # Tailwind design system tokens
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Node.js + Express Backend
│   ├── src/
│   │   ├── config/              # Database (MySQL/SQLite dual support), JWT, Razorpay
│   │   ├── controllers/         # Auth, Product, Cart, Order, Payment, Admin, Chat, Booking
│   │   ├── middleware/          # Auth, Roles, ErrorHandler, RateLimiter
│   │   ├── models/              # Sequelize entity models & associations
│   │   ├── routes/              # Express API routers mounted under /api/*
│   │   ├── seeders/             # Comprehensive database seeder (Users, 32+ Products, Orders)
│   │   ├── sockets/             # Socket.IO chat handlers
│   │   ├── app.js               # Express application setup
│   │   └── server.js            # Server entrypoint
│   ├── .env.example
│   └── package.json
│
├── package.json                 # Root script runner
└── README.md
```

---

## 🗄️ Database ER Relationships

- `User` 1:N `Address`
- `User` 1:1 `Cart` ➔ `Cart` 1:N `CartItem` ➔ `Product` 1:N `CartItem`
- `User` 1:1 `Wishlist` ➔ `Wishlist` 1:N `WishlistItem` ➔ `Product` 1:N `WishlistItem`
- `Category` 1:N `Product`
- `Brand` 1:N `Product`
- `Product` 1:N `ProductImage`
- `Product` 1:N `ProductVariant`
- `Product` 1:N `Review` ➔ `User` 1:N `Review`
- `User` 1:N `Order` ➔ `Order` 1:N `OrderItem` ➔ `Product` 1:N `OrderItem`
- `Order` 1:1 `Payment`
- `User` 1:N `Booking`
- `User` 1:N `Conversation` ➔ `Conversation` 1:N `Message`

---

## 🔑 Environment Variables

Create `.env` in `server/` based on `server/.env.example`:

```env
PORT=5000
NODE_ENV=development

# Database (Set DB_DIALECT=mysql when MySQL server is running, or sqlite for zero-config embedded SQLite)
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=nexora_ecommerce
DB_USER=root
DB_PASSWORD=your_password

# Authentication
JWT_SECRET=super_secret_jwt_key_nexora_ecommerce_2026_production_safe
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Razorpay
RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
RAZORPAY_KEY_SECRET=s9G7Y6F7E3B2A1Z9X8W7V6U5

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz12345
```

---

## 💾 MySQL & Database Setup

### 1. Create MySQL Database (if using MySQL)
```sql
CREATE DATABASE nexora_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Populate Database Schema & Seed Data
```bash
cd server
npm run seed
```

This creates:
- **Super Admin**: `admin@devtech.com` / `Admin@12345`
- **Support Staff**: `support@devtech.com` / `Admin@12345`
- **Customer Account**: `john.doe@example.com` / `Customer@12345`
- **9 Categories**: Men, Women, Footwear, Bags, Watches, Electronics, Home & Living, Beauty, Deals
- **32 Realistic Products** with variants, SKUs, and lifestyle gallery imagery.

---

## 💻 Local Development

### 1. Install all dependencies
```bash
npm run install:all
```

### 2. Start Both Server and Client Concurrently
```bash
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`
- **Admin Console**: `http://localhost:5173/admin/login`

---

## 📡 API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register new customer account | No |
| POST | `/api/auth/login` | Login customer | No |
| POST | `/api/auth/admin/login` | Login administrator | No |
| GET | `/api/auth/me` | Fetch logged-in user profile | Bearer Token |
| PUT | `/api/auth/profile` | Update profile information | Bearer Token |
| POST | `/api/auth/forgot-password` | Generate reset token | No |
| POST | `/api/auth/reset-password` | Reset password | No |

### Catalog & Products (`/api/products`, `/api/categories`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/products` | Fetch paginated products with filters | No |
| GET | `/api/products/filters` | Fetch available brands, sizes, colors | No |
| GET | `/api/products/:identifier` | Fetch single product details with variants | No |
| GET | `/api/categories` | Fetch all active categories | No |

### Cart & Wishlist (`/api/cart`, `/api/wishlist`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/cart` | Get user cart & recalculated totals | Bearer Token |
| POST | `/api/cart/items` | Add item/variant to cart with stock check | Bearer Token |
| PUT | `/api/cart/items/:id` | Update item quantity | Bearer Token |
| DELETE | `/api/cart/items/:id`| Remove item from cart | Bearer Token |
| GET | `/api/wishlist` | Fetch wishlist items | Bearer Token |
| POST | `/api/wishlist/toggle` | Toggle item in wishlist | Bearer Token |
| POST | `/api/wishlist/move-to-cart` | Move item to active cart | Bearer Token |

### Orders & Payments (`/api/orders`, `/api/payments`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/orders` | Create order with stock decrement transaction | Bearer Token |
| GET | `/api/orders/my-orders` | Fetch logged-in user orders | Bearer Token |
| GET | `/api/orders/:id` | Fetch order details with delivery timeline | Bearer Token |
| POST | `/api/payments/create-order`| Create Razorpay order | Bearer Token |
| POST | `/api/payments/verify` | Verify HMAC-SHA256 signature | Bearer Token |

### Bookings, Contact & Live Chat (`/api/bookings`, `/api/contact`, `/api/chat`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/bookings/slots?date=...` | Get available time slots for date | No |
| POST | `/api/bookings` | Book calendar stylist consultation | Optional Auth |
| POST | `/api/contact` | Submit contact form inquiry | Optional Auth |
| GET | `/api/chat/conversation` | Fetch customer conversation | Bearer Token |
| POST | `/api/chat/messages` | Send message | Bearer Token |

### Admin Endpoints (`/api/admin/*`)
- `GET /api/admin/dashboard/stats`: Analytics metrics & revenue chart
- `GET/POST/PUT/DELETE /api/admin/products`: Product catalog CRUD
- `GET/POST/PUT/DELETE /api/admin/categories`: Category taxonomy CRUD
- `GET /api/admin/orders` & `PUT /api/admin/orders/:id/status`: Order fulfillment
- `GET /api/admin/users` & `PUT /api/admin/users/:id/status`: User management
- `GET /api/admin/reviews` & `PUT /api/admin/reviews/:id/status`: Review moderation
- `GET /api/admin/bookings` & `PUT /api/admin/bookings/:id/status`: Appointments
- `GET /api/admin/messages` & `PUT /api/admin/messages/:id/status`: Inquiries
- `GET /api/admin/conversations` & `POST /api/admin/conversations/:id/messages`: Live Chat

---

## 💳 Payment Gateway (Razorpay)

1. Sign up on [Razorpay Dashboard](https://dashboard.razorpay.com/) to obtain `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
2. Configure them in `server/.env`.
3. When checkout is initiated, backend creates a Razorpay order entity with server-verified amount.
4. The frontend triggers the Razorpay modal. Upon successful client transaction, the backend validates the HMAC SHA256 signature before transitioning the order to `Paid` / `Confirmed`.

---

## 🚀 Deployment Guide

### Frontend (Vercel)
1. Link your Git repository to Vercel.
2. Root directory: `client`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variables: `VITE_API_URL=https://your-backend-domain.com/api`

### Backend (Render / Railway)
1. Root directory: `server`
2. Build command: `npm install`
3. Start command: `npm start`
4. Set production environment variables (`NODE_ENV=production`, `DB_DIALECT=mysql`, `CLIENT_URL=https://your-vercel-domain.app`, `JWT_SECRET=...`, `RAZORPAY_KEY_ID=...`).

---

## ✅ Production Checklist
- [x] Passwords securely hashed with bcrypt
- [x] JWT authentication with authorization middleware guards
- [x] Authoritative server-side pricing & inventory checks
- [x] Database transaction rollback on order failure
- [x] Helmet, CORS, and rate limiting configured
- [x] Clean zero-error production build
- [x] Responsive layout across Mobile, Tablet, and Desktop
