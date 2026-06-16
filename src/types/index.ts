// 商品数据类型
export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  details: string[];
  shipping: string;
  price: number;
  originalPrice: number;
  images: string[];
  createdAt: string | null;
}

// 品牌数据类型
export interface Brand {
  name: string;
  slug: string;
  count: number;
  description: string;
}

// 精简索引项（用于列表页和搜索）
export interface ProductIndex {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice: number;
  thumb: string;
  imageCount: number;
  createdAt: string | null;
}
