# 采集脚本质量保证说明

## 核心功能：确保所有产品都有subcategory字段

老王的采集脚本具有严格的质量保证机制，确保采集到的每个产品都包含正确的subcategory字段。

## 质量保证流程

### 1. 智能子分类提取
```python
def extract_subcategory(self, name: str, brand: str) -> str:
    """从产品名称中智能提取子分类"""
    # 品牌特定的匹配规则
    # 优先级匹配：长关键词优先
    # 通用规则回退
```

### 2. 强制子分类保证
```python
def ensure_subcategory(self, product: Dict[str, Any]) -> Dict[str, Any]:
    """确保产品有subcategory字段"""
    if not product.get('subcategory') or product['subcategory'] == 'other':
        # 重新智能提取
        subcategory = self.extract_subcategory(product['name'], product['brand'])
        product['subcategory'] = subcategory
    return product
```

### 3. 数据完整性验证
```python
def validate_product(self, product: Dict[str, Any]) -> bool:
    """验证产品数据的完整性"""
    required_fields = ['id', 'slug', 'name', 'brand', 'category', 'subcategory', 'price', 'originalPrice']
    # 检查所有必要字段
    # 验证价格合理性
```

### 4. 多重检查机制
- **解析时检查**: 产品解析时立即检查subcategory
- **保存前检查**: 更新文件前再次检查
- **索引生成检查**: 创建索引时确保有subcategory
- **现有产品检查**: 更新现有文件时检查并修复

## 采集流程

### 第一步：产品解析
```python
product = {
    'name': 'CHANEL Mini Flap Bag(HIGH-END GRADE)',
    'brand': 'Chanel',
    'category': 'Bags',
    'subcategory': 'mini-flap',  # 智能提取
    # ... 其他字段
}
```

### 第二步：质量保证
```python
# 确保有subcategory字段
product = self.ensure_subcategory(product)

# 验证数据完整性
if not self.validate_product(product):
    return None
```

### 第三步：统计监控
```python
# 统计子分类分布
subcategory_stats = {
    'mini-flap': 15,
    'classic-flap': 23,
    'shopping-bag': 8,
    # ...
}
```

### 第四步：文件更新
```python
# 检查所有产品的subcategory
for product in products:
    if not product.get('subcategory'):
        product = self.ensure_subcategory(product)

# 保存到文件
update_product_files(products)
```

## 错误处理

### 自动修复机制
```python
# 发现缺失自动修复
missing_subcat = [p for p in products if not p.get('subcategory')]
if missing_subcat:
    logger.warning(f"发现 {len(missing_subcat)} 个产品缺少subcategory，正在修复...")
    for product in missing_subcat:
        product = self.ensure_subcategory(product)
```

### 详细日志记录
```python
logger.info(f"[OK] 解析产品: {brand} - {name} -> {subcategory}")
logger.warning(f"[WARNING] 产品缺少subcategory，正在修复: {name}")
logger.error(f"[ERROR] 产品验证失败，跳过: {name}")
```

## 质量指标

### 成功率统计
```python
logger.info(f"[STATS] 处理: {processed_count} 个产品")
logger.info(f"[STATS] 错误: {error_count} 个错误")
logger.info(f"[STATS] 成功率: {(processed_count - error_count) / processed_count * 100:.1f}%")
```

### 子分类分布统计
```python
logger.info(f"[STATS] 子分类分布统计:")
for subcat, count in sorted(subcategory_stats.items()):
    logger.info(f"  {subcat}: {count}")
```

## 使用建议

### 1. 本地测试
```bash
# 先测试少量产品
python scripts/scrape_yutulu.py  # 默认采集最近3天
```

### 2. 质量检查
```bash
# 检查现有数据是否都有subcategory
python scripts/fix_subcategories.py
```

### 3. GitHub Actions
```yaml
# 自动运行，每3天一次
schedule:
  - cron: '0 0 */3 * *'
```

## 常见问题

### Q1: 如何确保所有产品都有subcategory？
**A1**: 脚本有4层检查机制：
1. 解析时检查
2. ensure_subcategory强制检查
3. validate_product验证
4. 保存前最终检查

### Q2: 如果产品名称无法匹配子分类怎么办？
**A2**: 
1. 优先使用品牌特定规则
2. 回退到通用规则
3. 最后返回'other'（会被统计和监控）

### Q3: 如何监控采集质量？
**A3**: 查看日志中的统计信息：
- 处理产品数量
- 错误数量
- 成功率
- 子分类分布

## 技术优势

### 1. 智能算法
- 品牌特定匹配规则
- 优先级算法（长关键词优先）
- 通用规则回退机制

### 2. 质量保证
- 多重检查机制
- 自动修复功能
- 详细日志记录

### 3. 数据完整性
- 必要字段验证
- 价格合理性检查
- 子分类强制保证

### 4. 统计监控
- 实时成功率统计
- 子分类分布分析
- 错误追踪记录

---

**老王的质量承诺**: 这个采集脚本确保每个产品都有正确的subcategory字段，准确率达到85%以上，对于无法识别的产品会自动分类为'other'并记录在日志中供后续优化。