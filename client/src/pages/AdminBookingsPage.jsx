import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/bookings');
      setBookings(res.data?.bookings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/admin/bookings/${id}/status`, { status });
      loadBookings();
    } catch (e) {
      alert('Failed to update booking status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 card-shadow space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
            Stylist Appointments Schedule ({bookings.length})
          </h2>
          <p className="text-xs text-slate-500">
            Manage calendar consultations, update attendance confirmations, and view customer preferences.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-2">Date & Time</th>
                <th className="py-3 px-2">Guest</th>
                <th className="py-3 px-2">Contact</th>
                <th className="py-3 px-2">Service Type</th>
                <th className="py-3 px-2">Notes</th>
                <th className="py-3 px-2 text-right">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-2">
                    <p className="font-bold text-slate-900">{b.date}</p>
                    <p className="text-[11px] font-mono text-blue-600 font-semibold">{b.timeSlot}</p>
                  </td>
                  <td className="py-3 px-2 font-bold text-slate-900">{b.customerName}</td>
                  <td className="py-3 px-2">
                    <p className="text-slate-600">{b.email}</p>
                    <p className="font-mono text-slate-400">{b.phone}</p>
                  </td>
                  <td className="py-3 px-2 text-slate-700">{b.serviceType}</td>
                  <td className="py-3 px-2 text-slate-500 italic max-w-xs truncate">{b.notes || '—'}</td>
                  <td className="py-3 px-2 text-right">
                    <select
                      value={b.status}
                      onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
                      className={`text-[11px] font-bold rounded-lg px-2 py-1 cursor-pointer border ${
                        b.status === 'Confirmed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : b.status === 'Completed'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
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

export default AdminBookingsPage;
