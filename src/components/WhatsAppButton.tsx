// WhatsApp 询价按钮组件
import { MessageCircle } from 'lucide-react';
import { buildWhatsAppLink, productInquiryMessage } from '@/lib/whatsapp';

interface WhatsAppButtonProps {
  productName?: string;
  productId?: string;
  message?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'solid' | 'outline';
  showText?: boolean;
  className?: string;
}

export default function WhatsAppButton({
  productName,
  productId,
  message,
  size = 'medium',
  variant = 'solid',
  showText = true,
  className = '',
}: WhatsAppButtonProps) {
  const text =
    message ||
    (productName && productId
      ? productInquiryMessage(productName, productId)
      : 'Hi! I would like to know more about your products.');

  const link = buildWhatsAppLink(text);

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm gap-1.5',
    medium: 'px-5 py-2.5 text-sm gap-2',
    large: 'px-8 py-4 text-base gap-2.5',
  };

  const iconSizes = {
    small: 16,
    medium: 18,
    large: 22,
  };

  const variantClasses =
    variant === 'solid'
      ? 'bg-[#25D366] text-white hover:bg-[#1da851]'
      : 'border border-[#25D366] text-[#1da851] hover:bg-[#25D366] hover:text-white';

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center font-medium rounded transition-all duration-200 hover:scale-[1.02] ${sizeClasses[size]} ${variantClasses} ${className}`}
    >
      <MessageCircle size={iconSizes[size]} />
      {showText && <span>Inquire via WhatsApp</span>}
    </a>
  );
}
