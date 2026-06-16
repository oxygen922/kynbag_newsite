// 数据转换脚本：读取 yutulu_scraper_data 素材，输出标准化静态 JSON
// 优化：清洗描述、生成价格、按分片输出（提升加载性能）

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = 'D:\\FP site\\yutulu_scraper_data';
const OUT_DIR = path.join(__dirname, '..', 'src', 'data');

// 品牌名标准化映射
const BRAND_MAP = {
  'louis vuitton': 'Louis Vuitton',
  'lv': 'Louis Vuitton',
  'chanel': 'Chanel',
  'dior': 'Dior',
  'gucci': 'Gucci',
  'hermes': 'Hermes',
  'ysl': 'YSL',
  'prada': 'Prada',
  'bottega veneta': 'Bottega Veneta',
  'celine': 'Celine',
  'goyard': 'Goyard',
  'loewe': 'Loewe',
  'miumiu': 'MiuMiu',
  'balenciaga': 'Balenciaga',
  'fendi': 'Fendi',
  'loro piana': 'Loro Piana',
  'givenchy': 'Givenchy',
  'burberry': 'Burberry',
};

const BRAND_DESCRIPTIONS = {
  'Louis Vuitton': 'French fashion house renowned for its iconic monogram canvas and timeless travel heritage since 1854.',
  'Chanel': 'Synonymous with timeless elegance, Chanel defines Parisian luxury with the iconic 2.55 and Classic Flap.',
  'Dior': 'Christian Dior\'s vision of refined femininity, crafting the legendary Lady Dior and Saddle bags.',
  'Gucci': 'Italian maximalism meets heritage craftsmanship, home to the Horsebit, Dionysus, and Marmont.',
  'Hermes': 'The pinnacle of artisanal leather goods, famed for the Birkin, Kelly, and unparalleled craftsmanship.',
  'YSL': 'Saint Laurent\'s edgy Parisian-chic, defining modern luxury with the Loulou, Kate, and Niki.',
  'Prada': 'Miuccia Prada\'s intellectual luxury, blending nylon innovation with refined Italian leather goods.',
  'Bottega Veneta': 'Master of intrecciato woven leather, understated luxury with the Cassette and Jodie.',
  'Celine': 'Phoebe Philo and Hedi Slimane\'s minimalist vision of modern French elegance.',
  'Goyard': 'The most discreet of luxury houses, hand-painted chevron canvas since 1853.',
  'Loewe': 'Jonathan Anderson\'s craft revival, blending Spanish leather heritage with modern artistry.',
  'MiuMiu': 'Playful, rebellious sister to Prada, defining youthful luxury.',
  'Balenciaga': 'Cristobal Balenciaga\'s architectural heritage reimagined for the streetwear age.',
  'Fendi': 'Roman luxury with the iconic Baguette and Peekaboo, defined by Karl Lagerfeld\'s vision.',
  'Loro Piana': 'The world\'s finest cashmere and vicuna, Italian quiet luxury at its peak.',
  'Givenchy': 'Hubert de Givenchy\'s aristocratic elegance, beloved by Audrey Hepburn.',
  'Burberry': 'British heritage icon, the quintessential trench coat house with the iconic check.',
};

// 品牌价格基准（参考 kynbag 和 yutulu 实际价格范围）
const BRAND_PRICE_BASE = {
  'Louis Vuitton': { min: 199, max: 599 },
  'Chanel': { min: 259, max: 699 },
  'Dior': { min: 229, max: 599 },
  'Hermes': { min: 299, max: 899 },
  'Gucci': { min: 189, max: 499 },
  'YSL': { min: 199, max: 499 },
  'Prada': { min: 189, max: 449 },
  'Bottega Veneta': { min: 219, max: 499 },
  'Celine': { min: 179, max: 449 },
  'Goyard': { min: 199, max: 499 },
  'Loewe': { min: 199, max: 449 },
  'MiuMiu': { min: 169, max: 399 },
  'Balenciaga': { min: 179, max: 449 },
  'Fendi': { min: 199, max: 499 },
  'Loro Piana': { min: 249, max: 599 },
  'Givenchy': { min: 179, max: 399 },
  'Burberry': { min: 159, max: 399 },
};

// 品类价格系数
const CATEGORY_PRICE_FACTOR = {
  'Bags': 1.0,
  'Men Bags': 0.9,
  'Shoes': 0.65,
  'Accessories': 0.4,
};

// 基于商品 id 生成确定性伪随机价格（同商品每次结果一致）
function generatePrice(brand, category, id) {
  const base = BRAND_PRICE_BASE[brand] || { min: 179, max: 399 };
  const factor = CATEGORY_PRICE_FACTOR[category] || 1.0;

  // 用 id 做种子生成 0-1 的伪随机值
  const seed = parseInt(String(id).slice(-6)) || 1;
  const rand = ((seed * 9301 + 49297) % 233280) / 233280;

  const range = base.max - base.min;
  let price = Math.round((base.min + rand * range) * factor);

  // 取整到 9 结尾（如 199, 209, 299）
  price = Math.round(price / 10) * 10 - 1;
  if (price < 99) price = 99;

  // 生成原价（现价的 1.3-1.8 倍）
  const origRand = ((seed * 12345 + 67890) % 233280) / 233280;
  const multiplier = 1.3 + origRand * 0.5;
  let originalPrice = Math.round(price * multiplier / 10) * 10 - 1;

  return { price, originalPrice };
}

// 清洗描述：去掉营销话术，结构化展示
function cleanDescription(desc) {
  if (!desc) return { details: [], shipping: '' };

  const lines = desc.split('\n').map(l => l.trim()).filter(Boolean);

  const details = [];
  let shipping = '';

  for (const line of lines) {
    const lower = line.toLowerCase();

    // 跳过营销话术
    if (lower.includes('super high-quality') || lower.includes('1:1 replica')) continue;
    if (lower.includes('free shipping worldwide')) continue;
    if (lower.includes('tracking number') || lower.includes('tracking link')) continue;
    if (lower.includes('money-back guarantee') || lower.includes('satisfaction guarantee')) continue;
    if (lower.includes('all orders will be shipped')) continue;
    if (lower.includes('packing comes with')) continue;

    // 收集物流信息
    if (lower.includes('7-15 days') || lower.includes('shipping time')) {
      shipping = 'Free worldwide shipping, 7-15 days delivery. Ships within 24 hours.';
      continue;
    }

    // 保留有意义的详情
    if (line.length > 2) {
      details.push(line);
    }
  }

  return { details, shipping: shipping || 'Free worldwide shipping, 7-15 days delivery.' };
}

function normalizeCategory(categories) {
  if (!categories || !Array.isArray(categories)) return 'Bags';
  const joined = categories.join('/').toLowerCase();
  if (joined.includes('shoe')) return 'Shoes';
  if (joined.includes('men')) return 'Men Bags';
  if (joined.includes('accessor')) return 'Accessories';
  return 'Bags';
}

function inferBrand(categories, name) {
  if (categories && Array.isArray(categories)) {
    for (const cat of categories) {
      const key = cat.toLowerCase().trim();
      if (BRAND_MAP[key]) return BRAND_MAP[key];
    }
  }
  if (name) {
    const lower = name.toLowerCase();
    for (const [key, value] of Object.entries(BRAND_MAP)) {
      if (lower.includes(key)) return value;
    }
  }
  return 'Other';
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

function brandSlug(brand) {
  return brand.toLowerCase().replace(/\s+/g, '-');
}

const R2_DOMAIN = 'https://kynbag.com';

// 全局价格映射（从 yutulu 抓取的真实价格）
let PRICES_MAP = {};

function transformProduct(raw) {
  const categories = raw.categories || [];
  const brand = inferBrand(categories, raw.name);
  const category = normalizeCategory(categories);
  const { details, shipping } = cleanDescription(raw.description);

  // 优先使用真实价格（上调 20%），没有则用生成的兜底价格
  const slug = raw.slug || '';
  let price, originalPrice;
  if (PRICES_MAP[slug]) {
    // 上调 20%，并格式化为 x9.99（如 189.99 -> 227.99 -> 229.99）
    const adjusted = PRICES_MAP[slug].price * 1.2;
    price = Math.floor(adjusted / 10) * 10 - 0.01;
    const adjustedOrig = PRICES_MAP[slug].originalPrice * 1.2;
    originalPrice = Math.floor(adjustedOrig / 10) * 10 - 0.01;
  } else {
    const generated = generatePrice(brand, category, raw.id);
    price = generated.price - 0.01;
    originalPrice = generated.originalPrice - 0.01;
  }

  const images = (raw.images || [])
    .map(img => {
      const r2 = img.r2Url || img.originalUrl || '';
      const filename = img.filename || '';
      if (!r2) return null;
      let p = r2.replace(/^https?:\/\/[^/]+/, '');
      p = p.replace(/^\/images/, '');
      return { url: R2_DOMAIN + p, filename };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const an = parseInt((a.filename.match(/\d+/) || ['0'])[0], 10);
      const bn = parseInt((b.filename.match(/\d+/) || ['0'])[0], 10);
      return an - bn;
    })
    .map(item => item.url);

  return {
    id: String(raw.id),
    slug: raw.slug || slugify(raw.name) + '-' + raw.id,
    name: raw.name,
    brand,
    category,
    details,
    shipping,
    price,
    originalPrice,
    images,
    createdAt: raw.date || null,
  };
}

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error('素材目录不存在:', SRC_DIR);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // 加载真实价格数据（如果存在）
  const pricesFile = path.join(OUT_DIR, 'prices.json');
  if (fs.existsSync(pricesFile)) {
    PRICES_MAP = JSON.parse(fs.readFileSync(pricesFile, 'utf8'));
    console.log(`加载 ${Object.keys(PRICES_MAP).length} 个真实价格`);
  } else {
    console.log('⚠ 未找到 prices.json，将使用生成的兜底价格');
    console.log('  运行 node scripts/fetch-prices.mjs 抓取真实价格');
  }

  const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.json') && f !== 'progress.json');
  const productMap = new Map();

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(SRC_DIR, file), 'utf8'));
      if (!Array.isArray(data)) continue;
      for (const raw of data) {
        if (!raw || !raw.id || !raw.name) continue;
        const product = transformProduct(raw);
        if (product.images.length === 0) continue;
        const existing = productMap.get(product.id);
        if (!existing || product.images.length > existing.images.length) {
          productMap.set(product.id, product);
        }
      }
    } catch (e) {
      console.warn(`跳过 ${file}: ${e.message}`);
    }
  }

  const allProducts = Array.from(productMap.values());
  console.log(`共转换 ${allProducts.length} 个商品`);

  // 统计品牌
  const brandCounts = {};
  const brandProductsMap = {};
  for (const p of allProducts) {
    brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
    if (!brandProductsMap[p.brand]) brandProductsMap[p.brand] = [];
    brandProductsMap[p.brand].push(p);
  }

  const brands = Object.keys(brandCounts)
    .filter(b => b !== 'Other')
    .sort((a, b) => brandCounts[b] - brandCounts[a])
    .map(name => ({
      name,
      slug: brandSlug(name),
      count: brandCounts[name],
      description: BRAND_DESCRIPTIONS[name] || '',
    }));

  // 输出 brands.json
  fs.writeFileSync(path.join(OUT_DIR, 'brands.json'), JSON.stringify(brands, null, 2));
  console.log(`输出 brands.json（${brands.length} 个品牌）`);

  // 按品牌输出商品 JSON（每个品牌一个文件）
  for (const brand of brands) {
    const products = brandProductsMap[brand.name]
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    fs.writeFileSync(
      path.join(OUT_DIR, `products-${brand.slug}.json`),
      JSON.stringify(products)
    );
    console.log(`输出 products-${brand.slug}.json（${products.length} 个）`);
  }

  // === 性能优化：输出精简的商品索引（用于列表页和搜索） ===
  // 索引只包含：id, slug, name, brand, category, price, originalPrice, thumb
  // 不包含 details/images 全量数组，大幅减小加载体积
  const allBrandSlugs = brands.map(b => b.slug);
  const indexByBrand = {};

  for (const brand of brands) {
    const products = brandProductsMap[brand.name];
    indexByBrand[brand.slug] = products.map(p => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: p.price,
      originalPrice: p.originalPrice,
      thumb: p.images[0] || '',
      imageCount: p.images.length,
      createdAt: p.createdAt,
    }));
  }

  // 输出每个品牌的索引文件
  for (const [slug, index] of Object.entries(indexByBrand)) {
    fs.writeFileSync(
      path.join(OUT_DIR, `index-${slug}.json`),
      JSON.stringify(index)
    );
  }
  console.log(`输出 ${allBrandSlugs.length} 个品牌索引文件（精简版，用于列表/搜索）`);

  // 输出全站索引（用于搜索，合并所有品牌）
  const fullIndex = Object.values(indexByBrand).flat();
  fs.writeFileSync(
    path.join(OUT_DIR, 'search-index.json'),
    JSON.stringify(fullIndex)
  );
  console.log(`输出 search-index.json（全站搜索索引，${fullIndex.length} 条）`);

  // 精选商品
  const featuredBrands = ['Louis Vuitton', 'Chanel', 'Dior', 'Hermes', 'Gucci'];
  const featured = [];
  for (const b of featuredBrands) {
    const list = (brandProductsMap[b] || [])
      .filter(p => p.images.length >= 4)
      .slice(0, 8);
    featured.push(...list);
  }
  fs.writeFileSync(path.join(OUT_DIR, 'featured.json'), JSON.stringify(featured));
  console.log(`输出 featured.json（${featured.length} 个精选）`);

  console.log('数据转换完成！');
}

main();
