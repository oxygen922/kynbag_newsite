#!/usr/bin/env python3
import json
import os
import sys

def main():
    new_data_dir = 'yutulu_new_data'
    project_data_dir = 'src/data'
    
    print('=== 同步新增产品到项目数据 ===\n')
    
    new_products = []
    for file in ['all_products.json', 'chanel.json', 'dior.json', 'prada.json']:
        file_path = os.path.join(new_data_dir, file)
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list):
                    new_products.extend(data)
    
    print(f'新增产品数: {len(new_products)}')
    
    brand_map = {
        'chanel': 'chanel',
        'louis-vuitton': 'louis-vuitton',
        'gucci': 'gucci',
        'dior': 'dior',
        'celine': 'celine',
        'hermes': 'hermes',
        'ysl': 'ysl',
        'prada': 'prada',
        'loewe': 'loewe',
        'goyard': 'goyard',
        'fendi': 'fendi',
        'balenciaga': 'balenciaga',
        'bottega-veneta': 'bottega-veneta',
        'miumiu': 'miumiu',
        'loro-piana': 'loro-piana',
        'givenchy': 'givenchy',
        'burberry': 'burberry'
    }
    
    added_count = 0
    for brand_slug in brand_map.values():
        project_file = os.path.join(project_data_dir, f'products-{brand_slug}.json')
        if not os.path.exists(project_file):
            continue
        
        with open(project_file, 'r', encoding='utf-8') as f:
            project_products = json.load(f)
        
        project_slugs = set(p['slug'] for p in project_products)
        
        for np in new_products:
            if np['slug'] in project_slugs:
                continue
            
            np_lower = np['name'].lower()
            brand_keywords = {
                'chanel': ['chanel'],
                'louis-vuitton': ['louis vuitton', 'lv'],
                'gucci': ['gucci'],
                'dior': ['dior'],
                'celine': ['celine'],
                'hermes': ['hermes'],
                'ysl': ['ysl', 'saint laurent', 'yves saint'],
                'prada': ['prada'],
                'loewe': ['loewe'],
                'goyard': ['goyard'],
                'fendi': ['fendi'],
                'balenciaga': ['balenciaga'],
                'bottega-veneta': ['bottega veneta'],
                'miumiu': ['miumiu'],
                'loro-piana': ['loro piana'],
                'givenchy': ['givenchy'],
                'burberry': ['burberry']
            }
            
            if any(kw in np_lower for kw in brand_keywords[brand_slug]):
                new_product = {
                    'id': np['id'],
                    'slug': np['slug'],
                    'name': np['name'],
                    'description': np.get('description', ''),
                    'price': 0,
                    'originalPrice': 0,
                    'brand': brand_slug,
                    'images': [img['r2Url'] for img in np.get('images', []) if img.get('r2Url')],
                    'categories': np.get('categories', []),
                    'subcategory': '',
                    'colors': [],
                    'rating': 0,
                    'reviewCount': 0,
                    'isNew': True,
                    'isFeatured': False,
                    'tags': []
                }
                
                project_products.append(new_product)
                project_slugs.add(np['slug'])
                added_count += 1
                print(f'  + {np["name"]}')
        
        with open(project_file, 'w', encoding='utf-8') as f:
            json.dump(project_products, f, ensure_ascii=False, indent=2)
    
    print(f'\n成功添加 {added_count} 个新产品')
    
    print('\n项目数据已更新')

if __name__ == '__main__':
    main()
