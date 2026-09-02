import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, ChevronLeft, ChevronRight, Star, Sparkles, TrendingUp } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { fetchProducts, fetchCategories } from '../store/productSlice';
import api from '../services/api';

const HERO_SLIDES = [
  {
    title: 'Summer Collection 2026',
    subtitle: 'Breathable linens, artisanal accessories, and tailored essentials designed for effortless warmth.',
    ctaText: 'SHOP NOW',
    link: '/category/men',
    bgImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
    tag: 'NEW ARRIVALS',
  },
  {
    title: 'Artisanal Footwear & Bags',
    subtitle: 'Hand-dyed Tuscan full-grain leathers and lightweight responsive runners.',
    ctaText: 'EXPLORE FOOTWEAR',
    link: '/category/footwear',
    bgImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80',
    tag: 'ICONIC CRAFTSMANSHIP',
  },
  {
    title: 'Precision Horology',
    subtitle: 'Automatic sapphire timepieces and smart biometrics crafted for modern life.',
    ctaText: 'DISCOVER TIMEPIECES',
    link: '/category/watches',
    bgImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=80',
    tag: 'LIMITED EDITIONS',
  },
];

const HomePage = () => {
  const dispatch = useDispatch();
  const { products, categories, loading } = useSelector((state) => state.products);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 8, featured: true }));
    dispatch(fetchCategories());

    const loadTestimonials = async () => {
      try {
        const res = await api.get('/testimonials');
        setTestimonials(res.data?.testimonials || []);
      } catch (e) {
        // fallback
      }
    };
    loadTestimonials();
  }, [dispatch]);

  // Auto slide carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO CAROUSEL SECTION */}
      <section className="relative overflow-hidden bg-slate-950 text-white min-h-[500px] sm:min-h-[580px] lg:min-h-[640px] flex items-center">
        {/* Background Slide Image */}
        <div className="absolute inset-0 z-0">
          <img
            key={slide.bgImage}
            src={slide.bgImage}
            alt={slide.title}
            className="w-full h-full object-cover object-center opacity-40 scale-105 animate-in fade-in zoom-in-95 duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-xl space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-[11px] font-bold tracking-widest uppercase backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              {slide.tag}
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              {slide.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
              {slide.subtitle}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to={slide.link}
                className="bg-white hover:bg-slate-100 text-slate-950 px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider transition shadow-xl hover:scale-105 flex items-center gap-2"
              >
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/booking"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md px-6 py-3.5 rounded-full font-semibold text-xs uppercase tracking-wider transition"
              >
                Book Stylist
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel Prev / Next Controls */}
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center justify-center transition backdrop-blur-md"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-1.5">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center justify-center transition backdrop-blur-md"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* 2. TOP CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Curated Catalog</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Top Categories
            </h2>
          </div>
          <Link
            to="/category/men"
            className="text-xs font-bold uppercase tracking-wider text-slate-900 hover:text-blue-600 flex items-center gap-1 transition"
          >
            <span>Explore All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group relative rounded-3xl overflow-hidden aspect-4/5 bg-slate-100 card-shadow card-shadow-hover block border border-slate-200"
            >
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80'}
                alt={cat.name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-3.5 inset-x-3.5 text-center">
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. BEST SELLING PRODUCTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Popular Right Now
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Best Selling Products
            </h2>
          </div>
          <Link
            to="/category/deals"
            className="text-xs font-bold uppercase tracking-wider text-slate-900 hover:text-blue-600 flex items-center gap-1 transition"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse h-80" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. STYLIST APPOINTMENT PROMO BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8 card-shadow">
          <div className="max-w-xl space-y-4 text-center lg:text-left">
            <span className="text-[11px] font-bold tracking-widest uppercase bg-white/10 text-blue-300 border border-white/20 px-3 py-1 rounded-full">
              Bespoke Styling Service
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Book a 1-on-1 Consultation with our Master Wardrobe Stylists
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Receive personalized fashion curation, fabric advice, and custom fitting recommendations via private virtual calendar sessions.
            </p>
          </div>
          <div>
            <Link
              to="/booking"
              className="bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-xs px-8 py-4 rounded-full uppercase tracking-wider shadow-2xl transition hover:scale-105 inline-block"
            >
              BOOK CALENDAR SLOT
            </Link>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Client Endorsements</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            What Our Customers Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 card-shadow flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                  "{t.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-slate-100 mt-6">
                <img
                  src={t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t.name}</h4>
                  <p className="text-[11px] text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
