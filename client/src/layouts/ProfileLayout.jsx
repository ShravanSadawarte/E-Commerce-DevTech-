import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Package, Heart, MapPin, Settings, LogOut, Shield } from 'lucide-react';
import { logoutUser } from '../store/authSlice';

const ProfileLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAdmin } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const navItems = [
    { label: 'My Orders', path: '/orders', icon: Package },
    { label: 'Wishlist', path: '/wishlist', icon: Heart },
    { label: 'Saved Addresses', path: '/addresses', icon: MapPin },
    { label: 'Account Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Menu */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 card-shadow space-y-6">
            {/* User Profile Header Badge */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                alt={user?.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 shadow-xs"
              />
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 truncate">{user?.name}</h3>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1 bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                  {user?.role || 'Customer'}
                </span>
              </div>
            </div>

            {/* Menu Links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}

              {isAdmin && (
                <NavLink
                  to="/admin/dashboard"
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-blue-600 hover:bg-blue-50 transition"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </NavLink>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition text-left mt-4 border-t border-slate-100 pt-4"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Right Tab Content */}
        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
