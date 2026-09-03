import React, { useState, useEffect } from 'react';
import { Users, Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data?.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    try {
      await api.put(`/admin/users/${user.id}/status`, { isActive: !user.isActive });
      loadUsers();
    } catch (e) {
      alert('Failed to update user status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 card-shadow space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
            Customers ({users.length})
          </h2>
          <p className="text-xs text-slate-500">
            View customer accounts, audit status and manage access.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-2">User</th>
                <th className="py-3 px-2">Email</th>
                <th className="py-3 px-2">Phone</th>
                <th className="py-3 px-2">Role</th>
                <th className="py-3 px-2">Account State</th>
                <th className="py-3 px-2">Joined Date</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border"
                      />
                      <span className="font-bold text-slate-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 font-mono text-slate-600">{u.email}</td>
                  <td className="py-3 px-2 text-slate-500">{u.phone || '—'}</td>
                  <td className="py-3 px-2">
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase text-slate-700 ring-1 ring-slate-200">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-slate-500 font-mono">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`text-xs font-bold ${u.isActive ? 'text-red-600 hover:underline' : 'text-emerald-600 hover:underline'}`}
                    >
                      {u.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
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

export default AdminUsersPage;
