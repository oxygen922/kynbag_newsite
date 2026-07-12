import json
import os
import re
import time
from datetime import datetime
from typing import List, Dict, Any

class YutuluBrowserScraper:
    def __init__(self):
        self.base_url = 'https://yutulu.com'
        self.categories = {
            'chanel': 'https://yutulu.com/product-category/bags/chanel/',
            'louis-vuitton': 'https://yutulu.com/product-category/bags/louis-vuitton/',
            'gucci': 'https://yutulu.com/product-category/bags/gucci/',
            'dior': 'https://yutulu.com/product-category/bags/dior/',
            'celine': 'https://yutulu.com/product-category/bags/celine/',
            'hermes': 'https://yutulu.com/product-category/bags/hermes/',
            'ysl': 'https://yutulu.com/product-category/bags/ysl/',
            'prada': 'https://yutulu.com/product-category/bags/prada/',
            'loewe': 'https://yutulu.com/product-category/bags/loewe/',
            'goyard': 'https://yutulu.com/product-category/bags/goyard/',
            'fendi': 'https://yutulu.com/product-category/bags/fendi/',
            'balenciaga': 'https://yutulu.com/product-category/bags/balenciaga/',
            'bottega-veneta': 'https://yutulu.com/product-category/bags/bottega-veneta/',
            'miumiu': 'https://yutulu.com/product-category/bags/miumiu/',
            'loro-piana': 'https://yutulu.com/product-category/bags/loro-piana/',
            'givenchy': 'https://yutulu.com/product-category/bags/givenchy/',
            'burberry': 'https://yutulu.com/product-category/bags/burberry/'
        }
        self.brand_map = {
            'chanel': 'Chanel',
            'louis-vuitton': 'Louis Vuitton',
            'gucci': 'Gucci',
            'dior': 'Dior',
            'celine': 'Celine',
            'hermes': 'Hermes',
            'ysl': 'YSL',
            'prada': 'Prada',
            'loewe': 'Loewe',
            'goyard': 'Goyard',
            'fendi': 'Fendi',
            'balenciaga': 'Balenciaga',
            'bottega-veneta': 'Bottega Veneta',
            'miumiu': 'MiuMiu',
            'loro-piana': 'Loro Piana',
            'givenchy': 'Givenchy',
            'burberry': 'Burberry'
        }

    def generate_js_script(self, page_num: int = 1) -> str:
        return f'''
        let products = [];
        const items = document.querySelectorAll('li.product');
        items.forEach(el => {{
            const titleEl = el.querySelector('h2, h3');
            const title = titleEl ? titleEl.textContent.trim() : '';
            
            const priceEl = el.querySelector('.price');
            let price = 0, originalPrice = 0;
            if (priceEl) {{
                const prices = priceEl.textContent.match(/\\$([\\d,]+\\.?\\d*)/g);
                if (prices && prices.length >= 2) {{
                    originalPrice = parseFloat(prices[0].replace('$', '').replace(',', ''));
                    price = parseFloat(prices[1].replace('$', '').replace(',', ''));
                }} else if (prices && prices.length === 1) {{
                    price = parseFloat(prices[0].replace('$', '').replace(',', ''));
                    originalPrice = price * 2;
                }}
            }}
            
            const linkEl = el.querySelector('a');
            const link = linkEl ? linkEl.href : '';
            
            const imgEl = el.querySelector('img');
            const image = imgEl ? (imgEl.src || imgEl.dataset.src || '') : '';
            
            if (title && link) {{
                const slug = link.split('/').filter(s => s).pop().replace('.html', '');
                products.push({{
                    title,
                    price,
                    originalPrice,
                    link,
                    image,
                    slug
                }});
            }}
        }});
        
        const loadMore = document.querySelector('a.load-more, button.load-more, .load-more');
        const hasMore = loadMore && loadMore.textContent.includes('Load More');
        
        return {{
            products: products,
            hasMore: hasMore,
            page: {page_num},
            totalCount: document.querySelector('.woocommerce-result-count')?.textContent || ''
        }};
        '''

    def save_scraped_data(self, data: Dict[str, List[Dict]], output_dir: str = 'yutulu_scraper_data'):
        os.makedirs(output_dir, exist_ok=True)
        
        all_products = []
        for brand_slug, products in data.items():
            brand_name = self.brand_map.get(brand_slug, brand_slug.title())
            for p in products:
                p['brand'] = brand_name
            
            brand_file = os.path.join(output_dir, f'{brand_slug}.json')
            with open(brand_file, 'w', encoding='utf-8') as f:
                json.dump(products, f, ensure_ascii=False, indent=2)
            
            all_products.extend(products)
        
        all_file = os.path.join(output_dir, 'all_products.json')
        with open(all_file, 'w', encoding='utf-8') as f:
            json.dump(all_products, f, ensure_ascii=False, indent=2)
        
        print(f'Saved {len(all_products)} products across {len(data)} brands')

    def compare_with_current_project(self, scraped_data: Dict[str, List[Dict]]):
        project_dir = 'src/data'
        
        existing_slugs = set()
        for brand_slug in self.brand_map.keys():
            products_file = os.path.join(project_dir, f'products-{brand_slug}.json')
            if os.path.exists(products_file):
                with open(products_file, 'r', encoding='utf-8') as f:
                    try:
                        data = json.load(f)
                        for p in data:
                            if 'slug' in p:
                                existing_slugs.add(p['slug'])
                    except:
                        pass
        
        new_products = []
        for brand_slug, products in scraped_data.items():
            for p in products:
                if p['slug'] not in existing_slugs:
                    new_products.append(p)
        
        print(f'Existing products: {len(existing_slugs)}')
        print(f'New products found: {len(new_products)}')
        
        if new_products:
            print('\nNew products:')
            for p in new_products[:10]:
                print(f'  - {p["title"]}')
            if len(new_products) > 10:
                print(f'  ... and {len(new_products) - 10} more')
        
        return new_products

if __name__ == '__main__':
    scraper = YutuluBrowserScraper()
    print('Yutulu Browser Scraper initialized')
    print(f'Available categories: {list(scraper.categories.keys())}')
