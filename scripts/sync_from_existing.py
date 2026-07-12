#!/usr/bin/env python3
import json
import os
import sys

def main():
    yutulu_dir = 'D:/FP site/yutulu_scraper_data'
    project_dir = 'src/data'
    
    print('=== 从现有采集数据同步 ===\n')
    
    yutulu_slugs = set()
    yutulu_products = []
    
    for brand_slug in ['chanel', 'louis-vuitton', 'gucci', 'dior', 'celine', 'hermes', 'ysl', 'prada', 'loewe', 'goyard', 'fendi', 'balenciaga', 'bottega-veneta', 'miumiu', 'loro-piana', 'givenchy', 'burberry']:
        file_path = os.path.join(yutulu_dir, f'{brand_slug}.json')
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for p in data:
                    yutulu_slugs.add(p['slug'])
                    yutulu_products.append(p)
    
    print(f'Yutulu 采集数据产品数: {len(yutulu_slugs)}')
    
    project_slugs = set()
    for brand_slug in ['chanel', 'louis-vuitton', 'gucci', 'dior', 'celine', 'hermes', 'ysl', 'prada', 'loewe', 'goyard', 'fendi', 'balenciaga', 'bottega-veneta', 'miumiu', 'loro-piana', 'givenchy', 'burberry']:
        file_path = os.path.join(project_dir, f'products-{brand_slug}.json')
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for p in data:
                    if 'slug' in p:
                        project_slugs.add(p['slug'])
    
    print(f'本项目产品数: {len(project_slugs)}')
    
    new_slugs = yutulu_slugs - project_slugs
    print(f'新增产品数: {len(new_slugs)}')
    
    if new_slugs:
        print(f'\n新增产品:')
        for p in yutulu_products:
            if p['slug'] in new_slugs:
                print(f'  - {p["name"]}')
                new_slugs.remove(p['slug'])
                if not new_slugs:
                    break
    else:
        print('没有新增产品')

if __name__ == '__main__':
    main()
