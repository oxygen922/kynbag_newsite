#!/usr/bin/env node
/**
 * 从 yutulu.com API 拉取全部商品 slug 列表，与项目数据对比
 * 只请求列表接口（不含图片），速度快
 */
import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PROJECT_DATA_DIR = path.join(ROOT, "src/data");
const CACHE_FILE = path.join(ROOT, "scripts/.yutulu_slugs_cache.json");

const BRAND_SLUGS = [
  "chanel", "louis-vuitton", "gucci", "dior", "celine", "hermes", "ysl",
  "prada", "loewe", "goyard", "fendi", "balenciaga", "bottega-veneta",
  "miumiu", "loro-piana", "givenchy", "burberry",
];

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const get = (u, redirects = 0) => {
      const req = https.get(
        u,
        { headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" } },
        (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            if (redirects > 5) return reject(new Error("Too many redirects"));
            return get(res.headers.location, redirects + 1);
          }
          if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
          let data = "";
          res.on("data", (c) => (data += c));
          res.on("end", () => {
            try { resolve({ data: JSON.parse(data), headers: res.headers }); }
            catch (e) { reject(e); }
          });
        }
      );
      req.on("error", reject);
      req.setTimeout(30000, () => req.destroy(new Error("timeout")));
    };
    get(url);
  });
}

async function fetchAllYutuluSlugs() {
  if (fs.existsSync(CACHE_FILE)) {
    const stat = fs.statSync(CACHE_FILE);
    const ageMin = (Date.now() - stat.mtimeMs) / 60000;
    if (ageMin < 60) {
      console.log(`  使用缓存（${ageMin.toFixed(0)}分钟前生成）`);
      return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
    }
  }
  const first = await fetchJSON(
    "https://yutulu.com/wp-json/wp/v2/product?per_page=100&page=1&orderby=date&order=desc"
  );
  const total = parseInt(first.headers["x-wp-total"] || "0");
  const totalPages = parseInt(first.headers["x-wp-totalpages"] || "0");
  console.log(`  yutulu 总商品数: ${total}, 总页数: ${totalPages}`);

  const all = first.data.map((p) => ({
    slug: p.slug, id: p.id, name: p.title?.rendered || "",
    date: p.date, cats: p.product_cat || [],
  }));

  for (let page = 2; page <= totalPages; page++) {
    const { data } = await fetchJSON(
      `https://yutulu.com/wp-json/wp/v2/product?per_page=100&page=${page}&orderby=date&order=desc`
    );
    for (const p of data) {
      all.push({
        slug: p.slug, id: p.id, name: p.title?.rendered || "",
        date: p.date, cats: p.product_cat || [],
      });
    }
    if (page % 10 === 0) process.stdout.write(`\r  已获取 ${all.length}/${total}`);
    await new Promise((r) => setTimeout(r, 250));
  }
  console.log(`\r  已获取 ${all.length}/${total}        `);
  fs.writeFileSync(CACHE_FILE, JSON.stringify(all, null, 2));
  return all;
}

// 从分类名称推断品牌
function inferBrandFromCats(catIds, name) {
  // 简单依据名称
  const text = name.toLowerCase();
  const map = {
    chanel: "chanel", "louis vuitton": "louis-vuitton", "louis-vuitton": "louis-vuitton",
    gucci: "gucci", dior: "dior", celine: "celine", hermes: "hermes",
    "saint laurent": "ysl", ysl: "ysl", prada: "prada", loewe: "loewe",
    goyard: "goyard", fendi: "fendi", balenciaga: "balenciaga",
    "bottega veneta": "bottega-veneta", miumiu: "miumiu", "miu miu": "miumiu",
    "loro piana": "loro-piana", givenchy: "givenchy", burberry: "burberry",
  };
  for (const [kw, brand] of Object.entries(map)) {
    if (text.includes(kw)) return brand;
  }
  return "uncategorized";
}

function loadProjectSlugs() {
  const slugs = new Set();
  const byBrand = {};
  for (const brand of BRAND_SLUGS) {
    const file = path.join(PROJECT_DATA_DIR, `products-${brand}.json`);
    if (!fs.existsSync(file)) { byBrand[brand] = 0; continue; }
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    byBrand[brand] = data.length;
    for (const p of data) if (p.slug) slugs.add(p.slug);
  }
  return { slugs, byBrand };
}

async function main() {
  console.log("=== yutulu.com 实时数据 vs 项目数据 对比 ===\n");
  console.log("[1/3] 拉取 yutulu.com 全部商品列表...");
  const yutulu = await fetchAllYutuluSlugs();
  const yutuluSlugs = new Set(yutulu.map((p) => p.slug));

  console.log("\n[2/3] 读取项目现有商品...");
  const { slugs: projSlugs, byBrand: projByBrand } = loadProjectSlugs();

  console.log(`  yutulu.com 商品数: ${yutuluSlugs.size}`);
  console.log(`  项目商品数:        ${projSlugs.size}\n`);

  // 新增（yutulu 有，项目无）
  const newProducts = yutulu.filter((p) => !projSlugs.has(p.slug));
  // 下架（项目有，yutulu 无）
  const removed = [...projSlugs].filter((s) => !yutuluSlugs.has(s));

  console.log(`[3/3] 对比结果：`);
  console.log(`  ★ 需新增的商品: ${newProducts.length}`);
  console.log(`  ☆ 已下架的商品: ${removed.length}\n`);

  // 新增按品牌统计
  const newByBrand = {};
  for (const p of newProducts) {
    const b = inferBrandFromCats(p.cats, p.name);
    newByBrand[b] = (newByBrand[b] || 0) + 1;
  }
  console.log("---------- 新增商品按品牌分布 ----------");
  let total = 0;
  for (const b of [...BRAND_SLUGS, "uncategorized"].sort(
    (a, c) => (newByBrand[c] || 0) - (newByBrand[a] || 0)
  )) {
    const cnt = newByBrand[b] || 0;
    if (!cnt) continue;
    total += cnt;
    const cur = projByBrand[b] || 0;
    console.log(`  ${b.padEnd(18)} 新增 ${String(cnt).padStart(3)}  (现有 ${cur})`);
  }
  console.log(`  ${"合计".padEnd(18)} ${String(total).padStart(3)}\n`);

  // 新增按月份
  const byMonth = {};
  for (const p of newProducts) {
    const m = (p.date || "").slice(0, 7);
    byMonth[m] = (byMonth[m] || 0) + 1;
  }
  console.log("---------- 新增商品按月份 ----------");
  for (const m of Object.keys(byMonth).sort()) {
    console.log(`  ${m || "未知"}: ${byMonth[m]}`);
  }

  // 新商品明细列表
  console.log("\n---------- 新增商品明细 ----------");
  const sorted = newProducts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  for (const p of sorted) {
    const b = inferBrandFromCats(p.cats, p.name);
    console.log(`  [${b.padEnd(16)}] ${p.name}  (${p.date})  slug=${p.slug}`);
  }

  console.log(`\n=== 结论：需要新增 ${newProducts.length} 个商品 ===`);
}

main().catch((e) => { console.error("失败:", e.message); process.exit(1); });
