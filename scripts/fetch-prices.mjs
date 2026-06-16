// 精简版价格抓取 - 带详细日志
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.join(__dirname, '..', 'src', 'data', 'prices.json');
const BASE = 'https://yutulu.com';

const CATS = [
  '/product-category/bags/',
  '/product-category/accessories/',
  '/product-category/luxury-shoes/',
  '/product-category/men-luxury-bags/',
];

const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36' };

function parse(html) {
  const out = {};
  for (const block of html.split(/<li[^>]*class="[^"]*product[^"]*"/i)) {
    const sm = block.match(/href="https:\/\/yutulu\.com\/product\/([\w-]+)\/"/);
    if (!sm || out[sm[1]]) continue;
    const o = block.match(/Original price was:\s*(?:&#0?36;|\$)([\d,.]+)/i);
    const c = block.match(/Current price is:\s*(?:&#0?36;|\$)([\d,.]+)/i);
    if (o && c) {
      out[sm[1]] = { originalPrice: parseFloat(o[1]), price: parseFloat(c[1]) };
    }
  }
  return out;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const allPrices = {};

for (const cat of CATS) {
  console.log(`\n=== ${cat} ===`);
  let totalPages = 1;

  // 抓第 1 页
  console.log('  fetch page 1...');
  let resp = await fetch(BASE + cat, { headers: UA, signal: AbortSignal.timeout(30000) });
  console.log(`  HTTP ${resp.status}`);
  let html = await resp.text();
  const firstBatch = parse(html);
  Object.assign(allPrices, firstBatch);
  console.log(`  page 1: ${Object.keys(firstBatch).length} prices`);

  // 总页数
  const pages = [...html.matchAll(/\/page\/(\d+)/g)].map(m => +m[1]);
  totalPages = pages.length ? Math.max(...pages) : 1;
  console.log(`  total pages: ${totalPages}`);

  // 剩余页
  for (let p = 2; p <= totalPages; p++) {
    try {
      resp = await fetch(`${BASE}${cat}page/${p}/`, { headers: UA, signal: AbortSignal.timeout(30000) });
      if (!resp.ok) { console.log(`  page ${p}: HTTP ${resp.status}`); continue; }
      html = await resp.text();
      const batch = parse(html);
      Object.assign(allPrices, batch);
      if (p % 20 === 0 || p === totalPages) {
        console.log(`  ${p}/${totalPages}, total: ${Object.keys(allPrices).length}`);
      }
    } catch (e) {
      console.log(`  page ${p}: ${e.message}`);
    }
    await sleep(300);
  }
}

fs.writeFileSync(OUT_FILE, JSON.stringify(allPrices, null, 2));
console.log(`\n✅ ${Object.keys(allPrices).length} prices saved`);
