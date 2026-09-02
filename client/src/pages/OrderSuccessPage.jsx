import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Home } from 'lucide-react';

const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const orderNumber = searchParams.get('orderNumber');

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Checkmark Icon */}
      <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/60 shadow-lg">
        <CheckCircle className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Thank you!
        </h1>
        <p className="text-sm text-slate-600">
          Your order has been placed successfully.
        </p>
      </div>

      {orderNumber && (
        <div className="inline-block bg-white border border-slate-200 rounded-2xl px-6 py-3 card-shadow">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Order Reference</span>
          <span className="text-sm font-mono font-bold text-slate-900">{orderNumber}</span>
        </div>
      )}

      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
        We have emailed your confirmation and receipt. Our warehouse team is already preparing your package for dispatch.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        {orderId ? (
          <Link
            to={`/orders/${orderId}`}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition hover:scale-105"
          >
            <Package className="w-4 h-4" />
            <span>VIEW ORDER</span>
          </Link>
        ) : (
          <Link
            to="/orders"
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition hover:scale-105"
          >
            <Package className="w-4 h-4" />
            <span>VIEW ORDERS</span>
          </Link>
        )}

        <Link
          to="/"
          className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 transition"
        >
          <Home className="w-4 h-4" />
          <span>RETURN HOME</span>
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
