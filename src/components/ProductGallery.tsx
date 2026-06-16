// 商品详情页图片画廊
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/5] bg-whisper rounded flex items-center justify-center">
        <span className="font-serif text-2xl text-champagne/40 italic">No image</span>
      </div>
    );
  }

  const goPrev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const goNext = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row gap-4">
        {/* 缩略图列表 */}
        {images.length > 1 && (
          <div className="flex md:flex-col gap-2 md:max-h-[600px] overflow-x-auto md:overflow-y-auto md:overflow-x-hidden">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`relative w-16 h-20 md:w-20 md:h-24 rounded overflow-hidden shrink-0 transition-all ${
                  activeIndex === index
                    ? 'ring-2 ring-champagne ring-offset-2 ring-offset-ivory'
                    : 'opacity-50 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`${productName} ${index + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* 主图 */}
        <div className="flex-1 relative group">
          <div className="relative aspect-[4/5] rounded overflow-hidden bg-whisper">
            <img
              src={images[activeIndex]}
              alt={`${productName} ${activeIndex + 1}`}
              className="w-full h-full object-cover"
            />

            {/* 左右切换 */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-ivory/80 backdrop-blur-sm rounded-full flex items-center justify-center text-ink opacity-0 group-hover:opacity-100 transition-opacity hover:bg-ivory"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-ivory/80 backdrop-blur-sm rounded-full flex items-center justify-center text-ink opacity-0 group-hover:opacity-100 transition-opacity hover:bg-ivory"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* 放大按钮 */}
            <button
              onClick={() => setLightbox(true)}
              className="absolute top-3 right-3 w-9 h-9 bg-ivory/80 backdrop-blur-sm rounded-full flex items-center justify-center text-ink opacity-0 group-hover:opacity-100 transition-opacity hover:bg-ivory"
              aria-label="Zoom image"
            >
              <Expand size={18} />
            </button>

            {/* 计数器 */}
            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-ink/60 backdrop-blur-sm text-ivory text-xs px-3 py-1 rounded-full">
                {activeIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 灯箱 */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[70] bg-ink/90 flex items-center justify-center animate-fade-in"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-ivory/80 hover:text-ivory"
            aria-label="Close"
          >
            <X size={28} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-6 w-12 h-12 flex items-center justify-center text-ivory/80 hover:text-ivory"
            aria-label="Previous"
          >
            <ChevronLeft size={32} />
          </button>
          <img
            src={images[activeIndex]}
            alt={`${productName} ${activeIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-6 w-12 h-12 flex items-center justify-center text-ivory/80 hover:text-ivory"
            aria-label="Next"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </>
  );
}
