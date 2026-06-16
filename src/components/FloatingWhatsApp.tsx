// 浮动 WhatsApp 询价按钮（固定在右下角）
import { MessageCircle } from 'lucide-react';
import { buildWhatsAppLink } from '@/lib/whatsapp';

export default function FloatingWhatsApp() {
  const link = buildWhatsAppLink(
    'Hi! I would like to know more about your luxury bags collection.'
  );

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact us on WhatsApp"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:bg-[#1da851] transition-all duration-200 hover:scale-110"
    >
      <MessageCircle size={28} />
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75" />
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
    </a>
  );
}
