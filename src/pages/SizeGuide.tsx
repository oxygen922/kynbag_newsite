// 尺码指南页
import { Ruler } from 'lucide-react';

export default function SizeGuide() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-whisper to-ivory border-b border-champagne/15">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-champagne mb-4 block">
            Customer Care
          </span>
          <h1 className="font-serif text-5xl font-light text-ink">Size Guide</h1>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-start gap-4 p-6 bg-whisper rounded-lg mb-10">
          <Ruler size={28} className="text-champagne shrink-0" />
          <div>
            <h2 className="font-medium text-ink mb-1">How to Measure</h2>
            <p className="text-sm text-ink/50">
              Bag dimensions are listed as Length × Height × Width (in cm). To find your ideal size,
              compare with a bag you already own, or use a measuring tape to visualize the dimensions.
            </p>
          </div>
        </div>

        <h2 className="font-serif text-2xl font-light text-ink mb-6">Bag Size Reference</h2>

        {/* 尺寸对照表 */}
        <div className="overflow-x-auto mb-12">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-champagne/20">
                <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-champagne font-medium">Size</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-champagne font-medium">Dimensions (cm)</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-champagne font-medium">Best For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-champagne/10">
              <tr className="hover:bg-whisper transition-colors">
                <td className="py-4 px-4 font-medium text-ink">Mini</td>
                <td className="py-4 px-4 text-ink/60">Under 20 cm</td>
                <td className="py-4 px-4 text-ink/60">Evening events, essentials only</td>
              </tr>
              <tr className="hover:bg-whisper transition-colors">
                <td className="py-4 px-4 font-medium text-ink">Small</td>
                <td className="py-4 px-4 text-ink/60">20 - 25 cm</td>
                <td className="py-4 px-4 text-ink/60">Daily use, phone & wallet</td>
              </tr>
              <tr className="hover:bg-whisper transition-colors">
                <td className="py-4 px-4 font-medium text-ink">Medium</td>
                <td className="py-4 px-4 text-ink/60">25 - 30 cm</td>
                <td className="py-4 px-4 text-ink/60">Work, everyday carry</td>
              </tr>
              <tr className="hover:bg-whisper transition-colors">
                <td className="py-4 px-4 font-medium text-ink">Large</td>
                <td className="py-4 px-4 text-ink/60">30 - 35 cm</td>
                <td className="py-4 px-4 text-ink/60">Travel, laptop, documents</td>
              </tr>
              <tr className="hover:bg-whisper transition-colors">
                <td className="py-4 px-4 font-medium text-ink">Extra Large</td>
                <td className="py-4 px-4 text-ink/60">Over 35 cm</td>
                <td className="py-4 px-4 text-ink/60">Travel, weekend, shopping</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 单位换算 */}
        <h2 className="font-serif text-2xl font-light text-ink mb-6">Unit Conversion</h2>
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-champagne/20">
                <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-champagne font-medium">Centimeters</th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-champagne font-medium">Inches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-champagne/10">
              {[
                [15, 5.9],
                [20, 7.9],
                [25, 9.8],
                [30, 11.8],
                [35, 13.8],
                [40, 15.7],
              ].map(([cm, inch]) => (
                <tr key={cm} className="hover:bg-whisper transition-colors">
                  <td className="py-3 px-4 text-ink/70">{cm} cm</td>
                  <td className="py-3 px-4 text-ink/70">{inch} in</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-whisper rounded-lg">
          <p className="text-sm text-ink/60 leading-relaxed">
            <strong className="text-ink">Need help choosing?</strong> If you're unsure about sizing
            or have questions about a specific product's dimensions, feel free to contact us via
            WhatsApp. Our team is happy to provide detailed measurements and recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}
