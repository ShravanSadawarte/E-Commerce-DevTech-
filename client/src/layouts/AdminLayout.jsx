import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Star,
  MessageSquare,
  LogOut,
  ChevronRight,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import { logoutUser } from '../store/authSlice';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', path: '/admin/users', icon: Users },
    { label: 'Reviews', path: '/admin/reviews', icon: Star },
    { label: 'Live Chat', path: '/admin/chat', icon: MessageSquare },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const currentLabel = navItems.find((i) => location.pathname.startsWith(i.path))?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-slate-900 text-white flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-[64px] px-6 flex items-center justify-between border-b border-white/10 shrink-0">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-900 font-black text-[13px]">N</span>
            <span className="text-[15px] font-black tracking-[-0.02em]">NEXORA</span>
            <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/70 ring-1 ring-white/10">Admin</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden -mr-2 p-2 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Management</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </span>
                {isActive && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full rounded-full border border-white/15 bg-white/10 py-2.5 text-[13px] font-semibold text-white hover:bg-white hover:text-slate-900 transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Back to storefront
          </Link>

          <div className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-3 py-3">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80'}
              alt={user?.name}
              className="h-9 w-9 rounded-full object-cover border border-white/10"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-none text-white">{user?.name}</p>
              <p className="truncate text-[11px] font-medium text-white/60">{user?.email}</p>
              <span className="mt-1 inline-flex rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-900">{user?.role}</span>
            </div>
            <button onClick={handleLogout} className="shrink-0 rounded-full bg-white/10 p-2 text-white/70 hover:bg-red-500 hover:text-white transition" title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-[64px] border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
          <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden -ml-1 rounded-xl p-2 text-slate-700 hover:bg-slate-100 transition">
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="hidden sm:block text-[11px] font-bold uppercase tracking-widest text-slate-400">Nexora Admin / {currentLabel}</p>
                <h1 className="font-display text-[18px] font-bold tracking-tight text-slate-900 capitalize">{currentLabel}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                API live
              </span>
              <Link to="/admin/orders" className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-[12px] font-semibold text-white hover:bg-black transition">
                Orders <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1280px] p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
