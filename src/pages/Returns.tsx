// 退换政策页
import { RotateCcw, Check, X, ShieldCheck } from 'lucide-react';

export default function Returns() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-whisper to-ivory border-b border-champagne/15">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-champagne mb-4 block">
            Customer Care
          </span>
          <h1 className="font-serif text-5xl font-light text-ink">Returns Policy</h1>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 保障 */}
        <div className="bg-whisper rounded-lg p-8 mb-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-champagne/10 flex items-center justify-center mb-4">
            <ShieldCheck size={32} className="text-champagne" />
          </div>
          <h2 className="font-serif text-2xl font-light text-ink mb-2">
            100% Satisfaction Guarantee
          </h2>
          <p className="text-ink/60 max-w-xl mx-auto">
            We stand behind every piece we sell. If you're not completely satisfied,
            we offer a 30-day money-back guarantee.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <h2 className="font-serif text-2xl font-light text-ink mb-4">Return Period</h2>
          <p className="text-ink/70 leading-relaxed mb-6">
            You may return any item within 30 days of delivery for a full refund. Items must be
            unused, in their original condition, with all packaging, dustbag, cards, and
            accessories included.
          </p>

          <h2 className="font-serif text-2xl font-light text-ink mb-4">How to Return</h2>
          <ol className="space-y-3 text-ink/70 mb-6 list-decimal list-inside">
            <li>Contact us via WhatsApp or email with your order number and reason for return.</li>
            <li>We will provide a return address and instructions within 24 hours.</li>
            <li>Securely package the item with all original accessories.</li>
            <li>Ship the package using a trackable shipping method.</li>
            <li>Once received and inspected, your refund will be processed within 3-5 business days.</li>
          </ol>

          <h2 className="font-serif text-2xl font-light text-ink mb-4">Conditions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-5 bg-whisper rounded-lg">
              <h3 className="flex items-center gap-2 font-medium text-green-600 mb-3">
                <Check size={18} /> Eligible
              </h3>
              <ul className="space-y-2 text-sm text-ink/60">
                <li>Unused items in original condition</li>
                <li>All packaging and accessories included</li>
                <li>Within 30 days of delivery</li>
                <li>Wrong item received</li>
                <li>Defective or damaged items</li>
              </ul>
            </div>
            <div className="p-5 bg-whisper rounded-lg">
              <h3 className="flex items-center gap-2 font-medium text-red-500 mb-3">
                <X size={18} /> Not Eligible
              </h3>
              <ul className="space-y-2 text-sm text-ink/60">
                <li>Used or worn items</li>
                <li>Items missing packaging or accessories</li>
                <li>Items damaged by misuse</li>
                <li>After 30 days of delivery</li>
              </ul>
            </div>
          </div>

          <h2 className="font-serif text-2xl font-light text-ink mb-4">Refunds</h2>
          <p className="text-ink/70 leading-relaxed mb-6">
            Refunds are processed to the original payment method within 3-5 business days after
            we receive and inspect the returned item. Please note that your bank may take
            additional time to process the refund.
          </p>

          <h2 className="font-serif text-2xl font-light text-ink mb-4">Exchanges</h2>
          <p className="text-ink/70 leading-relaxed">
            If you would like to exchange an item for a different style, color, or size, please
            contact us via WhatsApp. We will guide you through the exchange process and help
            you find the perfect replacement.
          </p>
        </div>
      </div>
    </div>
  );
}
