// 商品卡片组件（同时支持完整 Product 和精简 ProductIndex 数据）
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface ProductCardData {
  slug: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  images?: string[];
  thumb?: string;
}

interface ProductCardProps {
  product: ProductCardData;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  // 支持 images 数组或 thumb 字段
  const primaryImage = product.images?.[0] || product.thumb || '';
  const secondaryImage = product.images?.[1] || '';
  const [hovered, setHovered] = useState(false);

  const displayImage = hovered && secondaryImage ? secondaryImage : primaryImage;
  const hasDiscount = product.originalPrice > product.price;

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 图片区 */}
      <div className="relative aspect-[4/5] overflow-hidden bg-whisper rounded">
        {!imgError && displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-serif text-2xl text-champagne/40 italic">
              {product.brand}
            </span>
          </div>
        )}

        {/* 品牌标签 */}
        <div className="absolute top-3 left-3">
          <span className="bg-ivory/90 backdrop-blur-sm text-ink text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-sm">
            {product.brand}
          </span>
        </div>

        {/* 折扣标签 */}
        {hasDiscount && (
          <div className="absolute top-3 right-3">
            <span className="bg-champagne text-ivory text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-sm">
              Sale
            </span>
          </div>
        )}
      </div>

      {/* 信息区 */}
      <div className="pt-4 pb-2">
        <h3 className="font-serif text-lg text-ink leading-snug line-clamp-2 group-hover:text-champagne transition-colors">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 mt-1.5">
          <span className="text-base font-medium text-ink">
            ${product.price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-ink/40 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
