import requests
import re

MISSING = {
    'Airgun': ['32187', '32188', '32617', '33447', '34888', '35122', '35123'],
    'Paintball': ['15507', '20416', '31376', '35115', '35118', '559', '7029'],
    'Outdoor & Survival': ['16270', '27736', '30139', '31479', '32145', '33183'],
}

CATS = {
    'Airgun': ('https://www.arsenalsports.com/produtos/airgun/filter?d=34', 19),
    'Paintball': ('https://www.arsenalsports.com/produtos/paintball/filter?d=307', 6),
    'Outdoor & Survival': ('https://www.arsenalsports.com/produtos/boat-fishing-energy--survival/filter?d=540', 8),
}

def card_boundaries(html):
    # find div.product cards via stack of divs
    out = []
    start = 0
    while True:
        s = html.find('<div class="product"', start)
        if s == -1:
            break
        depth = 0
        i = s
        while i < len(html):
            o = html.find('<div', i)
            c = html.find('</div>', i)
            if o == -1:
                break
            if c == -1 or o < c:
                depth += 1
                i = o + len('<div')
            else:
                depth -= 1
                i = c + len('</div>')
                if depth == 0:
                    break
        out.append(html[s:i])
        start = i
    return out

for cat, (url, maxp) in CATS.items():
    found = {pid: None for pid in MISSING[cat]}
    import time
    for page in range(1, maxp + 1):
        if all(found.values()):
            break
        html = None
        for attempt in range(6):
            try:
                html = requests.get(f'{url}&pagina={page}', headers={'User-Agent': 'Mozilla/5.0'}, timeout=90).text
                break
            except Exception as e:
                print(f'  {cat} p{page} intento {attempt+1} fallo: {type(e).__name__}')
                time.sleep(5 * (attempt + 1))
        if html is None:
            print(f'  {cat} p{page} NO se pudo descargar, siguiendo')
            continue
        cards = card_boundaries(html)
        for card in cards:
            m = re.search(r'-(\d+)\.html"', card)
            if not m:
                continue
            pid = m.group(1)
            if pid in found and found[pid] is None:
                found[pid] = (page, card)
        print(f'{cat} p{page}: checked {len(cards)} cards')
    for pid, info in found.items():
        if info is None:
            print(f'{cat} {pid}: NO ENCONTRADO')
        else:
            page, card = info
            print(f'{cat} {pid}: pagina {page}')
            print(re.sub(r'\s+', ' ', card)[:800])
            print('---')
