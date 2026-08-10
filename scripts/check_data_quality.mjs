import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "src", "data");

const s = JSON.parse(fs.readFileSync(path.join(dir, "search-index.json"), "utf-8"));

// 统计各字段缺失情况
let missingSubcat = 0;
let missingBrand = 0;
let missingCategory = 0;
let missingThumb = 0;
let badPrice = 0;
let badSlug = 0;

// 找出所有异常数据
const problems = [];
for (const p of s) {
  const issues = [];
  if (!p.subcategory) { missingSubcat++; issues.push("no subcategory"); }
  if (!p.brand) { missingBrand++; issues.push("no brand"); }
  if (!p.category) { missingCategory++; issues.push("no category"); }
  if (!p.thumb) { missingThumb++; issues.push("no thumb"); }
  if (typeof p.price !== "number" || p.price <= 0) { badPrice++; issues.push(`price=${p.price}`); }
  if (!p.slug) { badSlug++; issues.push("no slug"); }
  if (issues.length > 0) {
    problems.push({ slug: p.slug, name: p.name, brand: p.brand, issues });
  }
}

console.log("=== search-index.json 数据质量检查 ===");
console.log(`总条目: ${s.length}`);
console.log(`缺少 subcategory: ${missingSubcat}`);
console.log(`缺少 brand: ${missingBrand}`);
console.log(`缺少 category: ${missingCategory}`);
console.log(`缺少 thumb: ${missingThumb}`);
console.log(`价格异常: ${badPrice}`);
console.log(`缺少 slug: ${badSlug}`);

// 统计 category 值
const catVals = {};
for (const p of s) {
  catVals[p.category || "(empty)"] = (catVals[p.category || "(empty)"] || 0) + 1;
}
console.log("\ncategory 值分布:");
for (const [k, v] of Object.entries(catVals)) {
  console.log(`  "${k}": ${v}`);
}

// Products 页面筛选用的 CATEGORIES
const FILTER_CATEGORIES = ["Bags", "Men Bags", "Shoes", "Accessories"];
console.log("\n筛选 category 匹配:");
for (const c of FILTER_CATEGORIES) {
  console.log(`  "${c}": ${catVals[c] || 0} 条`);
}

if (problems.length > 0) {
  console.log(`\n异常数据样例（前20条）:`);
  for (const p of problems.slice(0, 20)) {
    console.log(`  ${p.slug || "(no slug)"}: ${p.issues.join(", ")}`);
  }
}
