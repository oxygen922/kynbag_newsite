// 品牌页 - 使用精简索引提升性能
import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Pagination from '@/components/Pagination';
import { getBrandBySlug, getBrandIndex, brands } from '@/lib/data';
import { useFilterStore, type SortOption } from '@/store/useFilterStore';
import type { ProductIndex } from '@/types';

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest Arrivals',
  'price-low': 'Price: Low to High',
  'price-high': 'Price: High to Low',
  'name-asc': 'Name: A to Z',
  'name-desc': 'Name: Z to A',
};

export default function BrandPage() {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const [products, setProducts] = useState<ProductIndex[]>([]);
  const [loading, setLoading] = useState(true);

  const { sortBy, page, pageSize, setSortBy, setPage } = useFilterStore();

  const brand = brandSlug ? getBrandBySlug(brandSlug) : undefined;

  useEffect(() => {
    setLoading(true);
    setPage(1);
    if (!brandSlug) return;
    getBrandIndex(brandSlug).then((items) => {
      setProducts(items);
      setLoading(false);
    });
  }, [brandSlug, setPage]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const sorted = useMemo(() => {
    const result = [...products];
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
    return result;
  }, [products, sortBy]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  if (!brand) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-32 text-center">
        <h1 className="font-serif text-4xl text-ink mb-4">Brand Not Found</h1>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-ink text-ivory px-6 py-3 rounded text-sm hover:bg-stone-750 transition-colors"
        >
          Browse All Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* 品牌头图 */}
      <div className="relative bg-gradient-to-br from-whisper to-ivory border-b border-champagne/15">
        <div className="container max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-champagne mb-4 block">
            The House of
          </span>
          <h1 className="font-serif text-5xl md:text-7xl font-light text-ink mb-4">
            {brand.name}
          </h1>
          {brand.description && (
            <p className="text-ink/50 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              {brand.description}
            </p>
          )}
          <p className="text-xs text-champagne mt-4 uppercase tracking-widest">
            {brand.count} Products Available
          </p>
        </div>
      </div>

      {/* 商品列表 */}
      <div className="container max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* 工具栏 */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-champagne/10">
          <p className="text-sm text-ink/50">
            {loading ? 'Loading...' : `${sorted.length} products`}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink/40 hidden sm:inline">Sort by:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-transparent border border-champagne/30 text-sm text-ink pl-3 pr-8 py-2 rounded cursor-pointer hover:border-champagne transition-colors focus:outline-none focus:border-champagne"
              >
                {Object.entries(SORT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* 商品网格 */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-whisper rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
            {paged.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* 分页 */}
        {!loading && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>

      {/* 其他品牌 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-whisper">
        <div className="container max-w-8xl mx-auto">
          <h2 className="font-serif text-2xl font-light text-ink text-center mb-8">
            Explore Other Brands
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {brands.filter((b) => b.slug !== brand.slug).map((b) => (
              <Link
                key={b.slug}
                to={`/brand/${b.slug}`}
                className="px-5 py-2 bg-ivory border border-champagne/15 rounded text-sm text-ink/70 hover:border-champagne hover:text-champagne transition-all"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
