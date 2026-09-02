import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { User, Lock, Mail, ChevronRight, Loader2 } from 'lucide-react';
import { loginUser, clearAuthError } from '../store/authSlice';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { loading, error, isAuthenticated, isAdmin } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('john.doe@example.com');
  const [password, setPassword] = useState('Customer@12345');

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    const res = await dispatch(loginUser({ email, password }));
    if (!res.error) {
      navigate(from, { replace: true });
    }
  };

  const handleQuickDemoCustomer = () => {
    setEmail('john.doe@example.com');
    setPassword('Customer@12345');
  };

  const handleQuickDemoAdmin = () => {
    setEmail('admin@devtech.com');
    setPassword('Admin@12345');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 card-shadow space-y-6">
        {/* Wireframe Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-800 border border-slate-200 shadow-xs">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wider uppercase text-slate-900">
              LOGIN / REGISTER
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to your DevTech account
            </p>
          </div>
        </div>

        {/* Demo Credentials Quick Switcher Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Quick Fill Demo Accounts:
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleQuickDemoCustomer}
              className="flex-1 py-1 px-2 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold hover:bg-slate-100 transition text-[11px]"
            >
              👤 Customer (John)
            </button>
            <button
              type="button"
              onClick={handleQuickDemoAdmin}
              className="flex-1 py-1 px-2 rounded-lg bg-white border border-slate-200 text-indigo-700 font-bold hover:bg-indigo-50 transition text-[11px]"
            >
              🛡️ Super Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email / Phone
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl pl-11 pr-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <Link to="/forgot-password" className="text-[11px] text-blue-600 font-semibold hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl pl-11 pr-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition hover:scale-[1.01]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>LOGIN</span>}
          </button>
        </form>

        {/* Social Login Separator */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-bold uppercase text-slate-400 absolute">
            or
          </span>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => alert('OAuth configuration ready: Set GOOGLE_CLIENT_ID in production environment.')}
            className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition"
          >
            <span className="text-red-500 font-bold">G</span>
            <span>Google</span>
          </button>
          <button
            type="button"
            onClick={() => alert('OAuth configuration ready: Set FACEBOOK_CLIENT_ID in production environment.')}
            className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition"
          >
            <span className="text-blue-600 font-bold">f</span>
            <span>Facebook</span>
          </button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-slate-900 underline hover:text-blue-600">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
