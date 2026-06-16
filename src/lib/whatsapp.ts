// WhatsApp 询价配置与工具函数

// 站点配置（部署时修改为实际号码）
export const SITE_CONFIG = {
  whatsappNumber: '1234567890', // 替换为实际 WhatsApp 号码（含国家代码，无+号）
  email: 'ladybags.service@gmail.com',
  brandName: 'Kynbag',
};

// 生成 WhatsApp 询价链接
export function buildWhatsAppLink(message: string): string {
  const text = encodeURIComponent(message);
  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${text}`;
}

// 商品询价消息
export function productInquiryMessage(productName: string, productId: string): string {
  return `Hi! I'm interested in "${productName}" (ID: ${productId}). Could you please provide more details and pricing? Thank you!`;
}
