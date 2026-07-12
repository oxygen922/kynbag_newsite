// 品牌页 - 使用精简索引提升性能 + 子分类筛选
import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Pagination from '@/components/Pagination';
import SubcategoryFilter from '@/components/SubcategoryFilter';
import { getBrandBySlug, getBrandIndex, brands, getSubcategoriesByBrand } from '@/lib/data';
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
  const [showFilters, setShowFilters] = useState(false);

  const {
    selectedSubcategories,
    sortBy,
    page,
    pageSize,
    toggleSubcategory,
    setSubcategories,
    setSortBy,
    setPage,
    resetFilters,
  } = useFilterStore();

  const brand = brandSlug ? getBrandBySlug(brandSlug) : undefined;

  const brandSubcategories = useMemo(() => {
    if (brandSlug) {
      return getSubcategoriesByBrand(brandSlug);
    }
    return null;
  }, [brandSlug]);

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
    setSubcategories([]);
  }, [brandSlug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const filteredAndSorted = useMemo(() => {
    let result = [...products];

    if (selectedSubcategories.length > 0) {
      result = result.filter((p) => selectedSubcategories.includes(p.subcategory));
    }

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
  }, [products, selectedSubcategories, sortBy]);

  const totalPages = Math.ceil(filteredAndSorted.length / pageSize);
  const paged = filteredAndSorted.slice((page - 1) * pageSize, page * pageSize);

  const hasFilters = selectedSubcategories.length > 0;

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
        <div className="flex gap-8">
          {/* 侧栏筛选 - 桌面 */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* 品牌子分类 */}
              {brandSubcategories && (
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-champagne mb-3 font-medium">
                    {brandSubcategories.name} Styles
                  </h3>
                  <div className="space-y-2">
                    {brandSubcategories.subcategories.map((subcat) => (
                      <label
                        key={subcat.id}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSubcategories.includes(subcat.id)}
                          onChange={() => toggleSubcategory(subcat.id)}
                          className="w-4 h-4 accent-champagne border-champagne/30 rounded"
                        />
                        <span className="text-sm text-ink/70 group-hover:text-ink transition-colors">
                          {subcat.name}
                          <span className="text-ink/30 ml-1">({subcat.count})</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {hasFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-champagne hover:text-champagne-dark transition-colors underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </aside>

          {/* 主内容 */}
          <div className="flex-1 min-w-0">
            {/* 工具栏 */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-champagne/10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 text-sm text-ink/70"
                >
                  <SlidersHorizontal size={16} />
                  Filters
                  {hasFilters && (
                    <span className="w-5 h-5 bg-champagne text-ivory text-xs rounded-full flex items-center justify-center">
                      {selectedSubcategories.length}
                    </span>
                  )}
                </button>
                <p className="text-sm text-ink/50 hidden sm:block">
                  {loading ? 'Loading...' : `${filteredAndSorted.length} products`}
                </p>
              </div>
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

            {/* 移动端筛选抽屉 */}
            {showFilters && (
              <div className="lg:hidden mb-6 p-5 bg-whisper rounded animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-ink">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="text-ink/40">
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-4">
                  {brandSubcategories && (
                    <div>
                      <p className="text-xs uppercase tracking-widest text-champagne mb-2">
                        {brandSubcategories.name} Styles
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {brandSubcategories.subcategories.map((subcat) => (
                          <label key={subcat.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedSubcategories.includes(subcat.id)}
                              onChange={() => toggleSubcategory(subcat.id)}
                              className="w-4 h-4 accent-champagne rounded"
                            />
                            <span className="text-xs text-ink/70">{subcat.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  {hasFilters && (
                    <button
                      onClick={resetFilters}
                      className="text-xs text-champagne underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 子分类标签云 - 所有设备可见 */}
            {brandSubcategories && (
              <SubcategoryFilter subcategories={brandSubcategories} />
            )}

            {/* 商品网格 */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-whisper rounded animate-pulse" />
                ))}
              </div>
            ) : filteredAndSorted.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-ink/40 text-lg font-serif">No products found</p>
                <p className="text-ink/30 text-sm mt-2">Try adjusting your filters</p>
                {hasFilters && (
                  <button
                    onClick={resetFilters}
                    className="mt-4 text-sm text-champagne underline"
                  >
                    Clear all filters
                  </button>
                )}
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
        </div>
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