import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { User, Lock, Mail, Phone, Loader2, ArrowRight } from 'lucide-react';
import { registerUser, clearAuthError } from '../store/authSlice';

const RegisterPage = () => {
  const navigate = useNavigate(); const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [phone, setPhone] = useState('');
  const [password, setPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { alert('Passwords do not match'); return; }
    dispatch(clearAuthError());
    const res = await dispatch(registerUser({ name, email, phone, password }));
    if (!res.error) navigate('/');
  };
  const Field = ({ label, icon: Icon, ...props }) => (
    <div>
      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-700">{label}</label>
      <div className="relative mt-1.5">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input {...props} className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-[14px] placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/10" />
      </div>
    </div>
  );
  return (
    <div className="min-h-[78vh] bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[480px] rounded-[24px] border border-slate-200 bg-white p-7 sm:p-8 shadow-card">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white font-black text-[13px]">N</div><span className="text-[16px] font-black tracking-tight">NEXORA</span></Link>
          <h1 className="mt-4 font-display text-[22px] font-bold tracking-tight text-slate-900">Create account</h1>
          <p className="mt-1 text-[13px] text-slate-500">Join for curated essentials & member perks</p>
        </div>
        {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">{error}</div>}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Full name *" icon={User} type="text" required placeholder="John Doe" value={name} onChange={(e)=>setName(e.target.value)} />
          <Field label="Email *" icon={Mail} type="email" required placeholder="john@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <Field label="Phone" icon={Phone} type="tel" placeholder="+1 555 123 4567" value={phone} onChange={(e)=>setPhone(e.target.value)} />
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-700">Password *</label>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type={showPass ? 'text' : 'password'} required minLength={6} placeholder="••••••••" value={password} onChange={(e)=>setPassword(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-16 text-[14px] placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/10" />
              <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest">{showPass ? 'Hide' : 'Show'}</button>
            </div>
          </div>
          <Field label="Confirm password *" icon={Lock} type={showPass ? 'text' : 'password'} required placeholder="••••••••" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} />
          <button type="submit" disabled={loading} className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-slate-900 text-[13px] font-semibold tracking-wide text-white hover:bg-black disabled:opacity-40">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>
        <p className="mt-6 text-center text-[13px] text-slate-600">Already have an account? <Link to="/login" className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900">Log in</Link></p>
      </div>
    </div>
  );
};
export default RegisterPage;
