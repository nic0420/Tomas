import requests, re, time

CATS = [
    ('airsoft', 103, 'Airsoft'),
    ('airgun', 34, 'Airgun'),
    ('paintball', 307, 'Paintball'),
    ('otica-e-iluminacao', 273, 'Optica'),
    ('fitness--recovery', 1271, 'Fitness'),
    ('boat-fishing-energy--survival', 540, 'Outdoor'),
    ('relogios', 1631, 'Relojes'),
    ('esportes-e-lazer', 1551, 'Deportes'),
    ('marcadores-nao-letais--defesa-pessoal', 1563, 'Marcadores'),
    ('produtos-cocacola', 1679, 'CocaCola'),
    ('ofertas-e-promocoes', 635, 'Ofertas'),
]

for slug, d, name in CATS:
    got = None
    for attempt in range(6):
        try:
            r = requests.get(f'https://www.arsenalsports.com/produtos/{slug}/filter?d={d}&pagina=1', headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'}, timeout=60)
            m = re.search(r'(\d+)\s*de\s*(\d+)\s*item', r.text, re.S)
            if m:
                got = m.group(2)
                break
        except Exception:
            pass
        time.sleep(6 * (attempt + 1))
    print(f'{d}: {name} -> {got if got else "N/A"}')
