import requests
import re

url = 'https://www.arsenalsports.com/produtos/otica-e-iluminacao/filter?d=273&pagina=1'
html = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=30).text

m = re.search(r'<span>\s*(\d+)\s*de\s*(\d+)\s*item', html, re.S)
print('total items:', m.group(2) if m else 'N/A')

i = html.find('pagination')
if i == -1:
    print('no pagination found')
else:
    print(re.sub(r'\s+', ' ', html[i:i+2500]))
