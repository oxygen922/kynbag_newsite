# Yutulu网站采集器

老王的专用采集器，用于定期采集Yutulu网站的产品数据并自动更新到网站。

## 功能特性

- 🚀 每3天自动运行一次（通过GitHub Actions）
- 📅 采集最近3天的新产品
- 🏷️ 自动识别品牌和子分类
- 📦 自动更新产品索引和品牌文件
- 🔄 支持手动触发采集

## 使用方法

### 1. 配置GitHub Secrets

在GitHub仓库设置中添加以下Secrets：

- `YUTULU_BASE_URL`: Yutulu网站的URL（可选，默认为https://www.yutulu.com）

### 2. 手动触发采集

在GitHub Actions页面，找到"Yutulu Website Scraper"工作流，点击"Run workflow"按钮手动触发。

### 3. 本地测试

```bash
# 安装依赖
pip install -r scripts/requirements.txt

# 设置环境变量
export YUTULU_BASE_URL="https://www.yutulu.com"
export DAYS_TO_SCRAPE=3

# 运行采集器
python scripts/scrape_yutulu.py
```

## 数据处理逻辑

采集器会：

1. 访问Yutulu网站获取产品列表
2. 解析产品信息（名称、价格、品牌、图片等）
3. 根据产品名称自动识别子分类（如CF、Backpack等）
4. 更新以下文件：
   - `src/data/search-index.json` - 全局搜索索引
   - `src/data/products-{brand}.json` - 品牌完整产品数据
   - `src/data/index-{brand}.json` - 品牌产品索引

## 自动识别的子分类

采集器能根据产品名称中的关键词自动识别以下子分类：

- **Chanel**: Classic Flap, 2.55, CF, Boy Bag, Backpack, etc.
- **Louis Vuitton**: Neverfull, Speedy, Keepall, Carryall, etc.
- **Dior**: Lady Dior, Saddle, Book Tote, etc.
- **Hermes**: Birkin, Kelly, Constance, etc.
- **其他品牌**: 各品牌主要系列

## 定时任务

GitHub Actions配置为每3天运行一次（UTC时间00:00），你也可以修改`.github/workflows/scraper.yml`中的cron表达式来调整频率。

## 注意事项

⚠️ **重要**: 在首次使用前，需要根据Yutulu网站的实际结构调整`scrape_yutulu.py`中的：

1. `get_recent_products()` - 产品列表获取逻辑
2. `parse_product_element()` - 产品元素解析逻辑
3. CSS选择器需要匹配目标网站的实际HTML结构

## 故障排除

如果采集失败，检查：

1. GitHub Actions日志
2. Yutulu网站是否可访问
3. 网站HTML结构是否有变化
4. Python依赖是否正确安装

---

**老王的技术笔记**: 这个采集器设计得很简单，但很实用！记得定期检查网站结构变化，及时更新选择器。