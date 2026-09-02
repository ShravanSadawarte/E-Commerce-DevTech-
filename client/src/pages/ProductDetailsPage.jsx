import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Send,
  Loader2,
} from 'lucide-react';
import { fetchProductDetails } from '../store/productSlice';
import { addToCart } from '../store/cartSlice';
import { toggleWishlist } from '../store/wishlistSlice';
import api from '../services/api';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentProduct: product, detailsLoading: loading } = useSelector((state) => state.products);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'reviews' | 'shipping'
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  // Review form states
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(id));
      // Fetch reviews
      const loadReviews = async () => {
        try {
          const res = await api.get(`/reviews/product/${id}`);
          setReviews(res.data?.reviews || []);
        } catch (e) {
          // continue
        }
      };
      loadReviews();
    }
  }, [dispatch, id]);

  // Set default variant selections when product loads
  useEffect(() => {
    if (product) {
      if (product.variants && product.variants.length > 0) {
        setSelectedColor(product.variants[0].color || '');
        setSelectedSize(product.variants[0].size || '');
      }
      setReviews(product.reviews || []);
    }
  }, [product]);

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loading product details...</p>
        </div>
      </div>
    );
  }

  const isWishlisted = wishlistItems?.some((item) => item.productId === product.id);

  // Extract unique colors & sizes
  const uniqueColors = [...new Set(product.variants?.map((v) => v.color).filter(Boolean))];
  const uniqueSizes = [...new Set(product.variants?.map((v) => v.size).filter(Boolean))];

  // Match selected variant
  const selectedVariant = product.variants?.find(
    (v) => (v.color === selectedColor || !selectedColor) && (v.size === selectedSize || !selectedSize)
  );

  const price = parseFloat(product.price);
  const discountPrice = product.discountPrice ? parseFloat(product.discountPrice) : null;
  const effectivePrice = discountPrice || price;
  const availableStock = selectedVariant ? selectedVariant.stock : product.stock;

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80', altText: product.name }];

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setAddingToCart(true);
    await dispatch(
      addToCart({
        productId: product.id,
        variantId: selectedVariant?.id || null,
        quantity,
      })
    );
    setAddingToCart(false);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await dispatch(
      addToCart({
        productId: product.id,
        variantId: selectedVariant?.id || null,
        quantity,
      })
    );
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        productId: product.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviews([res.data?.review, ...reviews]);
      setReviewComment('');
    } catch (e) {
      alert(e.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="section-shell py-6 sm:py-8 space-y-8">
      <nav className="flex items-center gap-1.5 text-[12px] text-slate-500">
        <Link to="/" className="hover:text-slate-900">Home</Link><ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <Link to={product.category ? `/category/${product.category.slug}` : '/category/men'} className="hover:text-slate-900">{product.category?.name || 'Catalog'}</Link><ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="font-semibold text-slate-900 truncate max-w-[220px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-3">
          <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[560px] pb-2 sm:pb-0 no-scrollbar">
            {images.map((img, idx) => (
              <button key={img.id || idx} onClick={() => setActiveImageIndex(idx)} className={`relative w-[64px] sm:w-[72px] aspect-square rounded-2xl overflow-hidden border bg-white shrink-0 transition ${activeImageIndex === idx ? 'border-slate-900 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                <img src={img.imageUrl} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="flex-1 relative overflow-hidden rounded-[24px] border border-slate-200 bg-white aspect-[4/5] shadow-card">
            <img src={images[activeImageIndex]?.imageUrl} alt={product.name} className="h-full w-full object-cover object-center" />
            {hasDiscount && <span className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold tracking-widest text-white">Save ${(price - discountPrice).toFixed(2)}</span>}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-[24px] border border-slate-200/70 bg-white p-6 sm:p-7 shadow-card space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-blue-700 ring-1 ring-blue-200">{product.brand?.name || product.category?.name}</span>
                <span className="text-[11px] font-medium text-slate-400 font-mono">SKU {selectedVariant?.sku || product.sku}</span>
              </div>
              <h1 className="mt-3 font-display text-[26px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[28px]">{product.name}</h1>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[12px] font-semibold text-amber-700 ring-1 ring-amber-200"><Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> {parseFloat(product.rating || 4.8).toFixed(1)}</span>
                <button onClick={() => setActiveTab('reviews')} className="text-[12px] font-medium text-slate-500 hover:text-slate-900 underline">({reviews.length} reviews)</button>
                <span className="text-slate-200">•</span>
                <span className="text-[12px] text-slate-500">{product.reviewCount || reviews.length} ratings</span>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
              <div className="flex items-baseline gap-3">
                <span className="text-[28px] font-bold tracking-tight text-slate-900">${effectivePrice.toFixed(2)}</span>
                {hasDiscount && <span className="text-[14px] text-slate-400 line-through">${price.toFixed(2)}</span>}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Tax included • Free shipping over $100</p>
              <div className="mt-3">{availableStock > 0 ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200"><span className="h-2 w-2 rounded-full bg-emerald-500" /> In stock • {availableStock} left</span> : <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold text-red-600 ring-1 ring-red-200">Out of stock</span>}</div>
            </div>

          {uniqueColors.length > 0 && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Color <span className="font-medium normal-case tracking-normal text-slate-500">— {selectedColor}</span></label>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {uniqueColors.map((color) => {
                  const variant = product.variants?.find((v) => v.color === color);
                  return (
                    <button key={color} onClick={() => setSelectedColor(color)} className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition ${selectedColor === color ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                      {variant?.colorHex && <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: variant.colorHex }} />} {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {uniqueSizes.length > 0 && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Size <span className="font-medium normal-case tracking-normal text-slate-500">— {selectedSize}</span></label>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {uniqueSizes.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`min-w-[44px] rounded-full border px-4 py-2 text-[13px] font-semibold transition ${selectedSize === size ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>{size}</button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Quantity</label>
            <div className="mt-2.5 flex items-center gap-3">
              <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 disabled:opacity-30"><Minus className="h-3.5 w-3.5" /></button>
                <span className="w-10 text-center text-[13px] font-bold">{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))} disabled={quantity >= availableStock} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 disabled:opacity-30"><Plus className="h-3.5 w-3.5" /></button>
              </div>
              <span className="text-[12px] text-slate-500">{availableStock} available</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex gap-2.5">
              <button onClick={handleAddToCart} disabled={availableStock === 0 || addingToCart} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-900 py-3.5 text-[13px] font-semibold tracking-wide text-white hover:bg-black disabled:opacity-40 transition">
                {addingToCart ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShoppingBag className="h-4 w-4" /> Add to bag</>}
              </button>
              <button onClick={() => { if (!isAuthenticated) { navigate('/login'); return; } dispatch(toggleWishlist(product.id)); }} className={`flex h-[46px] w-[46px] items-center justify-center rounded-full border transition ${isWishlisted ? 'border-red-200 bg-red-50 text-red-600' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-600' : ''}`} />
              </button>
            </div>
            <button onClick={handleBuyNow} disabled={availableStock === 0} className="w-full rounded-full border border-slate-900 bg-white py-3.5 text-[13px] font-semibold tracking-wide text-slate-900 hover:bg-slate-50 disabled:opacity-40 transition">Buy now</button>
            {addedToast && <div className="flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-[13px] font-medium text-emerald-800"><span>Added to bag</span><Link to="/cart" className="font-bold underline">View bag</Link></div>}
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-5">
            <div className="text-center"><Truck className="mx-auto h-5 w-5 text-slate-700" /><p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-slate-700">Free ship</p><p className="text-[11px] text-slate-500">Over $100</p></div>
            <div className="text-center"><RotateCcw className="mx-auto h-5 w-5 text-slate-700" /><p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-slate-700">Free returns</p><p className="text-[11px] text-slate-500">30 days</p></div>
            <div className="text-center"><ShieldCheck className="mx-auto h-5 w-5 text-slate-700" /><p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-slate-700">Secure</p><p className="text-[11px] text-slate-500">Encrypted</p></div>
          </div>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200/70 bg-white overflow-hidden shadow-card">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          {[
            { id: 'description', label: 'Description' },
            { id: 'reviews', label: `Reviews (${reviews.length})` },
            { id: 'shipping', label: 'Shipping & Returns' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 sm:px-8 py-4 text-xs font-bold uppercase tracking-wider transition border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-slate-900 text-slate-900 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-10">
          {activeTab === 'description' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="text-base font-bold text-slate-900">Product Overview</h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {product.description}
              </p>
              {product.shortDescription && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-4">
                  <span className="text-xs font-bold text-slate-900 block mb-1">Key Highlight:</span>
                  <p className="text-xs text-slate-600">{product.shortDescription}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8 max-w-3xl">
              {/* Write Review Form */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Write a Customer Review</h4>
                {isAuthenticated ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                        Your Rating
                      </label>
                      <div className="flex gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="p-1"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                        Your Review Comment
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Tell others about fit, fabric quality, and experience..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-slate-900 text-white text-xs font-bold px-6 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-2 hover:bg-slate-800 disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submittingReview ? 'Submitting...' : 'Submit Review'}</span>
                    </button>
                  </form>
                ) : (
                  <p className="text-xs text-slate-600">
                    Please <Link to="/login" className="font-bold underline text-slate-900">Sign in</Link> to post your review.
                  </p>
                )}
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No reviews yet. Be the first to review this product!</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-4 border-b border-slate-100 last:border-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={rev.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover border"
                          />
                          <span className="text-xs font-bold text-slate-900">{rev.user?.name || 'Verified Customer'}</span>
                        </div>
                        <div className="flex text-amber-400">
                          {[...Array(rev.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4 max-w-3xl text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h3 className="text-base font-bold text-slate-900">Shipping & Returns Policy</h3>
              <p>
                We offer complimentary standard express delivery for all orders exceeding $100. Orders placed before 2:00 PM EST ship same-day from our climate-controlled fulfillment hub.
              </p>
              <h4 className="font-bold text-slate-900 pt-2">30-Day Hassle-Free Returns</h4>
              <p>
                If for any reason you are not completely satisfied with your purchase, you may return the unworn items in their original packaging within 30 days of delivery for a full refund or exchange.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
