import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, RotateCcw, ShieldCheck, Headphones, ArrowRight, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      {/* 4 Feature Benefits Strip */}
      <div className="border-b border-slate-200 bg-slate-50/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-xs">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Free Shipping</h4>
                <p className="text-xs text-slate-500">On all orders over $100</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-xs">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Easy Returns</h4>
                <p className="text-xs text-slate-500">30-day money-back guarantee</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Secure Payment</h4>
                <p className="text-xs text-slate-500">256-bit SSL Razorpay encryption</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-xs">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">24/7 Support</h4>
                <p className="text-xs text-slate-500">Dedicated live agent assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              Dev<span className="text-blue-600">Tech</span>
            </Link>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              DevTech is an experiential e-commerce destination curated for discerning individuals who appreciate enduring craftsmanship, modern tailoring, and refined aesthetics.
            </p>
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-900 block mb-2">Subscribe to our newsletter</span>
              <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to DevTech insider updates!'); }} className="flex max-w-sm">
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="bg-slate-50 border border-slate-200 text-slate-900 rounded-l-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 flex-1"
                />
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 py-2 rounded-r-xl font-semibold flex items-center gap-1 transition"
                >
                  Join
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h5 className="text-xs font-bold uppercase text-slate-900 tracking-wider mb-4">Shop</h5>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li><Link to="/category/men" className="hover:text-slate-950 transition">Men's Apparel</Link></li>
              <li><Link to="/category/women" className="hover:text-slate-950 transition">Women's Collection</Link></li>
              <li><Link to="/category/footwear" className="hover:text-slate-950 transition">Footwear & Sneakers</Link></li>
              <li><Link to="/category/bags" className="hover:text-slate-950 transition">Leather Bags</Link></li>
              <li><Link to="/category/watches" className="hover:text-slate-950 transition">Luxury Watches</Link></li>
              <li><Link to="/category/deals" className="text-red-600 font-semibold hover:text-red-700 transition">Exclusive Deals</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="text-xs font-bold uppercase text-slate-900 tracking-wider mb-4">Customer Care</h5>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li><Link to="/orders" className="hover:text-slate-950 transition">Track Your Order</Link></li>
              <li><Link to="/booking" className="hover:text-slate-950 transition">Book Stylist Session</Link></li>
              <li><Link to="/chat" className="hover:text-slate-950 transition">Live Chat Support</Link></li>
              <li><Link to="/contact" className="hover:text-slate-950 transition">Contact & Inquiries</Link></li>
              <li><Link to="/testimonials" className="hover:text-slate-950 transition">Verified Reviews</Link></li>
            </ul>
          </div>

          {/* Admin & Account */}
          <div>
            <h5 className="text-xs font-bold uppercase text-slate-900 tracking-wider mb-4">Account & Portal</h5>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li><Link to="/login" className="hover:text-slate-950 transition">Customer Sign In</Link></li>
              <li><Link to="/register" className="hover:text-slate-950 transition">Create Account</Link></li>
              <li><Link to="/profile" className="hover:text-slate-950 transition">Account Settings</Link></li>
              <li><Link to="/admin/login" className="text-indigo-600 font-medium hover:underline">Admin Portal</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & credits */}
        <div className="border-t border-slate-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} DevTech E-Commerce Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
