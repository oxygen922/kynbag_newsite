// 商品数据类型
export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
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

// 品牌子分类数据类型
export interface BrandSubcategory {
  id: string;
  name: string;
  count: number;
}

export interface BrandSubcategories {
  name: string;
  subcategories: BrandSubcategory[];
}

// 精简索引项（用于列表页和搜索）
export interface ProductIndex {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice: number;
  thumb: string;
  imageCount: number;
  createdAt: string | null;
}
