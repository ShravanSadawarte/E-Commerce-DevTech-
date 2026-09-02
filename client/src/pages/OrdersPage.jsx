import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Package, ChevronRight, Clock, CheckCircle2, Truck, AlertCircle, ShoppingBag } from 'lucide-react';
import { fetchMyOrders } from '../store/orderSlice';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">Delivered</span>;
      case 'Shipped':
      case 'Out for Delivery':
        return <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">In Transit</span>;
      case 'Cancelled':
        return <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full">Cancelled</span>;
      default:
        return <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 card-shadow space-y-6">
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
            My Orders ({orders.length})
          </h2>
          <p className="text-xs text-slate-500">
            Track past purchases, delivery timelines, and download receipts.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 bg-slate-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No Orders Found</h3>
            <p className="text-xs text-slate-500">You haven't placed any orders with us yet.</p>
            <Link
              to="/category/men"
              className="inline-block bg-slate-900 text-white text-xs font-bold px-6 py-2.5 rounded-full uppercase"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition space-y-4 bg-slate-50/40"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                    <div className="space-y-0.5">
                      <span className="text-xs font-mono font-bold text-slate-900 block">{order.orderNumber}</span>
                      <span className="text-[11px] text-slate-500">Placed on {formattedDate}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {getStatusBadge(order.status)}
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Snapshot List */}
                  <div className="flex flex-wrap items-center gap-3">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-xl">
                        <img
                          src={item.productImage || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=100&q=80'}
                          alt={item.productName}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                        <div className="min-w-0 pr-2">
                          <p className="text-[11px] font-bold text-slate-900 truncate max-w-[140px]">{item.productName}</p>
                          <p className="text-[10px] text-slate-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Bar: Total & View Order CTA */}
                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                      <span className="text-sm font-bold font-mono text-slate-900">${parseFloat(order.totalAmount).toFixed(2)}</span>
                    </div>

                    <Link
                      to={`/orders/${order.id}`}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl uppercase tracking-wider shadow-xs flex items-center gap-1.5 transition"
                    >
                      <span>VIEW ORDER</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
