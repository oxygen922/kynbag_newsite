import requests

base_url = 'https://yutulu.com/wp-json/wp/v2'

# Test product endpoint
try:
    response = requests.get(f'{base_url}/product', params={'per_page': 5}, headers={'User-Agent': 'Mozilla/5.0'})
    print(f'Product endpoint: {response.status_code}')
    if response.status_code == 200:
        data = response.json()
        print(f'Found {len(data)} products')
        if data:
            product = data[0]
            print(f'First product: {product.get("title", {}).get("rendered", "N/A")}')
            print(f'Available fields: {list(product.keys())[:15]}')
            print(f'Categories: {product.get("product_cat", [])}')
except Exception as e:
    print(f'Error: {e}')

# Test category endpoint
try:
    response = requests.get(f'{base_url}/product_cat', params={'per_page': 20}, headers={'User-Agent': 'Mozilla/5.0'})
    print(f'\nCategory endpoint: {response.status_code}')
    if response.status_code == 200:
        data = response.json()
        print(f'Found {len(data)} categories')
        for cat in data:
            print(f'  {cat.get("id")}: {cat.get("name")}')
except Exception as e:
    print(f'Error: {e}')
