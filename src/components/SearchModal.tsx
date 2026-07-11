// 搜索弹窗组件 - 老王教你写搜索！
import { useState, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useSearchStore } from '@/store/useSearchStore';
import { getAllProductIndex } from '@/lib/data';
import type { ProductIndex } from '@/types';
import { useNavigate } from 'react-router-dom';

export default function SearchModal() {
  const { isOpen, setOpen, query, setQuery } = useSearchStore();
  const [allProducts, setAllProducts] = useState<ProductIndex[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 加载搜索数据
  useEffect(() => {
    if (isOpen && allProducts.length === 0) {
      setLoading(true);
      getAllProductIndex().then((products) => {
        setAllProducts(products);
        setLoading(false);
      });
    }
  }, [isOpen, allProducts.length]);

  // 搜索逻辑 - 老王的简单搜索算法
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase().trim();
    return allProducts.filter((product) => {
      return (
        product.name.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
      );
    });
  }, [query, allProducts]);

  // 关闭搜索弹窗
  const handleClose = () => {
    setOpen(false);
    setQuery('');
  };

  // 点击产品跳转
  const handleProductClick = (slug: string) => {
    handleClose();
    navigate(`/products/${slug}`);
  };

  // 键盘事件支持
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* 搜索弹窗 */}
      <div className="relative w-full max-w-3xl mx-4 bg-ivory rounded-xl shadow-2xl max-h-[80vh] flex flex-col">
        {/* 搜索头部 */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-champagne/20">
          <Search size={22} className="text-ink/40" />
          <input
            type="text"
            placeholder="Search for products, brands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-lg text-ink placeholder:text-ink/30 focus:outline-none"
            autoFocus
          />
          <button
            onClick={handleClose}
            className="p-2 text-ink/40 hover:text-ink transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* 搜索结果 */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-ink/40">Loading...</div>
          ) : query.trim() === '' ? (
            <div className="py-12 text-center text-ink/30">
              <p className="text-lg">Start typing to search...</p>
              <p className="text-sm mt-2">Search by product name, brand, or category</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center text-ink/30">
              <p className="text-lg">No products found</p>
              <p className="text-sm mt-2">Try different keywords</p>
            </div>
          ) : (
            <div className="p-4">
              <p className="text-xs text-ink/40 mb-4 px-2">
                Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.slug)}
                    className="flex gap-4 p-3 rounded-lg hover:bg-whisper cursor-pointer transition-colors"
                  >
                    <img
                      src={product.thumb}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-champagne mb-1">{product.brand}</p>
                      <h4 className="text-sm font-medium text-ink mb-1 truncate">
                        {product.name}
                      </h4>
                      <p className="text-sm text-ink/60">
                        ${product.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}