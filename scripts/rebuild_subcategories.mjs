// 从 index-*.json 重新生成 subcategories.json 的 count
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "src", "data");

const subcats = JSON.parse(fs.readFileSync(path.join(dir, "subcategories.json"), "utf-8"));

for (const [brandSlug, config] of Object.entries(subcats)) {
  const indexFile = path.join(dir, `index-${brandSlug}.json`);
  if (!fs.existsSync(indexFile)) {
    console.log(`  跳过 ${brandSlug} (无 index 文件)`);
    continue;
  }
  const products = JSON.parse(fs.readFileSync(indexFile, "utf-8"));

  // 统计实际 subcategory 分布
  const actualCounts = {};
  for (const p of products) {
    const sc = p.subcategory || "other";
    actualCounts[sc] = (actualCounts[sc] || 0) + 1;
  }

  // 更新配置中的 count
  let changed = false;
  for (const subcat of config.subcategories) {
    const actual = actualCounts[subcat.id] || 0;
    if (subcat.count !== actual) {
      subcat.count = actual;
      changed = true;
    }
    delete actualCounts[subcat.id];
  }

  // 检查是否有 index 中存在但 subcategories.json 中没配置的子分类
  const unconfigured = Object.keys(actualCounts).filter(k => actualCounts[k] > 0);
  if (unconfigured.length > 0) {
    console.log(`\n  [${brandSlug}] 未配置的子分类:`);
    for (const sc of unconfigured.sort((a, b) => actualCounts[b] - actualCounts[a])) {
      console.log(`    ${sc}: ${actualCounts[sc]} 个`);
      // 添加到配置
      config.subcategories.push({
        id: sc,
        name: sc.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        count: actualCounts[sc],
      });
      changed = true;
    }
  }

  if (changed) {
    console.log(`  [${brandSlug}] 已更新 (总商品: ${products.length})`);
  }
}

fs.writeFileSync(path.join(dir, "subcategories.json"), JSON.stringify(subcats, null, 2), "utf-8");
console.log("\nsubcategories.json 已重新生成");

// 验证 chanel
console.log("\n=== Chanel 子分类验证 ===");
const chanelProducts = JSON.parse(fs.readFileSync(path.join(dir, "index-chanel.json"), "utf-8"));
for (const sc of subcats.chanel.subcategories) {
  const actual = chanelProducts.filter(p => p.subcategory === sc.id).length;
  const ok = actual === sc.count ? "OK" : "❌";
  console.log(`  ${sc.id}: ${sc.count} (${ok})`);
}
