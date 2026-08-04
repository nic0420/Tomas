import csv
from collections import Counter
import datetime

with open('public/productos.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    headers = next(reader)
    ts_counts = Counter()
    per_cat = {}
    for row in reader:
        cat = row[3]
        idpart = row[0].split('_')[0]
        if not idpart.isdigit():
            continue
        ts = int(idpart)
        ts_counts[ts] += 1
        per_cat.setdefault(cat, Counter())[ts] += 1

print('Timestamps distintos (ondas de scrape) y filas por onda:')
for ts, count in sorted(ts_counts.items()):
    dt = datetime.datetime.fromtimestamp(ts / 1000)
    print(f'  {dt}  ->  {count} filas')

print()
for cat, tsc in per_cat.items():
    distinct = len(tsc)
    waves = {datetime.datetime.fromtimestamp(ts/1000).strftime('%Y-%m-%d %H:%M'): c for ts, c in sorted(tsc.items())}
    print(f'{cat}: {distinct} ondas -> {waves}')
