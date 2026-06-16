// 商品详情页
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Package, Check, Truck, ShieldCheck } from 'lucide-react';
import ProductGallery from '@/components/ProductGallery';
import ProductCard from '@/components/ProductCard';
import WhatsAppButton from '@/components/WhatsAppButton';
import { getProductBySlug, getProductsByBrand } from '@/lib/data';
import type { Product } from '@/types';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (!slug) return;
    getProductBySlug(slug).then(async (p) => {
      setProduct(p);
      if (p) {
        const brandProducts = await getProductsByBrand(
          p.brand.toLowerCase().replace(/\s+/g, '-')
        );
        const relatedItems = brandProducts
          .filter((item) => item.id !== p.id)
          .slice(0, 4);
        setRelated(relatedItems);
      }
      setLoading(false);
    });
  }, [slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="container max-w-8xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[4/5] bg-whisper rounded animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-whisper rounded animate-pulse w-3/4" />
            <div className="h-4 bg-whisper rounded animate-pulse w-1/2" />
            <div className="h-32 bg-whisper rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-32 text-center">
        <h1 className="font-serif text-4xl text-ink mb-4">Product Not Found</h1>
        <p className="text-ink/50 mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-ink text-ivory px-6 py-3 rounded text-sm hover:bg-stone-750 transition-colors"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const hasDiscount = product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen">
      {/* 面包屑 */}
      <div className="container max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-xs text-ink/40">
          <Link to="/" className="hover:text-champagne transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/products" className="hover:text-champagne transition-colors">Products</Link>
          <ChevronRight size={12} />
          <Link
            to={`/brand/${product.brand.toLowerCase().replace(/\s+/g, '-')}`}
            className="hover:text-champagne transition-colors"
          >
            {product.brand}
          </Link>
          <ChevronRight size={12} />
          <span className="text-ink/70 truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* 主体 */}
      <div className="container max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 图片画廊 */}
          <div>
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* 信息栏 */}
          <div className="lg:pt-4">
            {/* 品牌 */}
            <Link
              to={`/brand/${product.brand.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-xs uppercase tracking-[0.3em] text-champagne hover:text-champagne-dark transition-colors"
            >
              {product.brand}
            </Link>

            {/* 名称 */}
            <h1 className="font-serif text-3xl md:text-4xl font-light text-ink mt-2 mb-4 leading-tight">
              {product.name}
            </h1>

            {/* 价格 */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-serif text-3xl text-ink">
                ${product.price.toFixed(2)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-ink/40 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                  <span className="bg-champagne/15 text-champagne text-xs font-medium px-2 py-1 rounded">
                    -{discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* 品类 + 库存 */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs bg-whisper text-ink/60 px-3 py-1 rounded uppercase tracking-wider">
                {product.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-green-600">
                <Check size={14} />
                In Stock
              </span>
            </div>

            {/* 询价 CTA */}
            <div className="bg-whisper rounded-lg p-6 mb-8">
              <p className="font-serif text-lg text-ink mb-1">Ready to order?</p>
              <p className="text-sm text-ink/50 mb-4">
                Contact us via WhatsApp to confirm availability and complete your purchase.
              </p>
              <WhatsAppButton
                productName={product.name}
                productId={product.id}
                size="large"
                className="w-full"
              />
            </div>

            {/* 商品详情 */}
            {product.details && product.details.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xs uppercase tracking-widest text-champagne mb-4 font-medium">
                  Details
                </h2>
                <ul className="text-sm text-ink/70 leading-relaxed space-y-1.5">
                  {product.details.map((line, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-champagne/50 mt-1.5 text-[6px]">●</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 包装与物流 */}
            <div className="border-t border-champagne/15 pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Package size={18} className="text-champagne shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-ink">Premium Packaging</p>
                  <p className="text-xs text-ink/50">Includes dustbag, invoice, authenticity cards, and gift box</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck size={18} className="text-champagne shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-ink">{product.shipping || 'Free Worldwide Shipping'}</p>
                  <p className="text-xs text-ink/50">Ships within 24 hours, tracking number provided</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="text-champagne shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-ink">30-Day Money-Back Guarantee</p>
                  <p className="text-xs text-ink/50">100% satisfaction guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 相关推荐 */}
        {related.length > 0 && (
          <section className="mt-20">
            <div className="text-center mb-10">
              <span className="text-xs uppercase tracking-[0.3em] text-champagne">You May Also Like</span>
              <h2 className="font-serif text-3xl font-light text-ink mt-2">
                More from {product.brand}
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
