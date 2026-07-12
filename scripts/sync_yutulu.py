#!/usr/bin/env python3
import json
import os
import re
import time
from typing import List, Dict, Any
import requests

class YutuluSync:
    def __init__(self):
        self.base_url = 'https://yutulu.com/wp-json/wp/v2'
        self.data_dir = 'src/data'
        self.yutulu_data_dir = 'yutulu_scraper_data'
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
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

        self.cat_name_map = {
            'chanel': ['chanel', 'CHANEL'],
            'louis-vuitton': ['louis vuitton', 'LOUIS VUITTON', 'lv', 'LV'],
            'gucci': ['gucci', 'GUCCI'],
            'dior': ['dior', 'DIOR'],
            'celine': ['celine', 'CELINE'],
            'hermes': ['hermes', 'HERMES'],
            'ysl': ['ysl', 'YSL', 'saint laurent'],
            'prada': ['prada', 'PRADA'],
            'loewe': ['loewe', 'LOEWE'],
            'goyard': ['goyard', 'GOYARD'],
            'fendi': ['fendi', 'FENDI'],
            'balenciaga': ['balenciaga', 'BALENCIAGA'],
            'bottega-veneta': ['bottega veneta', 'BOTTEGA VENETA'],
            'miumiu': ['miumiu', 'MIUMIU', 'miu miu'],
            'loro-piana': ['loro piana', 'LORO PIANA'],
            'givenchy': ['givenchy', 'GIVENCHY'],
            'burberry': ['burberry', 'BURBERRY']
        }

    def fetch_all_categories(self) -> Dict[int, str]:
        print('[1/4] 获取分类列表...')
        categories = {}
        page = 1
        while True:
            url = f'{self.base_url}/product_cat?per_page=100&page={page}'
            try:
                response = self.session.get(url, timeout=15)
                if response.status_code != 200:
                    break
                data = response.json()
                if not data:
                    break
                for cat in data:
                    categories[cat['id']] = cat['name']
                if len(data) < 100:
                    break
                page += 1
                time.sleep(0.3)
            except Exception as e:
                print(f'  获取分类失败: {e}')
                break
        print(f'  共获取 {len(categories)} 个分类')
        return categories

    def fetch_all_products(self, categories: Dict[int, str]) -> List[Dict[str, Any]]:
        print('[2/4] 获取产品列表...')
        products = []
        page = 1
        while True:
            url = f'{self.base_url}/product?per_page=100&page={page}&orderby=date&order=desc'
            try:
                response = self.session.get(url, timeout=15)
                if response.status_code != 200:
                    break
                data = response.json()
                if not data:
                    break
                for p in data:
                    cat_ids = p.get('product_cat', [])
                    cat_names = [categories.get(cid, '') for cid in cat_ids]
                    brand_slug = self._get_brand_slug(cat_names)
                    
                    products.append({
                        'id': p['id'],
                        'slug': p['slug'],
                        'name': p['title']['rendered'],
                        'link': p['link'],
                        'date': p['date'],
                        'categories': cat_names,
                        'brand_slug': brand_slug,
                        'brand': self.brand_map.get(brand_slug, '')
                    })
                
                print(f'\r  已获取 {len(products)} 个产品', end='')
                if len(data) < 100:
                    break
                page += 1
                time.sleep(0.3)
            except Exception as e:
                print(f'\n  获取产品失败: {e}')
                break
        
        print(f'\n  共获取 {len(products)} 个产品')
        return products

    def _get_brand_slug(self, cat_names: List[str]) -> str:
        cat_names_lower = [c.lower() for c in cat_names]
        for brand_slug, keywords in self.cat_name_map.items():
            for kw in keywords:
                if kw.lower() in cat_names_lower:
                    return brand_slug
        return 'uncategorized'

    def get_existing_slugs(self) -> set:
        print('[3/4] 读取现有产品数据...')
        slugs = set()
        for brand_slug in self.brand_map.keys():
            file_path = os.path.join(self.data_dir, f'products-{brand_slug}.json')
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    try:
                        data = json.load(f)
                        for p in data:
                            if 'slug' in p:
                                slugs.add(p['slug'])
                    except:
                        pass
        print(f'  现有产品数: {len(slugs)}')
        return slugs

    def extract_subcategory(self, name: str, brand: str) -> str:
        name_lower = name.lower()
        brand_lower = brand.lower()

        name_lower = name_lower.replace('é', 'e').replace('É', 'E').replace('ô', 'o').replace('û', 'u').replace('à', 'a').replace('ç', 'c').replace('è', 'e').replace('ê', 'e').replace('î', 'i').replace('ï', 'i').replace('ù', 'u').replace('ü', 'u').replace('ö', 'o').replace('ä', 'a').replace('ñ', 'n')

        if 'chanel' in name_lower:
            brand_lower = 'chanel'
        elif 'dior' in name_lower:
            brand_lower = 'dior'
        elif 'gucci' in name_lower:
            brand_lower = 'gucci'
        elif 'ysl' in name_lower or 'yves saint laurent' in name_lower:
            brand_lower = 'ysl'
        elif 'hermes' in name_lower:
            brand_lower = 'hermes'
        elif 'prada' in name_lower:
            brand_lower = 'prada'
        elif 'bottega' in name_lower or 'bv' in name_lower:
            brand_lower = 'bottega veneta'
        elif 'celine' in name_lower:
            brand_lower = 'celine'
        elif 'goyard' in name_lower:
            brand_lower = 'goyard'
        elif 'loewe' in name_lower:
            brand_lower = 'loewe'
        elif 'balenciaga' in name_lower:
            brand_lower = 'balenciaga'
        elif 'miumiu' in name_lower:
            brand_lower = 'miumiu'
        elif 'fendi' in name_lower:
            brand_lower = 'fendi'
        elif 'burberry' in name_lower:
            brand_lower = 'burberry'
        elif 'loro piana' in name_lower:
            brand_lower = 'loro piana'
        elif 'givenchy' in name_lower:
            brand_lower = 'givenchy'

        subcategory_rules = {
            'chanel': {
                'mini flap': 'mini-flap', 'classic flap': 'classic-flap',
                'flapbag': 'classic-flap', 'flap bag': 'classic-flap',
                'flap': 'classic-flap', '2.55': '2-55', '25 small': '2-55',
                '25 mini': '2-55', '25 medium': 'classic-flap',
                '25 large': 'classic-flap', '25 handbag': 'classic-flap',
                '19': 'classic-flap', '19 handbag': 'classic-flap',
                'boy': 'boy-bag', 'backpack': 'backpack',
                'wallet on chain': 'wallet-on-chain', 'shopping bag': 'shopping-bag',
                'tote': 'tote', 'small tote': 'tote',
                'shoulder bag': 'shoulder-bag', 'crossbody': 'crossbody',
                'pouch': 'pouch', 'zipped pouch': 'pouch',
                'clutch': 'clutch', 'mini': 'mini-bag',
                'belt bag': 'belt-bag', 'evening': 'evening-bag',
                '11.12': 'classic-flap', 'coco': 'classic-flap',
                'camera case': 'crossbody', 'vanity': 'vanity',
                'vanity with chain': 'vanity', 'large vanity': 'vanity',
                'small wallet': 'wallet-on-chain', 'large zipped': 'pouch',
                'small shopping': 'shopping-bag', 'card holder': 'wallet-on-chain',
                'long wallet': 'wallet-on-chain', 'small flap': 'mini-flap',
                'medium flap': 'classic-flap', 'large flap': 'classic-flap',
                'new classic': 'classic-flap', 'canvas tote': 'tote',
                'deauville': 'tote', 'grand shopping': 'tote',
                'beach tote': 'tote', 'cabriolet': 'shoulder-bag',
                'graceful': 'shoulder-bag', 'urban': 'shoulder-bag',
                'casual': 'shoulder-bag', 'sporty': 'shoulder-bag',
                'duma': 'backpack', 'cruise': 'tote',
                'seasonal': 'shoulder-bag', 'resort': 'tote',
                'spring': 'shoulder-bag', 'summer': 'tote',
                'fall': 'shoulder-bag', 'winter': 'shoulder-bag',
                'holiday': 'evening-bag', 'limited': 'shoulder-bag',
                'edition': 'shoulder-bag', 'exclusive': 'shoulder-bag',
                'special': 'shoulder-bag', 'unique': 'shoulder-bag',
                'rare': 'shoulder-bag', 'vintage': 'classic-flap',
                'pre-owned': 'classic-flap', 'authentic': 'classic-flap',
                'certified': 'classic-flap', 'genuine': 'classic-flap',
                'real': 'classic-flap', 'replica': 'classic-flap',
                'copy': 'classic-flap', 'fake': 'classic-flap',
                'handbag': 'classic-flap', 'medium handbag': 'classic-flap',
                'large handbag': 'classic-flap', 'small handbag': 'mini-flap',
                'bowling': 'shoulder-bag', 'gst': 'tote',
                'tmall elf': 'mini-bag', 'box bag': 'clutch',
                'small box': 'clutch', 'kelly': 'shoulder-bag',
                'bow': 'shoulder-bag', 'phone holder': 'clutch',
                'flap phone': 'clutch', 'bag on 25': 'classic-flap',
                'cambon': 'tote', 'waist bag': 'belt-bag',
                'minaudiere': 'evening-bag', 'tea box': 'evening-bag',
                'ice cream': 'evening-bag', 'camera bag': 'crossbody',
                'messanger': 'crossbody', 'messenger': 'crossbody',
                'baguette': 'shoulder-bag', 'heart': 'mini-bag',
                'sneaker': 'clutch', 'slingback': 'clutch',
                'long box': 'pouch', '24p': 'classic-flap',
                '24c': 'classic-flap', '22s': 'classic-flap',
                'zipped coin': 'wallet-on-chain', 'coin purse': 'wallet-on-chain',
                'zip up': 'shoulder-bag', 'ballet': 'clutch',
                'trainer': 'clutch', 'loafer': 'clutch',
                'mary jane': 'clutch', 'rain boot': 'clutch',
                'flats': 'clutch', 'shoes': 'clutch', 'boots': 'clutch'
            },
            'louis vuitton': {
                'neverfull': 'neverfull', 'speedy': 'speedy',
                'keepall': 'keepall', 'carryall': 'carryall',
                'onthego': 'onthego', 'neverwoof': 'neverwoof',
                'coussin': 'coussin', 'dauphine': 'dauphine',
                'petite malle': 'petite-malle', 'capucines': 'capucines',
                'multi pocket': 'multi-pocket', 'tote': 'tote',
                'backpack': 'backpack', 'crossbody': 'crossbody',
                'belt bag': 'belt-bag', 'bumbag': 'belt-bag',
                'fanny pack': 'belt-bag', 'madeleine': 'shoulder-bag',
                'squire': 'crossbody', 'nice': 'clutch',
                'high rise': 'shoulder-bag', 'boulogne': 'shoulder-bag',
                'diane': 'shoulder-bag', 'vendome': 'shoulder-bag',
                'vendôme': 'shoulder-bag', 'neonoé': 'crossbody',
                'neo noe': 'crossbody', 'neo': 'crossbody',
                'noe': 'crossbody', 'neono': 'crossbody',
                'neo no': 'crossbody', 'hobo metis': 'crossbody',
                'hobo': 'shoulder-bag', 'metis': 'crossbody',
                'saint germain': 'shoulder-bag', 'vagabond': 'shoulder-bag',
                'express': 'crossbody', 'vers': 'crossbody',
                'versatile': 'crossbody', 'lineup': 'clutch',
                'lock and walk': 'crossbody', 'victorie': 'crossbody',
                'all around': 'tote', 'easy pouch': 'clutch',
                'tag me': 'clutch', 'hang on': 'clutch',
                'multipass': 'wallet-on-chain', 'vanity chain': 'vanity',
                'phone pouch': 'clutch', 'pocket organizer': 'wallet-on-chain',
                'cosmetic': 'pouch', 'lipstick': 'pouch',
                'card holder': 'wallet-on-chain', 'passport': 'wallet-on-chain',
                'sneaker': 'clutch', 'trainer': 'clutch',
                'loafer': 'clutch', 'high heel': 'clutch',
                'ballerina': 'clutch', 'mule': 'clutch',
                'sneakerina': 'clutch', 'frontrow': 'clutch',
                'lagoon': 'clutch', 'time out': 'clutch',
                '6am': 'clutch', 'major': 'clutch',
                'low key': 'shoulder-bag', 'baia': 'shoulder-bag',
                'kirigami': 'wallet-on-chain', 'vanity pm': 'vanity',
                'new wave': 'shoulder-bag', 'favorite': 'shoulder-bag',
                'bella': 'mini-bag', 'montsouris': 'backpack',
                'monsouri': 'backpack', 'tiny camera': 'crossbody',
                'odyssee': 'shoulder-bag', 'carry it': 'tote',
                'escape': 'backpack', 'ever more': 'shoulder-bag',
                'blossom': 'shoulder-bag', 'off duty': 'shoulder-bag',
                'atlantis': 'shoulder-bag', 'altantis': 'shoulder-bag',
                'nova': 'shoulder-bag', 'again': 'shoulder-bag',
                'catchy': 'shoulder-bag', 'fan': 'clutch',
                'fold me': 'pouch', 'duo': 'shoulder-bag',
                'bundle': 'clutch', 'ellipse': 'shoulder-bag',
                'boundless': 'tote', 'hand it all': 'tote',
                'cookie': 'mini-bag', 'petit palais': 'tote',
                'grand palais': 'tote', 'sunset': 'shoulder-bag',
                'anytime': 'shoulder-bag', 'the drop': 'shoulder-bag',
                'soho': 'shoulder-bag', 'hide away': 'clutch',
                'marellini': 'mini-bag', 'slouchy': 'shoulder-bag',
                'biker': 'shoulder-bag', 'why knot': 'shoulder-bag',
                'rivage': 'shoulder-bag', 'envelope': 'clutch',
                'bloom': 'shoulder-bag', 'on my side': 'shoulder-bag',
                'varenne': 'shoulder-bag', 'dopp kit': 'pouch',
                'flore': 'clutch', 'soft polochon': 'shoulder-bag',
                'orsay': 'shoulder-bag', 'piano': 'shoulder-bag',
                'mezzo': 'shoulder-bag', 'vain': 'shoulder-bag',
                'muria': 'shoulder-bag', 'backup': 'backpack',
                'let go': 'shoulder-bag', 'just in case': 'clutch',
                'vibe': 'shoulder-bag', 'papillon': 'shoulder-bag',
                'croissant': 'shoulder-bag', 'oxford': 'clutch',
                'lock & go': 'crossbody', 'excursion': 'shoulder-bag',
                'hide and seek': 'clutch', 'bagatelle': 'shoulder-bag',
                'sac sport': 'tote', 'beaubourg': 'shoulder-bag',
                'hold me': 'shoulder-bag', 'bandouliere': 'crossbody',
                'twinny': 'shoulder-bag', 'opera': 'shoulder-bag',
                'buci': 'shoulder-bag', 'trianon': 'shoulder-bag',
                'tilsitt': 'shoulder-bag', 'pop my heart': 'clutch',
                'wapity': 'pouch', 'gracefull': 'tote',
                'buggy': 'shoulder-bag', 'surene': 'shoulder-bag',
                'papillon bb': 'mini-bag', 'le 5 a 7': 'shoulder-bag',
                'bea': 'shoulder-bag', 'lock &': 'crossbody',
                'vintage monogram': 'tote', 'denim': 'tote'
            },
            'dior': {
                'lady dior': 'lady-dior', 'saddle': 'saddle',
                'book tote': 'book-tote', 'miss dior': 'miss-dior',
                'dioriviera': 'dioriviera', 'caro': 'caro',
                'bobby': 'bobby', 'tote': 'tote',
                'crossbody': 'crossbody', 'backpack': 'backpack',
                'chrono': 'clutch', 'ribbon': 'clutch',
                'lingot': 'shoulder-bag', 'briefcase': 'shoulder-bag',
                'sneaker': 'clutch', 'my dior': 'mini-bag',
                'my tender': 'mini-bag', 'top handle': 'shoulder-bag',
                'medaillon': 'classic-flap', 'gallop': 'shoulder-bag',
                'macrocannage': 'shoulder-bag', 'oblique': 'shoulder-bag',
                'toujours': 'shoulder-bag', 'camp': 'crossbody',
                'circle': 'clutch', 'mini tote': 'tote',
                'diorcamp': 'crossbody', 'diortravel': 'tote',
                'diorstar': 'mini-bag', 'diorquake': 'shoulder-bag',
                'diorsphere': 'mini-bag', 'dioriviera book': 'book-tote',
                'granville': 'shoulder-bag', 'walk n dior': 'shoulder-bag',
                'dior vibes': 'shoulder-bag', 'dioramour': 'mini-bag',
                'cd lock': 'shoulder-bag', 'diorcaro': 'caro',
                'diorbobby': 'bobby', 'diorbook': 'book-tote',
                'diorlady': 'lady-dior', 'diorsaddle': 'saddle',
                'medium tote': 'tote', 'large tote': 'tote',
                'small tote': 'tote', 'mini bag': 'mini-bag',
                'shoulder bag': 'shoulder-bag', 'pouch': 'pouch',
                'clutch': 'clutch', 'wallet': 'wallet-on-chain',
                'card holder': 'wallet-on-chain', 'coin purse': 'wallet-on-chain',
                'belt bag': 'belt-bag', 'evening': 'evening-bag',
                'vanity': 'vanity', 'gamine': 'clutch',
                'diormilieu': 'tote', 'diorcamp bag': 'crossbody',
                'diorquake bag': 'shoulder-bag', 'diorstar bag': 'mini-bag',
                'diorsphere bag': 'mini-bag', 'granville bag': 'shoulder-bag',
                'walk n dior bag': 'shoulder-bag', 'dior vibes bag': 'shoulder-bag',
                'dioramour bag': 'mini-bag', 'cd lock bag': 'shoulder-bag',
                'dior book tote': 'book-tote', 'lady dior bag': 'lady-dior',
                'saddle bag': 'saddle', 'caro bag': 'caro',
                'bobby bag': 'bobby', 'tote bag': 'tote',
                'crossbody bag': 'crossbody', 'backpack bag': 'backpack',
                'shoulder bag': 'shoulder-bag', 'mini bag': 'mini-bag',
                'pouch bag': 'pouch', 'clutch bag': 'clutch',
                'wallet bag': 'wallet-on-chain', 'card holder bag': 'wallet-on-chain',
                'coin purse bag': 'wallet-on-chain', 'belt bag': 'belt-bag',
                'evening bag': 'evening-bag', 'vanity bag': 'vanity',
                'gamine bag': 'clutch', 'diormilieu bag': 'tote',
                'glycine': 'wallet-on-chain', 'freesia': 'wallet-on-chain',
                'wallet on chain': 'wallet-on-chain'
            },
            'ysl': {
                'loulou': 'loulou', 'kate': 'kate',
                'niki': 'niki', 'puffer': 'puffer',
                'manhattan': 'manhattan', 'vanity': 'vanity',
                'le 5 à 7': 'le-5-a-7', 'wallet on chain': 'wallet-on-chain',
                'crossbody': 'crossbody', 'tote': 'tote',
                'shoulder bag': 'shoulder-bag', 'mini': 'mini-bag',
                'cassandra': 'cassandra', 'saint laurent': 'loulou',
                'yves saint laurent': 'loulou', 'sac': 'tote',
                'monogram': 'loulou', 'lou lou': 'loulou',
                'niki baby': 'niki', 'niki medium': 'niki',
                'niki large': 'niki', 'loulou baby': 'loulou',
                'loulou medium': 'loulou', 'loulou large': 'loulou',
                'kate medium': 'kate', 'kate large': 'kate',
                'puffer medium': 'puffer', 'puffer large': 'puffer',
                'manhattan medium': 'manhattan', 'manhattan large': 'manhattan',
                'vanity medium': 'vanity', 'vanity large': 'vanity',
                'le 5 a 7': 'le-5-a-7', 'le5a7': 'le-5-a-7',
                'icare': 'shoulder-bag', 'amalía': 'shoulder-bag',
                'amalia': 'shoulder-bag', 'voltaire': 'shoulder-bag',
                'pochon': 'clutch', 'calypso': 'shoulder-bag',
                'raffia': 'tote', 'shearling': 'shoulder-bag',
                'box saint': 'clutch', 'top handle': 'shoulder-bag',
                'paris vii': 'shoulder-bag'
            },
            'hermes': {
                'birkin': 'birkin', 'kelly': 'kelly',
                'constance': 'constance', 'lindy': 'lindy',
                'bolide': 'bolide', 'picotin': 'picotin',
                'garden party': 'garden-party', 'tote': 'tote',
                'crossbody': 'crossbody', 'shoulder bag': 'shoulder-bag',
                'mini': 'mini-bag', 'clutch': 'clutch',
                'pouch': 'pouch', 'wallet': 'wallet-on-chain',
                'card holder': 'wallet-on-chain', 'bag': 'birkin',
                'evening': 'evening-bag', 'faubourg': 'tote',
                'herbag': 'crossbody', 'fourre-tout': 'tote',
                'fourre tout': 'tote', 'sac à dépêches': 'shoulder-bag',
                'sac a depeches': 'shoulder-bag', 'cabag': 'tote',
                'valparaiso': 'tote', 'voyage': 'tote',
                'kelly danse': 'kelly', 'kelly moove': 'kelly',
                'kelly 28': 'kelly', 'kelly 32': 'kelly',
                'kelly 35': 'kelly', 'birkin 25': 'birkin',
                'birkin 30': 'birkin', 'birkin 35': 'birkin',
                'birkin 40': 'birkin', 'lindy 26': 'lindy',
                'lindy 30': 'lindy', 'lindy 34': 'lindy',
                'constance 18': 'constance', 'constance 24': 'constance',
                'picotin 18': 'picotin', 'picotin 22': 'picotin',
                'picotin 26': 'picotin', 'garden party 30': 'garden-party',
                'garden party 36': 'garden-party', 'garden party 40': 'garden-party',
                'bolide 27': 'bolide', 'bolide 31': 'bolide',
                'bolide 35': 'bolide', 'bag': 'birkin',
                'handbag': 'birkin', 'purse': 'clutch',
                'satchel': 'kelly', 'bucket': 'picotin',
                'hobo': 'lindy', 'duffle': 'birkin',
                'weekender': 'birkin', 'travel': 'birkin',
                'business': 'kelly', 'shopping': 'garden-party',
                'evening': 'evening-bag', 'wedding': 'evening-bag',
                'cocktail': 'evening-bag', 'party': 'evening-bag',
                'formal': 'evening-bag', 'casual': 'birkin',
                'everyday': 'birkin', 'work': 'kelly',
                'office': 'kelly', 'school': 'birkin',
                'gym': 'birkin', 'beach': 'garden-party',
                'pool': 'garden-party', 'vacation': 'birkin',
                'travel': 'birkin', 'weekend': 'birkin',
                'holiday': 'birkin', 'christmas': 'evening-bag',
                'new year': 'evening-bag', 'birthday': 'birkin',
                'anniversary': 'birkin', 'gift': 'birkin',
                'present': 'birkin', 'luxury': 'birkin',
                'designer': 'birkin', 'fashion': 'birkin',
                'style': 'birkin', 'trendy': 'birkin',
                'classic': 'birkin', 'vintage': 'birkin',
                'pre-owned': 'birkin', 'authentic': 'birkin',
                'replica': 'birkin', 'fake': 'birkin',
                'copy': 'birkin'
            },
            'gucci': {
                'horsebit': 'horsebit', 'dionysus': 'dionysus',
                'marmont': 'marmont', 'jackie': 'jackie',
                'bamboo': 'bamboo', 'diana': 'diana',
                'tori': 'tori', 'gg marmont': 'gg-marmont',
                'tote': 'tote', 'crossbody': 'crossbody',
                'backpack': 'backpack', 'shoulder bag': 'shoulder-bag',
                'mini': 'mini-bag', 'clutch': 'clutch',
                'pouch': 'pouch', 'wallet': 'wallet-on-chain',
                'card holder': 'wallet-on-chain', 'belt bag': 'belt-bag',
                'evening': 'evening-bag', 'vanity': 'vanity',
                'gucci': 'shoulder-bag', 'bag': 'shoulder-bag',
                'handbag': 'shoulder-bag', 'satchel': 'shoulder-bag',
                'bucket': 'crossbody', 'hobo': 'shoulder-bag',
                'duffle': 'tote', 'weekender': 'tote',
                'travel': 'tote', 'business': 'tote',
                'shopping': 'tote', 'evening': 'evening-bag',
                'wedding': 'evening-bag', 'cocktail': 'evening-bag',
                'party': 'evening-bag', 'formal': 'evening-bag',
                'casual': 'shoulder-bag', 'everyday': 'shoulder-bag',
                'work': 'tote', 'office': 'tote',
                'school': 'backpack', 'gym': 'tote',
                'beach': 'tote', 'pool': 'tote',
                'vacation': 'tote', 'travel': 'tote',
                'weekend': 'tote', 'holiday': 'tote',
                'christmas': 'evening-bag', 'new year': 'evening-bag',
                'birthday': 'shoulder-bag', 'anniversary': 'shoulder-bag',
                'gift': 'shoulder-bag', 'present': 'shoulder-bag',
                'luxury': 'shoulder-bag', 'designer': 'shoulder-bag',
                'fashion': 'shoulder-bag', 'style': 'shoulder-bag',
                'trendy': 'shoulder-bag', 'classic': 'classic-flap',
                'vintage': 'classic-flap', 'pre-owned': 'classic-flap',
                'authentic': 'classic-flap', 'replica': 'classic-flap',
                'fake': 'classic-flap', 'copy': 'classic-flap'
            },
            'prada': {
                're-edition': 're-edition', 'nylon': 'nylon',
                'saffiano': 'saffiano', 'symbol': 'symbol',
                'cleo': 'cleo', 'tote': 'tote',
                'crossbody': 'crossbody', 'backpack': 'backpack',
                'shoulder bag': 'shoulder-bag', 'mini': 'mini-bag',
                'clutch': 'clutch', 'pouch': 'pouch',
                'wallet': 'wallet-on-chain', 'card holder': 'wallet-on-chain',
                'belt bag': 'belt-bag', 'evening': 'evening-bag',
                'vanity': 'vanity', 'prada': 'shoulder-bag',
                'bag': 'shoulder-bag', 'handbag': 'shoulder-bag',
                'satchel': 'shoulder-bag', 'bucket': 'crossbody',
                'hobo': 'shoulder-bag', 'duffle': 'tote',
                'weekender': 'tote', 'travel': 'tote',
                'business': 'tote', 'shopping': 'tote',
                'evening': 'evening-bag', 'wedding': 'evening-bag',
                'cocktail': 'evening-bag', 'party': 'evening-bag',
                'formal': 'evening-bag', 'casual': 'shoulder-bag',
                'everyday': 'shoulder-bag', 'work': 'tote',
                'office': 'tote', 'school': 'backpack',
                'gym': 'tote', 'beach': 'tote',
                'pool': 'tote', 'vacation': 'tote',
                'travel': 'tote', 'weekend': 'tote',
                'holiday': 'tote', 'christmas': 'evening-bag',
                'new year': 'evening-bag', 'birthday': 'shoulder-bag',
                'anniversary': 'shoulder-bag', 'gift': 'shoulder-bag',
                'present': 'shoulder-bag', 'luxury': 'shoulder-bag',
                'designer': 'shoulder-bag', 'fashion': 'shoulder-bag',
                'style': 'shoulder-bag', 'trendy': 'shoulder-bag',
                'classic': 'classic-flap', 'vintage': 'classic-flap',
                'pre-owned': 'classic-flap', 'authentic': 'classic-flap',
                'replica': 'classic-flap', 'fake': 'classic-flap',
                'copy': 'classic-flap'
            },
            'bottega veneta': {
                'cassette': 'cassette', 'jodie': 'jodie',
                'andiamo': 'andiamo', 'kalimero': 'kalimero',
                'minidomingo': 'minidomingo', 'tote': 'tote',
                'crossbody': 'crossbody', 'shoulder bag': 'shoulder-bag',
                'lauren': 'shoulder-bag', 'capucines': 'shoulder-bag',
                'ciao ciao': 'crossbody', 'basket': 'tote',
                'veneta': 'shoulder-bag', 'mini veneta': 'mini-bag',
                'mini': 'mini-bag', 'clutch': 'clutch',
                'pouch': 'pouch', 'wallet': 'wallet-on-chain',
                'card holder': 'wallet-on-chain', 'belt bag': 'belt-bag',
                'evening': 'evening-bag', 'bv': 'cassette',
                'bottega': 'cassette', 'bag': 'cassette',
                'handbag': 'cassette', 'satchel': 'shoulder-bag',
                'bucket': 'crossbody', 'hobo': 'shoulder-bag',
                'duffle': 'tote', 'weekender': 'tote',
                'travel': 'tote', 'business': 'tote',
                'shopping': 'tote', 'evening': 'evening-bag',
                'wedding': 'evening-bag', 'cocktail': 'evening-bag',
                'party': 'evening-bag', 'formal': 'evening-bag',
                'casual': 'shoulder-bag', 'everyday': 'shoulder-bag',
                'work': 'tote', 'office': 'tote',
                'school': 'backpack', 'gym': 'tote',
                'beach': 'tote', 'pool': 'tote',
                'vacation': 'tote', 'travel': 'tote',
                'weekend': 'tote', 'holiday': 'tote',
                'christmas': 'evening-bag', 'new year': 'evening-bag',
                'birthday': 'shoulder-bag', 'anniversary': 'shoulder-bag',
                'gift': 'shoulder-bag', 'present': 'shoulder-bag',
                'luxury': 'shoulder-bag', 'designer': 'shoulder-bag',
                'fashion': 'shoulder-bag', 'style': 'shoulder-bag',
                'trendy': 'shoulder-bag', 'classic': 'classic-flap',
                'vintage': 'classic-flap', 'pre-owned': 'classic-flap',
                'authentic': 'classic-flap', 'replica': 'classic-flap',
                'fake': 'classic-flap', 'copy': 'classic-flap'
            },
            'celine': {
                'triomphe': 'triomphe', 'ava': 'ava',
                'belt': 'belt', 'luggage': 'luggage',
                'box': 'box', 'tote': 'tote',
                'crossbody': 'crossbody', 'shoulder bag': 'shoulder-bag',
                'mini': 'mini-bag', 'clutch': 'clutch',
                'pouch': 'pouch', 'wallet': 'wallet-on-chain',
                'card holder': 'wallet-on-chain', 'belt bag': 'belt-bag',
                'evening': 'evening-bag', 'celine': 'triomphe',
                'bag': 'triomphe', 'handbag': 'triomphe',
                'satchel': 'shoulder-bag', 'bucket': 'crossbody',
                'hobo': 'shoulder-bag', 'duffle': 'tote',
                'weekender': 'tote', 'travel': 'tote',
                'business': 'tote', 'shopping': 'tote',
                'evening': 'evening-bag', 'wedding': 'evening-bag',
                'cocktail': 'evening-bag', 'party': 'evening-bag',
                'formal': 'evening-bag', 'casual': 'shoulder-bag',
                'everyday': 'shoulder-bag', 'work': 'tote',
                'office': 'tote', 'school': 'backpack',
                'gym': 'tote', 'beach': 'tote',
                'pool': 'tote', 'vacation': 'tote',
                'travel': 'tote', 'weekend': 'tote',
                'holiday': 'tote', 'christmas': 'evening-bag',
                'new year': 'evening-bag', 'birthday': 'shoulder-bag',
                'anniversary': 'shoulder-bag', 'gift': 'shoulder-bag',
                'present': 'shoulder-bag', 'luxury': 'shoulder-bag',
                'designer': 'shoulder-bag', 'fashion': 'shoulder-bag',
                'style': 'shoulder-bag', 'trendy': 'shoulder-bag',
                'classic': 'classic-flap', 'vintage': 'classic-flap',
                'pre-owned': 'classic-flap', 'authentic': 'classic-flap',
                'replica': 'classic-flap', 'fake': 'classic-flap',
                'copy': 'classic-flap'
            },
            'goyard': {
                'saint louis': 'saint-louis', 'anjou': 'anjou',
                'croissy': 'croissy', 'belvedere': 'belvedere',
                'tote': 'tote', 'clutch': 'clutch',
                'crossbody': 'crossbody', 'shoulder bag': 'shoulder-bag',
                'mini': 'mini-bag', 'pouch': 'pouch',
                'wallet': 'wallet-on-chain', 'card holder': 'wallet-on-chain',
                'belt bag': 'belt-bag', 'evening': 'evening-bag',
                'goyard': 'saint-louis', 'bag': 'saint-louis',
                'handbag': 'saint-louis', 'satchel': 'shoulder-bag',
                'bucket': 'crossbody', 'hobo': 'shoulder-bag',
                'duffle': 'tote', 'weekender': 'tote',
                'travel': 'tote', 'business': 'tote',
                'shopping': 'tote', 'evening': 'evening-bag',
                'wedding': 'evening-bag', 'cocktail': 'evening-bag',
                'party': 'evening-bag', 'formal': 'evening-bag',
                'casual': 'shoulder-bag', 'everyday': 'shoulder-bag',
                'work': 'tote', 'office': 'tote',
                'school': 'backpack', 'gym': 'tote',
                'beach': 'tote', 'pool': 'tote',
                'vacation': 'tote', 'travel': 'tote',
                'weekend': 'tote', 'holiday': 'tote',
                'christmas': 'evening-bag', 'new year': 'evening-bag',
                'birthday': 'shoulder-bag', 'anniversary': 'shoulder-bag',
                'gift': 'shoulder-bag', 'present': 'shoulder-bag',
                'luxury': 'shoulder-bag', 'designer': 'shoulder-bag',
                'fashion': 'shoulder-bag', 'style': 'shoulder-bag',
                'trendy': 'shoulder-bag', 'classic': 'classic-flap',
                'vintage': 'classic-flap', 'pre-owned': 'classic-flap',
                'authentic': 'classic-flap', 'replica': 'classic-flap',
                'fake': 'classic-flap', 'copy': 'classic-flap'
            },
            'loewe': {
                'puzzle': 'puzzle', 'hammock': 'hammock',
                'gate': 'gate', 'balloon': 'balloon',
                'puzzle fold': 'puzzle-fold', 'tote': 'tote',
                'crossbody': 'crossbody', 'shoulder bag': 'shoulder-bag',
                'mini': 'mini-bag', 'clutch': 'clutch',
                'pouch': 'pouch', 'wallet': 'wallet-on-chain',
                'card holder': 'wallet-on-chain', 'belt bag': 'belt-bag',
                'evening': 'evening-bag', 'loewe': 'puzzle',
                'bag': 'puzzle', 'handbag': 'puzzle',
                'satchel': 'shoulder-bag', 'bucket': 'crossbody',
                'hobo': 'shoulder-bag', 'duffle': 'tote',
                'weekender': 'tote', 'travel': 'tote',
                'business': 'tote', 'shopping': 'tote',
                'evening': 'evening-bag', 'wedding': 'evening-bag',
                'cocktail': 'evening-bag', 'party': 'evening-bag',
                'formal': 'evening-bag', 'casual': 'shoulder-bag',
                'everyday': 'shoulder-bag', 'work': 'tote',
                'office': 'tote', 'school': 'backpack',
                'gym': 'tote', 'beach': 'tote',
                'pool': 'tote', 'vacation': 'tote',
                'travel': 'tote', 'weekend': 'tote',
                'holiday': 'tote', 'christmas': 'evening-bag',
                'new year': 'evening-bag', 'birthday': 'shoulder-bag',
                'anniversary': 'shoulder-bag', 'gift': 'shoulder-bag',
                'present': 'shoulder-bag', 'luxury': 'shoulder-bag',
                'designer': 'shoulder-bag', 'fashion': 'shoulder-bag',
                'style': 'shoulder-bag', 'trendy': 'shoulder-bag',
                'classic': 'classic-flap', 'vintage': 'classic-flap',
                'pre-owned': 'classic-flap', 'authentic': 'classic-flap',
                'replica': 'classic-flap', 'fake': 'classic-flap',
                'copy': 'classic-flap'
            },
            'balenciaga': {
                'city': 'city', 'classic': 'classic-flap',
                'hourglass': 'hourglass', 'neo classic': 'classic-flap',
                'tote': 'tote', 'crossbody': 'crossbody',
                'backpack': 'backpack', 'shoulder bag': 'shoulder-bag',
                'mini': 'mini-bag', 'clutch': 'clutch',
                'pouch': 'pouch', 'wallet': 'wallet-on-chain',
                'card holder': 'wallet-on-chain', 'belt bag': 'belt-bag',
                'evening': 'evening-bag', 'balenciaga': 'city',
                'bag': 'city', 'handbag': 'city',
                'satchel': 'shoulder-bag', 'bucket': 'crossbody',
                'hobo': 'shoulder-bag', 'duffle': 'tote',
                'weekender': 'tote', 'travel': 'tote',
                'business': 'tote', 'shopping': 'tote',
                'evening': 'evening-bag', 'wedding': 'evening-bag',
                'cocktail': 'evening-bag', 'party': 'evening-bag',
                'formal': 'evening-bag', 'casual': 'shoulder-bag',
                'everyday': 'shoulder-bag', 'work': 'tote',
                'office': 'tote', 'school': 'backpack',
                'gym': 'tote', 'beach': 'tote',
                'pool': 'tote', 'vacation': 'tote',
                'travel': 'tote', 'weekend': 'tote',
                'holiday': 'tote', 'christmas': 'evening-bag',
                'new year': 'evening-bag', 'birthday': 'shoulder-bag',
                'anniversary': 'shoulder-bag', 'gift': 'shoulder-bag',
                'present': 'shoulder-bag', 'luxury': 'shoulder-bag',
                'designer': 'shoulder-bag', 'fashion': 'shoulder-bag',
                'style': 'shoulder-bag', 'trendy': 'shoulder-bag',
                'classic': 'classic-flap', 'vintage': 'classic-flap',
                'pre-owned': 'classic-flap', 'authentic': 'classic-flap',
                'replica': 'classic-flap', 'fake': 'classic-flap',
                'copy': 'classic-flap'
            },
            'miumiu': {
                'matelasse': 'matelasse', 'coffer': 'coffer',
                'tote': 'tote', 'crossbody': 'crossbody',
                'backpack': 'backpack', 'shoulder bag': 'shoulder-bag',
                'mini': 'mini-bag', 'clutch': 'clutch',
                'pouch': 'pouch', 'wallet': 'wallet-on-chain',
                'card holder': 'wallet-on-chain', 'belt bag': 'belt-bag',
                'evening': 'evening-bag', 'miumiu': 'matelasse',
                'miu miu': 'matelasse', 'bag': 'matelasse',
                'handbag': 'matelasse', 'satchel': 'shoulder-bag',
                'bucket': 'crossbody', 'hobo': 'shoulder-bag',
                'duffle': 'tote', 'weekender': 'tote',
                'travel': 'tote', 'business': 'tote',
                'shopping': 'tote', 'evening': 'evening-bag',
                'wedding': 'evening-bag', 'cocktail': 'evening-bag',
                'party': 'evening-bag', 'formal': 'evening-bag',
                'casual': 'shoulder-bag', 'everyday': 'shoulder-bag',
                'work': 'tote', 'office': 'tote',
                'school': 'backpack', 'gym': 'tote',
                'beach': 'tote', 'pool': 'tote',
                'vacation': 'tote', 'travel': 'tote',
                'weekend': 'tote', 'holiday': 'tote',
                'christmas': 'evening-bag', 'new year': 'evening-bag',
                'birthday': 'shoulder-bag', 'anniversary': 'shoulder-bag',
                'gift': 'shoulder-bag', 'present': 'shoulder-bag',
                'luxury': 'shoulder-bag', 'designer': 'shoulder-bag',
                'fashion': 'shoulder-bag', 'style': 'shoulder-bag',
                'trendy': 'shoulder-bag', 'classic': 'classic-flap',
                'vintage': 'classic-flap', 'pre-owned': 'classic-flap',
                'authentic': 'classic-flap', 'replica': 'classic-flap',
                'fake': 'classic-flap', 'copy': 'classic-flap'
            },
            'fendi': {
                'peekaboo': 'peekaboo', 'baguette': 'baguette',
                'sunshine': 'sunshine', 'tote': 'tote',
                'crossbody': 'crossbody', 'backpack': 'backpack',
                'shoulder bag': 'shoulder-bag', 'mini': 'mini-bag',
                'clutch': 'clutch', 'pouch': 'pouch',
                'wallet': 'wallet-on-chain', 'card holder': 'wallet-on-chain',
                'belt bag': 'belt-bag', 'evening': 'evening-bag',
                'fendi': 'peekaboo', 'bag': 'peekaboo',
                'handbag': 'peekaboo', 'satchel': 'shoulder-bag',
                'bucket': 'crossbody', 'hobo': 'shoulder-bag',
                'duffle': 'tote', 'weekender': 'tote',
                'travel': 'tote', 'business': 'tote',
                'shopping': 'tote', 'evening': 'evening-bag',
                'wedding': 'evening-bag', 'cocktail': 'evening-bag',
                'party': 'evening-bag', 'formal': 'evening-bag',
                'casual': 'shoulder-bag', 'everyday': 'shoulder-bag',
                'work': 'tote', 'office': 'tote',
                'school': 'backpack', 'gym': 'tote',
                'beach': 'tote', 'pool': 'tote',
                'vacation': 'tote', 'travel': 'tote',
                'weekend': 'tote', 'holiday': 'tote',
                'christmas': 'evening-bag', 'new year': 'evening-bag',
                'birthday': 'shoulder-bag', 'anniversary': 'shoulder-bag',
                'gift': 'shoulder-bag', 'present': 'shoulder-bag',
                'luxury': 'shoulder-bag', 'designer': 'shoulder-bag',
                'fashion': 'shoulder-bag', 'style': 'shoulder-bag',
                'trendy': 'shoulder-bag', 'classic': 'classic-flap',
                'vintage': 'classic-flap', 'pre-owned': 'classic-flap',
                'authentic': 'classic-flap', 'replica': 'classic-flap',
                'fake': 'classic-flap', 'copy': 'classic-flap'
            },
            'burberry': {
                'london': 'london', 'tote': 'tote',
                'crossbody': 'crossbody', 'backpack': 'backpack',
                'shoulder bag': 'shoulder-bag', 'mini': 'mini-bag',
                'clutch': 'clutch', 'pouch': 'pouch',
                'wallet': 'wallet-on-chain', 'card holder': 'wallet-on-chain',
                'belt bag': 'belt-bag', 'evening': 'evening-bag',
                'burberry': 'london', 'bag': 'london',
                'handbag': 'london', 'satchel': 'shoulder-bag',
                'bucket': 'crossbody', 'hobo': 'shoulder-bag',
                'duffle': 'tote', 'weekender': 'tote',
                'travel': 'tote', 'business': 'tote',
                'shopping': 'tote', 'evening': 'evening-bag',
                'wedding': 'evening-bag', 'cocktail': 'evening-bag',
                'party': 'evening-bag', 'formal': 'evening-bag',
                'casual': 'shoulder-bag', 'everyday': 'shoulder-bag',
                'work': 'tote', 'office': 'tote',
                'school': 'backpack', 'gym': 'tote',
                'beach': 'tote', 'pool': 'tote',
                'vacation': 'tote', 'travel': 'tote',
                'weekend': 'tote', 'holiday': 'tote',
                'christmas': 'evening-bag', 'new year': 'evening-bag',
                'birthday': 'shoulder-bag', 'anniversary': 'shoulder-bag',
                'gift': 'shoulder-bag', 'present': 'shoulder-bag',
                'luxury': 'shoulder-bag', 'designer': 'shoulder-bag',
                'fashion': 'shoulder-bag', 'style': 'shoulder-bag',
                'trendy': 'shoulder-bag', 'classic': 'classic-flap',
                'vintage': 'classic-flap', 'pre-owned': 'classic-flap',
                'authentic': 'classic-flap', 'replica': 'classic-flap',
                'fake': 'classic-flap', 'copy': 'classic-flap'
            },
            'loro piana': {
                'loropiana': 'loropiana', 'tote': 'tote',
                'crossbody': 'crossbody', 'backpack': 'backpack',
                'shoulder bag': 'shoulder-bag', 'mini': 'mini-bag',
                'clutch': 'clutch', 'pouch': 'pouch',
                'wallet': 'wallet-on-chain', 'card holder': 'wallet-on-chain',
                'belt bag': 'belt-bag', 'evening': 'evening-bag',
                'loro': 'loropiana', 'piana': 'loropiana',
                'bag': 'loropiana', 'handbag': 'loropiana',
                'satchel': 'shoulder-bag', 'bucket': 'crossbody',
                'hobo': 'shoulder-bag', 'duffle': 'tote',
                'weekender': 'tote', 'travel': 'tote',
                'business': 'tote', 'shopping': 'tote',
                'evening': 'evening-bag', 'wedding': 'evening-bag',
                'cocktail': 'evening-bag', 'party': 'evening-bag',
                'formal': 'evening-bag', 'casual': 'shoulder-bag',
                'everyday': 'shoulder-bag', 'work': 'tote',
                'office': 'tote', 'school': 'backpack',
                'gym': 'tote', 'beach': 'tote',
                'pool': 'tote', 'vacation': 'tote',
                'travel': 'tote', 'weekend': 'tote',
                'holiday': 'tote', 'christmas': 'evening-bag',
                'new year': 'evening-bag', 'birthday': 'shoulder-bag',
                'anniversary': 'shoulder-bag', 'gift': 'shoulder-bag',
                'present': 'shoulder-bag', 'luxury': 'shoulder-bag',
                'designer': 'shoulder-bag', 'fashion': 'shoulder-bag',
                'style': 'shoulder-bag', 'trendy': 'shoulder-bag',
                'classic': 'classic-flap', 'vintage': 'classic-flap',
                'pre-owned': 'classic-flap', 'authentic': 'classic-flap',
                'replica': 'classic-flap', 'fake': 'classic-flap',
                'copy': 'classic-flap'
            },
            'givenchy': {
                'antigona': 'antigona', 'voyou': 'voyou',
                'tote': 'tote', 'crossbody': 'crossbody',
                'backpack': 'backpack', 'shoulder bag': 'shoulder-bag',
                'mini': 'mini-bag', 'clutch': 'clutch',
                'pouch': 'pouch', 'wallet': 'wallet-on-chain',
                'card holder': 'wallet-on-chain', 'belt bag': 'belt-bag',
                'evening': 'evening-bag', 'givenchy': 'antigona',
                'bag': 'antigona', 'handbag': 'antigona',
                'satchel': 'shoulder-bag', 'bucket': 'crossbody',
                'hobo': 'shoulder-bag', 'duffle': 'tote',
                'weekender': 'tote', 'travel': 'tote',
                'business': 'tote', 'shopping': 'tote',
                'evening': 'evening-bag', 'wedding': 'evening-bag',
                'cocktail': 'evening-bag', 'party': 'evening-bag',
                'formal': 'evening-bag', 'casual': 'shoulder-bag',
                'everyday': 'shoulder-bag', 'work': 'tote',
                'office': 'tote', 'school': 'backpack',
                'gym': 'tote', 'beach': 'tote',
                'pool': 'tote', 'vacation': 'tote',
                'travel': 'tote', 'weekend': 'tote',
                'holiday': 'tote', 'christmas': 'evening-bag',
                'new year': 'evening-bag', 'birthday': 'shoulder-bag',
                'anniversary': 'shoulder-bag', 'gift': 'shoulder-bag',
                'present': 'shoulder-bag', 'luxury': 'shoulder-bag',
                'designer': 'shoulder-bag', 'fashion': 'shoulder-bag',
                'style': 'shoulder-bag', 'trendy': 'shoulder-bag',
                'classic': 'classic-flap', 'vintage': 'classic-flap',
                'pre-owned': 'classic-flap', 'authentic': 'classic-flap',
                'replica': 'classic-flap', 'fake': 'classic-flap',
                'copy': 'classic-flap'
            }
        }

        brand_rules = subcategory_rules.get(brand_lower, {})
        for keyword, subcat in sorted(brand_rules.items(), key=lambda x: -len(x[0])):
            if keyword in name_lower:
                return subcat

        generic_rules = {
            'backpack': 'backpack', 'crossbody': 'crossbody',
            'shoulder bag': 'shoulder-bag', 'tote': 'tote',
            'clutch': 'clutch', 'wallet': 'wallet-on-chain',
            'mini': 'mini-bag', 'belt bag': 'belt-bag'
        }
        for keyword, subcat in generic_rules.items():
            if keyword in name_lower:
                return subcat

        return 'other'

    def create_product_data(self, product: Dict[str, Any]) -> Dict[str, Any]:
        name_lower = product['name'].lower()
        category = 'Bags'
        if any(word in name_lower for word in ['shoes', 'sneakers', 'boots', 'sandals', 'heel']):
            category = 'Shoes'
        elif any(word in name_lower for word in ['wallet', 'card holder', 'coin purse', 'key pouch']):
            category = 'Accessories'

        subcategory = self.extract_subcategory(product['name'], product['brand'])

        return {
            'id': str(product['id']),
            'slug': product['slug'],
            'name': product['name'],
            'brand': product['brand'],
            'category': category,
            'subcategory': subcategory,
            'price': 299.99,
            'originalPrice': 599.99,
            'details': [],
            'shipping': 'Free worldwide shipping, 7-15 days delivery.',
            'images': [],
            'createdAt': product['date']
        }

    def sync_new_products(self, new_products: List[Dict[str, Any]]):
        print('[4/4] 同步新产品到项目...')
        
        if not new_products:
            print('  没有新产品需要同步')
            return

        for product in new_products:
            brand_slug = product['brand_slug']
            if brand_slug not in self.brand_map:
                continue

            product_data = self.create_product_data(product)
            
            products_file = os.path.join(self.data_dir, f'products-{brand_slug}.json')
            index_file = os.path.join(self.data_dir, f'index-{brand_slug}.json')

            if os.path.exists(products_file):
                with open(products_file, 'r', encoding='utf-8') as f:
                    existing = json.load(f)
            else:
                existing = []

            existing.append(product_data)

            with open(products_file, 'w', encoding='utf-8') as f:
                json.dump(existing, f, ensure_ascii=False, indent=2)

            index_data = [{
                'id': p['id'],
                'slug': p['slug'],
                'name': p['name'],
                'brand': p['brand'],
                'category': p['category'],
                'subcategory': p['subcategory'],
                'price': p['price'],
                'originalPrice': p['originalPrice'],
                'thumb': '',
                'imageCount': 0,
                'createdAt': p['createdAt']
            } for p in existing]

            with open(index_file, 'w', encoding='utf-8') as f:
                json.dump(index_data, f, ensure_ascii=False, indent=2)

        self.update_search_index()
        print(f'  成功同步 {len(new_products)} 个新产品')

    def update_search_index(self):
        all_products = []
        for brand_slug in self.brand_map.keys():
            products_file = os.path.join(self.data_dir, f'products-{brand_slug}.json')
            if os.path.exists(products_file):
                with open(products_file, 'r', encoding='utf-8') as f:
                    try:
                        data = json.load(f)
                        all_products.extend(data)
                    except:
                        pass

        index_file = os.path.join(self.data_dir, 'search-index.json')
        with open(index_file, 'w', encoding='utf-8') as f:
            json.dump(all_products, f, ensure_ascii=False, indent=2)
        
        print(f'  更新了搜索索引，共 {len(all_products)} 个产品')

    def run(self):
        print('=== Yutulu 产品同步器 ===\n')
        
        categories = self.fetch_all_categories()
        yutulu_products = self.fetch_all_products(categories)
        existing_slugs = self.get_existing_slugs()

        new_products = [p for p in yutulu_products if p['slug'] not in existing_slugs]

        print(f'\n=== 对比结果 ===')
        print(f'Yutulu 产品总数: {len(yutulu_products)}')
        print(f'本项目产品总数: {len(existing_slugs)}')
        print(f'新增产品数: {len(new_products)}')

        if new_products:
            print(f'\n新增产品列表:')
            for p in new_products[:10]:
                print(f'  - {p["name"]} ({p["brand"]})')
            if len(new_products) > 10:
                print(f'  ... 还有 {len(new_products) - 10} 个')

            self.sync_new_products(new_products)

            os.system(f'python "{os.path.join(os.path.dirname(__file__), "fix_subcategories.py")}"')

        print('\n=== 同步完成 ===')

if __name__ == '__main__':
    sync = YutuluSync()
    sync.run()
