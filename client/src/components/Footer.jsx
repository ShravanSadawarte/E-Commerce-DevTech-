import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="section-shell py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="text-[18px] font-black tracking-tight text-slate-900">NEXORA</span>
            </Link>
            <p className="mt-3 max-w-sm text-[13px] leading-6 text-slate-500">Premium essentials, curated for everyday life. Quality materials, timeless design, fair pricing.</p>
            <form onSubmit={(e)=>{e.preventDefault(); alert('Subscribed — check your inbox');}} className="mt-5 flex max-w-sm gap-2">
              <input type="email" required placeholder="Email for updates" className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-[13px] placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none" />
              <button type="submit" className="rounded-full bg-slate-900 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-black">Join <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></button>
            </form>
            <p className="mt-2 text-[11px] text-slate-400">No spam. Unsubscribe anytime.</p>
          </div>

          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-widest text-slate-900">Shop</h4>
            <ul className="mt-4 space-y-2.5 text-[13px]">
              <li><Link to="/category/men" className="text-slate-600 hover:text-slate-900">Men</Link></li>
              <li><Link to="/category/women" className="text-slate-600 hover:text-slate-900">Women</Link></li>
              <li><Link to="/category/footwear" className="text-slate-600 hover:text-slate-900">Footwear</Link></li>
              <li><Link to="/category/bags" className="text-slate-600 hover:text-slate-900">Bags</Link></li>
              <li><Link to="/category/watches" className="text-slate-600 hover:text-slate-900">Watches</Link></li>
              <li><Link to="/category/deals" className="font-semibold text-red-600 hover:text-red-700">Deals</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-widest text-slate-900">Help</h4>
            <ul className="mt-4 space-y-2.5 text-[13px]">
              <li><Link to="/orders" className="text-slate-600 hover:text-slate-900">Track order</Link></li>
              <li><Link to="/chat" className="text-slate-600 hover:text-slate-900">Live chat</Link></li>
              <li><span className="text-slate-400">Shipping & returns</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-widest text-slate-900">Account</h4>
            <ul className="mt-4 space-y-2.5 text-[13px]">
              <li><Link to="/login" className="text-slate-600 hover:text-slate-900">Sign in</Link></li>
              <li><Link to="/register" className="text-slate-600 hover:text-slate-900">Create account</Link></li>
              <li><Link to="/profile" className="text-slate-600 hover:text-slate-900">Profile</Link></li>
              <li><Link to="/admin/login" className="inline-flex items-center gap-1 font-semibold text-slate-900 hover:text-blue-600"><ShieldCheck className="h-3.5 w-3.5" /> Admin</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-100 pt-6 text-[12px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Nexora. All rights reserved.</p>
          <div className="flex gap-4"><span>Privacy</span><span>Terms</span><span>Security</span></div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
