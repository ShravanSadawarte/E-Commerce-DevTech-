import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Filter, SlidersHorizontal, ChevronRight, X, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { fetchProducts, fetchFilters } from '../store/productSlice';

const CategoryPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, pagination, filters, loading, categories } = useSelector((state) => state.products);
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
  const activeCategory = categories.find((c) => c.slug === slug);
  const categoryTitle = activeCategory ? activeCategory.name : (slug ? slug.replace(/-/g, ' ') : 'All products');

  useEffect(() => { dispatch(fetchFilters()); }, [dispatch]);
  useEffect(() => {
    const params = { page: currentPage, limit: 12, sort };
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
    const p = new URLSearchParams(searchParams); p.set('page', newPage); setSearchParams(p); window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const resetAll = () => { setMinPrice(''); setMaxPrice(''); setSelectedBrand(''); setSelectedSize(''); setSelectedColor(''); setSelectedRating(''); setInStockOnly(false); setSort('newest'); setSearchParams({}); };

  return (
    <div className="section-shell py-6 sm:py-8">
      {/* breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[12px] text-slate-500">
        <Link to="/" className="hover:text-slate-900">Home</Link><ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="hidden sm:inline">Catalog</span><ChevronRight className="hidden sm:inline h-3.5 w-3.5 text-slate-300" />
        <span className="font-semibold text-slate-900 capitalize">{categoryTitle}</span>
      </nav>

      {/* header */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-6">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-tight text-slate-900 sm:text-[32px] capitalize">{categoryTitle}</h1>
          <p className="mt-1 flex items-center gap-2 text-[13px] text-slate-500">
            <span className="inline-flex items-center rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-bold tracking-widest text-white">{pagination.total} items</span>
            <span>• Showing {products.length} styles</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMobileFilterOpen(true)} className="lg:hidden inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold shadow-subtle">
            <Filter className="h-4 w-4" /> Filters
          </button>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-subtle">
            <span className="hidden sm:inline pl-2 text-[12px] font-semibold text-slate-500">Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full bg-slate-50 px-3 py-1.5 text-[13px] font-semibold text-slate-900 focus:outline-none">
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top rated</option>
              <option value="popularity">Most popular</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-[88px] rounded-[20px] border border-slate-200/70 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-slate-900"><SlidersHorizontal className="h-4 w-4" /> Filters</span>
              <button onClick={resetAll} className="text-[12px] font-semibold text-blue-600 hover:underline">Reset</button>
            </div>

            <div className="mt-5 space-y-6">
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Price range</h4>
                <div className="mt-3 flex items-center gap-2">
                  <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] focus:bg-white focus:border-slate-900 focus:outline-none" />
                  <span className="text-slate-300">—</span>
                  <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] focus:bg-white focus:border-slate-900 focus:outline-none" />
                </div>
              </div>

              {filters?.brands?.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Brand</h4>
                  <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1">
                    {filters.brands.map((b) => (
                      <label key={b.id} className="flex items-center gap-2.5 text-[13px] text-slate-700 hover:text-slate-900 cursor-pointer">
                        <input type="radio" name="brand" checked={selectedBrand === b.name} onChange={() => setSelectedBrand(selectedBrand === b.name ? '' : b.name)} className="h-4 w-4 accent-slate-900" />
                        <span>{b.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {filters?.sizes?.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Size</h4>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {filters.sizes.map((sz) => (
                      <button key={sz} onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)} className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${selectedSize === sz ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>{sz}</button>
                    ))}
                  </div>
                </div>
              )}

              {filters?.colors?.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Color</h4>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {filters.colors.map((c) => (
                      <button key={c} onClick={() => setSelectedColor(selectedColor === c ? '' : c)} className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${selectedColor === c ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 hover:bg-white'}`}>{c}</button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Rating</h4>
                <div className="mt-3 space-y-1.5">
                  {[4,3].map((r) => (
                    <button key={r} onClick={() => setSelectedRating(selectedRating === String(r) ? '' : String(r))} className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-[13px] transition ${selectedRating === String(r) ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-600'}`}>
                      <span className="flex gap-0.5 text-amber-400">{[...Array(r)].map((_,i)=><Star key={i} className="h-3.5 w-3.5 fill-amber-400" />)}</span>
                      <span className="font-medium">{r}+ stars</span>
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 cursor-pointer">
                <span className="text-[12px] font-bold uppercase tracking-widest">In stock only</span>
                <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="h-4 w-4 accent-slate-900" />
              </label>
            </div>
          </div>
        </aside>

        {/* grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(6)].map((_,i)=><div key={i} className="rounded-[20px] border border-slate-200 bg-white p-3 animate-pulse"><div className="aspect-[4/5] rounded-2xl bg-slate-100" /><div className="mt-3 h-3 w-3/4 rounded bg-slate-100" /></div>)}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[24px] border border-slate-200 bg-white p-10 text-center shadow-card">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Filter className="h-7 w-7" /></div>
              <h3 className="mt-4 text-[16px] font-bold text-slate-900">No products found</h3>
              <p className="mx-auto mt-1 max-w-sm text-[13px] leading-6 text-slate-500">Try adjusting your filters or search to find what you’re looking for.</p>
              <button onClick={resetAll} className="mt-6 rounded-full bg-slate-900 px-6 py-3 text-[13px] font-semibold text-white hover:bg-black">Clear filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
            </>
          )}
        </div>
      </div>

      {/* mobile drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
          <div className="relative ml-auto w-[86%] max-w-[360px] bg-white h-full overflow-y-auto p-5">
            <div className="flex items-center justify-between border-b pb-4"><span className="text-[13px] font-bold uppercase tracking-widest">Filters</span><button onClick={() => setMobileFilterOpen(false)} className="rounded-full bg-slate-100 p-2"><X className="h-4 w-4" /></button></div>
            <div className="mt-4 flex gap-2"><input type="number" placeholder="Min" value={minPrice} onChange={(e)=>setMinPrice(e.target.value)} className="w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-[13px]" /><input type="number" placeholder="Max" value={maxPrice} onChange={(e)=>setMaxPrice(e.target.value)} className="w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-[13px]" /></div>
            <button onClick={()=>setMobileFilterOpen(false)} className="mt-6 w-full rounded-full bg-slate-900 py-3.5 text-[13px] font-semibold text-white">Apply</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default CategoryPage;
