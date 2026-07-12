import json
import os
import subprocess
import time

BRAND_URLS = {
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

def save_scraped_data(data, output_dir='yutulu_scraper_data_new'):
    os.makedirs(output_dir, exist_ok=True)
    
    all_products = []
    for brand_slug, products in data.items():
        brand_file = os.path.join(output_dir, f'{brand_slug}.json')
        with open(brand_file, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        all_products.extend(products)
    
    all_file = os.path.join(output_dir, 'all_products.json')
    with open(all_file, 'w', encoding='utf-8') as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)
    
    print(f'\nSaved {len(all_products)} products to {output_dir}')

if __name__ == '__main__':
    print('=== Browser Scraper ===')
    print('This script generates JS code to scrape yutulu.com')
    print('Open yutulu.com shop page in browser and run the generated JS in console\n')
    
    js_code = '''
    let allProducts = [];
    let page = 1;
    
    function extractProducts() {
        const items = document.querySelectorAll('li.product');
        let found = 0;
        items.forEach(el => {
            const titleEl = el.querySelector('h2, h3');
            const title = titleEl ? titleEl.textContent.trim() : '';
            const linkEl = el.querySelector('a');
            const link = linkEl ? linkEl.href : '';
            const priceEl = el.querySelector('.price');
            let price = 0, originalPrice = 0;
            if (priceEl) {
                const prices = priceEl.textContent.match(/\\$([\\d,]+\\.?\\d*)/g);
                if (prices && prices.length >= 2) {
                    originalPrice = parseFloat(prices[0].replace('$', '').replace(',', ''));
                    price = parseFloat(prices[1].replace('$', '').replace(',', ''));
                } else if (prices && prices.length === 1) {
                    price = parseFloat(prices[0].replace('$', '').replace(',', ''));
                    originalPrice = price * 2;
                }
            }
            const imgEl = el.querySelector('img');
            const image = imgEl ? (imgEl.src || imgEl.dataset.src || '') : '';
            if (title && link) {
                const slug = link.split('/').filter(s => s).pop().replace('.html', '');
                if (!allProducts.find(p => p.slug === slug)) {
                    allProducts.push({ title, price, originalPrice, link, image, slug });
                    found++;
                }
            }
        });
        return found;
    }
    
    async function loadMore() {
        const loadMoreBtn = document.querySelector('a.load-more');
        if (loadMoreBtn && loadMoreBtn.textContent.includes('Load More')) {
            loadMoreBtn.click();
            await new Promise(r => setTimeout(r, 3000));
            return true;
        }
        return false;
    }
    
    async function scrape() {
        console.log('Starting scrape...');
        let totalFound = 0;
        while (true) {
            const found = extractProducts();
            totalFound += found;
            console.log(`Page ${page}: Found ${found} products, Total: ${totalFound}`);
            page++;
            const hasMore = await loadMore();
            if (!hasMore) break;
        }
        console.log('Scrape complete!');
        console.log('Total products:', allProducts.length);
        
        const blob = new Blob([JSON.stringify(allProducts, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'yutulu_products.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return allProducts;
    }
    
    scrape();
    '''
    
    print('=== Copy this JS code and paste in browser console ===')
    print('=' * 60)
    print(js_code)
    print('=' * 60)
    print('\nSteps:')
    print('1. Open https://yutulu.com/shop in browser')
    print('2. Open browser developer tools (F12)')
    print('3. Go to Console tab')
    print('4. Paste and run the above JS code')
    print('5. Wait for it to finish - it will automatically download yutulu_products.json')
    print('6. Copy the downloaded file to: D:\\FP site\\仿牌网站\\yutulu_scraper_data_new\\all_products.json')
