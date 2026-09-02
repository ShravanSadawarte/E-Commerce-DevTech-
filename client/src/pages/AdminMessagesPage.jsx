import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, Archive, Loader2 } from 'lucide-react';
import api from '../services/api';

const AdminMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/messages');
      setMessages(res.data?.messages || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/admin/messages/${id}/status`, { status });
      loadMessages();
    } catch (e) {
      alert('Failed to update message status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 card-shadow space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
            Customer Inquiries & Messages ({messages.length})
          </h2>
          <p className="text-xs text-slate-500">
            Read contact inquiries, track reply statuses, and archive resolved notes.
          </p>
        </div>

        <div className="space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{m.name} ({m.email})</h4>
                  <p className="text-[11px] font-semibold text-blue-600">Subject: {m.subject || 'Inquiry'}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(m.createdAt).toLocaleString()}
                  </span>
                  <select
                    value={m.status}
                    onChange={(e) => handleUpdateStatus(m.id, e.target.value)}
                    className="bg-white border border-slate-200 text-slate-900 text-[10px] font-bold rounded-lg px-2 py-1 cursor-pointer"
                  >
                    <option value="NEW">NEW</option>
                    <option value="READ">READ</option>
                    <option value="REPLIED">REPLIED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {m.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminMessagesPage;
