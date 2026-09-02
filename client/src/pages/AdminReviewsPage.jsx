import React, { useState, useEffect } from 'react';
import { Star, Check, X, Trash2, Loader2 } from 'lucide-react';
import api from '../services/api';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reviews');
      setReviews(res.data?.reviews || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleToggleApproval = async (id, currentStatus) => {
    try {
      await api.put(`/admin/reviews/${id}/status`, { isApproved: !currentStatus });
      loadReviews();
    } catch (e) {
      alert('Failed to update review status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this review permanently?')) {
      try {
        await api.delete(`/admin/reviews/${id}`);
        loadReviews();
      } catch (e) {
        alert('Failed to delete review');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 card-shadow space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
            Customer Reviews Moderation ({reviews.length})
          </h2>
          <p className="text-xs text-slate-500">
            Approve verified purchase testimonials or remove policy-violating content.
          </p>
        </div>

        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 text-xs">{rev.user?.name || 'Customer'}</span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-xs font-semibold text-blue-600">{rev.product?.name}</span>
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <button
                  onClick={() => handleToggleApproval(rev.id, rev.isApproved)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition ${
                    rev.isApproved
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{rev.isApproved ? 'Approved' : 'Approve'}</span>
                </button>

                <button
                  onClick={() => handleDelete(rev.id)}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50"
                  title="Delete Review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminReviewsPage;
