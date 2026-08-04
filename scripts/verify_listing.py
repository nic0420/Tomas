import requests
import re
import csv
import json
from concurrent.futures import ThreadPoolExecutor

CATEGORIES = [
    ('Airsoft', 'https://www.arsenalsports.com/produtos/airsoft/filter?d=103'),
    ('Airgun', 'https://www.arsenalsports.com/produtos/airgun/filter?d=34'),
    ('Paintball', 'https://www.arsenalsports.com/produtos/paintball/filter?d=307'),
    ('Óptica e Iluminación', 'https://www.arsenalsports.com/produtos/otica-e-iluminacao/filter?d=273'),
    ('Outdoor & Survival', 'https://www.arsenalsports.com/produtos/boat-fishing-energy--survival/filter?d=540'),
]

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def get_total(url):
    html = requests.get(url, headers=HEADERS, timeout=30).text
    m = re.search(r'(\d+)\s*de\s*(\d+)\s*item', html, re.S)
    if not m:
        return None
    return int(m.group(2))

def get_page(url, page):
    html = requests.get(f'{url}&pagina={page}', headers=HEADERS, timeout=30).text
    cards = re.findall(r'<div class="product".*?</div>\s*</div>\s*</div>', html, re.S)
    results = []
    for c in cards:
        href = re.search(r'href="([^"]*-(\d+)\.html)"', c)
        price = re.search(r'<ins class="new-price">USD\s*([\d.,]+)</ins>', c)
        pid = href.group(2) if href else None
        if pid:
            results.append((pid, bool(price)))
    # pagination max
    m = re.search(r'pagina=(\d+)"[^>]*>[^<]*Ultima', html, re.S)
    if not m:
        nums = re.findall(r'pagina=(\d+)', html)
        nums = [int(n) for n in nums]
        maxp = max(nums) if nums else page
    else:
        maxp = int(m.group(1))
    return results, maxp

def crawl(name, url):
    total = get_total(url)
    pages = (total + 35) // 36 if total else None
    seen = {}
    page = 1
    while True:
        for attempt in range(4):
            try:
                results, maxp = get_page(url, page)
                break
            except Exception as e:
                print(f'{name} page {page} error (intento {attempt+1}): {e}')
                if attempt == 3:
                    return name, len(seen), None, None
        for pid, has_price in results:
            if pid not in seen:
                seen[pid] = has_price
        print(f'{name} p{page}: {len(results)} cards, cum {len(seen)}')
        page += 1
        if page > maxp:
            break
        if page > 500:
            break
    avail = sum(1 for v in seen.values() if v)
    return name, seen, avail, total

results = []
with ThreadPoolExecutor(max_workers=2) as ex:
    for name, url in CATEGORIES:
        results.append(ex.submit(crawl, name, url).result())

print('\n===== RESUMEN =====')
listing_map = {}
for name, seen, avail, total in results:
    if seen:
        print(f'{name}: vistos={len(seen)}, con_precio={avail}')
        listing_map[name] = seen

# compare with captured CSV
captured_map = {}
with open('public/productos_nuevo.csv', encoding='utf-8') as f:
    for row in csv.DictReader(f):
        cat = row['categoria']
        captured_map.setdefault(cat, {})[row['id']] = row

print('\n===== COMPARACION =====')
for name, seen in listing_map.items():
    cap = captured_map.get(name, {})
    missing = {pid for pid, pr in seen.items() if pr and pid not in cap}
    extra = set(cap) - set(seen)
    print(f'{name}: capturados={len(cap)}, en_listing_con_precio={sum(1 for v in seen.values() if v)}')
    print(f'  FALTAN (con precio, no capturados): {len(missing)}')
    print(f'  EN CSV PERO NO EN LISTING: {len(extra)}')
    with open(f'scripts/missing_{name.replace(" ", "_").replace("Ó", "O")}.json', 'w', encoding='utf-8') as f:
        json.dump(sorted(missing), f, ensure_ascii=False, indent=2)
