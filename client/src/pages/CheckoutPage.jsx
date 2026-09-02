import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  MapPin,
  CheckCircle2,
  Plus,
  ArrowRight,
  Loader2,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { fetchAddresses, addAddress } from '../store/addressSlice';
import { createOrder } from '../store/orderSlice';
import { fetchCart } from '../store/cartSlice';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: cartItems, totals } = useSelector((state) => state.cart);
  const { addresses } = useSelector((state) => state.addresses);

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [newAddr, setNewAddr] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    isDefault: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(fetchCart());
    dispatch(fetchAddresses());
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    } else if (addresses.length === 0) {
      setShowNewAddressForm(true);
    }
  }, [addresses, selectedAddressId]);

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-xs text-slate-500">Please add products to your cart before proceeding to checkout.</p>
        <Link to="/" className="inline-block bg-slate-900 text-white text-xs font-bold px-6 py-3 rounded-full uppercase">
          Return to Store
        </Link>
      </div>
    );
  }

  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.phone || !newAddr.addressLine1 || !newAddr.city || !newAddr.state || !newAddr.postalCode) {
      alert('Please fill in all required address fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await dispatch(addAddress(newAddr)).unwrap();
      setSelectedAddressId(res.id);
      setShowNewAddressForm(false);
    } catch (err) {
      alert(err.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select or add a shipping address.');
      return;
    }
    setProcessing(true);
    try {
      const order = await dispatch(
        createOrder({
          addressId: selectedAddressId,
          paymentMethod: 'COD',
          notes: orderNotes,
        })
      ).unwrap();

      navigate(`/order-success?orderId=${order.id}&orderNumber=${order.orderNumber}`);
    } catch (err) {
      alert(err.message || 'Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Checkout</h1>
        <p className="text-xs text-slate-500 mt-1">Complete your order with Cash on Delivery</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Shipping Address */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 card-shadow space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-slate-700" />
                <span>Shipping Address</span>
              </h2>
              {!showNewAddressForm && (
                <button
                  onClick={() => setShowNewAddressForm(true)}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New</span>
                </button>
              )}
            </div>

            {!showNewAddressForm && addresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                      selectedAddressId === addr.id
                        ? 'border-slate-900 bg-slate-50/50 shadow-xs ring-1 ring-slate-900'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {addr.addressLine1} {addr.addressLine2 && `, ${addr.addressLine2}`}
                      </p>
                      <p className="text-xs text-slate-600">
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p className="text-xs font-mono text-slate-500 pt-1">Phone: {addr.phone}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-700">
                        {selectedAddressId === addr.id ? '✓ Selected' : 'Click to select'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showNewAddressForm && (
              <form onSubmit={handleSaveNewAddress} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newAddr.fullName}
                      onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="House number and street name"
                    value={newAddr.addressLine1}
                    onChange={(e) => setNewAddr({ ...newAddr, addressLine1: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Apartment, suite, unit (optional)</label>
                  <input
                    type="text"
                    value={newAddr.addressLine2}
                    onChange={(e) => setNewAddr({ ...newAddr, addressLine2: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">ZIP Code *</label>
                    <input
                      type="text"
                      required
                      value={newAddr.postalCode}
                      onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-slate-900 text-white text-xs font-bold px-6 py-2.5 rounded-xl uppercase tracking-wider shadow-xs hover:bg-slate-800"
                  >
                    {loading ? 'Saving...' : 'Save & Select Address'}
                  </button>
                </div>
              </form>
            )}

            {/* Delivery Notes */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Delivery Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Leave with doorman or ring doorbell 4B"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 card-shadow space-y-4 sticky top-24">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
              Order Summary ({cartItems.length} items)
            </h3>

            <div className="space-y-3 divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="pt-3 flex items-center gap-3">
                  <img
                    src={item.product?.images?.[0]?.imageUrl}
                    alt=""
                    className="w-10 h-10 object-cover rounded-lg border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.product?.name}</p>
                    <p className="text-[10px] text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    ${(parseFloat(item.product?.discountPrice || item.product?.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 pt-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-slate-900">${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-mono font-semibold text-slate-900">
                  {totals.shipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `$${totals.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5%)</span>
                <span className="font-mono font-semibold text-slate-900">${totals.tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-black text-slate-900">
                <span>Total</span>
                <span className="font-mono text-base text-slate-950">${totals.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-2 text-xs text-blue-800">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Pay with Cash on Delivery when your order arrives.</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={processing || !selectedAddressId}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition hover:scale-[1.02]"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
                  <span>PLACE ORDER — ${totals.total.toFixed(2)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
              <Truck className="w-3 h-3" />
              <span>Free shipping on orders over $100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
