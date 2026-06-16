// 底部页脚
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, Globe, Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import { brands } from '@/lib/data';
import { SITE_CONFIG, buildWhatsAppLink } from '@/lib/whatsapp';

export default function Footer() {
  const topBrands = brands.slice(0, 8);

  return (
    <footer className="bg-ink text-ivory mt-24">
      {/* 信任徽章条 */}
      <div className="border-b border-ivory/10">
        <div className="container max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Truck size={24} className="text-champagne shrink-0" />
              <div>
                <p className="text-sm font-medium">Free Worldwide Shipping</p>
                <p className="text-xs text-ivory/50">7-15 days delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw size={24} className="text-champagne shrink-0" />
              <div>
                <p className="text-sm font-medium">30-Day Returns</p>
                <p className="text-xs text-ivory/50">Money-back guarantee</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={24} className="text-champagne shrink-0" />
              <div>
                <p className="text-sm font-medium">100% Satisfaction</p>
                <p className="text-xs text-ivory/50">Quality guarantee</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Globe size={24} className="text-champagne shrink-0" />
              <div>
                <p className="text-sm font-medium">Secure Packaging</p>
                <p className="text-xs text-ivory/50">Dustbag, cards & box</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="container max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* 品牌 */}
          <div className="md:col-span-2">
            <h3 className="font-serif text-3xl font-semibold mb-3">{SITE_CONFIG.brandName}</h3>
            <p className="text-ivory/60 text-sm leading-relaxed max-w-md mb-6">
              A curated atelier of the world's finest luxury designer bags. Each piece is crafted
              with exceptional attention to detail, bringing you timeless elegance and unmatched
              craftsmanship.
            </p>
            <div className="flex items-center gap-4">
              <a
                href={buildWhatsAppLink('Hi! I would like to know more about your products.')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-ivory/70 hover:text-champagne transition-colors"
              >
                <MessageCircle size={18} />
                WhatsApp
              </a>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="flex items-center gap-2 text-sm text-ivory/70 hover:text-champagne transition-colors"
              >
                <Mail size={18} />
                Email
              </a>
            </div>
          </div>

          {/* 品牌 */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-champagne mb-4">Brands</h4>
            <ul className="space-y-2">
              {topBrands.map((brand) => (
                <li key={brand.slug}>
                  <Link
                    to={`/brand/${brand.slug}`}
                    className="text-sm text-ivory/60 hover:text-ivory transition-colors"
                  >
                    {brand.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 服务 */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-champagne mb-4">Customer Care</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-ivory/60 hover:text-ivory transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-ivory/60 hover:text-ivory transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-sm text-ivory/60 hover:text-ivory transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-sm text-ivory/60 hover:text-ivory transition-colors">
                  Returns Policy
                </Link>
              </li>
              <li>
                <Link to="/size-guide" className="text-sm text-ivory/60 hover:text-ivory transition-colors">
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 底部版权 */}
        <div className="border-t border-ivory/10 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ivory/40">
            &copy; {new Date().getFullYear()} {SITE_CONFIG.brandName}. All rights reserved.
          </p>
          <p className="text-xs text-ivory/40">
            Crafted with passion for luxury design.
          </p>
        </div>
      </div>
    </footer>
  );
}
