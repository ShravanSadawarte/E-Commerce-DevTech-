import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, ArrowUpRight, ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { fetchProducts, fetchCategories } from '../store/productSlice';

const HERO_SLIDES = [
  {
    title: 'Quiet luxury,\neveryday ease',
    subtitle: 'Curated essentials crafted with premium materials and timeless silhouettes.',
    cta: 'Shop collection',
    link: '/category/men',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80',
    accent: 'New season',
  },
  {
    title: 'Crafted leather\n& modern runners',
    subtitle: 'Tuscan full-grain, responsive cushioning — built to move with you.',
    cta: 'Explore footwear',
    link: '/category/footwear',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=80',
    accent: 'Editor pick',
  },
  {
    title: 'Time, refined',
    subtitle: 'Sapphire, steel and precision — watches that outlast trends.',
    cta: 'Discover watches',
    link: '/category/watches',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1400&q=80',
    accent: 'Limited',
  },
];

const HomePage = () => {
  const dispatch = useDispatch();
  const { products, categories, loading } = useSelector((state) => state.products);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 8, featured: true }));
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const t = setInterval(() => setCurrentSlide((p) => (p + 1) % HERO_SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className="pb-10">
      {/* Hero - split, premium, not oversized */}
      <section className="section-shell pt-6 sm:pt-8">
        <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-card">
          <div className="grid lg:grid-cols-[1.05fr_1fr] min-h-[480px] sm:min-h-[520px]">
            <div className="relative flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12 lg:py-12">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" /> {slide.accent}
              </span>
              <h1 className="mt-5 whitespace-pre-line font-display text-[34px] font-bold leading-[0.95] tracking-[-0.04em] text-slate-900 sm:text-[46px] lg:text-[52px]">
                {slide.title}
              </h1>
              <p className="mt-4 max-w-[44ch] text-[14px] leading-6 text-slate-500 sm:text-[15px]">{slide.subtitle}</p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link to={slide.link} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-[13px] font-semibold tracking-wide text-white hover:bg-black transition shadow-sm">
                  {slide.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-4 text-[12px] text-slate-500">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> In stock & ready to ship</span>
                <span className="hidden sm:inline h-3 w-px bg-slate-200" />
                <span className="hidden sm:inline">Free returns 30 days</span>
              </div>
              {/* dots */}
              <div className="mt-8 flex items-center gap-2">
                {HERO_SLIDES.map((_, i) => (
                  <button key={i} onClick={() => setCurrentSlide(i)} aria-label={`Slide ${i+1}`} className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-slate-900' : 'w-4 bg-slate-200 hover:bg-slate-300'}`} />
                ))}
                <div className="ml-3 hidden sm:flex gap-2">
                  <button onClick={() => setCurrentSlide((p) => (p - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)} className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50"><ChevronLeft className="h-4 w-4" /></button>
                  <button onClick={() => setCurrentSlide((p) => (p + 1) % HERO_SLIDES.length)} className="h-8 w-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50"><ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
            <div className="relative min-h-[300px] lg:min-h-0 bg-slate-100">
              <img key={slide.image} src={slide.image} alt={slide.title} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent lg:hidden" />
              {/* floating card */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:w-[300px] rounded-2xl border border-white/60 bg-white/90 backdrop-blur-xl p-4 shadow-elevated">
                <div className="flex items-center gap-3">
                  <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80" alt="" className="h-12 w-12 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-slate-900 truncate">Air Max Pulse — Crimson</p>
                    <p className="text-[11px] text-slate-500">From $129.99 • 4.9★ (52)</p>
                  </div>
                  <Link to="/product/air-max-pulse-running-shoes" className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-black"><ArrowUpRight className="h-4 w-4" /></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-shell mt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { icon: Truck, title: 'Free shipping', desc: 'Orders over $100' },
            { icon: RotateCcw, title: 'Free returns', desc: 'Within 30 days' },
            { icon: ShieldCheck, title: 'Secure checkout', desc: 'Encrypted & safe' },
            { icon: Headphones, title: 'Live support', desc: 'Chat with us' },
          ].map((b) => (
            <div key={b.title} className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-4 shadow-subtle">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shrink-0"><b.icon className="h-5 w-5" /></div>
              <div><p className="text-[13px] font-semibold text-slate-900 leading-none">{b.title}</p><p className="text-[12px] text-slate-500">{b.desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="section-shell mt-12 sm:mt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Curated catalog</p>
            <h2 className="section-heading mt-1">Shop by category</h2>
          </div>
          <Link to="/category/men" className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold hover:bg-slate-50">Explore all <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.slice(0, 6).map((cat) => (
            <Link key={cat.id} to={`/category/${cat.slug}`} className="group relative overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-card hover:shadow-elevated transition">
              <div className="aspect-[4/5] overflow-hidden bg-slate-100">
                <img src={cat.image} alt={cat.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold tracking-wide text-white">{cat.name}</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-900 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition"><ArrowUpRight className="h-3.5 w-3.5" /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="section-shell mt-12 sm:mt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Popular right now</p>
            <h2 className="section-heading mt-1">Featured products</h2>
            <p className="mt-1 text-[13px] text-slate-500">Hand-picked for quality, fit and value</p>
          </div>
          <Link to="/category/deals" className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-[13px] font-semibold text-white hover:bg-black">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        {loading ? (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-[20px] border border-slate-200 bg-white p-3 animate-pulse">
                <div className="aspect-[4/5] rounded-2xl bg-slate-100" />
                <div className="mt-3 h-3 w-2/3 rounded bg-slate-100" />
                <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
        <div className="mt-6 flex justify-center sm:hidden">
          <Link to="/category/deals" className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-3 text-[13px] font-semibold text-white">View all products <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      {/* Editorial banner */}
      <section className="section-shell mt-12 sm:mt-16">
        <div className="relative overflow-hidden rounded-[28px] bg-slate-900 text-white">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80" alt="" className="h-full w-full object-cover opacity-[0.18]" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
          </div>
          <div className="relative grid lg:grid-cols-2 gap-8 px-6 py-10 sm:px-10 sm:py-12 lg:p-12">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">The Nexora edit</p>
              <h3 className="mt-3 font-display text-[28px] font-bold leading-tight tracking-tight sm:text-[32px]">Build a wardrobe that lasts.</h3>
              <p className="mt-3 max-w-[48ch] text-[13px] leading-6 text-white/70">Fewer, better pieces. Responsibly sourced, designed for everyday wear and made to age beautifully.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/category/men" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[13px] font-semibold text-slate-900 hover:bg-slate-100">Shop men</Link>
                <Link to="/category/women" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-[13px] font-semibold text-white hover:bg-white/15 backdrop-blur">Shop women</Link>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-end gap-3">
              <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=300&q=80" alt="" className="h-[180px] w-[140px] rounded-2xl object-cover border border-white/10" />
              <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80" alt="" className="h-[180px] w-[140px] rounded-2xl object-cover border border-white/10 mt-8" />
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};
export default HomePage;
