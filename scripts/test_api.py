import requests

endpoints = [
    'https://yutulu.com/wp-json/wc/v3/products',
    'https://yutulu.com/wp-json/wc/v2/products',
    'https://yutulu.com/wp-json/api/products',
    'https://yutulu.com/api/products',
    'https://yutulu.com/wp-json/wp/v2/products',
    'https://yutulu.com/wp-json/yutulu/products',
    'https://yutulu.com/product-feed.json'
]

for url in endpoints:
    try:
        response = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
        print(f'{url} -> Status: {response.status_code}')
        if response.status_code == 200:
            try:
                data = response.json()
                if isinstance(data, list):
                    print(f'  -> Found {len(data)} products')
                    if data:
                        name = data[0].get('name', 'N/A')
                        print(f'  -> First product: {name[:50]}')
                else:
                    keys = list(data.keys())[:5]
                    print(f'  -> Object with keys: {keys}')
            except:
                text = response.text[:200]
                print(f'  -> Response: {text}')
    except Exception as e:
        print(f'{url} -> Error: {e}')
