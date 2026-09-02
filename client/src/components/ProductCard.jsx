import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Star, ShoppingBag, Check } from 'lucide-react';
import { toggleWishlist } from '../store/wishlistSlice';
import { addToCart } from '../store/cartSlice';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const isWishlisted = wishlistItems?.some((item) => item.productId === product.id);

  const price = parseFloat(product.price);
  const discountPrice = product.discountPrice ? parseFloat(product.discountPrice) : null;
  const effectivePrice = discountPrice || price;
  const hasDiscount = discountPrice && discountPrice < price;
  const discountPercent = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;

  const primaryImage = product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80';
  const secondaryImage = product.images?.[1]?.imageUrl || primaryImage;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(toggleWishlist(product.id));
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const defaultVariant = product.variants?.[0]?.id || null;
    dispatch(addToCart({ productId: product.id, variantId: defaultVariant, quantity: 1 }));
  };

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white card-shadow card-shadow-hover">
      {/* Product Image Area */}
      <Link to={`/product/${product.slug || product.id}`} className="relative block aspect-square overflow-hidden bg-slate-50">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount / New Badge */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1">
          {hasDiscount && (
            <span className="rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-white">
              {discountPercent}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="rounded-md bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition ${
            isWishlisted
              ? 'border border-red-200 bg-red-50 text-red-600'
              : 'border border-slate-200 bg-white/80 text-slate-700 hover:bg-white'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-600 text-red-600' : ''}`} />
        </button>

        {/* Stock Status Pill if low stock */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-2 left-2.5 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            Only {product.stock} left
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Rating & Brand */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-medium truncate max-w-[120px]">
              {product.category?.name || product.brand?.name || 'Collection'}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{parseFloat(product.rating || 4.8).toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({product.reviewCount || 0})</span>
            </div>
          </div>

          {/* Title */}
          <Link
            to={`/product/${product.slug || product.id}`}
            className="text-sm font-semibold text-slate-900 line-clamp-2 hover:text-blue-600 transition mb-2"
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Action Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-slate-900 font-mono">
                ${effectivePrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through font-mono">
                  ${price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={product.stock === 0}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] transition ${
              product.stock === 0
                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
