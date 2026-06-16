// 全部商品页（筛选/排序/分页）- 使用精简索引提升性能
import { useEffect, useState, useMemo } from 'react';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Pagination from '@/components/Pagination';
import { brands, getAllProductIndex } from '@/lib/data';
import { useFilterStore, type SortOption } from '@/store/useFilterStore';
import type { ProductIndex } from '@/types';

const CATEGORIES = ['Bags', 'Men Bags', 'Shoes', 'Accessories'];

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest Arrivals',
  'price-low': 'Price: Low to High',
  'price-high': 'Price: High to Low',
  'name-asc': 'Name: A to Z',
  'name-desc': 'Name: Z to A',
};

export default function Products() {
  const [allProducts, setAllProducts] = useState<ProductIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const {
    selectedBrands,
    selectedCategories,
    sortBy,
    page,
    pageSize,
    toggleBrand,
    toggleCategory,
    setSortBy,
    setPage,
    resetFilters,
  } = useFilterStore();

  // 加载精简索引（一次加载全站索引，体积远小于完整数据）
  useEffect(() => {
    getAllProductIndex().then((products) => {
      setAllProducts(products);
      setLoading(false);
    });
  }, []);

  // 滚动到顶部（页码变化时）
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  // 筛选 + 排序
  const filtered = useMemo(() => {
    let result = [...allProducts];

    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
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
  }, [allProducts, selectedBrands, selectedCategories, sortBy]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const hasFilters = selectedBrands.length > 0 || selectedCategories.length > 0;

  return (
    <div className="min-h-screen">
      {/* 页头 */}
      <div className="border-b border-champagne/15">
        <div className="container max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <span className="text-xs uppercase tracking-[0.3em] text-champagne">Collection</span>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-ink mt-2">
            All Products
          </h1>
          <p className="text-ink/50 mt-2 text-sm">
            {loading ? 'Loading...' : `${filtered.length} pieces available`}
          </p>
        </div>
      </div>

      <div className="container max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* 侧栏筛选 - 桌面 */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-24 space-y-8">
              {/* 品牌 */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-champagne mb-3 font-medium">
                  Brands
                </h3>
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <label
                      key={brand.slug}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand.name)}
                        onChange={() => toggleBrand(brand.name)}
                        className="w-4 h-4 accent-champagne border-champagne/30 rounded"
                      />
                      <span className="text-sm text-ink/70 group-hover:text-ink transition-colors">
                        {brand.name}
                        <span className="text-ink/30 ml-1">({brand.count})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 品类 */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-champagne mb-3 font-medium">
                  Category
                </h3>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="w-4 h-4 accent-champagne border-champagne/30 rounded"
                      />
                      <span className="text-sm text-ink/70 group-hover:text-ink transition-colors">
                        {cat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

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
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-champagne/10">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 text-sm text-ink/70"
              >
                <SlidersHorizontal size={16} />
                Filters
                {hasFilters && (
                  <span className="w-5 h-5 bg-champagne text-ivory text-xs rounded-full flex items-center justify-center">
                    {selectedBrands.length + selectedCategories.length}
                  </span>
                )}
              </button>

              <div className="hidden lg:block" />

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
                  <div>
                    <p className="text-xs uppercase tracking-widest text-champagne mb-2">Brands</p>
                    <div className="grid grid-cols-2 gap-2">
                      {brands.map((brand) => (
                        <label key={brand.slug} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand.name)}
                            onChange={() => toggleBrand(brand.name)}
                            className="w-4 h-4 accent-champagne rounded"
                          />
                          <span className="text-xs text-ink/70">{brand.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-champagne mb-2">Category</p>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((cat) => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => toggleCategory(cat)}
                            className="w-4 h-4 accent-champagne rounded"
                          />
                          <span className="text-xs text-ink/70">{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>
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

            {/* 商品网格 */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-whisper rounded animate-pulse" />
                ))}
              </div>
            ) : paged.length === 0 ? (
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
                {paged.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* 分页 */}
            {!loading && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
