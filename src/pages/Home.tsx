// 首页
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { brands } from '@/lib/data';
import { getProductsByBrand } from '@/lib/data';
import type { Product } from '@/types';

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);

  // 加载精选商品（头部 5 个品牌各取最新 4 个）
  useEffect(() => {
    const featuredBrands = ['louis-vuitton', 'chanel', 'dior', 'hermes', 'gucci'];
    Promise.all(featuredBrands.map((b) => getProductsByBrand(b))).then((results) => {
      const combined = results
        .flat()
        .filter((p) => p.images.length >= 4)
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
        .slice(0, 12);
      setFeatured(combined);
    });
  }, []);

  // 头部 8 个品牌展示
  const topBrands = brands.slice(0, 8);

  return (
    <div>
      {/* Hero 区 */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* 背景渐变 */}
        <div className="absolute inset-0 bg-gradient-to-br from-ivory via-whisper to-ivory" />

        {/* 装饰几何 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-10 w-64 h-64 rounded-full bg-champagne/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-10 w-80 h-80 rounded-full bg-champagne/8 blur-3xl" />
        </div>

        {/* 内容 */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="mb-6 animate-fade-up">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-champagne">
              <span className="w-8 h-px bg-champagne" />
              Curated Luxury Collection
              <span className="w-8 h-px bg-champagne" />
            </span>
          </div>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light text-ink leading-[1.05] mb-4 animate-fade-up animation-delay-200">
            Timeless
            <span className="block italic font-medium">Elegance</span>
          </h1>

          <p className="text-base md:text-lg text-ink/60 max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up animation-delay-400">
            Discover exceptional craftsmanship from the world's finest luxury houses.
            Each piece is a testament to artistry and refined taste.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up animation-delay-600">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-ink text-ivory px-8 py-4 text-sm font-medium tracking-wide rounded hover:bg-stone-750 transition-all duration-200 hover:scale-[1.02]"
            >
              Explore Collection
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 border border-ink/30 text-ink px-8 py-4 text-sm font-medium tracking-wide rounded hover:border-champagne hover:text-champagne transition-all duration-200"
            >
              Our Story
            </Link>
          </div>

          {/* 品牌名 */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-14 text-xs text-ink/40 uppercase tracking-widest animate-fade-up animation-delay-600">
            <span>Louis Vuitton</span>
            <span className="text-champagne">•</span>
            <span>Chanel</span>
            <span className="text-champagne">•</span>
            <span>Dior</span>
            <span className="text-champagne">•</span>
            <span>Hermès</span>
            <span className="text-champagne">•</span>
            <span>Gucci</span>
            <span className="text-champagne">•</span>
            <span>17+ Brands</span>
          </div>
        </div>
      </section>

      {/* 精选商品 */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container max-w-8xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.3em] text-champagne">Featured</span>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-ink mt-3 mb-4">
              Latest Arrivals
            </h2>
            <p className="text-ink/50 max-w-xl mx-auto">
              A curated selection of the newest additions to our luxury collection
            </p>
          </div>

          {featured.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-whisper rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-14">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 border border-ink/30 text-ink px-8 py-3.5 text-sm font-medium tracking-wide rounded hover:border-champagne hover:text-champagne transition-all"
            >
              View All Products
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 品牌矩阵 */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-whisper">
        <div className="container max-w-8xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.3em] text-champagne">The Houses</span>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-ink mt-3 mb-4">
              Featured Brands
            </h2>
            <p className="text-ink/50 max-w-xl mx-auto">
              Partnering with the world's most prestigious luxury houses
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topBrands.map((brand) => (
              <Link
                key={brand.slug}
                to={`/brand/${brand.slug}`}
                className="group bg-ivory p-8 rounded border border-champagne/10 hover:border-champagne/40 hover:shadow-lg transition-all duration-300 text-center"
              >
                <h3 className="font-serif text-2xl text-ink group-hover:text-champagne transition-colors">
                  {brand.name}
                </h3>
                <p className="text-xs text-ink/40 uppercase tracking-widest mt-2">
                  {brand.count} Products
                </p>
                <p className="text-[10px] text-champagne mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore →
                </p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/products"
              className="text-sm text-ink/60 hover:text-champagne transition-colors inline-flex items-center gap-1"
            >
              Browse all 17 brands
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 卖点区 */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container max-w-8xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full border border-champagne/30 flex items-center justify-center mb-4">
                <Truck size={24} className="text-champagne" />
              </div>
              <h3 className="font-serif text-xl text-ink mb-2">Free Worldwide Shipping</h3>
              <p className="text-sm text-ink/50 leading-relaxed">
                Complimentary shipping globally. 7-15 days delivery with tracking.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full border border-champagne/30 flex items-center justify-center mb-4">
                <RotateCcw size={24} className="text-champagne" />
              </div>
              <h3 className="font-serif text-xl text-ink mb-2">30-Day Returns</h3>
              <p className="text-sm text-ink/50 leading-relaxed">
                Not satisfied? Return within 30 days for a full money-back guarantee.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full border border-champagne/30 flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-champagne" />
              </div>
              <h3 className="font-serif text-xl text-ink mb-2">1:1 Quality</h3>
              <p className="text-sm text-ink/50 leading-relaxed">
                Super high-quality craftsmanship matching original specifications.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full border border-champagne/30 flex items-center justify-center mb-4">
                <ShieldCheck size={24} className="text-champagne" />
              </div>
              <h3 className="font-serif text-xl text-ink mb-2">Complete Package</h3>
              <p className="text-sm text-ink/50 leading-relaxed">
                Every order includes dustbag, invoice, cards, and premium box.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 询价区 */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-ink text-ivory">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-4">
            Ready to Find Your <span className="italic text-champagne">Perfect Piece?</span>
          </h2>
          <p className="text-ivory/60 max-w-xl mx-auto mb-8">
            Browse our complete collection of over 6,000 luxury items, or contact us directly
            for personalized assistance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-champagne text-ink px-8 py-4 text-sm font-medium tracking-wide rounded hover:bg-champagne-light transition-all duration-200 hover:scale-[1.02]"
            >
              Browse Collection
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border border-ivory/30 text-ivory px-8 py-4 text-sm font-medium tracking-wide rounded hover:border-champagne hover:text-champagne transition-all duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
