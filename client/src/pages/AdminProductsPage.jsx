import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Plus, Search, Edit2, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

const AdminProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/products', { params: { search, page, limit: 15 } });
      setProducts(res.data?.products || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, search]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate / delete this product?')) {
      try {
        await api.delete(`/admin/products/${id}`);
        loadProducts();
      } catch (e) {
        alert(e.message || 'Failed to delete product');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 card-shadow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
              Product Inventory Management
            </h2>
            <p className="text-xs text-slate-500">
              Create, update, manage SKUs, stock counts, images, and variant matrices.
            </p>
          </div>

          <Link
            to="/admin/products/new"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl uppercase tracking-wider shadow-xs flex items-center gap-1.5 transition self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-slate-900"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-2">Product</th>
                <th className="py-3 px-2">Category</th>
                <th className="py-3 px-2">SKU</th>
                <th className="py-3 px-2">Price</th>
                <th className="py-3 px-2">Stock</th>
                <th className="py-3 px-2">Variants</th>
                <th className="py-3 px-2">Featured</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading product inventory...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=100&q=80'}
                          alt=""
                          className="w-10 h-10 object-cover rounded-xl border border-slate-200"
                        />
                        <span className="font-bold text-slate-900 line-clamp-1 max-w-[180px]">
                          {prod.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-slate-600 font-medium">
                      {prod.category?.name || 'Unassigned'}
                    </td>
                    <td className="py-3 px-2 font-mono text-slate-500">{prod.sku}</td>
                    <td className="py-3 px-2 font-mono font-bold text-slate-900">
                      ${parseFloat(prod.price).toFixed(2)}
                      {prod.discountPrice && (
                        <span className="text-[10px] text-red-600 block">
                          ${parseFloat(prod.discountPrice).toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        prod.stock > 10 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {prod.stock} in stock
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-500 font-mono">
                      {prod.variants?.length || 0} variants
                    </td>
                    <td className="py-3 px-2">
                      {prod.isFeatured ? (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] rounded">
                          YES
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold text-[10px]">NO</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/${prod.id}/edit`}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProductsPage;
