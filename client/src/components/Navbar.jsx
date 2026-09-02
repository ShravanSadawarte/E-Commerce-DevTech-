import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Menu,
  X,
  Search,
  Heart,
  ShoppingBag,
  User as UserIcon,
  LogOut,
  Package,
  Calendar,
  MessageSquare,
  Shield,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { logoutUser } from '../store/authSlice';
import { setMobileMenuOpen } from '../store/uiSlice';
import api from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, isAdmin, user } = useSelector((state) => state.auth);
  const { items: cartItems, totals: cartTotals } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { categories } = useSelector((state) => state.products);
  const { mobileMenuOpen } = useSelector((state) => state.ui);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

  const searchRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on route change or outside click
  useEffect(() => {
    setProfileDropdownOpen(false);
    setCategoriesDropdownOpen(false);
    setShowSearchDropdown(false);
    dispatch(setMobileMenuOpen(false));
  }, [location.pathname, dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/products', { params: { search: searchQuery, limit: 5 } });
        setSearchSuggestions(res.data?.products || []);
        setShowSearchDropdown(true);
      } catch (e) {
        setSearchSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchDropdown(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const totalCartCount = cartTotals?.itemCount ?? cartItems?.reduce((acc, i) => acc + i.quantity, 0) ?? 0;
  const totalWishlistCount = wishlistItems?.length || 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 text-center tracking-wide font-medium flex items-center justify-center gap-3">
        <span>Summer Season Sale: Complimentary Express Delivery on orders over $100</span>
        <span className="hidden md:inline font-mono opacity-60">|</span>
        <Link to="/booking" className="hidden md:inline underline hover:text-slate-200 text-xs">Book Stylist Consultation</Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Mobile Menu Button & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch(setMobileMenuOpen(!mobileMenuOpen))}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-sans uppercase">
                Dev<span className="text-blue-600">Tech</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6 ml-6 text-sm font-medium text-slate-700">
              <Link to="/" className="hover:text-slate-950 transition">Home</Link>
              <div className="relative group">
                <button
                  onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                  className="flex items-center gap-1 hover:text-slate-950 transition py-2"
                >
                  <span>Categories</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:rotate-180 transition-transform" />
                </button>
                <div className="absolute top-full left-0 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 hidden group-hover:block animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-xs font-semibold uppercase text-slate-400">Shop by Category</div>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      className="flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition"
                    >
                      <span>{cat.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  ))}
                </div>
              </div>
              <Link to="/category/deals" className="text-red-600 hover:text-red-700 font-semibold transition">Deals</Link>
              <Link to="/booking" className="hover:text-slate-950 transition">Book Appointment</Link>
              <Link to="/testimonials" className="hover:text-slate-950 transition">Testimonials</Link>
              <Link to="/contact" className="hover:text-slate-950 transition">Contact</Link>
            </nav>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-md hidden md:block" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search shirts, shoes, watches, bags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchSuggestions.length > 0) setShowSearchDropdown(true); }}
                className="w-full bg-slate-100 border border-slate-200 text-slate-900 rounded-full pl-10 pr-24 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-slate-900 text-white hover:bg-slate-800 text-xs px-3.5 py-1.5 rounded-full font-medium transition"
              >
                Search
              </button>

              {/* Autocomplete Dropdown */}
              {showSearchDropdown && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
                  <div className="p-2 divide-y divide-slate-100">
                    {searchSuggestions.map((prod) => (
                      <Link
                        key={prod.id}
                        to={`/product/${prod.slug || prod.id}`}
                        onClick={() => setShowSearchDropdown(false)}
                        className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition"
                      >
                        <img
                          src={prod.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=100&q=80'}
                          alt={prod.name}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">{prod.name}</p>
                          <p className="text-xs text-slate-500">${parseFloat(prod.discountPrice || prod.price).toFixed(2)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="w-full text-center py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border-t border-slate-100 transition"
                  >
                    View all results for "{searchQuery}"
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Right Action Icons: Wishlist, Cart, Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile search trigger */}
            <Link
              to="/search"
              className="md:hidden p-2 rounded-full text-slate-700 hover:bg-slate-100 transition"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative p-2 rounded-full text-slate-700 hover:bg-slate-100 transition"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {totalWishlistCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalWishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="relative p-2 rounded-full text-slate-700 hover:bg-slate-100 transition"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-slate-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Login */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <span className="hidden sm:inline text-xs font-semibold text-slate-800 max-w-[90px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 divide-y divide-slate-100">
                    <div className="px-4 py-2">
                      <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <UserIcon className="w-4 h-4 text-slate-500" />
                        My Profile & Settings
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Package className="w-4 h-4 text-slate-500" />
                        My Orders
                      </Link>
                      <Link
                        to="/booking"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Calendar className="w-4 h-4 text-slate-500" />
                        Bookings
                      </Link>
                      <Link
                        to="/chat"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                      >
                        <MessageSquare className="w-4 h-4 text-slate-500" />
                        Live Support Chat
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Shield className="w-4 h-4 text-blue-600" />
                          Admin Console
                        </Link>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="bg-slate-900 text-white hover:bg-slate-800 text-xs px-4 py-2 rounded-full font-semibold transition"
                >
                  LOGIN
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Slideout Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => dispatch(setMobileMenuOpen(false))}
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <span className="text-lg font-black tracking-tight uppercase">DevTech</span>
              <button
                onClick={() => dispatch(setMobileMenuOpen(false))}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="p-4 border-b border-slate-100">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </form>
            </div>

            {/* Links */}
            <div className="p-4 space-y-1 flex-1">
              <Link to="/" className="block py-2.5 px-3 rounded-lg text-sm font-medium text-slate-900 hover:bg-slate-50">
                Home
              </Link>
              <div className="py-2">
                <p className="px-3 text-xs font-semibold uppercase text-slate-400 mb-1">Categories</p>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    className="block py-2 px-3 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
              <Link to="/booking" className="block py-2.5 px-3 rounded-lg text-sm font-medium text-slate-900 hover:bg-slate-50">
                Book Stylist Appointment
              </Link>
              <Link to="/testimonials" className="block py-2.5 px-3 rounded-lg text-sm font-medium text-slate-900 hover:bg-slate-50">
                Testimonials
              </Link>
              <Link to="/contact" className="block py-2.5 px-3 rounded-lg text-sm font-medium text-slate-900 hover:bg-slate-50">
                Contact Us
              </Link>
              <Link to="/chat" className="block py-2.5 px-3 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50">
                Live Support Chat
              </Link>
              {isAdmin && (
                <Link to="/admin/dashboard" className="block py-2.5 px-3 rounded-lg text-sm font-bold text-indigo-600 hover:bg-indigo-50">
                  Admin Dashboard
                </Link>
              )}
            </div>

            {/* Mobile Footer Profile */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt={user?.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                      <p className="text-[11px] text-slate-500">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center py-2 text-xs font-bold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="block text-center w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  LOGIN / SIGN UP
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
