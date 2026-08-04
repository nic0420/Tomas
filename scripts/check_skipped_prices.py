import requests
import re

urls = [
    'https://www.arsenalsports.com/produto/vector-optics-scope-constantine-1-10x24i-31531.html',
    'https://www.arsenalsports.com/produto/motor-eletrico-haswing-cayman-12v-55lbs-33378.html',
    'https://www.arsenalsports.com/produto/rebound-stand-up-paddle-sup-inflable-fam-31618.html',
    'https://www.arsenalsports.com/produto/wosport-camouflage-net-1.5x2m-multicam-24364.html',
]

for url in urls:
    try:
        html = requests.get(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}, timeout=30).text
        # Look for price
        m = re.search(r'USD\s*[\d.,]+', html)
        m2 = re.search(r'new-price[^>]*>\s*([^<]+)', html)
        m3 = re.search(r'(R\$\s*[\d.,]+)', html)
        # Product name
        mt = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.S)
        print(url.split('/')[-1])
        print('  title:', (mt.group(1).strip() if mt else '?')[:80])
        print('  USD:', (m.group(0) if m else 'NONE'), '| new-price:', (m2.group(1).strip() if m2 else 'NONE'), '| BRL:', (m3.group(1) if m3 else 'NONE'))
        idx = html.find('availability')
        if idx == -1: idx = html.find('stock')
        if idx != -1:
            print('  availability snippet:', re.sub(r'\s+', ' ', html[idx:idx+300])[:200])
    except Exception as e:
        print(url.split('/')[-1], 'ERROR', e)
