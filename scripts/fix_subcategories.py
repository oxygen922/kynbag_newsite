#!/usr/bin/env python3
"""
老王的数据修复脚本 - 为现有产品添加subcategory字段
"""

import json
import re
import os
from pathlib import Path
from typing import Dict, Any

class SubcategoryFixer:
    """老王的子分类修复器"""

    def __init__(self, data_dir='src/data'):
        self.data_dir = Path(data_dir)
        self.processed_count = 0
        self.error_count = 0

    def extract_subcategory(self, name: str, brand: str) -> str:
        """从产品名称中提取子分类"""
        name_lower = name.lower()
        brand_lower = brand.lower()

        # 品牌特定的子分类匹配规则
        subcategory_rules = {
            'chanel': {
                'mini flap': 'mini-flap',
                'classic flap': 'classic-flap',
                'flapbag': 'classic-flap',
                'flap bag': 'classic-flap',
                '2.55': '2-55',
                '25 small': '2-55',
                '25 mini': '2-55',
                'boy': 'boy-bag',
                'backpack': 'backpack',
                'wallet on chain': 'wallet-on-chain',
                'shopping bag': 'shopping-bag',
                'tote': 'tote',
                'small tote': 'tote',
                'shoulder bag': 'shoulder-bag',
                'crossbody': 'crossbody',
                'pouch': 'pouch',
                'zipped pouch': 'pouch',
                'clutch': 'clutch',
                'mini': 'mini-bag',
                'belt bag': 'belt-bag',
                'evening': 'evening-bag',
                '11.12': 'classic-flap',
                'coco': 'classic-flap',
                'camera case': 'crossbody',
                'vanity': 'vanity',
                'vanity with chain': 'vanity'
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
                'bumbag': 'belt-bag',
                'fanny pack': 'belt-bag',
                'slingbag': 'crossbody',
                'messenger': 'crossbody',
                'christopher': 'backpack',
                'steamer': 'crossbody',
                'all in': 'carryall',
                'baggy': 'tote',
                'passport cover': 'wallet-on-chain',
                'card holder': 'wallet-on-chain',
                'magnetic card holder': 'wallet-on-chain',
                'recto verso': 'wallet-on-chain'
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
            },
            'balenciaga': {
                'city': 'city',
                'hourglass': 'hourglass',
                'bazar': 'bazar',
                'duffle': 'duffle',
                'tote': 'tote',
                'crossbody': 'crossbody'
            },
            'miumiu': {
                'wander': 'wander',
                'arcadie': 'arcadie',
                'muse': 'muse',
                'tote': 'tote',
                'crossbody': 'crossbody'
            },
            'fendi': {
                'baguette': 'baguette',
                'peekaboo': 'peekaboo',
                'first': 'first',
                'tote': 'tote',
                'crossbody': 'crossbody'
            },
            'burberry': {
                'kensington': 'kensington',
                'check': 'check',
                'tote': 'tote',
                'crossbody': 'crossbody'
            },
            'loro piana': {
                'extra pocket': 'extra-pocket',
                'sesia': 'sesia',
                'tote': 'tote'
            },
            'givenchy': {
                'antigona': 'antigona',
                'nightingale': 'nightingale'
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
        return 'other'

    def fix_product_file(self, file_path: Path) -> bool:
        """修复单个产品文件"""
        try:
            # 读取产品数据
            with open(file_path, 'r', encoding='utf-8') as f:
                products = json.load(f)

            # 为每个产品添加subcategory字段
            updated_products = []
            for product in products:
                # 提取子分类
                subcategory = self.extract_subcategory(
                    product.get('name', ''),
                    product.get('brand', '')
                )

                # 添加subcategory字段
                product['subcategory'] = subcategory
                updated_products.append(product)

                self.processed_count += 1
                print(f"[OK] Processed: {product['brand']} - {product['name']} -> {subcategory}")

            # 保存更新后的数据
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(updated_products, f, ensure_ascii=False, indent=2)

            return True

        except Exception as e:
            print(f"[ERROR] Error processing file {file_path}: {str(e)}")
            self.error_count += 1
            return False

    def fix_index_file(self, file_path: Path) -> bool:
        """修复索引文件"""
        try:
            # 读取索引数据
            with open(file_path, 'r', encoding='utf-8') as f:
                products = json.load(f)

            # 为每个产品添加subcategory字段
            updated_products = []
            for product in products:
                # 提取子分类
                subcategory = self.extract_subcategory(
                    product.get('name', ''),
                    product.get('brand', '')
                )

                # 添加subcategory字段
                product['subcategory'] = subcategory
                updated_products.append(product)

            # 保存更新后的数据
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(updated_products, f, ensure_ascii=False, indent=2)

            return True

        except Exception as e:
            print(f"[ERROR] Error processing index file {file_path}: {str(e)}")
            self.error_count += 1
            return False

    def run(self):
        """运行修复流程"""
        print("Starting to fix existing product data, adding subcategory field...")

        # 处理产品文件
        product_files = list(self.data_dir.glob('products-*.json'))
        print(f"\n[FILES] Found {len(product_files)} product files")

        for product_file in product_files:
            print(f"\n[PROCESS] Processing file: {product_file.name}")
            if self.fix_product_file(product_file):
                print(f"[OK] Successfully updated {product_file.name}")

        # 处理索引文件
        index_files = list(self.data_dir.glob('index-*.json'))
        print(f"\n[INDEX] Found {len(index_files)} index files")

        for index_file in index_files:
            print(f"\n[PROCESS] Processing index file: {index_file.name}")
            if self.fix_index_file(index_file):
                print(f"[OK] Successfully updated {index_file.name}")

        # 处理全局搜索索引
        search_index = self.data_dir / 'search-index.json'
        if search_index.exists():
            print(f"\n[SEARCH] Processing global search index: {search_index.name}")
            if self.fix_index_file(search_index):
                print(f"[OK] Successfully updated {search_index.name}")

        print(f"\n[COMPLETE] Fix completed!")
        print(f"[STATS] Processed {self.processed_count} products")
        print(f"[ERRORS] {self.error_count} errors")

if __name__ == "__main__":
    fixer = SubcategoryFixer()
    fixer.run()