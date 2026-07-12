import requests

base_url = 'https://yutulu.com/wp-json/wp/v2'

# Test with proper headers
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json'
}

print('Testing Yutulu API...')
print('=' * 50)

# Test category endpoint
print('\n1. Testing product_cat endpoint:')
try:
    response = requests.get(f'{base_url}/product_cat', params={'per_page': 5}, headers=headers, timeout=15)
    print(f'   Status: {response.status_code}')
    print(f'   Headers: {dict(response.headers)}')
    print(f'   Content: {response.text[:500]}')
except Exception as e:
    print(f'   Error: {e}')

# Test product endpoint
print('\n2. Testing product endpoint:')
try:
    response = requests.get(f'{base_url}/product', params={'per_page': 3}, headers=headers, timeout=15)
    print(f'   Status: {response.status_code}')
    print(f'   Headers: {dict(response.headers)}')
    print(f'   Content: {response.text[:500]}')
except Exception as e:
    print(f'   Error: {e}')

# Test with session
print('\n3. Testing with session:')
session = requests.Session()
session.headers.update(headers)
try:
    response = session.get(f'{base_url}/product_cat', params={'per_page': 5}, timeout=15)
    print(f'   Status: {response.status_code}')
    print(f'   Content: {response.text[:500]}')
except Exception as e:
    print(f'   Error: {e}')
