// 搜索弹窗 - 使用精简索引
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { useSearchStore } from '@/store/useSearchStore';
import { getAllProductIndex } from '@/lib/data';
import type { ProductIndex } from '@/types';

export default function SearchModal() {
  const { isOpen, query, setOpen, setQuery } = useSearchStore();
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState<ProductIndex[]>([]);
  const [loaded, setLoaded] = useState(false);

  // 弹窗打开时懒加载索引
  useEffect(() => {
    if (isOpen && !loaded) {
      getAllProductIndex().then((products) => {
        setAllProducts(products);
        setLoaded(true);
      });
    }
  }, [isOpen, loaded]);

  // ESC 关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, setOpen]);

  // 搜索结果（最多 20 条）
  const results = useMemo(() => {
    if (!query.trim() || !loaded) return [];
    const q = query.toLowerCase();
    return allProducts
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [query, allProducts, loaded]);

  if (!isOpen) return null;

  const handleSelect = (slug: string) => {
    setOpen(false);
    setQuery('');
    navigate(`/products/${slug}`);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 px-4">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
        onClick={() => setOpen(false)}
      />

      {/* 搜索面板 */}
      <div className="relative w-full max-w-2xl bg-ivory rounded-lg shadow-2xl animate-fade-up">
        {/* 搜索框 */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-champagne/15">
          <Search size={22} className="text-champagne shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by brand, name, or category..."
            className="flex-1 bg-transparent outline-none text-lg text-ink placeholder:text-ink/30 font-serif"
          />
          <button
            onClick={() => setOpen(false)}
            className="p-1 text-ink/40 hover:text-ink transition-colors"
            aria-label="Close search"
          >
            <X size={22} />
          </button>
        </div>

        {/* 结果区 */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!loaded && (
            <div className="px-6 py-12 text-center text-ink/40 text-sm">Loading...</div>
          )}

          {loaded && !query.trim() && (
            <div className="px-6 py-12 text-center text-ink/40 text-sm">
              Start typing to search our collection
            </div>
          )}

          {loaded && query.trim() && results.length === 0 && (
            <div className="px-6 py-12 text-center text-ink/40 text-sm">
              No results found for "{query}"
            </div>
          )}

          {loaded && results.length > 0 && (
            <ul className="py-2">
              {results.map((product) => (
                <li key={product.id}>
                  <button
                    onClick={() => handleSelect(product.slug)}
                    className="w-full flex items-center gap-4 px-6 py-3 hover:bg-whisper transition-colors text-left"
                  >
                    {/* 缩略图 */}
                    <div className="w-12 h-12 rounded overflow-hidden bg-whisper shrink-0">
                      {product.thumb && (
                        <img
                          src={product.thumb}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-ink/40 uppercase tracking-wider">
                        {product.brand} · ${product.price.toFixed(2)}
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-champagne shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
