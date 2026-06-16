// 关于我们页
import { Link } from 'react-router-dom';
import { Shield, Truck, RefreshCw, Headphones, Gem, Globe2, Award, Lock } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-whisper to-ivory border-b border-champagne/15">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-champagne mb-4 block">
            About Kynbag
          </span>
          <h1 className="font-serif text-5xl md:text-6xl font-light text-ink mb-6 leading-tight">
            Where Luxury Meets <span className="italic text-champagne">Accessibility</span>
          </h1>
          <p className="text-ink/60 text-lg leading-relaxed max-w-2xl mx-auto">
            We are dedicated to bringing you the world's finest designer handbags —
            exceptional craftsmanship, timeless design, and unparalleled quality, accessible to collectors worldwide.
          </p>
        </div>
      </div>

      {/* Brand Story */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <h2 className="font-serif text-3xl font-light text-ink mb-6">Our Story</h2>
            <p className="text-ink/70 leading-relaxed mb-6">
              Kynbag was born from a simple belief: that the beauty of luxury fashion should be within reach.
              What began as a passion for exquisite leather goods has grown into a curated destination for
              discerning individuals who appreciate the artistry behind the world's most coveted handbags.
            </p>
            <p className="text-ink/70 leading-relaxed mb-6">
              Over the years, we have built relationships with master artisans and suppliers who share our
              commitment to excellence. Each piece in our collection — from the iconic monogram canvas of
              Louis Vuitton to the timeless quilted elegance of Chanel, from the architectural lines of Dior
              to the artisanal weaving of Bottega Veneta — is selected with an obsessive attention to detail.
            </p>
            <p className="text-ink/70 leading-relaxed">
              Today, Kynbag serves customers in over 100 countries, offering more than 6,000 pieces from
              17 of the world's most prestigious fashion houses. Our mission remains unchanged:
              to deliver extraordinary products with service that matches.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-ink text-ivory">
        <div className="container max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="font-serif text-4xl md:text-5xl font-light text-champagne mb-2">6,000+</div>
              <div className="text-xs uppercase tracking-widest text-ivory/50">Products</div>
            </div>
            <div>
              <div className="font-serif text-4xl md:text-5xl font-light text-champagne mb-2">17</div>
              <div className="text-xs uppercase tracking-widest text-ivory/50">Luxury Brands</div>
            </div>
            <div>
              <div className="font-serif text-4xl md:text-5xl font-light text-champagne mb-2">100+</div>
              <div className="text-xs uppercase tracking-widest text-ivory/50">Countries Served</div>
            </div>
            <div>
              <div className="font-serif text-4xl md:text-5xl font-light text-champagne mb-2">30-Day</div>
              <div className="text-xs uppercase tracking-widest text-ivory/50">Return Policy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.3em] text-champagne mb-3 block">Why Kynbag</span>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-ink">
              The Kynbag Difference
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Gem, title: 'Premium Materials', desc: 'Only the finest leathers, hardware, and fabrics — sourced and crafted to exacting standards.' },
              { icon: Shield, title: 'Quality Guarantee', desc: 'Every piece undergoes rigorous inspection before shipping. Satisfaction guaranteed or your money back.' },
              { icon: Truck, title: 'Free Global Shipping', desc: 'Complimentary express shipping worldwide with full tracking and insurance on every order.' },
              { icon: RefreshCw, title: '30-Day Returns', desc: 'Not completely satisfied? Return within 30 days for a full refund — no questions asked.' },
              { icon: Headphones, title: 'Dedicated Support', desc: 'Our team is available around the clock to assist with selection, sizing, and after-sales care.' },
              { icon: Lock, title: 'Secure & Private', desc: 'Your personal information is protected with industry-leading encryption. We never share your data.' },
              { icon: Globe2, title: 'Worldwide Network', desc: 'Logistics partners across the globe ensure fast, reliable delivery to your doorstep.' },
              { icon: Award, title: 'Trusted Reputation', desc: 'Thousands of satisfied collectors rely on Kynbag for quality, authenticity, and service.' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 mx-auto rounded-full border border-champagne/30 flex items-center justify-center mb-4">
                  <item.icon size={24} className="text-champagne" />
                </div>
                <h3 className="font-serif text-lg text-ink mb-2">{item.title}</h3>
                <p className="text-sm text-ink/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-whisper">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.3em] text-champagne mb-3 block">How It Works</span>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-ink">
              A Seamless Experience
            </h2>
          </div>
          <div className="space-y-8">
            {[
              { step: '01', title: 'Browse & Discover', desc: 'Explore over 6,000 pieces from 17 luxury houses. Filter by brand, category, or price to find your perfect match.' },
              { step: '02', title: 'Inquire via WhatsApp', desc: 'Found something you love? Message us directly on WhatsApp for product details, availability, and personalized assistance.' },
              { step: '03', title: 'Fast Global Shipping', desc: 'Once confirmed, your order is carefully packaged and shipped via express courier with full tracking and insurance.' },
              { step: '04', title: 'Enjoy & Return Easily', desc: 'Receive your piece and enjoy. Not satisfied? Our 30-day return policy has you covered.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="font-serif text-3xl font-light text-champagne/60 flex-shrink-0 w-16">
                  {item.step}
                </div>
                <div className="border-l border-champagne/20 pl-6 pb-2">
                  <h3 className="font-serif text-xl text-ink mb-2">{item.title}</h3>
                  <p className="text-ink/60 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-serif text-3xl font-light text-ink mb-4">
          Begin Your Collection
        </h2>
        <p className="text-ink/50 mb-8 max-w-xl mx-auto">
          Explore our curated selection and discover the piece that speaks to you.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-ink text-ivory px-8 py-4 text-sm font-medium tracking-wide rounded hover:bg-stone-750 transition-all duration-200"
        >
          Explore Collection
        </Link>
      </section>
    </div>
  );
}
