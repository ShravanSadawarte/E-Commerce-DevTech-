import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, ChevronRight, SlidersHorizontal, Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { fetchProducts } from '../store/productSlice';

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const query = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page'), 10) || 1;
  const sort = searchParams.get('sort') || 'relevance';

  const [inputSearch, setInputSearch] = useState(query);
  const { products, pagination, loading } = useSelector((state) => state.products);

  useEffect(() => {
    setInputSearch(query);
    dispatch(
      fetchProducts({
        search: query,
        page: currentPage,
        limit: 12,
        sort: sort === 'relevance' ? 'popularity' : sort,
      })
    );
  }, [dispatch, query, currentPage, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (inputSearch.trim()) {
      newParams.set('q', inputSearch.trim());
      newParams.set('page', '1');
      setSearchParams(newParams);
    }
  };

  const handleSortChange = (newSort) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', newSort);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage);
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-900 transition">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-bold text-slate-900">Search Results</span>
      </nav>

      {/* Big Search Bar Area */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 card-shadow space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search product name, category, or brand..."
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-8 py-3 rounded-2xl uppercase tracking-wider shadow-md transition"
          >
            Search
          </button>
        </form>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            {query ? (
              <>Showing results for "<span className="font-bold text-slate-900">{query}</span>" ({pagination.total} matches)</>
            ) : (
              <>Showing all available catalog styles ({pagination.total} matches)</>
            )}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Sort:</span>
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-white border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-1.5 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="relevance">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="newest">Newest</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse h-80" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center card-shadow">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No products found for "{query}"</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            Check your spelling or explore our popular collections.
          </p>
          <Link
            to="/category/men"
            className="inline-block bg-slate-900 text-white text-xs font-bold px-6 py-3 rounded-full uppercase tracking-wider"
          >
            Explore Collections
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default SearchResultsPage;
