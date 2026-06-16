// 物流政策页
import { Truck, Package, Globe, Clock } from 'lucide-react';

export default function Shipping() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-whisper to-ivory border-b border-champagne/15">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-champagne mb-4 block">
            Customer Care
          </span>
          <h1 className="font-serif text-5xl font-light text-ink">Shipping Policy</h1>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 要点 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="flex items-start gap-4 p-6 bg-whisper rounded-lg">
            <Globe size={28} className="text-champagne shrink-0" />
            <div>
              <h3 className="font-medium text-ink mb-1">Free Worldwide Shipping</h3>
              <p className="text-sm text-ink/50">Complimentary shipping to all destinations globally.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 bg-whisper rounded-lg">
            <Clock size={28} className="text-champagne shrink-0" />
            <div>
              <h3 className="font-medium text-ink mb-1">7-15 Days Delivery</h3>
              <p className="text-sm text-ink/50">Total delivery time including processing and transit.</p>
            </div>
          </div>
        </div>

        {/* 详细 */}
        <div className="prose prose-lg max-w-none">
          <h2 className="font-serif text-2xl font-light text-ink mb-4">Processing Time</h2>
          <p className="text-ink/70 leading-relaxed mb-6">
            All orders are processed within 24 hours of placement. You will receive a confirmation
            email with your order details, followed by a tracking number and tracking link within
            2-3 business days after processing.
          </p>

          <h2 className="font-serif text-2xl font-light text-ink mb-4">Shipping Methods</h2>
          <p className="text-ink/70 leading-relaxed mb-4">
            We partner with trusted international couriers to ensure your order arrives safely
            and promptly. Shipping methods include:
          </p>
          <ul className="space-y-2 text-ink/70 mb-6">
            <li className="flex items-start gap-2">
              <Truck size={18} className="text-champagne shrink-0 mt-1" />
              <span><strong>Standard Shipping:</strong> 10-15 business days (free)</span>
            </li>
            <li className="flex items-start gap-2">
              <Truck size={18} className="text-champagne shrink-0 mt-1" />
              <span><strong>Express Shipping:</strong> 7-10 business days (contact for pricing)</span>
            </li>
          </ul>

          <h2 className="font-serif text-2xl font-light text-ink mb-4">Order Tracking</h2>
          <p className="text-ink/70 leading-relaxed mb-6">
            Once your order ships, you will receive a tracking number via email. You can track
            your package at any time through the courier's website. If you have any questions
            about your shipment, please contact us via WhatsApp.
          </p>

          <h2 className="font-serif text-2xl font-light text-ink mb-4">Customs & Duties</h2>
          <p className="text-ink/70 leading-relaxed mb-6">
            International orders may be subject to customs fees, import duties, or taxes imposed
            by the destination country. These charges are the responsibility of the recipient
            and are not included in our pricing. We recommend checking your country's import
            regulations for more information.
          </p>

          <h2 className="font-serif text-2xl font-light text-ink mb-4">Packaging</h2>
          <p className="text-ink/70 leading-relaxed">
            Every order is carefully packaged to ensure it arrives in pristine condition.
            Each shipment includes:
          </p>
          <ul className="space-y-2 text-ink/70 mt-4">
            <li className="flex items-start gap-2">
              <Package size={18} className="text-champagne shrink-0 mt-1" />
              Premium gift box
            </li>
            <li className="flex items-start gap-2">
              <Package size={18} className="text-champagne shrink-0 mt-1" />
              Protective dustbag
            </li>
            <li className="flex items-start gap-2">
              <Package size={18} className="text-champagne shrink-0 mt-1" />
              Invoice and authenticity cards
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
