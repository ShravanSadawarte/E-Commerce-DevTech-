import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import api from '../services/api';

const AdminDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get('/admin/dashboard/stats');
        setDashboardData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading || !dashboardData) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
      </div>
    );
  }

  const { stats, chartData, recentOrders, lowStockList } = dashboardData;

  const statCards = [
    { title: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Registered Customers', value: stats.totalUsers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Catalog Products', value: stats.totalProducts, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Low Stock Items', value: stats.lowStockProducts, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8">
      {/* 6 Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="bg-white rounded-3xl border border-slate-200 p-5 card-shadow space-y-2">
              <div className={`w-9 h-9 rounded-2xl ${c.bg} ${c.color} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{c.title}</span>
                <span className="text-xl font-black text-slate-900 font-mono">{c.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Visual Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Revenue Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 card-shadow space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">Weekly Revenue Breakdown</h3>
              <p className="text-xs text-slate-500">Aggregated daily revenue from captured orders</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% this week</span>
            </span>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 pt-8">
            {chartData.map((d) => {
              const maxRev = Math.max(...chartData.map((x) => x.revenue || 1));
              const heightPercent = Math.max(15, Math.round((d.revenue / maxRev) * 100));

              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition">
                    ${Math.round(d.revenue)}
                  </span>
                  <div
                    className="w-full bg-slate-900 group-hover:bg-blue-600 rounded-2xl transition-all duration-300"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-xs font-bold text-slate-700">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 card-shadow space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Inventory Alert</span>
            </h3>
            <Link to="/admin/products" className="text-xs text-blue-600 font-bold hover:underline">
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {lowStockList.map((p) => (
              <div key={p.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={p.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=100&q=80'}
                    alt=""
                    className="w-9 h-9 object-cover rounded-xl border"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{p.name}</p>
                    <span className="text-[10px] font-mono text-slate-400">${parseFloat(p.price).toFixed(2)}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                  {p.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 card-shadow space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">Recent Customer Orders</h3>
            <p className="text-xs text-slate-500">Live transaction stream with fulfillment actions</p>
          </div>
          <Link to="/admin/orders" className="text-xs font-bold text-slate-900 hover:text-blue-600 flex items-center gap-1">
            <span>View All Orders</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-2">Order #</th>
                <th className="py-3 px-2">Customer</th>
                <th className="py-3 px-2">Items</th>
                <th className="py-3 px-2">Total</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Payment</th>
                <th className="py-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-2 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                  <td className="py-3.5 px-2 font-medium text-slate-800">{ord.user?.name || 'Customer'}</td>
                  <td className="py-3.5 px-2 text-slate-500">{ord.items?.length || 1} items</td>
                  <td className="py-3.5 px-2 font-mono font-bold text-slate-900">${parseFloat(ord.totalAmount).toFixed(2)}</td>
                  <td className="py-3.5 px-2">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md font-bold text-[10px] uppercase">
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ord.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 text-right">
                    <Link
                      to={`/orders/${ord.id}`}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
