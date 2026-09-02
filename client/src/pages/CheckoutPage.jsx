import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  MapPin,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Plus,
  ArrowRight,
  ChevronRight,
  Loader2,
  Truck,
} from 'lucide-react';
import { fetchAddresses, addAddress } from '../store/addressSlice';
import { createOrder } from '../store/orderSlice';
import { fetchCart } from '../store/cartSlice';
import api from '../services/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: cartItems, totals } = useSelector((state) => state.cart);
  const { addresses } = useSelector((state) => state.addresses);

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY'); // 'RAZORPAY' | 'COD'
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // New Address Form state
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

  const handleProceedToPayment = () => {
    if (!selectedAddressId) {
      alert('Please select or add a shipping address.');
      return;
    }
    setStep(2);
  };

  const handleProceedToReview = () => {
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    setProcessingPayment(true);
    try {
      // 1. Create order on backend transactionally
      const order = await dispatch(
        createOrder({
          addressId: selectedAddressId,
          paymentMethod,
          notes: orderNotes,
        })
      ).unwrap();

      if (paymentMethod === 'COD') {
        navigate(`/order-success?orderId=${order.id}&orderNumber=${order.orderNumber}`);
        return;
      }

      // 2. Online Payment via Razorpay SDK
      const razorpayOrderRes = await api.post('/payments/create-order', { orderId: order.id });
      const { razorpayKeyId, razorpayOrderId, amount, currency, orderNumber } = razorpayOrderRes.data;

      // Initialize Razorpay Options
      const options = {
        key: razorpayKeyId,
        amount,
        currency,
        name: 'DevTech Store',
        description: `Order ${orderNumber}`,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80',
        order_id: razorpayOrderId.startsWith('order_mock_') ? undefined : razorpayOrderId,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              orderId: order.id,
              razorpayOrderId: response.razorpay_order_id || razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
              razorpaySignature: response.razorpay_signature || 'sandbox_sig',
            });
            navigate(`/order-success?orderId=${order.id}&orderNumber=${order.orderNumber}`);
          } catch (e) {
            alert('Payment verification failed. Please check with support.');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone || selectedAddress?.phone,
        },
        theme: {
          color: '#0F172A',
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          alert(`Payment failed: ${resp.error.description}`);
          setProcessingPayment(false);
        });
        rzp.open();
      } else {
        // Instant Sandbox Verification Fallback for local testing
        await api.post('/payments/verify', {
          orderId: order.id,
          razorpayOrderId,
          razorpayPaymentId: `pay_sandbox_${Date.now()}`,
          isSandboxDemo: true,
        });
        navigate(`/order-success?orderId=${order.id}&orderNumber=${order.orderNumber}`);
      }
    } catch (err) {
      alert(err.message || 'Failed to initiate order placement');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Stepper Header Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
          
          {[
            { num: 1, label: 'Shipping' },
            { num: 2, label: 'Payment' },
            { num: 3, label: 'Review' },
          ].map((s) => (
            <div key={s.num} className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition ${
                  step >= s.num
                    ? 'bg-slate-900 text-white ring-4 ring-slate-100'
                    : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${step >= s.num ? 'text-slate-900' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Step Form Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: SHIPPING ADDRESS */}
          {step === 1 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 card-shadow space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="text-base font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-slate-700" />
                  <span>1. Select Shipping Address</span>
                </h2>
                {!showNewAddressForm && (
                  <button
                    onClick={() => setShowNewAddressForm(true)}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {/* Saved Addresses List */}
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

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-700">
                          {selectedAddressId === addr.id ? '✓ Selected' : 'Click to select'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Address Form */}
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

              {!showNewAddressForm && (
                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={handleProceedToPayment}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-2 transition"
                  >
                    <span>CONTINUE TO PAYMENT</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PAYMENT METHOD */}
          {step === 2 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 card-shadow space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="text-base font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-slate-700" />
                  <span>2. Select Payment Method</span>
                </h2>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Edit Address
                </button>
              </div>

              <div className="space-y-3">
                {/* Razorpay Option */}
                <label
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition ${
                    paymentMethod === 'RAZORPAY'
                      ? 'border-slate-900 bg-slate-50/60 shadow-xs ring-1 ring-slate-900'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={() => setPaymentMethod('RAZORPAY')}
                    className="mt-1 text-slate-900 focus:ring-slate-900"
                  />
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-slate-900 block">
                      Razorpay Secure Online Payment
                    </span>
                    <p className="text-xs text-slate-500">
                      Credit / Debit Card, UPI (Google Pay, PhonePe), Net Banking, and Digital Wallets.
                    </p>
                    <div className="flex items-center gap-2 pt-2 text-[10px] font-bold text-slate-400 uppercase">
                      <span>✓ Visa</span>
                      <span>• MasterCard</span>
                      <span>• UPI</span>
                      <span>• NetBanking</span>
                    </div>
                  </div>
                </label>

                {/* Cash on Delivery Option */}
                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition ${
                    paymentMethod === 'COD'
                      ? 'border-slate-900 bg-slate-50/60 shadow-xs ring-1 ring-slate-900'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 text-slate-900 focus:ring-slate-900"
                  />
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-slate-900 block">
                      Cash on Delivery (COD)
                    </span>
                    <p className="text-xs text-slate-500">
                      Pay with cash or digital UPI upon physical package handover.
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Delivery Notes / Special Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Leave with doorman or ring doorbell 4B"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  ← Back to Address
                </button>
                <button
                  onClick={handleProceedToReview}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-2 transition"
                >
                  <span>REVIEW ORDER</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ORDER REVIEW & CONFIRMATION */}
          {step === 3 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 card-shadow space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="text-base font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-slate-700" />
                  <span>3. Final Review & Place Order</span>
                </h2>
                <button
                  onClick={() => setStep(2)}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Change Payment
                </button>
              </div>

              {/* Shipping & Payment summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="font-bold uppercase text-slate-400 block mb-1">Delivering To</span>
                  <p className="font-bold text-slate-900">{selectedAddress?.fullName}</p>
                  <p className="text-slate-600">{selectedAddress?.addressLine1} {selectedAddress?.addressLine2}</p>
                  <p className="text-slate-600">{selectedAddress?.city}, {selectedAddress?.state} {selectedAddress?.postalCode}</p>
                  <p className="text-slate-500 font-mono mt-1">Tel: {selectedAddress?.phone}</p>
                </div>
                <div>
                  <span className="font-bold uppercase text-slate-400 block mb-1">Payment Method</span>
                  <p className="font-bold text-slate-900">
                    {paymentMethod === 'RAZORPAY' ? 'Razorpay Secure Online' : 'Cash on Delivery'}
                  </p>
                  {orderNotes && (
                    <p className="text-slate-500 mt-2 italic">Note: "{orderNotes}"</p>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3 divide-y divide-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 pt-2">
                  Items in this order ({cartItems.length})
                </h3>
                {cartItems.map((item) => (
                  <div key={item.id} className="pt-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product?.images?.[0]?.imageUrl}
                        alt=""
                        className="w-12 h-12 object-cover rounded-xl border"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.product?.name}</p>
                        <p className="text-[11px] text-slate-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-900">
                      ${(parseFloat(item.product?.discountPrice || item.product?.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  ← Back to Payment
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={processingPayment}
                  className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white px-10 py-4 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-xl flex items-center gap-2 transition hover:scale-105"
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>PROCESSING PAYMENT...</span>
                    </>
                  ) : (
                    <>
                      <span>{paymentMethod === 'RAZORPAY' ? `PAY $${totals.total.toFixed(2)}` : 'CONFIRM ORDER'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Sticky Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 card-shadow space-y-4 sticky top-24">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-mono font-semibold text-slate-900">${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-mono font-semibold text-slate-900">
                  {totals.shipping === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `$${totals.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Taxes (5%)</span>
                <span className="font-mono font-semibold text-slate-900">${totals.tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-black text-slate-900">
                <span>Total Due</span>
                <span className="font-mono text-base text-slate-950">${totals.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2.5 text-xs text-slate-600">
              <Truck className="w-4 h-4 text-slate-900 shrink-0" />
              <span>Complimentary tracking code dispatched upon dispatch.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
