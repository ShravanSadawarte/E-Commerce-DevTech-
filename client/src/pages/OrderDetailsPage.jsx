import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronRight, Package, MapPin, CreditCard, Clock, CheckCircle2, Truck, Loader2 } from 'lucide-react';
import { fetchOrderById } from '../store/orderSlice';

const TIMELINE_STEPS = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

const OrderDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentOrder: order } = useSelector((state) => state.orders);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id));
    }
  }, [dispatch, id]);

  if (!order) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
      </div>
    );
  }

  const shippingAddr = order.shippingAddress || (order.shippingAddressSnapshot ? JSON.parse(order.shippingAddressSnapshot) : null);
  const currentStepIndex = TIMELINE_STEPS.indexOf(order.status) !== -1 ? TIMELINE_STEPS.indexOf(order.status) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 card-shadow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Order Summary</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-0.5">
              {order.orderNumber}
            </h1>
            <p className="text-xs text-slate-500">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-wider">
              {order.status}
            </span>
            <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              Payment: {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Order Status Timeline Tracker */}
        <div className="py-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-6">
            Delivery Timeline Status
          </h3>
          <div className="relative flex items-center justify-between">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-slate-900 -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${(currentStepIndex / (TIMELINE_STEPS.length - 1)) * 100}%` }}
            />

            {TIMELINE_STEPS.map((stepName, idx) => {
              const isPastOrCurrent = idx <= currentStepIndex;
              return (
                <div key={stepName} className="relative z-10 flex flex-col items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                      isPastOrCurrent
                        ? 'bg-slate-900 text-white ring-4 ring-slate-100'
                        : 'bg-white border-2 border-slate-200 text-slate-300'
                    }`}
                  >
                    {isPastOrCurrent ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block ${
                    isPastOrCurrent ? 'text-slate-900' : 'text-slate-400'
                  }`}>
                    {stepName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shipping & Payment Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-700" />
              <span>Shipping Address</span>
            </h4>
            {shippingAddr ? (
              <div className="text-slate-600 leading-relaxed">
                <p className="font-bold text-slate-900">{shippingAddr.fullName}</p>
                <p>{shippingAddr.addressLine1} {shippingAddr.addressLine2}</p>
                <p>{shippingAddr.city}, {shippingAddr.state} {shippingAddr.postalCode}</p>
                <p className="font-mono text-slate-500 mt-1">Phone: {shippingAddr.phone}</p>
              </div>
            ) : (
              <p className="text-slate-500">Address recorded on file.</p>
            )}
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-700" />
              <span>Payment Details</span>
            </h4>
            <div className="text-slate-600 leading-relaxed">
              <p>Method: <span className="font-bold text-slate-900">{order.paymentMethod}</span></p>
              <p>Status: <span className="font-bold text-slate-900">{order.paymentStatus}</span></p>
              {order.payment?.providerPaymentId && (
                <p className="font-mono text-slate-500 mt-1">Txn ID: {order.payment.providerPaymentId}</p>
              )}
            </div>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div className="space-y-3 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Purchased Products
          </h3>
          <div className="divide-y divide-slate-100">
            {order.items?.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={item.productImage || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=100&q=80'}
                    alt={item.productName}
                    className="w-12 h-12 object-cover rounded-xl border border-slate-200"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{item.productName}</h5>
                    {item.variantInfo && <p className="text-[11px] text-slate-500">{item.variantInfo}</p>}
                    <p className="text-[11px] text-slate-500">Qty: {item.quantity} × ${parseFloat(item.unitPrice).toFixed(2)}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-900">
                  ${parseFloat(item.totalPrice).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown Summary */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 max-w-sm ml-auto space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono font-semibold text-slate-900">${parseFloat(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (5%)</span>
            <span className="font-mono font-semibold text-slate-900">${parseFloat(order.tax).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="font-mono font-semibold text-slate-900">${parseFloat(order.shippingFee).toFixed(2)}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
            <span>Total Paid</span>
            <span className="font-mono text-base">${parseFloat(order.totalAmount).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
