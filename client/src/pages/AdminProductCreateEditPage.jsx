import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Image as ImageIcon, Layers, Loader2 } from 'lucide-react';
import api from '../services/api';

const AdminProductCreateEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    categoryId: '',
    brandId: '',
    description: '',
    shortDescription: '',
    price: '',
    discountPrice: '',
    sku: '',
    stock: 20,
    isFeatured: false,
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'],
    variants: [
      { color: 'Black', colorHex: '#000000', size: 'M', sku: '', stock: 10, additionalPrice: 0 },
    ],
  });

  useEffect(() => {
    const loadCategoriesAndBrands = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products/filters'),
        ]);
        setCategories(catRes.data?.categories || []);
        setBrands(brandRes.data?.brands || []);
      } catch (e) {
        console.error(e);
      }
    };
    loadCategoriesAndBrands();

    if (isEditing) {
      const loadProduct = async () => {
        try {
          const res = await api.get(`/products/${id}`);
          const p = res.data?.product;
          if (p) {
            setFormData({
              name: p.name,
              slug: p.slug,
              categoryId: p.categoryId,
              brandId: p.brandId || '',
              description: p.description || '',
              shortDescription: p.shortDescription || '',
              price: p.price,
              discountPrice: p.discountPrice || '',
              sku: p.sku || '',
              stock: p.stock,
              isFeatured: p.isFeatured,
              images: p.images?.map((img) => img.imageUrl) || [],
              variants: p.variants || [],
            });
          }
        } catch (e) {
          alert('Failed to load product for editing');
        } finally {
          setFetching(false);
        }
      };
      loadProduct();
    }
  }, [id, isEditing]);

  const handleAddImage = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, idx) => idx !== index),
    });
  };

  const handleImageChange = (index, value) => {
    const updated = [...formData.images];
    updated[index] = value;
    setFormData({ ...formData, images: updated });
  };

  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        { color: 'Navy', colorHex: '#000080', size: 'L', sku: '', stock: 10, additionalPrice: 0 },
      ],
    });
  };

  const handleRemoveVariant = (index) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, idx) => idx !== index),
    });
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...formData.variants];
    updated[index][field] = value;
    setFormData({ ...formData, variants: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.categoryId) {
      alert('Please fill in product name, price, and category.');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/admin/products/${id}`, formData);
        alert('Product updated successfully!');
      } else {
        await api.post('/admin/products', formData);
        alert('Product created successfully!');
      }
      navigate('/admin/products');
    } catch (e) {
      alert(e.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/products"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
          {isEditing ? 'Edit Product' : 'Create New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 card-shadow space-y-6">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Custom Slug (Optional)</label>
              <input
                type="text"
                placeholder="casual-cotton-shirt"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Category *</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Brand</label>
              <select
                value={formData.brandId}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Short Feature Summary</label>
            <input
              type="text"
              placeholder="e.g. 100% Organic breathable cotton tailored shirt"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Detailed Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
            />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 card-shadow space-y-6">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
            Pricing & Inventory
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Regular Price ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Discount Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Base SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Total Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold uppercase text-slate-800 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="rounded text-slate-900"
            />
            <span>Mark as Featured Product on Homepage</span>
          </label>
        </div>

        {/* Gallery Image URLs */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 card-shadow space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span>Image Gallery URLs</span>
            </h2>
            <button
              type="button"
              onClick={handleAddImage}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Image</span>
            </button>
          </div>

          <div className="space-y-3">
            {formData.images.map((imgUrl, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imgUrl}
                  onChange={(e) => handleImageChange(idx, e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
                />
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Variant Matrix Generator */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 card-shadow space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Variants Matrix (Colors, Sizes, Stock)</span>
            </h2>
            <button
              type="button"
              onClick={handleAddVariant}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variant</span>
            </button>
          </div>

          <div className="space-y-3">
            {formData.variants.map((v, idx) => (
              <div key={idx} className="grid grid-cols-2 sm:grid-cols-6 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 items-center">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Color</label>
                  <input
                    type="text"
                    placeholder="Olive Green"
                    value={v.color || ''}
                    onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Hex</label>
                  <input
                    type="text"
                    placeholder="#556B2F"
                    value={v.colorHex || ''}
                    onChange={(e) => handleVariantChange(idx, 'colorHex', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Size</label>
                  <input
                    type="text"
                    placeholder="M"
                    value={v.size || ''}
                    onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Stock</label>
                  <input
                    type="number"
                    value={v.stock || 0}
                    onChange={(e) => handleVariantChange(idx, 'stock', parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Extra ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={v.additionalPrice || 0}
                    onChange={(e) => handleVariantChange(idx, 'additionalPrice', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-mono"
                  />
                </div>
                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end gap-4">
          <Link
            to="/admin/products"
            className="px-6 py-3 rounded-xl text-xs font-bold uppercase text-slate-600 hover:bg-slate-200"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold px-8 py-3.5 rounded-2xl uppercase tracking-wider shadow-lg flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{isEditing ? 'Update Product' : 'Create Product'}</span>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductCreateEditPage;
