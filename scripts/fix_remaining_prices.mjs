// 修复最后6个价格异常的商品
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "src", "data");

// 已确认的真实价格（yutulu 现价）
const FIXES = {
  "chanel-large-vanity-with-chainhigh-end-grade": { price: 259.99, originalPrice: 509.99 },
  "hermes-birkin-40high-end-grade-5": { price: 899.99, originalPrice: 1799.99 },
  "hermes-birkin-40high-end-grade-4": { price: 899.99, originalPrice: 1799.99 },
  "hermes-birkin-40high-end-grade-3": { price: 899.99, originalPrice: 1799.99 },
  "hermes-birkin-40high-end-grade-2": { price: 899.99, originalPrice: 1799.99 },
  "hermes-birkin-40high-end-grade": { price: 899.99, originalPrice: 1799.99 },
};

function adjustPrice(price, originalPrice) {
  const adjP = Math.floor((price * 1.2) / 10) * 10 - 0.01;
  const adjO = Math.floor((originalPrice * 1.2) / 10) * 10 - 0.01;
  return { price: adjP, originalPrice: adjO };
}

const BRANDS = ["chanel", "louis-vuitton", "gucci", "dior", "celine", "hermes", "ysl", "prada", "loewe", "goyard", "fendi", "balenciaga", "bottega-veneta", "miumiu", "loro-piana", "givenchy", "burberry"];

for (const brand of BRANDS) {
  const pFile = path.join(DATA_DIR, `products-${brand}.json`);
  const iFile = path.join(DATA_DIR, `index-${brand}.json`);
  if (!fs.existsSync(pFile)) continue;

  const products = JSON.parse(fs.readFileSync(pFile, "utf-8"));
  let changed = false;
  for (const p of products) {
    if (FIXES[p.slug]) {
      const adj = adjustPrice(FIXES[p.slug].price, FIXES[p.slug].originalPrice);
      p.price = adj.price;
      p.originalPrice = adj.originalPrice;
      changed = true;
      console.log(`  [${brand}] ${p.slug}: $${adj.price} (原价 $${adj.originalPrice})`);
    }
  }
  if (changed) {
    fs.writeFileSync(pFile, JSON.stringify(products, null, 2), "utf-8");
    // sync index
    const index = JSON.parse(fs.readFileSync(iFile, "utf-8"));
    for (const idx of index) {
      if (FIXES[idx.slug]) {
        const adj = adjustPrice(FIXES[idx.slug].price, FIXES[idx.slug].originalPrice);
        idx.price = adj.price;
        idx.originalPrice = adj.originalPrice;
      }
    }
    fs.writeFileSync(iFile, JSON.stringify(index, null, 2), "utf-8");
  }
}

// search-index
const sFile = path.join(DATA_DIR, "search-index.json");
const search = JSON.parse(fs.readFileSync(sFile, "utf-8"));
for (const s of search) {
  if (FIXES[s.slug]) {
    const adj = adjustPrice(FIXES[s.slug].price, FIXES[s.slug].originalPrice);
    s.price = adj.price;
    s.originalPrice = adj.originalPrice;
  }
}
fs.writeFileSync(sFile, JSON.stringify(search, null, 2), "utf-8");

// prices.json
const pricesFile = path.join(DATA_DIR, "prices.json");
const prices = JSON.parse(fs.readFileSync(pricesFile, "utf-8"));
for (const [slug, p] of Object.entries(FIXES)) {
  prices[slug] = { price: p.price, originalPrice: p.originalPrice };
}
fs.writeFileSync(pricesFile, JSON.stringify(prices, null, 2), "utf-8");

console.log("\n=== 6 个异常价格已修复 ===");
