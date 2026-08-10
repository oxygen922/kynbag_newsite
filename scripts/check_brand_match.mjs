import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, "..", "src", "data", "search-index.json");
const s = JSON.parse(fs.readFileSync(file, "utf-8"));

const brandNames = {};
for (const p of s) {
  brandNames[p.brand] = (brandNames[p.brand] || 0) + 1;
}

console.log("search-index 中的 brand 值:");
for (const [k, v] of Object.entries(brandNames).sort((a, b) => b[1] - a[1])) {
  console.log(`  "${k}": ${v}`);
}

// 检查 brands.json 里的 name
const brandsFile = path.join(__dirname, "..", "src", "data", "brands.json");
const brands = JSON.parse(fs.readFileSync(brandsFile, "utf-8"));
console.log("\nbrands.json 里的 name:");
for (const b of brands) {
  console.log(`  "${b.name}"`);
}

// 检查筛选时 brand 匹配情况
console.log("\n品牌名匹配检查:");
for (const b of brands) {
  const match = brandNames[b.name] || 0;
  if (match === 0) {
    console.log(`  ❌ "${b.name}" 在 search-index 中找不到!`);
  }
}
