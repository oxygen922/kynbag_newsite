#!/usr/bin/env python3
import json
import os
import sys
import time
from datetime import datetime, timezone
import subprocess

BASE_URL = "https://yutulu.com/wp-json/wp/v2"
PER_PAGE = 100
PROJECT_DATA_DIR = "src/data"
LAST_UPDATE_FILE = "scripts/.last_update.json"

BRAND_KEYWORDS = {
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

SUBCATEGORY_RULES = {
    'chanel': {
        'classic flap': 'classic-flap',
        'flap bag': 'classic-flap',
        'flapbag': 'classic-flap',
        '2.55': '2-55',
        'reissue': '2-55',
        'boy chanel': 'boy-bag',
        'boy bag': 'boy-bag',
        'boybag': 'boy-bag',
        'backpack': 'backpack',
        'wallet on chain': 'wallet-on-chain',
        'woc': 'wallet-on-chain',
        'tote': 'tote',
        'grand shopping': 'shopping-bag',
        'shopping bag': 'shopping-bag',
        'large shopping': 'shopping-bag',
        'vanity': 'other',
        'pouch': 'other',
        'clutch': 'other',
        'belt bag': 'belt-bag',
        'camera case': 'crossbody',
        'crossbody': 'crossbody',
        'shoulder bag': 'shoulder-bag',
        'mini flap': 'mini-bag',
        'classic mini': 'mini-bag',
        'mini bag': 'mini-bag',
        'small flap': 'mini-bag',
        'evening': 'evening-bag',
        'bag': 'other'
    },
    'louis-vuitton': {
        'neverfull': 'neverfull',
        'speedy': 'speedy',
        'keepall': 'keepall',
        'carryall': 'carryall',
        'onthego': 'onthego',
        'onthe go': 'onthego',
        'onthe-go': 'onthego',
        'petit malle': 'petite-malle',
        'petitmalle': 'petite-malle',
        'capucines': 'capucines',
        'lv capucines': 'capucines',
        'dauphine': 'dauphine',
        'coussin': 'coussin',
        'trunk': 'backpack',
        'soft trunk': 'backpack',
        'backpack': 'backpack',
        'tote': 'tote',
        'clutch': 'other',
        'pouch': 'other',
        'shoulder bag': 'other',
        'bucket': 'other',
        'neonoe': 'other',
        'nano': 'other',
        'mini': 'other',
        'wallet on chain': 'other',
        'woc': 'other',
        'bag': 'other'
    },
    'gucci': {
        'dionysus': 'dionysus',
        'jackie': 'jackie',
        'jackie 1961': 'jackie',
        'marmont': 'marmont',
        'gg marmont': 'gg-marmont',
        'ggmarmont': 'gg-marmont',
        'bamboo': 'bamboo',
        'horsebit': 'horsebit',
        'diana': 'diana',
        'tote': 'tote',
        'soho': 'other',
        'soho disco': 'other',
        'ophidia': 'other',
        'shoulder bag': 'shoulder-bag',
        'chain bag': 'other',
        'clutch': 'other',
        'wallet on chain': 'other',
        'woc': 'other',
        'mini': 'other',
        'bucket': 'other',
        'crossbody': 'crossbody',
        'belt bag': 'other',
        'pouch': 'other',
        'bag': 'other'
    },
    'dior': {
        'lady dior': 'lady-dior',
        'ladydior': 'lady-dior',
        'saddle': 'saddle',
        'saddle bag': 'saddle',
        'dior saddle': 'saddle',
        'book tote': 'book-tote',
        'miss dior': 'miss-dior',
        'dioriviera': 'dioriviera',
        'caro': 'caro',
        'bobby': 'bobby',
        'my dior': 'caro',
        'mydior': 'caro',
        'tender dior': 'bobby',
        'tote': 'tote',
        '30 montaigne': 'other',
        'montaigne': 'other',
        'shoulder bag': 'other',
        'crossbody': 'crossbody',
        'clutch': 'other',
        'pouch': 'other',
        'wallet on chain': 'other',
        'woc': 'other',
        'backpack': 'backpack',
        'bag': 'other'
    },
    'celine': {
        'triomphe': 'triomphe',
        'ava': 'ava',
        'luggage': 'luggage',
        'box': 'box',
        'classic': 'triomphe',
        'classic box': 'box',
        'tote': 'tote',
        'shoulder bag': 'shoulder-bag',
        'crossbody': 'crossbody',
        'clutch': 'other',
        'pouch': 'other',
        'bag': 'other'
    },
    'hermes': {
        'birkin': 'birkin',
        'kelly': 'kelly',
        'constance': 'constance',
        'constance slim': 'constance',
        'lindy': 'lindy',
        'bolide': 'bolide',
        'picotin': 'picotin',
        'picotin lock': 'picotin',
        'garden party': 'garden-party',
        'gardenparty': 'garden-party',
        'tote': 'garden-party',
        'evelyne': 'other',
        'bag': 'other'
    },
    'ysl': {
        'loulou': 'loulou',
        'lou lou': 'loulou',
        'niki': 'niki',
        'kate': 'kate',
        'puffer': 'puffer',
        'manhattan': 'manhattan',
        'vanity': 'vanity',
        'le 5 a 7': 'le-5-a-7',
        'le-5-a-7': 'le-5-a-7',
        'wallet on chain': 'wallet-on-chain',
        'woc': 'wallet-on-chain',
        'tote': 'tote',
        'sunset': 'other',
        'college': 'other',
        'monogram': 'other',
        'cassandre': 'other',
        'shoulder bag': 'other',
        'crossbody': 'crossbody',
        'clutch': 'other',
        'pouch': 'other',
        'bag': 'other'
    },
    'prada': {
        're-edition': 're-edition',
        'reedition': 're-edition',
        'saffiano': 'saffiano',
        'galleria': 'saffiano',
        'prada galleria': 'saffiano',
        'cleo': 'cleo',
        'nylon': 'nylon',
        'symbol': 'symbol',
        'tote': 'tote',
        'shoulder bag': 'saffiano',
        'mini': 'nylon',
        'crossbody': 'crossbody',
        'clutch': 'other',
        'pouch': 'other',
        'bag': 'other'
    },
    'loewe': {
        'puzzle': 'puzzle',
        'hammock': 'hammock',
        'gate': 'gate',
        'balloon': 'balloon',
        'puzzle fold': 'puzzle-fold',
        'tote': 'tote',
        'shoulder bag': 'shoulder-bag',
        'crossbody': 'crossbody',
        'cushion': 'other',
        'bag': 'other'
    },
    'goyard': {
        'saint louis': 'saint-louis',
        'st louis': 'saint-louis',
        'saintlouis': 'saint-louis',
        'anjou': 'anjou',
        'croissy': 'croissy',
        'belvedere': 'belvedere',
        'tote': 'tote',
        'clutch': 'clutch',
        'artois': 'other',
        'voltaire': 'other',
        'bag': 'other'
    },
    'fendi': {
        'baguette': 'baguette',
        'peekaboo': 'peekaboo',
        'first': 'first',
        'tote': 'tote',
        'sunshine': 'other',
        'by the way': 'other',
        'bytheway': 'other',
        'shoulder bag': 'other',
        'mini': 'other',
        'crossbody': 'crossbody',
        'bag': 'other'
    },
    'balenciaga': {
        'city': 'city',
        'classic': 'city',
        'classic city': 'city',
        'hourglass': 'hourglass',
        'neo classic': 'city',
        'neoclassic': 'city',
        'tote': 'tote',
        'bazar': 'other',
        'duffle': 'other',
        'shoulder bag': 'other',
        'hobo': 'other',
        'crossbody': 'crossbody',
        'bag': 'other'
    },
    'bottega-veneta': {
        'jodie': 'jodie',
        'mini jodie': 'jodie',
        'andiamo': 'andiamo',
        'cassette': 'cassette',
        'tote': 'tote',
        'shoulder bag': 'shoulder-bag',
        'crossbody': 'crossbody',
        'arco': 'other',
        'kalimero': 'other',
        'minidomingo': 'other',
        'bag': 'other'
    },
    'miumiu': {
        'wander': 'wander',
        'arcadie': 'arcadie',
        'tote': 'tote',
        'shoulder bag': 'other',
        'crossbody': 'crossbody',
        'matelasse': 'other',
        'muse': 'other',
        'bag': 'other'
    },
    'loro-piana': {
        'extra pocket': 'extra-pocket',
        'sesia': 'sesia',
        'tote': 'tote',
        'bag': 'other'
    },
    'givenchy': {
        'antigona': 'antigona',
        'nightingale': 'nightingale',
        'tote': 'other',
        'shoulder bag': 'other',
        'bag': 'other'
    },
    'burberry': {
        'kensington': 'kensington',
        'check': 'check',
        'tote': 'tote',
        'shoulder bag': 'other',
        'crossbody': 'crossbody',
        'lola': 'other',
        'bag': 'other'
    }
}

def fetch_json(url):
    import platform
    if platform.system() == 'Windows':
        curl_path = r"D:\01 软件\Git\mingw64\bin\curl.exe"
    else:
        curl_path = 'curl'
    try:
        result = subprocess.run(
            [curl_path, url, '-H', 'User-Agent: Mozilla/5.0', '-H', 'Accept: application/json', '--connect-timeout', '10'],
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode != 0:
            raise Exception(f"Curl error: {result.stderr}")
        if not result.stdout.strip():
            raise Exception("Empty response")
        return json.loads(result.stdout)
    except subprocess.TimeoutExpired:
        raise Exception("Request timeout")
    except json.JSONDecodeError as e:
        raise Exception(f"JSON decode error: {e}")
    except Exception as e:
        raise Exception(f"Fetch error: {e}")

def get_last_update():
    if os.path.exists(LAST_UPDATE_FILE):
        with open(LAST_UPDATE_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('last_update', '2026-01-01T00:00:00')
    return '2026-01-01T00:00:00'

def save_last_update():
    now = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S')
    with open(LAST_UPDATE_FILE, 'w', encoding='utf-8') as f:
        json.dump({'last_update': now}, f, indent=2)
    return now

def fetch_new_products(since_date):
    print(f"[1/4] 获取 {since_date} 之后的新增产品...")
    new_products = []
    page = 1
    has_more = True

    while has_more:
        url = f"{BASE_URL}/product?per_page={PER_PAGE}&page={page}&orderby=date&order=desc"
        try:
            products = fetch_json(url)
        except Exception as e:
            print(f"  第 {page} 页获取失败: {e}")
            break

        if not isinstance(products, list) or len(products) == 0:
            has_more = False
            break

        for product in products:
            if product['date'] < since_date:
                has_more = False
                break
            new_products.append(product)

        print(f"\r  已检查 {(page - 1) * PER_PAGE + len(products)} 个产品, 新增 {len(new_products)} 个", end='')

        if not has_more or len(products) < PER_PAGE:
            break
        page += 1
        time.sleep(0.3)

    print(f"\n  共 {len(new_products)} 个新增产品")
    return new_products

def fetch_product_images(product_id):
    try:
        media = fetch_json(f"{BASE_URL}/media?parent={product_id}&per_page=100")
        if not isinstance(media, list):
            return []
        return [m['source_url'] for m in media]
    except:
        return []

def detect_brand(product_name):
    name_lower = product_name.lower()
    for brand, keywords in BRAND_KEYWORDS.items():
        if any(kw in name_lower for kw in keywords):
            return brand
    return 'other'

def get_subcategory(product_name, brand):
    name_lower = product_name.lower()
    rules = SUBCATEGORY_RULES.get(brand, {})
    
    for pattern, subcat in rules.items():
        if pattern in name_lower:
            return subcat
    
    return 'other'

def sync_new_products(new_products):
    print("\n[2/4] 同步新增产品到项目数据...")
    
    added_count = 0
    for product in new_products:
        brand = detect_brand(product['title']['rendered'])
        if brand == 'other':
            print(f"  ? 未识别品牌: {product['title']['rendered']}")
            continue

        project_file = os.path.join(PROJECT_DATA_DIR, f'products-{brand}.json')
        if not os.path.exists(project_file):
            continue

        with open(project_file, 'r', encoding='utf-8') as f:
            project_products = json.load(f)

        project_slugs = set(p['slug'] for p in project_products)
        if product['slug'] in project_slugs:
            continue

        images = fetch_product_images(product['id'])

        new_product = {
            'id': product['id'],
            'slug': product['slug'],
            'name': product['title']['rendered'],
            'description': '',
            'price': 0,
            'originalPrice': 0,
            'brand': brand,
            'images': images,
            'categories': [],
            'subcategory': get_subcategory(product['title']['rendered'], brand),
            'colors': [],
            'rating': 0,
            'reviewCount': 0,
            'isNew': True,
            'isFeatured': False,
            'tags': []
        }

        project_products.append(new_product)

        with open(project_file, 'w', encoding='utf-8') as f:
            json.dump(project_products, f, ensure_ascii=False, indent=2)

        added_count += 1
        print(f"  + {product['title']['rendered']} -> {brand}")

    print(f"\n  成功添加 {added_count} 个新产品")
    return added_count

def update_index_files():
    print("\n[3/4] 更新索引文件...")
    
    brands = [b for b in BRAND_KEYWORDS if b != 'other']
    
    for brand in brands:
        product_file = os.path.join(PROJECT_DATA_DIR, f'products-{brand}.json')
        index_file = os.path.join(PROJECT_DATA_DIR, f'index-{brand}.json')
        
        if not os.path.exists(product_file):
            continue

        with open(product_file, 'r', encoding='utf-8') as f:
            products = json.load(f)

        index_data = []
        for p in products:
            index_item = {
                'id': p['id'],
                'slug': p['slug'],
                'name': p['name'],
                'price': p['price'],
                'brand': p['brand'],
                'image': p['images'][0] if p['images'] else '',
                'subcategory': p.get('subcategory', '')
            }
            index_data.append(index_item)

        with open(index_file, 'w', encoding='utf-8') as f:
            json.dump(index_data, f, ensure_ascii=False, indent=2)

        print(f"  更新 index-{brand}.json ({len(index_data)} 个)")

def update_search_index():
    print("\n[4/4] 更新搜索索引...")
    
    all_products = []
    brands = [b for b in BRAND_KEYWORDS if b != 'other']
    
    for brand in brands:
        product_file = os.path.join(PROJECT_DATA_DIR, f'products-{brand}.json')
        if not os.path.exists(product_file):
            continue
        with open(product_file, 'r', encoding='utf-8') as f:
            products = json.load(f)
            all_products.extend(products)

    search_index = []
    for p in all_products:
        search_index.append({
            'id': p['id'],
            'slug': p['slug'],
            'name': p['name'],
            'brand': p['brand'],
            'subcategory': p.get('subcategory', '')
        })

    search_file = os.path.join(PROJECT_DATA_DIR, 'search-index.json')
    with open(search_file, 'w', encoding='utf-8') as f:
        json.dump(search_index, f, ensure_ascii=False, indent=2)

    print(f"  更新 search-index.json ({len(search_index)} 个)")

def main():
    print("=== Yutulu 增量更新脚本 ===")
    
    since_date = get_last_update()
    print(f"\n上次更新时间: {since_date}")
    
    new_products = fetch_new_products(since_date)
    
    if not new_products:
        print("\n没有新增产品，更新结束")
        return
    
    added_count = sync_new_products(new_products)
    
    if added_count > 0:
        update_index_files()
        update_search_index()
    
    save_last_update()
    
    print(f"\n=== 更新完成 ===")
    print(f"新增产品: {added_count}")
    print(f"下次更新将从当前时间开始")

if __name__ == '__main__':
    main()
