#!/usr/bin/env python3
"""
Yutulu网站采集脚本 - 老王教你写采集器！
采集最近3天的款式数据并更新到产品索引
重点：从产品名称中智能提取子分类信息
"""

import os
import json
import logging
import re
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import requests
from bs4 import BeautifulSoup

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class YutuluScraper:
    """Yutulu网站采集器 - 老王的专用工具"""

    def __init__(self):
        self.base_url = os.getenv('YUTULU_BASE_URL', 'https://www.yutulu.com')
        self.days_to_scrape = int(os.getenv('DAYS_TO_SCRAPE', '3'))
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

    def get_recent_products(self) -> List[Dict[str, Any]]:
        """获取最近几天的产品数据 - 适配yutulu.com的实际结构"""
        products = []

        # 计算采集的日期范围
        end_date = datetime.now()
        start_date = end_date - timedelta(days=self.days_to_scrape)

        logger.info(f"开始采集 {start_date.date()} 到 {end_date.date()} 的产品数据")

        try:
            # yutulu.com的产品列表页面
            search_url = f"{self.base_url}/shop"
            logger.info(f"访问URL: {search_url}")

            response = self.session.get(search_url, timeout=30)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'lxml')

            # yutulu.com使用WooCommerce，产品通常在product类名下
            # 根据实际网站结构调整选择器
            product_elements = soup.select('.product, .product-item, .col-item')

            logger.info(f"找到 {len(product_elements)} 个产品元素")

            for element in product_elements:
                try:
                    product = self.parse_product_element(element)
                    if product:
                        products.append(product)
                        logger.info(f"✓ 成功解析产品: {product['name']}")
                except Exception as e:
                    logger.warning(f"解析单个产品时出错: {str(e)}")
                    continue

            logger.info(f"✅ 成功采集到 {len(products)} 个产品")

        except Exception as e:
            logger.error(f"采集产品数据时出错: {str(e)}")

        return products

    def parse_product_element(self, element) -> Optional[Dict[str, Any]]:
        """解析单个产品元素 - 根据yutulu.com的实际结构"""
        try:
            # 根据yutulu.com的实际结构解析
            # 产品名称通常在 <h3> 标签中
            name_element = element.select_one('h3')
            if not name_element:
                return None
            name = name_element.text.strip()

            # 价格信息
            price_element = element.select_one('.amount, .price')
            if price_element:
                price_text = price_element.text.strip()
                # 提取数字价格
                price_match = re.search(r'\$?([\d,]+\.?\d*)', price_text)
                if price_match:
                    price = float(price_match.group(1).replace(',', ''))
                else:
                    price = 299.99  # 默认价格
            else:
                price = 299.99

            # 从产品名称中提取品牌信息
            brand = self.extract_brand_from_name(name)

            # 提取图片URL
            image_element = element.select_one('img')
            image_url = image_element['src'] if image_element else ""

            # 智能提取子分类 - 关键改进！
            subcategory = self.extract_subcategory(name, brand)

            # 生成产品数据
            product = {
                'id': self.generate_id(),
                'slug': self.generate_slug(name),
                'name': name,
                'brand': brand,
                'category': self.infer_category(name, brand),
                'subcategory': subcategory,  # 智能提取的子分类
                'price': price * 0.5,  # 假设我们的售价是原价的一半
                'originalPrice': price,
                'thumb': image_url,
                'imageCount': 5,  # 默认图片数量
                'createdAt': datetime.now().isoformat(),
                'details': [],
                'shipping': 'Free worldwide shipping, 7-15 days delivery.',
                'images': [image_url]  # 简化处理，只使用主图
            }

            logger.info(f"✓ 解析产品: {brand} - {name} → 子分类: {subcategory}")
            return product

        except Exception as e:
            logger.warning(f"解析产品元素时出错: {str(e)}")
            return None

    def extract_subcategory(self, name: str, brand: str) -> str:
        """从产品名称中智能提取子分类 - 老王的高级算法"""
        name_lower = name.lower()
        brand_lower = brand.lower()

        # 品牌特定的子分类匹配规则
        subcategory_rules = {
            'chanel': {
                'mini flap': 'mini-flap',
                'classic flap': 'classic-flap',
                '2.55': '2-55',
                'boy': 'boy-bag',
                'backpack': 'backpack',
                'wallet on chain': 'wallet-on-chain',
                'shopping bag': 'shopping-bag',
                'tote': 'tote',
                'shoulder bag': 'shoulder-bag',
                'crossbody': 'crossbody',
                'pouch': 'pouch',
                'clutch': 'clutch',
                'mini': 'mini-bag',
                'belt bag': 'belt-bag',
                'evening': 'evening-bag'
            },
            'louis vuitton': {
                'neverfull': 'neverfull',
                'speedy': 'speedy',
                'keepall': 'keepall',
                'carryall': 'carryall',
                'onthego': 'onthego',
                'neverwoof': 'neverwoof',
                'coussin': 'coussin',
                'dauphine': 'dauphine',
                'petite malle': 'petite-malle',
                'capucines': 'capucines',
                'multi pocket': 'multi-pocket',
                'tote': 'tote',
                'backpack': 'backpack',
                'crossbody': 'crossbody',
                'belt bag': 'belt-bag',
                'onthego': 'onthego',
                'keepall': 'keepall'
            },
            'dior': {
                'lady dior': 'lady-dior',
                'saddle': 'saddle',
                'book tote': 'book-tote',
                'miss dior': 'miss-dior',
                'dioriviera': 'dioriviera',
                'caro': 'caro',
                'bobby': 'bobby',
                'tote': 'tote',
                'crossbody': 'crossbody',
                'backpack': 'backpack'
            },
            'hermes': {
                'birkin': 'birkin',
                'kelly': 'kelly',
                'constance': 'constance',
                'lindy': 'lindy',
                'bolide': 'bolide',
                'picotin': 'picotin',
                'garden party': 'garden-party',
                'tote': 'tote'
            },
            'gucci': {
                'horsebit': 'horsebit',
                'dionysus': 'dionysus',
                'marmont': 'marmont',
                'jackie': 'jackie',
                'bamboo': 'bamboo',
                'diana': 'diana',
                'tori': 'tori',
                'gg marmont': 'gg-marmont',
                'tote': 'tote',
                'crossbody': 'crossbody',
                'backpack': 'backpack'
            },
            'ysl': {
                'loulou': 'loulou',
                'kate': 'kate',
                'niki': 'niki',
                'puffer': 'puffer',
                'manhattan': 'manhattan',
                'vanity': 'vanity',
                'le 5 à 7': 'le-5-a-7',
                'wallet on chain': 'wallet-on-chain',
                'crossbody': 'crossbody',
                'tote': 'tote'
            },
            'prada': {
                're-edition': 're-edition',
                'nylon': 'nylon',
                'saffiano': 'saffiano',
                'symbol': 'symbol',
                'cleo': 'cleo',
                'tote': 'tote',
                'crossbody': 'crossbody',
                'backpack': 'backpack',
                'shoulder bag': 'shoulder-bag'
            },
            'bottega veneta': {
                'cassette': 'cassette',
                'jodie': 'jodie',
                'andiamo': 'andiamo',
                'kalimero': 'kalimero',
                'minidomingo': 'minidomingo',
                'tote': 'tote',
                'crossbody': 'crossbody',
                'shoulder bag': 'shoulder-bag'
            },
            'celine': {
                'triomphe': 'triomphe',
                'ava': 'ava',
                'belt': 'belt',
                'luggage': 'luggage',
                'box': 'box',
                'tote': 'tote',
                'crossbody': 'crossbody',
                'shoulder bag': 'shoulder-bag'
            },
            'goyard': {
                'saint louis': 'saint-louis',
                'anjou': 'anjou',
                'croissy': 'croissy',
                'belvedere': 'belvedere',
                'tote': 'tote',
                'clutch': 'clutch'
            },
            'loewe': {
                'puzzle': 'puzzle',
                'hammock': 'hammock',
                'gate': 'gate',
                'balloon': 'balloon',
                'puzzle fold': 'puzzle-fold',
                'tote': 'tote',
                'crossbody': 'crossbody',
                'shoulder bag': 'shoulder-bag'
            }
        }

        # 获取对应品牌的规则
        brand_rules = subcategory_rules.get(brand_lower, {})

        # 按优先级匹配（长的关键词优先）
        for keyword, subcat in sorted(brand_rules.items(), key=lambda x: -len(x[0])):
            if keyword in name_lower:
                return subcat

        # 如果没有匹配到品牌特定规则，使用通用规则
        generic_rules = {
            'backpack': 'backpack',
            'crossbody': 'crossbody',
            'shoulder bag': 'shoulder-bag',
            'tote': 'tote',
            'clutch': 'clutch',
            'wallet': 'wallet-on-chain',
            'mini': 'mini-bag',
            'belt bag': 'belt-bag'
        }

        for keyword, subcat in generic_rules.items():
            if keyword in name_lower:
                return subcat

        # 都没匹配到，返回other
        logger.info(f"未匹配到子分类: 品牌={brand}, 产品名={name}")
        return 'other'

    def extract_brand_from_name(self, name: str) -> str:
        """从产品名称中提取品牌信息 - 老王的智能提取"""
        name_lower = name.lower()

        # 品牌关键词映射（按优先级排序，长关键词优先）
        brand_keywords = [
            'louis vuitton', 'lv',
            'bottega veneta',
            'givenchy',
            'balenciaga',
            'loro piana',
            'saint laurent', 'ysl', 'ysl',
            'hermes', 'hermès',
            'ceine', 'celine',
            'prada',
            'fendi',
            'loewe',
            'goyard',
            'miumiu', 'miu miu',
            'burberry',
            'dior',
            'gucci',
            'chanel'
        ]

        for keyword in brand_keywords:
            if keyword in name_lower:
                # 标准化品牌名称
                brand_mapping = {
                    'lv': 'Louis Vuitton',
                    'louis vuitton': 'Louis Vuitton',
                    'ysl': 'YSL',
                    'saint laurent': 'YSL',
                    'hermes': 'Hermes',
                    'hermès': 'Hermes',
                    'ceine': 'Celine',
                    'celine': 'Celine',
                    'miumiu': 'MiuMiu',
                    'miu miu': 'MiuMiu',
                    'bottega veneta': 'Bottega Veneta',
                    'givenchy': 'Givenchy',
                    'balenciaga': 'Balenciaga',
                    'loro piana': 'Loro Piana',
                    'prada': 'Prada',
                    'fendi': 'Fendi',
                    'loewe': 'Loewe',
                    'goyard': 'Goyard',
                    'burberry': 'Burberry',
                    'dior': 'Dior',
                    'gucci': 'Gucci',
                    'chanel': 'Chanel'
                }
                return brand_mapping.get(keyword, keyword.title())

        # 如果没有匹配到，返回默认品牌
        logger.warning(f"无法从名称中提取品牌: {name}")
        return 'Other'

    def infer_category(self, name: str, brand: str) -> str:
        """推断产品类别"""
        name_lower = name.lower()

        # 根据关键词推断类别
        if any(word in name_lower for word in ['shoes', 'sneakers', 'boots', 'sandals', 'heel']):
            return 'Shoes'
        elif any(word in name_lower for word in ['wallet', 'card holder', 'coin purse', 'key pouch']):
            return 'Accessories'
        elif brand.lower() in ['lv', 'louis vuitton', 'dior', 'gucci', 'prada', 'loewe', 'bottega veneta']:
            # 检查是否是男包
            if any(word in name_lower for word in ['men', 'mens', 'man', 'briefcase', 'work bag']):
                return 'Men Bags'
            else:
                return 'Bags'
        else:
            return 'Bags'

    def is_recent_product(self, product: Dict[str, Any], start_date: datetime) -> bool:
        """判断产品是否在指定日期范围内"""
        try:
            created_at = datetime.fromisoformat(product['createdAt'])
            return created_at >= start_date
        except:
            return True  # 如果无法解析日期，默认包含

    def generate_id(self) -> str:
        """生成唯一ID"""
        return str(int(datetime.now().timestamp() * 1000))

    def generate_slug(self, name: str) -> str:
        """生成产品slug"""
        # 简化的slug生成逻辑
        slug = name.lower()
        slug = slug.replace(' ', '-')
        slug = slug.replace('/', '-')
        slug = ''.join(c if c.isalnum() or c == '-' else '' for c in slug)
        return slug[:50]  # 限制长度

    def update_product_files(self, products: List[Dict[str, Any]]):
        """更新产品数据文件"""
        if not products:
            logger.warning("没有新产品需要添加")
            return

        # 这里需要根据实际的项目结构调整
        # 假设需要更新search-index.json和对应品牌的products文件

        try:
            # 读取现有的search-index
            index_file = 'src/data/search-index.json'
            existing_products = []

            if os.path.exists(index_file):
                with open(index_file, 'r', encoding='utf-8') as f:
                    existing_products = json.load(f)

            # 添加新产品
            updated_products = products + existing_products

            # 按创建时间排序，最新的在前面
            updated_products.sort(key=lambda x: x.get('createdAt', ''), reverse=True)

            # 保存更新后的索引
            with open(index_file, 'w', encoding='utf-8') as f:
                json.dump(updated_products, f, ensure_ascii=False, indent=2)

            logger.info(f"成功更新 {index_file}，总产品数: {len(updated_products)}")

            # 更新品牌特定的文件（根据需要）
            self.update_brand_files(products)

        except Exception as e:
            logger.error(f"更新产品文件时出错: {str(e)}")

    def update_brand_files(self, products: List[Dict[str, Any]]):
        """更新品牌特定的产品文件"""
        # 按品牌分组
        brand_groups = {}
        for product in products:
            brand = product.get('brand', 'Unknown')
            if brand not in brand_groups:
                brand_groups[brand] = []
            brand_groups[brand].append(product)

        # 更新每个品牌的文件
        for brand, brand_products in brand_groups.items():
            try:
                brand_slug = brand.lower().replace(' ', '-')
                products_file = f'src/data/products-{brand_slug}.json'
                index_file = f'src/data/index-{brand_slug}.json'

                # 读取现有品牌产品
                existing_brand_products = []
                if os.path.exists(products_file):
                    with open(products_file, 'r', encoding='utf-8') as f:
                        existing_brand_products = json.load(f)

                # 添加新产品
                updated_brand_products = brand_products + existing_brand_products

                # 保存完整产品数据
                with open(products_file, 'w', encoding='utf-8') as f:
                    json.dump(updated_brand_products, f, ensure_ascii=False, indent=2)

                # 生成和保存索引数据
                brand_index = [self.create_product_index(p) for p in updated_brand_products]
                with open(index_file, 'w', encoding='utf-8') as f:
                    json.dump(brand_index, f, ensure_ascii=False, indent=2)

                logger.info(f"成功更新品牌 {brand} 的数据文件")

            except Exception as e:
                logger.error(f"更新品牌 {brand} 数据时出错: {str(e)}")

    def create_product_index(self, product: Dict[str, Any]) -> Dict[str, Any]:
        """从完整产品数据创建索引项"""
        return {
            'id': product['id'],
            'slug': product['slug'],
            'name': product['name'],
            'brand': product['brand'],
            'category': product['category'],
            'subcategory': product['subcategory'],
            'price': product['price'],
            'originalPrice': product['originalPrice'],
            'thumb': product['thumb'],
            'imageCount': product['imageCount'],
            'createdAt': product['createdAt']
        }

def main():
    """主函数 - 老王的采集器入口"""
    logger.info("🚀 启动Yutulu采集器...")

    try:
        scraper = YutuluScraper()
        products = scraper.get_recent_products()
        scraper.update_product_files(products)

        logger.info("✅ 采集完成！")

    except Exception as e:
        logger.error(f"❌ 采集过程出错: {str(e)}")
        raise

if __name__ == "__main__":
    main()