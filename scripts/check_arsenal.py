import requests
import re

urls = [
    ('Airsoft', 'https://www.arsenalsports.com/produtos/airsoft/filter?d=103'),
    ('Airgun', 'https://www.arsenalsports.com/produtos/airgun/filter?d=34'),
    ('Paintball', 'https://www.arsenalsports.com/produtos/paintball/filter?d=307'),
    ('Optica', 'https://www.arsenalsports.com/produtos/otica-e-iluminacao/filter?d=273'),
    ('Outdoor', 'https://www.arsenalsports.com/produtos/boat-fishing-energy--survival/filter?d=540'),
    ('Ofertas', 'https://www.arsenalsports.com/produtos/ofertas-e-promocoes/filter?d=635'),
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for name, url in urls:
    try:
        r = requests.get(url, headers=headers, timeout=30)
        html = r.text
        m = re.search(r'<span>(\d+)\s*de\s*(\d+)\s*</span>', html)
        pag = [int(x) for x in re.findall(r'pagina=(\d+)', html)]
        maxpage = max(pag) if pag else 1
        shown, total = (int(m.group(1)), int(m.group(2))) if m else (None, None)
        print(f'{name}: shown={shown} TOTAL_EN_SITIO={total} maxpage={maxpage}')
    except Exception as e:
        print(f'{name}: ERROR {e}')
