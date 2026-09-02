import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, Loader2, ArrowRight, Shield } from 'lucide-react';
import { loginUser, clearAuthError } from '../store/authSlice';

const LoginPage = () => {
  const navigate = useNavigate(); const location = useLocation(); const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('john.doe@example.com');
  const [password, setPassword] = useState('Customer@12345');
  const [showPass, setShowPass] = useState(false);
  const from = location.state?.from?.pathname || '/';
  const handleSubmit = async (e) => { e.preventDefault(); dispatch(clearAuthError()); const res = await dispatch(loginUser({ email, password })); if (!res.error) navigate(from, { replace: true }); };

  return (
    <div className="min-h-[78vh] bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[440px] rounded-[24px] border border-slate-200 bg-white p-7 sm:p-8 shadow-card">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white font-black text-[13px]">N</div>
            <span className="text-[16px] font-black tracking-tight">NEXORA</span>
          </Link>
          <h1 className="mt-4 font-display text-[22px] font-bold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-1 text-[13px] text-slate-500">Sign in to your account</p>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Demo accounts — one click</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button type="button" onClick={()=>{setEmail('john.doe@example.com');setPassword('Customer@12345');}} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold hover:bg-slate-50">Customer</button>
            <button type="button" onClick={()=>{setEmail('admin@devtech.com');setPassword('Admin@12345');}} className="rounded-full bg-slate-900 px-3 py-2 text-[12px] font-semibold text-white hover:bg-black flex items-center justify-center gap-1"><Shield className="h-3.5 w-3.5" /> Admin</button>
          </div>
        </div>

        {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-700">Email</label>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="text" required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-[14px] placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/10" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-[12px] font-semibold text-blue-600 hover:underline">Forgot?</Link>
            </div>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type={showPass ? 'text' : 'password'} required value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-[14px] placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/10" />
              <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100">{showPass ? 'Hide' : 'Show'}</button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-slate-900 text-[13px] font-semibold tracking-wide text-white hover:bg-black disabled:opacity-40 transition">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-slate-200" /><span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">or</span><div className="h-px flex-1 bg-slate-200" /></div>

        <p className="text-center text-[13px] text-slate-600">New here? <Link to="/register" className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900">Create account</Link></p>
        <p className="mt-3 text-center text-[11px] text-slate-400">By signing in you agree to our Terms and Privacy.</p>
      </div>
    </div>
  );
};
export default LoginPage;
