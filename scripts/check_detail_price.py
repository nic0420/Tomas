import requests
import re

url = 'https://www.arsenalsports.com/produto/motor-eletrico-haswing-cayman-12v-55lbs-33378.html'
html = requests.get(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}, timeout=30).text
idx = html.find('product-sku')
print(re.sub(r'\s+', ' ', html[idx:idx+3500]))
