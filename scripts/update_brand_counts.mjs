// 更新 brands.json 的 count 为实际商品数
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "src", "data");

const brands = JSON.parse(fs.readFileSync(path.join(dir, "brands.json"), "utf-8"));

for (const brand of brands) {
  const file = path.join(dir, `products-${brand.slug}.json`);
  if (!fs.existsSync(file)) continue;
  const products = JSON.parse(fs.readFileSync(file, "utf-8"));
  const actual = products.length;
  if (brand.count !== actual) {
    console.log(`  ${brand.slug}: ${brand.count} -> ${actual}`);
    brand.count = actual;
  }
}

fs.writeFileSync(path.join(dir, "brands.json"), JSON.stringify(brands, null, 2), "utf-8");
console.log("brands.json count 已更新");
