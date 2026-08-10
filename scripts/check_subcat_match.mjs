import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "src", "data");

// 1. 检查 index-chanel.json 中的 subcategory 分布
const chanelIndex = JSON.parse(fs.readFileSync(path.join(dir, "index-chanel.json"), "utf-8"));
const chanelSubcats = {};
for (const p of chanelIndex) {
  const sc = p.subcategory || "(empty)";
  chanelSubcats[sc] = (chanelSubcats[sc] || 0) + 1;
}
console.log("=== index-chanel.json subcategory 分布 ===");
for (const [k, v] of Object.entries(chanelSubcats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k}: ${v}`);
}

// 2. 检查 subcategories.json 中 chanel 的配置
const subcats = JSON.parse(fs.readFileSync(path.join(dir, "subcategories.json"), "utf-8"));
console.log("\n=== subcategories.json chanel 配置 ===");
if (subcats.chanel) {
  console.log(`name: ${subcats.chanel.name}`);
  for (const sc of subcats.chanel.subcategories) {
    const actual = chanelSubcats[sc.id] || 0;
    const mismatch = actual !== sc.count ? " ❌ 不匹配!" : "";
    console.log(`  ${sc.id} (${sc.name}): 配置count=${sc.count}, 实际=${actual}${mismatch}`);
  }
}

// 3. 检查 index-chanel.json 字段完整性
let missingSubcat = 0;
let missingPrice = 0;
for (const p of chanelIndex) {
  if (!p.subcategory) missingSubcat++;
  if (typeof p.price !== "number") missingPrice++;
}
console.log(`\nindex-chanel.json 总数: ${chanelIndex.length}`);
console.log(`缺失 subcategory: ${missingSubcat}`);
console.log(`缺失 price: ${missingPrice}`);

// 4. "other" 子分类检查
const others = chanelIndex.filter(p => p.subcategory === "other");
console.log(`\n"other" 子分类商品: ${others.length}`);
console.log("样例:");
for (const o of others.slice(0, 5)) {
  console.log(`  ${o.slug}`);
}
