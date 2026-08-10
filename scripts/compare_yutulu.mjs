#!/usr/bin/env node
/**
 * 对比 yutulu 采集数据与本项目商品数据
 * 输出：新增商品数、缺失商品、各品牌统计
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// 采集数据来源（优先 scraper 完整数据）
const SCRAPER_DATA = "D:/07 仿牌/FP site/scraper/data/all_products.json";
const NEW_DATA = path.join(ROOT, "yutulu_new_data/all_products.json");
const PROJECT_DATA_DIR = path.join(ROOT, "src/data");

const BRAND_SLUGS = [
  "chanel", "louis-vuitton", "gucci", "dior", "celine", "hermes", "ysl",
  "prada", "loewe", "goyard", "fendi", "balenciaga", "bottega-veneta",
  "miumiu", "loro-piana", "givenchy", "burberry",
];

// ---------- 加载采集数据 ----------
function loadScraped() {
  const all = new Map(); // slug -> product
  const files = [SCRAPER_DATA, NEW_DATA];
  for (const f of files) {
    if (!fs.existsSync(f)) {
      console.log(`  (跳过不存在的采集文件: ${f})`);
      continue;
    }
    const data = JSON.parse(fs.readFileSync(f, "utf-8"));
    for (const p of data) {
      if (!all.has(p.slug)) all.set(p.slug, p);
    }
  }
  return all;
}

// ---------- 加载项目数据 ----------
function loadProject() {
  const all = new Map(); // slug -> product
  const byBrand = {};
  for (const brand of BRAND_SLUGS) {
    const file = path.join(PROJECT_DATA_DIR, `products-${brand}.json`);
    if (!fs.existsSync(file)) {
      byBrand[brand] = 0;
      continue;
    }
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    byBrand[brand] = data.length;
    for (const p of data) {
      if (p.slug) all.set(p.slug, { ...p, _brand: brand });
    }
  }
  return { all, byBrand };
}

// ---------- 品牌识别（从采集数据的 categories 推断品牌）----------
function inferBrand(product) {
  const cats = (product.categories || []).map((c) => c.toLowerCase());
  const text = (product.name + " " + cats.join(" ")).toLowerCase();
  const map = {
    "chanel": ["chanel"],
    "louis-vuitton": ["louis vuitton", "louis-vuitton"],
    "gucci": ["gucci"],
    "dior": ["dior"],
    "celine": ["celine"],
    "hermes": ["hermes", "hermès"],
    "ysl": ["ysl", "saint laurent", "yves saint"],
    "prada": ["prada"],
    "loewe": ["loewe"],
    "goyard": ["goyard"],
    "fendi": ["fendi"],
    "balenciaga": ["balenciaga"],
    "bottega-veneta": ["bottega veneta", "bottega"],
    "miumiu": ["miumiu", "miu miu"],
    "loro-piana": ["loro piana", "loro-piana"],
    "givenchy": ["givenchy"],
    "burberry": ["burberry"],
  };
  // 先从 categories 精确匹配
  for (const [brand, keywords] of Object.entries(map)) {
    for (const kw of keywords) {
      if (cats.some((c) => c === kw || c.includes(kw))) return brand;
    }
  }
  // 再从名称匹配
  for (const [brand, keywords] of Object.entries(map)) {
    for (const kw of keywords) {
      if (text.includes(kw)) return brand;
    }
  }
  return "uncategorized";
}

// ---------- 主流程 ----------
function main() {
  console.log("=== Yutulu 采集数据 vs 项目数据 对比 ===\n");

  const scraped = loadScraped();
  const { all: project, byBrand: projectByBrand } = loadProject();

  console.log(`采集数据(yutulu)总商品数: ${scraped.size}`);
  console.log(`项目数据当前商品数:       ${project.size}\n`);

  // 项目里不存在的新商品
  const newProducts = [];
  const newByBrand = {};
  for (const [slug, p] of scraped) {
    if (!project.has(slug)) {
      newProducts.push(p);
      const brand = inferBrand(p);
      newByBrand[brand] = (newByBrand[brand] || 0) + 1;
    }
  }

  // 项目里有但采集数据里没有的（可能已下架/删除）
  const removed = [];
  for (const [slug, p] of project) {
    if (!scraped.has(slug)) removed.push({ slug, brand: p._brand });
  }

  console.log("---------- 各品牌现有商品数 ----------");
  let projTotal = 0;
  for (const brand of BRAND_SLUGS) {
    const cnt = projectByBrand[brand] || 0;
    projTotal += cnt;
    console.log(`  ${brand.padEnd(18)} ${String(cnt).padStart(5)}`);
  }
  console.log(`  ${"总计".padEnd(18)} ${String(projTotal).padStart(5)}\n`);

  console.log("---------- 各品牌新增商品数（采集有、项目无）----------");
  let newTotal = 0;
  const sortedBrands = [...BRAND_SLUGS, "uncategorized"].sort((a, b) =>
    (newByBrand[b] || 0) - (newByBrand[a] || 0)
  );
  for (const brand of sortedBrands) {
    const cnt = newByBrand[brand] || 0;
    if (cnt === 0) continue;
    newTotal += cnt;
    const current = projectByBrand[brand] || 0;
    const pct = current > 0 ? `(+${((cnt / current) * 100).toFixed(0)}%)` : "(新)";
    console.log(`  ${brand.padEnd(18)} 新增 ${String(cnt).padStart(4)}  现有 ${String(current).padStart(4)}  ${pct}`);
  }
  console.log(`  ${"新增总计".padEnd(18)} ${String(newTotal).padStart(4)}\n`);

  console.log(`项目中有 ${removed.length} 个商品在采集数据里已不存在（可能已下架）。\n`);

  // 新商品按日期统计
  const byMonth = {};
  for (const p of newProducts) {
    const m = (p.date || "").slice(0, 7);
    byMonth[m] = (byMonth[m] || 0) + 1;
  }
  console.log("---------- 新商品按月份分布 ----------");
  for (const m of Object.keys(byMonth).sort()) {
    console.log(`  ${m || "未知"}: ${byMonth[m]}`);
  }

  // 新商品样例
  console.log("\n---------- 新商品样例（前20条）----------");
  const sorted = newProducts
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  for (const p of sorted.slice(0, 20)) {
    const brand = inferBrand(p);
    console.log(`  [${brand.padEnd(16)}] ${p.name}  (${p.date})`);
  }
  if (newProducts.length > 20) {
    console.log(`  ... 还有 ${newProducts.length - 20} 条`);
  }

  console.log(`\n=== 结论：需要新增/更新的商品共 ${newTotal} 个 ===`);
}

main();
