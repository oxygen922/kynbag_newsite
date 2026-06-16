// 联系我们页
import { useState } from 'react';
import { Mail, MessageCircle, Clock, Send } from 'lucide-react';
import WhatsAppButton from '@/components/WhatsAppButton';
import { SITE_CONFIG, buildWhatsAppLink } from '@/lib/whatsapp';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 表单提交跳转 WhatsApp（无后端存储）
    const text = `Hi! My name is ${form.name} (${form.email}). ${form.message}`;
    window.open(buildWhatsAppLink(text), '_blank');
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-whisper to-ivory border-b border-champagne/15">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-champagne mb-4 block">
            Get in Touch
          </span>
          <h1 className="font-serif text-5xl md:text-6xl font-light text-ink mb-4">
            Contact Us
          </h1>
          <p className="text-ink/60 max-w-xl mx-auto">
            We're here to help. Whether you have a question about a product, need styling advice,
            or want to inquire about a specific piece, our team is ready to assist.
          </p>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 联系方式 */}
          <div>
            <h2 className="font-serif text-2xl font-light text-ink mb-6">
              Connect With Us
            </h2>

            <div className="space-y-6">
              {/* WhatsApp */}
              <div className="flex items-start gap-4 p-5 bg-whisper rounded-lg">
                <div className="w-11 h-11 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0">
                  <MessageCircle size={22} className="text-[#25D366]" />
                </div>
                <div>
                  <h3 className="font-medium text-ink mb-1">WhatsApp</h3>
                  <p className="text-sm text-ink/50 mb-3">
                    Fastest response. Chat with our team directly.
                  </p>
                  <WhatsAppButton message="Hi! I would like to inquire about your products." size="small" />
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4 p-5 bg-whisper rounded-lg">
                <div className="w-11 h-11 rounded-full bg-champagne/10 flex items-center justify-center shrink-0">
                  <Mail size={22} className="text-champagne" />
                </div>
                <div>
                  <h3 className="font-medium text-ink mb-1">Email</h3>
                  <p className="text-sm text-ink/50 mb-2">
                    For detailed inquiries and wholesale.
                  </p>
                  <a
                    href={`mailto:${SITE_CONFIG.email}`}
                    className="text-sm text-champagne hover:text-champagne-dark transition-colors"
                  >
                    {SITE_CONFIG.email}
                  </a>
                </div>
              </div>

              {/* 时区 */}
              <div className="flex items-start gap-4 p-5 bg-whisper rounded-lg">
                <div className="w-11 h-11 rounded-full bg-champagne/10 flex items-center justify-center shrink-0">
                  <Clock size={22} className="text-champagne" />
                </div>
                <div>
                  <h3 className="font-medium text-ink mb-1">Business Hours</h3>
                  <p className="text-sm text-ink/50">
                    Monday - Sunday: 9:00 AM - 10:00 PM (GMT+8)
                  </p>
                  <p className="text-xs text-ink/40 mt-1">
                    We typically respond within 2 hours during business hours.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 表单 */}
          <div>
            <h2 className="font-serif text-2xl font-light text-ink mb-6">
              Send a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-widest text-champagne mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-ivory border border-champagne/20 rounded px-4 py-3 text-sm text-ink focus:outline-none focus:border-champagne transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-champagne mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-ivory border border-champagne/20 rounded px-4 py-3 text-sm text-ink focus:outline-none focus:border-champagne transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-champagne mb-2">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-ivory border border-champagne/20 rounded px-4 py-3 text-sm text-ink focus:outline-none focus:border-champagne transition-colors resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-ink text-ivory px-6 py-3.5 text-sm font-medium tracking-wide rounded hover:bg-stone-750 transition-all duration-200"
              >
                <Send size={16} />
                Send via WhatsApp
              </button>
              <p className="text-xs text-ink/40 text-center">
                Your message will be sent through WhatsApp for the fastest response.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
