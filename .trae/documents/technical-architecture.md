# 技术架构文档 — 奢侈品包包展示网站

## 1. 架构设计

轻量级纯前端 SPA，构建时生成静态数据，Vercel 静态托管，无后端服务。

```mermaid
flowchart TB
    subgraph "构建时 Build Time"
        "yutulu 素材 JSON" --> "数据转换脚本 scripts/build-data.mjs"
        "数据转换脚本" --> "静态 JSON src/data/*.json"
    end
    subgraph "运行时 Runtime 纯前端"
        "React SPA Vite" --> "静态 JSON"
        "React SPA" --> "R2 图片 CDN"
        "React SPA" --> "WhatsApp 询价外链"
    end
    subgraph "部署 Deploy"
        "Vite 构建" --> "Vercel 静态托管 + CDN"
    end
```

## 2. 技术说明
- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite 5（快速冷启动，轻量产物）
- **样式**：Tailwind CSS 3（原子化，定制奢华主题）
- **路由**：react-router-dom 6（SPA 客户端路由）
- **状态**：Zustand（搜索、筛选等轻量全局状态）
- **图标**：lucide-react
- **初始化工具**：vite-init（react-ts 模板）
- **后端**：无（纯展示型，无交易、无数据库）
- **部署**：Vercel（静态构建产物 `dist/`，全球 CDN）

## 3. 路由定义
| 路由 | 用途 |
|------|------|
| `/` | 首页：Hero + 精选 + 品牌矩阵 + 卖点 |
| `/products` | 全部商品（筛选/排序/分页） |
| `/products/:slug` | 商品详情页 |
| `/brand/:brandSlug` | 品牌页（该品牌全部商品） |
| `/about` | 关于我们 |
| `/contact` | 联系我们（表单 + WhatsApp） |
| `/shipping` | 物流政策 |
| `/returns` | 退换政策 |
| `/size-guide` | 尺码指南 |
| `*` | 404 页 |

## 4. 数据模型

### 4.1 商品数据结构（TypeScript）
```typescript
interface Product {
  id: string;           // 原 id 转字符串
  slug: string;         // URL 友好标识，路由用
  name: string;
  description: string;
  brand: string;        // 标准化品牌名
  category: string;     // Bags / Men Bags / Accessories / Shoes
  images: string[];     // R2 云存储直链数组
  createdAt: string;    // 原 date 字段
}

interface Brand {
  name: string;
  slug: string;
  count: number;        // 商品数量
}
```

### 4.2 数据转换策略
- 脚本 `scripts/build-data.mjs` 读取 `yutulu_scraper_data/*.json`
- 合并去重（按 id），标准化品牌名（大小写统一映射）
- 按品牌拆分输出 `src/data/products-{brand}.json`，避免单文件过大
- 输出 `src/data/brands.json`（品牌清单 + 数量）
- 图片取 `images[].r2Url`，过滤空值
- 运行时按需 import JSON（Vite 自动按 chunk 拆分）

## 5. 关键设计决策
- **无交易**：去除购物车/结算/支付，仅 WhatsApp 询价外链 + 联系表单（表单提交跳转 WhatsApp/邮件，不存数据）
- **轻量**：纯静态 JSON + 图片走 R2 CDN，Vercel 托管零服务器
- **性能**：图片懒加载（loading="lazy"）、路由级代码分割、分页避免一次渲染过多
- **SEO**：静态 HTML、语义化标签、meta 标签（展示型站点基础 SEO）

## 6. 项目结构
```
仿牌网站/
├── scripts/
│   └── build-data.mjs        # 素材数据转换脚本
├── src/
│   ├── components/           # Header, Footer, ProductCard, WhatsAppButton, SearchModal, Gallery...
│   ├── pages/                # Home, Products, ProductDetail, Brand, About, Contact, Policy...
│   ├── data/                 # 构建生成的静态 JSON
│   ├── store/                # Zustand 状态（筛选/搜索）
│   ├── lib/                  # 数据加载/工具函数
│   ├── types/                # TS 类型定义
│   ├── App.tsx               # 路由配置
│   └── main.tsx
├── public/                   # 静态资源（品牌 logo 等）
├── index.html
├── tailwind.config.js
├── vite.config.ts
└── package.json
```
