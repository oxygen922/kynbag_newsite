// 为新增的 22 个商品抓取 yutulu 真实价格并更新项目数据
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "src", "data");
const PRICES_FILE = path.join(DATA_DIR, "prices.json");
const CACHE_FILE = path.join(__dirname, ".yutulu_slugs_cache.json");

const UA = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 新商品 slug 列表
const NEW_SLUGS = [
  "lv-multipass-mini-2",
  "lv-multipass-mini",
  "lv-margot-wallet",
  "lv-charms-pocket-wallet",
  "chanel-large-classic-handbagtax-free-grade",
  "chanel-vanity-with-chainhigh-end-grade-10",
  "chanel-vanity-with-chainhigh-end-grade-9",
  "chanel-vanity-with-chainhigh-end-grade-8",
  "chanel-vanity-with-chainhigh-end-grade-7",
  "chanel-vanity-with-chainhigh-end-grade-11",
  "chanel-medium-vanity-with-chainhigh-end-grade-3",
  "chanel-medium-vanity-with-chainhigh-end-grade-2",
  "chanel-medium-vanity-with-chainhigh-end-grade",
  "chanel-large-vanity-with-chainhigh-end-grade-10",
  "chanel-large-vanity-with-chainhigh-end-grade-9",
  "chanel-large-vanity-with-chainhigh-end-grade-8",
  "chanel-large-vanity-with-chainhigh-end-grade-7",
  "chanel-large-vanity-with-chainhigh-end-grade-6",
  "chanel-large-vanity-with-chainhigh-end-grade-5",
  "chanel-large-vanity-with-chainhigh-end-grade-4",
  "chanel-large-vanity-with-chainhigh-end-grade-3",
  "chanel-large-vanity-with-chainhigh-end-grade-2",
];

async function fetchPage(url) {
  const resp = await fetch(url, { headers: UA, signal: AbortSignal.timeout(30000) });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return await resp.text();
}

function parsePrice(html) {
  const o = html.match(/Original price was:\s*(?:&#0?36;|\$)([\d,.]+)/i);
  const c = html.match(/Current price is:\s*(?:&#0?36;|\$)([\d,.]+)/i);
  if (o && c) {
    return {
      originalPrice: parseFloat(o[1]),
      price: parseFloat(c[1]),
    };
  }
  // 尝试其他价格格式
  const ins = html.match(
    /<ins[^>]*>[\s\S]*?<span[^>]*class="[^"]*amount[^"]*"[^>]*>[\s\S]*?<\/span>/i
  );
  const del = html.match(
    /<del[^>]*>[\s\S]*?<span[^>]*class="[^"]*amount[^"]*"[^>]*>[\s\S]*?<\/span>/i
  );
  if (ins) {
    const cp = ins[0].match(/([\d,.]+)/);
    const op = del ? del[0].match(/([\d,.]+)/) : null;
    if (cp) {
      return {
        originalPrice: op ? parseFloat(op[1]) : parseFloat(cp[1]),
        price: parseFloat(cp[1]),
      };
    }
  }
  return null;
}

// 用 build-data.mjs 的逻辑：真实价格上调 20%
function adjustPrice(realPrice) {
  const adjusted = realPrice.price * 1.2;
  const price = Math.floor(adjusted / 10) * 10 - 0.01;
  const adjustedOrig = realPrice.originalPrice * 1.2;
  const originalPrice = Math.floor(adjustedOrig / 10) * 10 - 0.01;
  return { price, originalPrice };
}

async function main() {
  console.log("=== 抓取 22 个新商品的真实价格 ===\n");

  // 1. 从各商品页面抓取价格
  const prices = JSON.parse(fs.readFileSync(PRICES_FILE, "utf-8"));
  const newPrices = {};
  let found = 0;

  for (let i = 0; i < NEW_SLUGS.length; i++) {
    const slug = NEW_SLUGS[i];
    const url = `https://yutulu.com/product/${slug}/`;
    process.stdout.write(`  [${i + 1}/${NEW_SLUGS.length}] ${slug}... `);
    try {
      const html = await fetchPage(url);
      const p = parsePrice(html);
      if (p) {
        newPrices[slug] = p;
        prices[slug] = p;
        found++;
        console.log(`$${p.price} (原价 $${p.originalPrice})`);
      } else {
        console.log("未找到价格");
      }
    } catch (e) {
      console.log(`失败: ${e.message}`);
    }
    await sleep(500);
  }

  console.log(`\n抓取到 ${found}/${NEW_SLUGS.length} 个真实价格\n`);

  // 2. 保存 prices.json
  fs.writeFileSync(PRICES_FILE, JSON.stringify(prices, null, 2), "utf-8");
  console.log(`prices.json 已更新 (共 ${Object.keys(prices).length} 条)`);

  // 3. 用真实价格更新 products-*.json 和 index-*.json
  console.log("\n更新项目数据中的价格...");
  const brandFiles = {
    chanel: "products-chanel.json",
    "louis-vuitton": "products-louis-vuitton.json",
  };

  let updated = 0;
  for (const [brand, file] of Object.entries(brandFiles)) {
    const pFile = path.join(DATA_DIR, file);
    const iFile = path.join(DATA_DIR, `index-${brand}.json`);
    const products = JSON.parse(fs.readFileSync(pFile, "utf-8"));
    const index = JSON.parse(fs.readFileSync(iFile, "utf-8"));

    for (const p of products) {
      if (newPrices[p.slug]) {
        const adj = adjustPrice(newPrices[p.slug]);
        p.price = adj.price;
        p.originalPrice = adj.originalPrice;
        // 同步更新 index
        const idx = index.find((x) => x.slug === p.slug);
        if (idx) {
          idx.price = adj.price;
          idx.originalPrice = adj.originalPrice;
        }
        // 同步更新 search-index
        updated++;
        console.log(`  ${p.slug}: ¥${adj.price} (原价 ¥${adj.originalPrice})`);
      }
    }

    fs.writeFileSync(pFile, JSON.stringify(products, null, 2), "utf-8");
    fs.writeFileSync(iFile, JSON.stringify(index, null, 2), "utf-8");
  }

  // 更新 search-index.json
  const sFile = path.join(DATA_DIR, "search-index.json");
  const search = JSON.parse(fs.readFileSync(sFile, "utf-8"));
  for (const s of search) {
    if (newPrices[s.slug]) {
      const adj = adjustPrice(newPrices[s.slug]);
      s.price = adj.price;
      s.originalPrice = adj.originalPrice;
    }
  }
  fs.writeFileSync(sFile, JSON.stringify(search, null, 2), "utf-8");

  console.log(`\n=== 完成: ${updated} 个商品价格已更新为真实价格 ===`);
}

main().catch((e) => {
  console.error("失败:", e.message);
  process.exit(1);
});
