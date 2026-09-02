import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';
import ProfileLayout from './layouts/ProfileLayout';

// Public Pages
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import SearchResultsPage from './pages/SearchResultsPage';
import TestimonialsPage from './pages/TestimonialsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Authenticated Customer Pages
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import LiveChatPage from './pages/LiveChatPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import WishlistPage from './pages/WishlistPage';
import AddressesPage from './pages/AddressesPage';
import AccountSettingsPage from './pages/AccountSettingsPage';

// Admin Pages
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminProductCreateEditPage from './pages/AdminProductCreateEditPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminReviewsPage from './pages/AdminReviewsPage';
import AdminChatPage from './pages/AdminChatPage';

// Actions
import { fetchCurrentUser } from './store/authSlice';
import { fetchCart } from './store/cartSlice';
import { fetchWishlist } from './store/wishlistSlice';
import { fetchCategories } from './store/productSlice';

// Auth Route Guards
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCategories());
    if (localStorage.getItem('token')) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <Routes>
      {/* 1. Customer Storefront Layout Routes */}
      <Route element={<CustomerLayout />}>
        {/* Public Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/testimonials" element={<TestimonialsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Authenticated Customer Pages */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/order-success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><LiveChatPage /></ProtectedRoute>} />

        {/* Profile Sub-Pages Layout */}
        <Route element={<ProtectedRoute><ProfileLayout /></ProtectedRoute>}>
          <Route path="/profile" element={<AccountSettingsPage />} />
          <Route path="/settings" element={<AccountSettingsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailsPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/addresses" element={<AddressesPage />} />
        </Route>
      </Route>

      {/* 2. Admin Authentication Route */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* 3. Protected Admin Console Layout Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductCreateEditPage />} />
        <Route path="products/:id/edit" element={<AdminProductCreateEditPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="chat" element={<AdminChatPage />} />
      </Route>

      {/* Catch-all 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
