// 数据加载层：统一管理静态 JSON 的加载与查询
// 性能优化：列表页用精简索引，详情页用完整数据
import type { Product, Brand, ProductIndex, BrandSubcategories } from '@/types';
import brandsData from '@/data/brands.json';
import subcategoriesData from '@/data/subcategories.json';

// 品牌列表
export const brands: Brand[] = brandsData as Brand[];

// 品牌子分类列表
export const brandSubcategories: Record<string, BrandSubcategories> = subcategoriesData as Record<string, BrandSubcategories>;

// 获取指定品牌的子分类
export function getSubcategoriesByBrand(brandSlug: string): BrandSubcategories | null {
  return brandSubcategories[brandSlug] || null;
}

// 品牌查找映射
const brandMap = new Map<string, Brand>(brands.map(b => [b.slug, b]));

export function getBrandBySlug(slug: string): Brand | undefined {
  return brandMap.get(slug);
}

// === 精简索引（用于列表页、搜索，体积小加载快）===
// 使用 import.meta.glob 预加载品牌索引文件
const indexModules = import.meta.glob('/src/data/index-*.json') as Record<string, () => Promise<{ default: ProductIndex[] }>>;

function slugFromIndexPath(path: string): string {
  const match = path.match(/index-([^/]+)\.json$/);
  return match ? match[1] : '';
}

const indexCache = new Map<string, ProductIndex[]>();

export async function getBrandIndex(brandSlug: string): Promise<ProductIndex[]> {
  if (indexCache.has(brandSlug)) {
    return indexCache.get(brandSlug)!;
  }
  const modulePath = Object.keys(indexModules).find(p => slugFromIndexPath(p) === brandSlug);
  if (modulePath) {
    const mod = await indexModules[modulePath]();
    indexCache.set(brandSlug, mod.default);
    return mod.default;
  }
  return [];
}

// 全站索引（一次性加载 search-index.json）
let fullIndexCache: ProductIndex[] | null = null;

export async function getAllProductIndex(): Promise<ProductIndex[]> {
  if (fullIndexCache) return fullIndexCache;
  const mod = await import('@/data/search-index.json');
  fullIndexCache = mod.default as ProductIndex[];
  return fullIndexCache;
}

// === 完整商品数据（仅详情页使用，按需懒加载）===
const productModules = import.meta.glob('/src/data/products-*.json') as Record<string, () => Promise<{ default: Product[] }>>;

function slugFromPath(path: string): string {
  const match = path.match(/products-([^/]+)\.json$/);
  return match ? match[1] : '';
}

const productCache = new Map<string, Product[]>();

export async function getProductsByBrand(brandSlug: string): Promise<Product[]> {
  if (productCache.has(brandSlug)) {
    return productCache.get(brandSlug)!;
  }
  const modulePath = Object.keys(productModules).find(p => slugFromPath(p) === brandSlug);
  if (modulePath) {
    const mod = await productModules[modulePath]();
    productCache.set(brandSlug, mod.default);
    return mod.default;
  }
  return [];
}

// 按 slug 查找完整商品（用于详情页）
// 优化：先用索引找到品牌，再只加载该品牌的完整数据
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const fullIndex = await getAllProductIndex();
  const item = fullIndex.find(p => p.slug === slug);
  if (!item) return null;

  const brandSlug = item.brand.toLowerCase().replace(/\s+/g, '-');
  const products = await getProductsByBrand(brandSlug);
  return products.find(p => p.slug === slug) || null;
}
