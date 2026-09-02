import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, Loader2 } from 'lucide-react';
import { fetchCart, updateCartItemQty, removeCartItem } from '../store/cartSlice';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items, totals, loading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign in to view your bag</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please log in to sync your cart across all devices and proceed with checkout.
        </p>
        <Link
          to="/login"
          className="inline-block bg-slate-900 text-white text-xs font-bold px-6 py-3 rounded-full uppercase tracking-wider"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'WELCOME10') {
      setAppliedDiscount(totals.subtotal * 0.1);
      setPromoMessage('Promo code WELCOME10 applied! (10% OFF)');
    } else if (promoCode.trim().toUpperCase() === 'DEVTECH25') {
      setAppliedDiscount(25.00);
      setPromoMessage('Promo code DEVTECH25 applied! ($25.00 OFF)');
    } else {
      setAppliedDiscount(0);
      setPromoMessage('Invalid promotional code.');
    }
  };

  const finalTotal = Math.max(0, totals.total - appliedDiscount);

  if (!loading && (!items || items.length === 0)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Looks like you haven't added any items to your shopping bag yet.
        </p>
        <Link
          to="/category/men"
          className="inline-block bg-slate-900 text-white text-xs font-bold px-8 py-3.5 rounded-full uppercase tracking-wider shadow-lg hover:scale-105 transition"
        >
          EXPLORE CATALOG
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
        Shopping Bag ({totals.itemCount} items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden card-shadow divide-y divide-slate-100">
            {items.map((item) => {
              const product = item.product;
              const variant = item.variant;
              const unitPrice = parseFloat(product.discountPrice || product.price) + (variant ? parseFloat(variant.additionalPrice || 0) : 0);
              const itemTotal = unitPrice * item.quantity;
              const primaryImg = product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80';

              return (
                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between">
                  {/* Image & Title */}
                  <div className="flex gap-4 items-center">
                    <Link to={`/product/${product.slug || product.id}`} className="shrink-0">
                      <img
                        src={primaryImg}
                        alt={product.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover object-center rounded-2xl border border-slate-200"
                      />
                    </Link>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                        {product.brand?.name || 'Collection'}
                      </span>
                      <Link
                        to={`/product/${product.slug || product.id}`}
                        className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 hover:underline block"
                      >
                        {product.name}
                      </Link>
                      {variant && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {variant.color && `Color: ${variant.color}`} {variant.size && `• Size: ${variant.size}`}
                        </p>
                      )}
                      <p className="text-xs font-mono font-semibold text-slate-900 mt-1">
                        ${unitPrice.toFixed(2)} each
                      </p>
                    </div>
                  </div>

                  {/* Quantity Stepper & Price */}
                  <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            dispatch(updateCartItemQty({ itemId: item.id, quantity: item.quantity - 1 }));
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold font-mono">{item.quantity}</span>
                      <button
                        onClick={() => {
                          dispatch(updateCartItemQty({ itemId: item.id, quantity: item.quantity + 1 }));
                        }}
                        className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-slate-900 block">
                        ${itemTotal.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => dispatch(removeCartItem(item.id))}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Link to="/category/men" className="text-xs font-semibold text-slate-600 hover:text-slate-950 underline">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right: Order Summary Box */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 card-shadow space-y-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h2>

            {/* Breakdown */}
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-slate-900">${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (5%)</span>
                <span className="font-mono font-semibold text-slate-900">${totals.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-mono font-semibold text-slate-900">
                  {totals.shipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `$${totals.shipping.toFixed(2)}`}
                </span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Promo Discount</span>
                  <span className="font-mono">-${appliedDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-black text-slate-900">
                <span>Total Amount</span>
                <span className="font-mono text-base">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code (WELCOME10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="submit"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  Apply
                </button>
              </div>
              {promoMessage && (
                <p className="text-[11px] text-emerald-600 font-semibold">{promoMessage}</p>
              )}
            </form>

            {/* Proceed to Checkout CTA */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition hover:scale-[1.01]"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Security Guarantee */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <span>256-bit Bank Grade Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
