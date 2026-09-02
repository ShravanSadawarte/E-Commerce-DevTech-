import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { toggleWishlist } from '../store/wishlistSlice';
import { addToCart } from '../store/cartSlice';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const [imgError, setImgError] = useState(false);
  const isWishlisted = wishlistItems?.some((item) => item.productId === product.id);
  const price = parseFloat(product.price);
  const discountPrice = product.discountPrice ? parseFloat(product.discountPrice) : null;
  const effectivePrice = discountPrice || price;
  const hasDiscount = discountPrice && discountPrice < price;
  const discountPercent = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;
  const primaryImage = !imgError ? (product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80') : 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80';
  const secondaryImage = product.images?.[1]?.imageUrl || null;

  const handleWishlist = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    dispatch(toggleWishlist(product.id));
  };
  const handleAdd = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    const v = product.variants?.[0]?.id || null;
    dispatch(addToCart({ productId: product.id, variantId: v, quantity: 1 }));
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-[20px] border border-slate-200/70 bg-white shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
      <Link to={`/product/${product.slug || product.id}`} className="relative block aspect-[4/5] overflow-hidden bg-slate-50">
        <img src={primaryImage} alt={product.name} onError={() => setImgError(true)} className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-[1.04]" loading="lazy" />
        {secondaryImage && <img src={secondaryImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-700 group-hover:opacity-100" loading="lazy" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition" />
        {/* badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {hasDiscount && <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold tracking-widest text-white shadow-sm">-{discountPercent}%</span>}
          {product.isFeatured && !hasDiscount && <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold tracking-widest text-white">Featured</span>}
        </div>
        <button onClick={handleWishlist} aria-label="Wishlist" className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-md transition ${isWishlisted ? 'border-red-200 bg-white text-red-600 shadow-sm' : 'border-white/70 bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900'}`}>
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-600' : ''}`} />
        </button>
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold tracking-widest text-white">Only {product.stock} left</span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-[2px]">
            <span className="rounded-full bg-slate-900 px-3.5 py-1.5 text-[11px] font-bold tracking-widest text-white">Sold out</span>
          </div>
        )}
        {/* quick add on hover - desktop */}
        <div className="absolute inset-x-3 bottom-3 hidden translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:flex">
          <button onClick={handleAdd} disabled={product.stock === 0} className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-2.5 text-[12px] font-semibold tracking-wide text-white shadow-lg hover:bg-black disabled:opacity-40">
            <ShoppingBag className="h-3.5 w-3.5" /> Add to bag
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="truncate text-[11px] font-semibold uppercase tracking-widest text-slate-400">{product.brand?.name || product.category?.name || 'Nexora'}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {parseFloat(product.rating || 4.8).toFixed(1)}
          </span>
        </div>
        <Link to={`/product/${product.slug || product.id}`} className="line-clamp-2 min-h-[40px] text-[14px] font-semibold leading-snug text-slate-900 hover:text-blue-600 transition">
          {product.name}
        </Link>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-[16px] font-bold tracking-tight text-slate-900">${effectivePrice.toFixed(2)}</span>
            {hasDiscount && <span className="text-[12px] font-medium text-slate-400 line-through">${price.toFixed(2)}</span>}
          </div>
          {/* mobile add button */}
          <button onClick={handleAdd} disabled={product.stock === 0} className="sm:hidden flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white hover:bg-black disabled:opacity-30">
            <ShoppingBag className="h-4 w-4" />
          </button>
          <span className="hidden sm:block text-[11px] font-medium text-slate-400">{product.reviewCount || 0} reviews</span>
        </div>
      </div>
    </div>
  );
};
export default ProductCard;
