import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { fetchWishlist, toggleWishlist, moveWishlistToCart } from '../store/wishlistSlice';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleMoveToCart = (productId, variantId) => {
    dispatch(moveWishlistToCart({ productId, variantId }));
  };

  const handleRemove = (productId) => {
    dispatch(toggleWishlist(productId));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 card-shadow space-y-6">
        <div>
          <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
            My Wishlist ({items.length} saved)
          </h2>
          <p className="text-xs text-slate-500">
            Keep track of pieces you love and move them to your bag when ready.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Heart className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">Your Wishlist is Empty</h3>
            <p className="text-xs text-slate-500">Explore our catalog and click the heart icon on any style.</p>
            <Link
              to="/category/men"
              className="inline-block bg-slate-900 text-white text-xs font-bold px-6 py-2.5 rounded-full uppercase"
            >
              Explore Styles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const product = item.product;
              if (!product) return null;
              const primaryImg = product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80';
              const price = parseFloat(product.discountPrice || product.price);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/40 p-3 flex flex-col justify-between space-y-3"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                    <img src={primaryImg} alt={product.name} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white text-red-600 shadow-xs flex items-center justify-center hover:bg-red-50 transition"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      {product.brand?.name || 'Collection'}
                    </span>
                    <Link
                      to={`/product/${product.slug || product.id}`}
                      className="text-xs font-bold text-slate-900 line-clamp-1 hover:underline block"
                    >
                      {product.name}
                    </Link>
                    <span className="text-xs font-mono font-bold text-slate-900 mt-1 block">
                      ${price.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleMoveToCart(product.id, product.variants?.[0]?.id || null)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Cart</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
