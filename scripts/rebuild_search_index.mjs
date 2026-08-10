// 从 products-*.json 重新生成 search-index.json（修正缺失字段和品牌名不一致）
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "src", "data");

const BRANDS = [
  "chanel", "louis-vuitton", "gucci", "dior", "celine", "hermes", "ysl",
  "prada", "loewe", "goyard", "fendi", "balenciaga", "bottega-veneta",
  "miumiu", "loro-piana", "givenchy", "burberry",
];

// 品牌名标准化
const BRAND_NORMALIZE = {
  "louis-vuitton": "Louis Vuitton",
  "louis_vuitton": "Louis Vuitton",
  "Louis-vuitton": "Louis Vuitton",
  "Ysl": "YSL",
  "ysl": "YSL",
};

function normalizeBrand(brand) {
  if (BRAND_NORMALIZE[brand]) return BRAND_NORMALIZE[brand];
  return brand;
}

const allIndex = [];
let total = 0;

for (const brand of BRANDS) {
  const file = path.join(dir, `products-${brand}.json`);
  if (!fs.existsSync(file)) continue;
  const products = JSON.parse(fs.readFileSync(file, "utf-8"));
  for (const p of products) {
    allIndex.push({
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand: normalizeBrand(p.brand),
      category: p.category || "Bags",
      price: p.price,
      originalPrice: p.originalPrice,
      thumb: p.images?.[0] || "",
      imageCount: p.images?.length || 0,
      createdAt: p.createdAt,
      subcategory: p.subcategory || "other",
    });
    total++;
  }
}

// 写入
const outFile = path.join(dir, "search-index.json");
fs.writeFileSync(outFile, JSON.stringify(allIndex, null, 2), "utf-8");

console.log(`search-index.json 已重新生成: ${total} 条`);

// 验证
const brandVals = {};
let missingPrice = 0;
let missingCat = 0;
for (const p of allIndex) {
  brandVals[p.brand] = (brandVals[p.brand] || 0) + 1;
  if (typeof p.price !== "number" || p.price <= 0) missingPrice++;
  if (!p.category) missingCat++;
}
console.log("\n品牌分布:");
for (const [k, v] of Object.entries(brandVals).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k}: ${v}`);
}
console.log(`\n缺失价格: ${missingPrice}`);
console.log(`缺失分类: ${missingCat}`);
