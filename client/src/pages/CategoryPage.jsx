import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Filter, SlidersHorizontal, ChevronRight, X, Star, Check } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { fetchProducts, fetchFilters } from '../store/productSlice';

const CategoryPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { products, pagination, filters, loading, categories } = useSelector((state) => state.products);

  // Filter states
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [selectedSize, setSelectedSize] = useState(searchParams.get('size') || '');
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '');
  const [selectedRating, setSelectedRating] = useState(searchParams.get('rating') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const currentPage = parseInt(searchParams.get('page'), 10) || 1;

  // Find active category
  const activeCategory = categories.find((c) => c.slug === slug);
  const categoryTitle = activeCategory ? activeCategory.name : (slug ? slug.replace(/-/g, ' ') : 'All Products');

  useEffect(() => {
    dispatch(fetchFilters());
  }, [dispatch]);

  // Load products when filters or slug change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 12,
      sort,
    };
    if (slug) params.category = slug;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (selectedBrand) params.brand = selectedBrand;
    if (selectedSize) params.size = selectedSize;
    if (selectedColor) params.color = selectedColor;
    if (selectedRating) params.rating = selectedRating;
    if (inStockOnly) params.inStock = true;

    dispatch(fetchProducts(params));
  }, [dispatch, slug, currentPage, sort, minPrice, maxPrice, selectedBrand, selectedSize, selectedColor, selectedRating, inStockOnly]);

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage);
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetAllFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedBrand('');
    setSelectedSize('');
    setSelectedColor('');
    setSelectedRating('');
    setInStockOnly(false);
    setSort('newest');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-900 transition">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span>Categories</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-bold text-slate-900 capitalize">{categoryTitle}</span>
      </nav>

      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
            {categoryTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {products.length} of {pagination.total} styles available
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer shadow-xs"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popularity">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid with Sidebar Filter Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filter */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 card-shadow space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-900" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Filters</h3>
              </div>
              <button
                onClick={resetAllFilters}
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Price Range ($)</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Brands */}
            {filters?.brands && filters.brands.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Brand</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {filters.brands.map((b) => (
                    <label
                      key={b.id}
                      className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-950"
                    >
                      <input
                        type="radio"
                        name="brandFilter"
                        checked={selectedBrand === b.name}
                        onChange={() => setSelectedBrand(selectedBrand === b.name ? '' : b.name)}
                        className="rounded text-slate-900 focus:ring-slate-900"
                      />
                      <span>{b.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {filters?.sizes && filters.sizes.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Size</h4>
                <div className="flex flex-wrap gap-1.5">
                  {filters.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        selectedSize === sz
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {filters?.colors && filters.colors.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Color</h4>
                <div className="flex flex-wrap gap-1.5">
                  {filters.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(selectedColor === c ? '' : c)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition ${
                        selectedColor === c
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ratings Filter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Customer Rating</h4>
              <div className="space-y-1">
                {[4, 3, 2].map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRating(selectedRating === String(r) ? '' : String(r))}
                    className={`flex items-center gap-2 w-full py-1 px-2 rounded-lg text-xs transition ${
                      selectedRating === String(r) ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(r)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span>{r}★ & above</span>
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-900 cursor-pointer">
                <span>In Stock Only</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-slate-900 w-4 h-4"
                />
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse h-80" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center card-shadow">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Filter className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No products match your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                Try resetting or broadening your filters to explore our available styles.
              </p>
              <button
                onClick={resetAllFilters}
                className="bg-slate-900 text-white text-xs font-bold px-6 py-3 rounded-full uppercase tracking-wider shadow-xs hover:bg-slate-800 transition"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Server-Side Pagination */}
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Mobile filter elements */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-slate-900">Price Range</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setMobileFilterOpen(false);
              }}
              className="w-full bg-slate-900 text-white text-xs font-bold py-3 rounded-xl uppercase tracking-wider"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
