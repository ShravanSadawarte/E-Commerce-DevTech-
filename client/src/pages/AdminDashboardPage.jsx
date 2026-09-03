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
  ArrowUpRight,
  ChevronRight,
  Loader2,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';

const statusTone = (s) => {
  const v = (s || '').toLowerCase();
  if (['delivered', 'paid', 'captured'].includes(v)) return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (['shipped', 'out for delivery', 'confirmed', 'processing'].includes(v)) return 'bg-blue-50 text-blue-700 ring-blue-200';
  if (['pending'].includes(v)) return 'bg-amber-50 text-amber-700 ring-amber-200';
  if (['cancelled', 'failed', 'refunded'].includes(v)) return 'bg-red-50 text-red-700 ring-red-200';
  return 'bg-slate-50 text-slate-700 ring-slate-200';
};

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
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-[20px] border border-slate-200/70 bg-white p-5 shadow-card animate-pulse">
              <div className="h-10 w-10 rounded-xl bg-slate-100" />
              <div className="mt-4 h-3 w-20 rounded bg-slate-100" />
              <div className="mt-2 h-6 w-16 rounded bg-slate-100" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          <span className="ml-2 text-[13px] font-medium text-slate-500">Loading dashboard…</span>
        </div>
      </div>
    );
  }

  const { stats, chartData, recentOrders, lowStockList } = dashboardData;

  const statCards = [
    { title: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, sub: 'Paid orders only', icon: DollarSign, accent: 'bg-slate-900 text-white' },
    { title: 'Total Orders', value: stats.totalOrders.toLocaleString(), sub: 'Lifetime', icon: ShoppingBag, accent: 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' },
    { title: 'Customers', value: stats.totalUsers.toLocaleString(), sub: 'Registered', icon: Users, accent: 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' },
    { title: 'Products', value: stats.totalProducts.toLocaleString(), sub: 'Catalog size', icon: Package, accent: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' },
    { title: 'Pending Orders', value: stats.pendingOrders.toLocaleString(), sub: 'Needs action', icon: Clock, accent: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200' },
    { title: 'Low Stock', value: stats.lowStockProducts.toLocaleString(), sub: '≤ 10 units', icon: AlertTriangle, accent: 'bg-red-50 text-red-600 ring-1 ring-red-200' },
  ];

  const maxRev = Math.max(...chartData.map((x) => x.revenue || 1), 1);

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Control center</p>
          <h1 className="mt-1 font-display text-[26px] font-bold tracking-tight text-slate-900 sm:text-[28px]">Dashboard</h1>
          <p className="mt-1 text-[13px] leading-6 text-slate-500">Monitor revenue, fulfilment and inventory at a glance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/orders" className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-black transition shadow-sm">
            Review orders <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link to="/" className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition">
            <ExternalLink className="h-3.5 w-3.5" /> Storefront
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="group relative overflow-hidden rounded-[20px] border border-slate-200/70 bg-white p-5 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.accent}`}>
                <Icon className="h-[18px] w-[18px]" />
              </div>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">{c.title}</p>
              <p className="mt-1 text-[22px] font-bold tracking-tight text-slate-900 leading-none">{c.value}</p>
              <p className="mt-1 text-[11px] font-medium text-slate-500">{c.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts & inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue */}
        <div className="lg:col-span-2 rounded-[24px] border border-slate-200/70 bg-white p-6 sm:p-7 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-900">Weekly revenue</h3>
              <p className="mt-1 text-[13px] text-slate-500">Captured orders · last 7 days</p>
            </div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold tracking-wide text-emerald-700 ring-1 ring-emerald-200">
              <TrendingUp className="h-3.5 w-3.5" /> +18.4% this week
            </span>
          </div>

          <div className="mt-6">
            {/* y-axis hints */}
            <div className="relative h-64 flex items-end gap-2 sm:gap-3 pt-6">
              {/* grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
                <span className="h-px w-full bg-slate-100" />
                <span className="h-px w-full bg-slate-100" />
                <span className="h-px w-full bg-slate-100" />
                <span className="h-px w-full bg-slate-100" />
              </div>

              {chartData.map((d) => {
                const h = Math.max(14, Math.round((d.revenue / maxRev) * 100));
                const isPeak = d.revenue === maxRev;
                return (
                  <div key={d.day} className="relative flex flex-1 flex-col items-center justify-end gap-2 h-full group">
                    <div className="hidden group-hover:flex absolute -top-1 -translate-y-full flex-col items-center">
                      <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg whitespace-nowrap">
                        ${Math.round(d.revenue).toLocaleString()}
                      </span>
                      <span className="mt-1 h-1.5 w-1.5 rotate-45 bg-slate-900 -mt-1" />
                    </div>
                    <div
                      className={`w-full rounded-t-2xl transition-all duration-500 ${isPeak ? 'bg-slate-900' : 'bg-slate-200 group-hover:bg-slate-900'}`}
                      style={{ height: `${h}%` }}
                    />
                    <span className={`text-[11px] font-bold tracking-wide ${isPeak ? 'text-slate-900' : 'text-slate-500'}`}>{d.day}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
              <span>Mon → Sun</span>
              <span className="font-mono">${Math.round(maxRev).toLocaleString()} peak</span>
            </div>
          </div>
        </div>

        {/* Inventory alert */}
        <div className="rounded-[24px] border border-slate-200/70 bg-white p-6 sm:p-7 shadow-card flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <h3 className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-slate-900">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-200">
                <AlertTriangle className="h-3.5 w-3.5" />
              </span>
              Low stock
            </h3>
            <Link to="/admin/products" className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition">
              Manage <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-5 flex-1 space-y-3">
            {lowStockList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-emerald-600">
                  <Package className="h-5 w-5" />
                </div>
                <p className="mt-3 text-[13px] font-semibold text-slate-900">All stocked</p>
                <p className="text-[12px] text-slate-500">No products below 10 units.</p>
              </div>
            ) : (
              lowStockList.map((p) => (
                <Link key={p.id} to={`/admin/products/${p.id}/edit`} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 hover:bg-white hover:shadow-sm transition group">
                  <img
                    src={p.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=200&q=80'}
                    alt=""
                    className="h-11 w-11 rounded-xl object-cover border border-white shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-slate-900 group-hover:text-blue-600 transition">{p.name}</p>
                    <p className="text-[11px] font-medium text-slate-500">${parseFloat(p.price).toFixed(2)} • SKU {p.sku?.slice(0, 8) || '—'}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${p.stock === 0 ? 'bg-red-600 text-white ring-red-600' : p.stock <= 5 ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-amber-50 text-amber-700 ring-amber-200'}`}>
                    {p.stock} left
                  </span>
                </Link>
              ))
            )}
          </div>

          {lowStockList.length > 0 && (
            <p className="mt-5 text-center text-[11px] font-medium text-slate-400">Showing {lowStockList.length} lowest-stock SKUs</p>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-[24px] border border-slate-200/70 bg-white shadow-card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 sm:px-7 py-6 border-b border-slate-100">
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-slate-900">Recent orders</h3>
            <p className="mt-1 text-[13px] text-slate-500">Latest transactions and fulfilment state</p>
          </div>
          <Link to="/admin/orders" className="inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition">
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                <th className="whitespace-nowrap px-6 py-3">Order</th>
                <th className="whitespace-nowrap px-3 py-3">Customer</th>
                <th className="whitespace-nowrap px-3 py-3">Items</th>
                <th className="whitespace-nowrap px-3 py-3">Total</th>
                <th className="whitespace-nowrap px-3 py-3">Status</th>
                <th className="whitespace-nowrap px-3 py-3">Payment</th>
                <th className="whitespace-nowrap px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="group hover:bg-slate-50/60 transition">
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="font-mono text-[13px] font-bold tracking-tight text-slate-900">{ord.orderNumber}</span>
                    <span className="block text-[11px] font-medium text-slate-400">{new Date(ord.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="px-3 py-4">
                    <p className="text-[13px] font-semibold text-slate-900 leading-none">{ord.user?.name || 'Customer'}</p>
                    <p className="text-[11px] text-slate-500 truncate max-w-[160px]">{ord.user?.email || '—'}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-[13px] font-medium text-slate-600">{ord.items?.length || 1} items</td>
                  <td className="whitespace-nowrap px-3 py-4 font-mono text-[13px] font-bold text-slate-900">${parseFloat(ord.totalAmount).toFixed(2)}</td>
                  <td className="whitespace-nowrap px-3 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-widest uppercase ring-1 ${statusTone(ord.status)}`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-widest uppercase ring-1 ${statusTone(ord.paymentStatus)}`}>
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <Link to={`/orders/${ord.id}`} className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition">
                      Details <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {recentOrders.length === 0 && (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><ShoppingBag className="h-6 w-6" /></div>
            <p className="mt-3 text-[13px] font-semibold text-slate-900">No orders yet</p>
            <p className="text-[12px] text-slate-500">New orders will appear here in real time.</p>
          </div>
        )}
      </div>

      {/* quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Products', to: '/admin/products', desc: 'Manage catalog & inventory', icon: Package },
          { label: 'Customers', to: '/admin/users', desc: 'View buyers & roles', icon: Users },
          { label: 'Live chat', to: '/admin/chat', desc: 'Respond to shoppers', icon: Clock },
        ].map((q) => (
          <Link key={q.label} to={q.to} className="flex items-center justify-between rounded-[20px] border border-slate-200/70 bg-white px-5 py-4 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white"><q.icon className="h-4 w-4" /></span>
              <div><p className="text-[13px] font-semibold text-slate-900">{q.label}</p><p className="text-[11px] text-slate-500">{q.desc}</p></div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
