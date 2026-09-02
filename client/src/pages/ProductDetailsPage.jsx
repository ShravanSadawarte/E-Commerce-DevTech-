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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-900 transition">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to={product.category ? `/category/${product.category.slug}` : '/category/men'} className="hover:text-slate-900 transition">
          {product.category?.name || 'Category'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-bold text-slate-900 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Gallery (Thumbnails + Main Image) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails list */}
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[580px] pb-2 sm:pb-0">
            {images.map((img, idx) => (
              <button
                key={img.id || idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-16 sm:w-20 aspect-square rounded-2xl overflow-hidden border-2 transition shrink-0 ${
                  activeImageIndex === idx ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                <img src={img.imageUrl} alt="" className="w-full h-full object-cover object-center" />
              </button>
            ))}
          </div>

          {/* Main Selected Image */}
          <div className="flex-1 relative rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 aspect-4/5 card-shadow">
            <img
              src={images[activeImageIndex]?.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>

        {/* Right: Product Buy Box Information */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-semibold">
              <span className="text-blue-600 uppercase tracking-widest font-bold">
                {product.brand?.name || product.category?.name}
              </span>
              <span className="font-mono text-slate-400">SKU: {selectedVariant?.sku || product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Ratings & Reviews Link */}
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.rating || 5)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-900">{parseFloat(product.rating || 4.8).toFixed(1)}</span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-xs text-slate-500 hover:text-slate-900 underline ml-1"
              >
                ({reviews.length} customer reviews)
              </button>
            </div>
          </div>

          {/* Pricing & Stock Status */}
          <div className="py-4 border-y border-slate-200 space-y-1.5">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                ${effectivePrice.toFixed(2)}
              </span>
              {discountPrice && discountPrice < price && (
                <>
                  <span className="text-base text-slate-400 line-through font-mono">
                    ${price.toFixed(2)}
                  </span>
                  <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                    Save ${(price - discountPrice).toFixed(2)}
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Tax included. Free shipping on orders over $100.
            </p>
            <div className="pt-2">
              {availableStock > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  In Stock ({availableStock} available)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Color Selector */}
          {uniqueColors.length > 0 && (
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
                Color: <span className="font-normal text-slate-600">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {uniqueColors.map((color) => {
                  const variant = product.variants?.find((v) => v.color === color);
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition ${
                        selectedColor === color
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {variant?.colorHex && (
                        <span
                          className="w-3 h-3 rounded-full border border-white/40"
                          style={{ backgroundColor: variant.colorHex }}
                        />
                      )}
                      <span>{color}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {uniqueSizes.length > 0 && (
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
                Size: <span className="font-normal text-slate-600">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {uniqueSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[44px] h-10 px-3.5 rounded-xl text-xs font-bold border transition ${
                      selectedSize === size
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Controls */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition"
                  aria-label="Decrease Quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-xs font-bold font-mono">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                  disabled={quantity >= availableStock}
                  className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition"
                  aria-label="Increase Quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons: ADD TO CART, BUY NOW, WISHLIST */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={availableStock === 0 || addingToCart}
                className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition hover:scale-[1.01]"
              >
                {addingToCart ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>ADD TO CART</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (!isAuthenticated) { navigate('/login'); return; }
                  dispatch(toggleWishlist(product.id));
                }}
                className={`p-3.5 rounded-2xl border transition ${
                  isWishlisted
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-600' : ''}`} />
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={availableStock === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md transition hover:scale-[1.01]"
            >
              BUY NOW
            </button>

            {addedToast && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between animate-in fade-in">
                <span>✓ Added to cart successfully!</span>
                <Link to="/cart" className="underline font-bold">View Cart</Link>
              </div>
            )}
          </div>

          {/* 3 Feature Guarantee Cards */}
          <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-slate-200">
            <div className="p-3 bg-slate-50 rounded-2xl text-center border border-slate-100">
              <Truck className="w-4 h-4 text-slate-700 mx-auto mb-1" />
              <p className="text-[10px] font-bold text-slate-900 uppercase">Free Shipping</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl text-center border border-slate-100">
              <RotateCcw className="w-4 h-4 text-slate-700 mx-auto mb-1" />
              <p className="text-[10px] font-bold text-slate-900 uppercase">Easy Returns</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl text-center border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-slate-700 mx-auto mb-1" />
              <p className="text-[10px] font-bold text-slate-900 uppercase">Secure Payment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Reviews, Shipping */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden card-shadow">
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
