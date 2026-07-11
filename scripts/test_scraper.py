#!/usr/bin/env python3
"""
老王的测试版采集脚本 - 从yutulu.com采集少量产品进行测试
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import requests
from bs4 import BeautifulSoup

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TestYutuluScraper:
    """老王的测试采集器"""

    def __init__(self):
        self.base_url = "https://www.yutulu.com"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

    def extract_brand_from_name(self, name: str) -> str:
        """从产品名称中提取品牌信息"""
        name_lower = name.lower()

        # 品牌关键词映射
        brand_keywords = [
            'louis vuitton', 'lv',
            'bottega veneta',
            'givenchy',
            'balenciaga',
            'loro piana',
            'saint laurent', 'ysl',
            'hermes', 'hermès',
            'celine',
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
                brand_mapping = {
                    'lv': 'Louis Vuitton',
                    'louis vuitton': 'Louis Vuitton',
                    'ysl': 'YSL',
                    'saint laurent': 'YSL',
                    'hermes': 'Hermes',
                    'hermès': 'Hermes',
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
                    'chanel': 'Chanel',
                    'celine': 'Celine'
                }
                return brand_mapping.get(keyword, keyword.title())

        return 'Other'

    def extract_subcategory(self, name: str, brand: str) -> str:
        """从产品名称中提取子分类"""
        name_lower = name.lower()
        brand_lower = brand.lower()

        # 简化的子分类规则（用于测试）
        subcategory_rules = {
            'chanel': {
                'mini flap': 'mini-flap',
                'classic flap': 'classic-flap',
                '2.55': '2-55',
                'boy': 'boy-bag',
                'backpack': 'backpack',
                'shopping bag': 'shopping-bag',
                'tote': 'tote',
                'pouch': 'pouch',
                'clutch': 'clutch',
                'mini': 'mini-bag',
                '11.12': 'classic-flap'
            },
            'louis vuitton': {
                'neverfull': 'neverfull',
                'speedy': 'speedy',
                'keepall': 'keepall',
                'carryall': 'carryall',
                'tote': 'tote',
                'backpack': 'backpack',
                'neverwoof': 'neverwoof'
            },
            'dior': {
                'lady dior': 'lady-dior',
                'saddle': 'saddle',
                'book tote': 'book-tote',
                'tote': 'tote'
            },
            'hermes': {
                'birkin': 'birkin',
                'kelly': 'kelly',
                'constance': 'constance'
            }
        }

        brand_rules = subcategory_rules.get(brand_lower, {})

        # 按优先级匹配
        for keyword, subcat in sorted(brand_rules.items(), key=lambda x: -len(x[0])):
            if keyword in name_lower:
                return subcat

        # 通用规则
        generic_rules = {
            'backpack': 'backpack',
            'crossbody': 'crossbody',
            'shoulder bag': 'shoulder-bag',
            'tote': 'tote',
            'clutch': 'clutch',
            'mini': 'mini-bag'
        }

        for keyword, subcat in generic_rules.items():
            if keyword in name_lower:
                return subcat

        return 'other'

    def infer_category(self, name: str, brand: str) -> str:
        """推断产品类别"""
        name_lower = name.lower()

        if any(word in name_lower for word in ['shoes', 'sneakers', 'boots']):
            return 'Shoes'
        elif any(word in name_lower for word in ['wallet', 'card holder']):
            return 'Accessories'
        elif any(word in name_lower for word in ['men', 'mens', 'man', 'briefcase']):
            return 'Men Bags'
        else:
            return 'Bags'

    def generate_id(self) -> str:
        """生成唯一ID"""
        return str(int(datetime.now().timestamp() * 1000))

    def generate_slug(self, name: str) -> str:
        """生成产品slug"""
        slug = name.lower()
        slug = slug.replace(' ', '-')
        slug = slug.replace('/', '-')
        slug = ''.join(c if c.isalnum() or c == '-' else '' for c in slug)
        return slug[:50]

    def scrape_sample_products(self, max_count=10) -> List[Dict[str, Any]]:
        """采集少量产品进行测试"""
        products = []

        try:
            print(f"[TEST] Accessing: {self.base_url}/shop")
            response = self.session.get(f"{self.base_url}/shop", timeout=30)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'lxml')

            # 查找产品元素
            product_elements = soup.select('.product, .product-item, .col-item')
            print(f"[TEST] Found {len(product_elements)} product elements")

            # 只处理前几个产品用于测试
            for element in product_elements[:max_count]:
                try:
                    # 解析产品名称
                    name_element = element.select_one('h3, .product-title, h2')
                    if not name_element:
                        continue

                    name = name_element.text.strip()
                    print(f"[TEST] Processing product: {name[:60]}...")

                    # 提取品牌
                    brand = self.extract_brand_from_name(name)

                    # 提取子分类 - 关键功能！
                    subcategory = self.extract_subcategory(name, brand)
                    print(f"[TEST] Extracted: Brand={brand}, Subcategory={subcategory}")

                    # 简化处理，使用默认价格
                    price = 299.99

                    # 提取图片
                    image_element = element.select_one('img')
                    image_url = image_element['src'] if image_element else ""

                    # 创建产品数据
                    product = {
                        'id': self.generate_id(),
                        'slug': self.generate_slug(name),
                        'name': name,
                        'brand': brand,
                        'category': self.infer_category(name, brand),
                        'subcategory': subcategory,  # 智能提取的子分类
                        'price': price * 0.5,
                        'originalPrice': price,
                        'thumb': image_url,
                        'imageCount': 5,
                        'createdAt': datetime.now().isoformat(),
                        'details': [],
                        'shipping': 'Free worldwide shipping, 7-15 days delivery.',
                        'images': [image_url]
                    }

                    products.append(product)

                except Exception as e:
                    print(f"[ERROR] Error parsing product element: {str(e)}")
                    continue

            print(f"[SUCCESS] Successfully scraped {len(products)} products")
            return products

        except Exception as e:
            print(f"[ERROR] Scraping failed: {str(e)}")
            return []

    def save_test_results(self, products: List[Dict[str, Any]]):
        """保存测试结果"""
        test_file = 'test_products.json'

        try:
            with open(test_file, 'w', encoding='utf-8') as f:
                json.dump(products, f, ensure_ascii=False, indent=2)

            print(f"[SAVE] Test results saved to {test_file}")

            # 显示统计信息
            print(f"\n[STATS] Scraped Products Summary:")
            print(f"Total products: {len(products)}")

            brand_count = {}
            subcategory_count = {}

            for product in products:
                brand = product['brand']
                subcategory = product['subcategory']

                brand_count[brand] = brand_count.get(brand, 0) + 1
                subcategory_count[subcategory] = subcategory_count.get(subcategory, 0) + 1

            print(f"\n[BRANDS] Distribution:")
            for brand, count in sorted(brand_count.items()):
                print(f"  {brand}: {count}")

            print(f"\n[SUBCATEGORIES] Distribution:")
            for subcat, count in sorted(subcategory_count.items()):
                print(f"  {subcat}: {count}")

        except Exception as e:
            print(f"[ERROR] Failed to save test results: {str(e)}")

def main():
    """主函数"""
    print("[START] Testing Yutulu.com scraper...")

    scraper = TestYutuluScraper()
    products = scraper.scrape_sample_products(max_count=10)  # 只采集10个产品测试

    if products:
        scraper.save_test_results(products)
        print("\n[COMPLETE] Test completed successfully!")
        print("[INFO] The scraper successfully extracts subcategory information from product names!")
    else:
        print("[FAIL] Test failed - no products scraped")

if __name__ == "__main__":
    main()