// 顶部导航栏
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, ChevronDown } from 'lucide-react';
import { brands } from '@/lib/data';
import { useSearchStore } from '@/store/useSearchStore';
import { SITE_CONFIG } from '@/lib/whatsapp';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { setOpen: setSearchOpen } = useSearchStore();

  // 滚动时改变背景
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 路由变化时关闭菜单
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-ivory/95 backdrop-blur-md shadow-sm py-3'
          : 'bg-ivory/80 backdrop-blur-sm py-5'
      }`}
    >
      <div className="container max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 leading-none">
            <span className="font-serif text-2xl md:text-3xl font-light text-ink tracking-wide">
              Kyn<span className="text-champagne italic">bag</span>
            </span>
          </Link>

          {/* 桌面导航 */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-medium text-ink/80 hover:text-champagne transition-colors tracking-wide"
            >
              Home
            </Link>

            {/* 品牌下拉 */}
            <div
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm font-medium text-ink/80 hover:text-champagne transition-colors tracking-wide">
                Brands
                <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3">
                  <div className="bg-ivory border border-champagne/20 rounded-lg shadow-xl py-3 w-64 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-1 px-2">
                      {brands.map((brand) => (
                        <Link
                          key={brand.slug}
                          to={`/brand/${brand.slug}`}
                          className="px-3 py-2 text-xs text-ink/70 hover:text-champagne hover:bg-whisper rounded transition-colors"
                        >
                          {brand.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/products"
              className="text-sm font-medium text-ink/80 hover:text-champagne transition-colors tracking-wide"
            >
              All Products
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-ink/80 hover:text-champagne transition-colors tracking-wide"
            >
              About
            </Link>
            <a
              href="https://luxbag.blog"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-ink/80 hover:text-champagne transition-colors tracking-wide"
            >
              Blog
            </a>
            <Link
              to="/contact"
              className="text-sm font-medium text-ink/80 hover:text-champagne transition-colors tracking-wide"
            >
              Contact
            </Link>
          </nav>

          {/* 右侧操作 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="p-2 text-ink/80 hover:text-champagne transition-colors"
            >
              <Search size={20} />
            </button>

            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
              className="lg:hidden p-2 text-ink"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* 移动端导航 */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-champagne/20 pt-4 animate-fade-in">
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-sm font-medium text-ink/80 hover:text-champagne">
                Home
              </Link>
              <Link to="/products" className="text-sm font-medium text-ink/80 hover:text-champagne">
                All Products
              </Link>

              <div className="py-2">
                <p className="text-xs uppercase tracking-widest text-champagne mb-2">Brands</p>
                <div className="grid grid-cols-2 gap-2">
                  {brands.map((brand) => (
                    <Link
                      key={brand.slug}
                      to={`/brand/${brand.slug}`}
                      className="text-xs text-ink/70 hover:text-champagne py-1"
                    >
                      {brand.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link to="/about" className="text-sm font-medium text-ink/80 hover:text-champagne">
                About
              </Link>
              <a
                href="https://luxbag.blog"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-ink/80 hover:text-champagne"
              >
                Blog
              </a>
              <Link to="/contact" className="text-sm font-medium text-ink/80 hover:text-champagne">
                Contact
              </Link>
              <Link to="/shipping" className="text-sm font-medium text-ink/80 hover:text-champagne">
                Shipping
              </Link>
              <Link to="/returns" className="text-sm font-medium text-ink/80 hover:text-champagne">
                Returns
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
