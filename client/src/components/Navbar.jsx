import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Menu, X, Search, Heart, ShoppingBag, User as UserIcon,
  LogOut, Package, MessageSquare, Shield, ChevronDown, ChevronRight,
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
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    setProfileDropdownOpen(false);
    setShowSearchDropdown(false);
    dispatch(setMobileMenuOpen(false));
  }, [location.pathname, dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchDropdown(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) { setSearchSuggestions([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/products', { params: { search: searchQuery, limit: 5 } });
        setSearchSuggestions(res.data?.products || []);
        setShowSearchDropdown(true);
      } catch { setSearchSuggestions([]); }
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
  const handleLogout = () => { dispatch(logoutUser()); navigate('/login'); };
  const totalCartCount = cartTotals?.itemCount ?? cartItems?.reduce((a, i) => a + i.quantity, 0) ?? 0;
  const totalWishlistCount = wishlistItems?.length || 0;
  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/70">
      {/* Announcement */}
      <div className="bg-slate-900 text-white text-[11px] tracking-wide">
        <div className="section-shell flex items-center justify-center gap-2 py-2 text-center">
          <span className="hidden sm:inline opacity-70">Free shipping on orders over $100</span>
          <span className="hidden sm:inline opacity-30">•</span>
          <span className="font-medium">New arrivals — curated for the season</span>
          <Link to="/category/deals" className="hidden md:inline-flex ml-2 underline decoration-white/30 underline-offset-4 hover:decoration-white font-semibold">Shop deals</Link>
        </div>
      </div>

      <div className="section-shell">
        <div className="flex h-[64px] items-center justify-between gap-4">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch(setMobileMenuOpen(!mobileMenuOpen))}
              className="lg:hidden -ml-2 p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              aria-label="Menu"
            ><Menu className="w-5 h-5" /></button>

            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-[13px] tracking-tight">N</div>
              <span className="text-[20px] font-black tracking-[-0.04em] text-slate-900">NEXORA</span>
              <span className="hidden sm:inline text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400 border-l border-slate-200 pl-2.5 ml-1">Store</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 ml-6">
              <Link to="/" className={`px-3 py-2 rounded-full text-[13px] font-medium transition ${isActive('/') ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>Home</Link>
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition">
                  Categories <ChevronDown className="h-3.5 w-3.5 opacity-50 group-hover:rotate-180 transition-transform duration-200" />
                </button>
                <div className="absolute left-0 top-full mt-2 w-[320px] rounded-2xl border border-slate-200 bg-white p-2 shadow-elevated hidden group-hover:block animate-fadeIn">
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Browse</div>
                  {categories.slice(0, 8).map((cat) => (
                    <Link key={cat.id} to={`/category/${cat.slug}`} className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">
                      <span>{cat.name}</span><ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                    </Link>
                  ))}
                  <Link to="/category/deals" className="mt-1 flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold text-red-600 hover:bg-red-50 transition">
                    <span>Deals & offers</span><ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
              <Link to="/testimonials" className={`px-3 py-2 rounded-full text-[13px] font-medium transition ${isActive('/testimonials') ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>Reviews</Link>
              <Link to="/chat" className={`px-3 py-2 rounded-full text-[13px] font-medium transition ${isActive('/chat') ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>Support</Link>
            </nav>
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-[420px] mx-4" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-slate-400" />
              <input
                type="text"
                placeholder="Search products, brands, categories"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchSuggestions.length > 0) setShowSearchDropdown(true); }}
                className="w-full h-[42px] rounded-full border border-slate-200 bg-slate-50 pl-10 pr-[88px] text-[13px] font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/10 transition-all"
              />
              <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 h-[34px] rounded-full bg-slate-900 px-4 text-[12px] font-semibold tracking-wide text-white hover:bg-black transition">
                Search
              </button>
              {showSearchDropdown && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-elevated">
                  <div className="p-2">
                    {searchSuggestions.map((prod) => (
                      <Link key={prod.id} to={`/product/${prod.slug || prod.id}`} onClick={() => setShowSearchDropdown(false)} className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition">
                        <img src={prod.images?.[0]?.imageUrl} alt="" className="w-11 h-11 rounded-xl object-cover border border-slate-100" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-slate-900 truncate">{prod.name}</p>
                          <p className="text-[12px] font-medium text-slate-500">${parseFloat(prod.discountPrice || prod.price).toFixed(2)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <button type="submit" className="w-full border-t border-slate-100 bg-slate-50 py-2.5 text-center text-[12px] font-semibold text-slate-600 hover:bg-slate-100 transition">View all results</button>
                </div>
              )}
            </form>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link to="/search" className="md:hidden p-2.5 rounded-full text-slate-600 hover:bg-slate-100 transition" aria-label="Search"><Search className="w-[18px] h-[18px]" /></Link>
            <Link to="/wishlist" className="relative p-2.5 rounded-full text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition" aria-label="Wishlist">
              <Heart className="w-[18px] h-[18px]" />
              {totalWishlistCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">{totalWishlistCount}</span>}
            </Link>
            <Link to="/cart" className="relative p-2.5 rounded-full text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition" aria-label="Cart">
              <ShoppingBag className="w-[18px] h-[18px]" />
              {totalCartCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold leading-none text-white">{totalCartCount}</span>}
            </Link>
            <div className="hidden sm:block h-6 w-px bg-slate-200 mx-1" />
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white pl-1 pr-2.5 py-1 hover:border-slate-300 hover:bg-slate-50 transition shadow-subtle">
                  <img src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'} alt="" className="w-7 h-7 rounded-full object-cover" />
                  <span className="hidden lg:inline text-[13px] font-semibold text-slate-800 max-w-[96px] truncate">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-slate-400 transition ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-elevated z-50">
                    <div className="p-4 bg-slate-50/70 border-b border-slate-100">
                      <p className="text-[13px] font-semibold text-slate-900">{user?.name}</p>
                      <p className="text-[12px] text-slate-500 truncate">{user?.email}</p>
                      {isAdmin && <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase text-blue-700 ring-1 ring-blue-200">Admin</span>}
                    </div>
                    <div className="p-2">
                      <Link to="/profile" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition"><UserIcon className="w-4 h-4 text-slate-500" /> Profile & settings</Link>
                      <Link to="/orders" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition"><Package className="w-4 h-4 text-slate-500" /> Orders</Link>
                      <Link to="/chat" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition"><MessageSquare className="w-4 h-4 text-slate-500" /> Live chat</Link>
                      {isAdmin && <Link to="/admin/dashboard" className="flex items-center gap-3 rounded-xl bg-slate-900 px-3 py-2.5 text-[13px] font-semibold text-white hover:bg-black transition mt-1"><Shield className="w-4 h-4" /> Admin console</Link>}
                    </div>
                    <div className="p-2 border-t border-slate-100">
                      <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-red-600 hover:bg-red-50 transition"><LogOut className="w-4 h-4" /> Sign out</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden sm:inline-flex rounded-full px-4 py-2 text-[13px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition">Log in</Link>
                <Link to="/register" className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white hover:bg-black transition shadow-sm">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => dispatch(setMobileMenuOpen(false))} />
          <div className="relative w-[88%] max-w-[360px] bg-white h-full shadow-2xl flex flex-col overflow-hidden">
            <div className="h-[64px] px-5 flex items-center justify-between border-b border-slate-100 shrink-0">
              <span className="text-[16px] font-black tracking-tight">NEXORA</span>
              <button onClick={() => dispatch(setMobileMenuOpen(false))} className="p-2 rounded-xl hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 border-b border-slate-100">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." className="w-full h-11 rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-[13px] focus:bg-white focus:border-slate-900 focus:outline-none" />
              </form>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <Link to="/" className="flex items-center justify-between rounded-xl px-3 py-3 text-[14px] font-semibold hover:bg-slate-50">Home <ChevronRight className="w-4 h-4 text-slate-300" /></Link>
              <div className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">Categories</div>
              {categories.slice(0, 8).map((cat) => (
                <Link key={cat.id} to={`/category/${cat.slug}`} className="block rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50">{cat.name}</Link>
              ))}
              <Link to="/testimonials" className="flex items-center justify-between rounded-xl px-3 py-3 text-[14px] font-semibold hover:bg-slate-50">Reviews <ChevronRight className="w-4 h-4 text-slate-300" /></Link>
              <Link to="/chat" className="flex items-center justify-between rounded-xl px-3 py-3 text-[14px] font-semibold text-blue-600 hover:bg-blue-50">Live support <ChevronRight className="w-4 h-4" /></Link>
              {isAdmin && <Link to="/admin/dashboard" className="flex items-center justify-between rounded-xl bg-slate-900 px-3 py-3 text-[14px] font-semibold text-white">Admin dashboard <ChevronRight className="w-4 h-4" /></Link>}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <img src={user?.avatar} alt="" className="w-9 h-9 rounded-full" />
                  <div className="flex-1 min-w-0"><p className="text-[13px] font-semibold truncate">{user?.name}</p><p className="text-[12px] text-slate-500 truncate">{user?.email}</p></div>
                  <button onClick={handleLogout} className="rounded-full bg-white border border-slate-200 px-3 py-1.5 text-[12px] font-semibold">Logout</button>
                </div>
              ) : (
                <Link to="/login" className="flex w-full items-center justify-center rounded-full bg-slate-900 py-3 text-[13px] font-semibold text-white">Log in / Sign up</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
export default Navbar;
