import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import { fetchCart, updateCartItemQty, removeCartItem } from '../store/cartSlice';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, totals, loading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');

  useEffect(() => { if (isAuthenticated) dispatch(fetchCart()); }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="section-shell py-16 text-center">
        <div className="mx-auto max-w-md rounded-[24px] border border-slate-200 bg-white p-8 shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white"><ShoppingBag className="h-7 w-7" /></div>
          <h2 className="mt-4 text-[18px] font-bold text-slate-900">Sign in to view your bag</h2>
          <p className="mt-1 text-[13px] leading-6 text-slate-500">Please log in to sync your cart across devices.</p>
          <Link to="/login" className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-[13px] font-semibold text-white hover:bg-black">Sign in</Link>
        </div>
      </div>
    );
  }

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'WELCOME10') { setAppliedDiscount(totals.subtotal * 0.1); setPromoMessage('WELCOME10 applied — 10% off'); }
    else if (promoCode.trim().toUpperCase() === 'NEXORA25') { setAppliedDiscount(25); setPromoMessage('NEXORA25 applied — $25 off'); }
    else { setAppliedDiscount(0); setPromoMessage('Invalid code'); }
  };
  const finalTotal = Math.max(0, totals.total - appliedDiscount);

  if (!loading && (!items || items.length === 0)) {
    return (
      <div className="section-shell py-16 text-center">
        <div className="mx-auto max-w-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><ShoppingBag className="h-8 w-8" /></div>
          <h2 className="mt-4 font-display text-[24px] font-bold tracking-tight text-slate-900">Your bag is empty</h2>
          <p className="mt-1 text-[13px] text-slate-500">Add some favourites — they’ll appear here.</p>
          <Link to="/category/men" className="mt-6 inline-flex rounded-full bg-slate-900 px-7 py-3.5 text-[13px] font-semibold text-white hover:bg-black shadow-sm">Explore catalog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell py-6 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight text-slate-900 sm:text-[30px]">Bag</h1>
          <p className="mt-1 text-[13px] text-slate-500"><span className="inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-bold tracking-widest text-white">{totals.itemCount} items</span> <span className="ml-2">Ready for checkout</span></p>
        </div>
        <Link to="/category/men" className="hidden sm:inline-flex items-center gap-1 text-[13px] font-semibold text-slate-600 hover:text-slate-900">Continue shopping <ArrowRight className="h-4 w-4" /></Link>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <div className="rounded-[24px] border border-slate-200/70 bg-white shadow-card overflow-hidden divide-y divide-slate-100">
          {items.map((item) => {
            const product = item.product; const variant = item.variant;
            const unitPrice = parseFloat(product.discountPrice || product.price) + (variant ? parseFloat(variant.additionalPrice || 0) : 0);
            const itemTotal = unitPrice * item.quantity;
            const img = product.images?.[0]?.imageUrl;
            return (
              <div key={item.id} className="flex gap-4 p-4 sm:p-5">
                <Link to={`/product/${product.slug || product.id}`} className="shrink-0"><img src={img} alt={product.name} className="h-[84px] w-[84px] rounded-2xl object-cover border border-slate-100 bg-slate-50" /></Link>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{product.brand?.name || product.category?.name}</p>
                  <Link to={`/product/${product.slug || product.id}`} className="line-clamp-1 text-[14px] font-semibold text-slate-900 hover:text-blue-600">{product.name}</Link>
                  {variant && <p className="text-[12px] text-slate-500">{[variant.color, variant.size].filter(Boolean).join(' • ')}</p>}
                  <p className="mt-1 text-[13px] font-semibold text-slate-900">${unitPrice.toFixed(2)} <span className="font-normal text-slate-400">each</span></p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1">
                      <button onClick={() => item.quantity > 1 && dispatch(updateCartItemQty({ itemId: item.id, quantity: item.quantity - 1 }))} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-slate-50"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-8 text-center text-[13px] font-semibold">{item.quantity}</span>
                      <button onClick={() => dispatch(updateCartItemQty({ itemId: item.id, quantity: item.quantity + 1 }))} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-slate-50"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <button onClick={() => dispatch(removeCartItem(item.id))} className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    <span className="ml-auto text-[14px] font-bold text-slate-900">${itemTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-slate-200/70 bg-white p-6 shadow-card">
            <h2 className="text-[12px] font-bold uppercase tracking-widest text-slate-900">Order summary</h2>
            <div className="mt-4 space-y-3 text-[13px]">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="font-semibold text-slate-900">${totals.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-slate-600"><span>Tax (5%)</span><span className="font-semibold text-slate-900">${totals.tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-slate-600"><span>Shipping</span><span className="font-semibold text-slate-900">{totals.shipping === 0 ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 ring-1 ring-emerald-200 font-bold">Free</span> : `$${totals.shipping.toFixed(2)}`}</span></div>
              {appliedDiscount > 0 && <div className="flex justify-between font-semibold text-emerald-600"><span>Discount</span><span>-${appliedDiscount.toFixed(2)}</span></div>}
              <div className="flex justify-between border-t border-slate-200 pt-3 text-[16px] font-bold text-slate-900"><span>Total</span><span>${finalTotal.toFixed(2)}</span></div>
            </div>

            <form onSubmit={handleApplyPromo} className="mt-5 flex gap-2">
              <input value={promoCode} onChange={(e)=>setPromoCode(e.target.value)} placeholder="Promo code" className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-[13px] font-medium uppercase placeholder:normal-case focus:bg-white focus:border-slate-900 focus:outline-none" />
              <button type="submit" className="rounded-full bg-slate-900 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-black">Apply</button>
            </form>
            {promoMessage && <p className={`mt-2 text-[12px] font-medium ${appliedDiscount ? 'text-emerald-600' : 'text-red-600'}`}>{promoMessage}</p>}
            <p className="mt-2 text-[11px] text-slate-400">Try WELCOME10 or NEXORA25</p>

            <button onClick={() => navigate('/checkout')} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-4 text-[13px] font-semibold tracking-wide text-white hover:bg-black shadow-sm">Proceed to checkout <ArrowRight className="h-4 w-4" /></button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400"><ShieldCheck className="h-3.5 w-3.5" /> Secure checkout • 256-bit encryption</p>
          </div>
          <Link to="/category/men" className="flex items-center justify-center gap-1 text-[13px] font-semibold text-slate-600 hover:text-slate-900 sm:hidden">Continue shopping <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </div>
  );
};
export default CartPage;
