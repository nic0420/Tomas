import csv
from collections import Counter

with open('public/productos.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    headers = next(reader)
    unique = {}
    cat_counts = Counter()
    for row in reader:
        sku = row[1]
        if sku not in unique:
            unique[sku] = (row[2], row[3])
        cat_counts[row[3]] += 1

print(f'PRODUCTOS ÚNICOS por SKU: {len(unique)}')
print()
cat_unique = Counter(c for _, c in unique.values())
print('Únicos por categoría:')
for cat, count in cat_unique.most_common():
    print(f'  {count:4d}  {cat}')

print()
print('Total filas por categoría (con duplicados):')
for cat, count in cat_counts.most_common():
    print(f'  {count:6d}  {cat}')

print()
print('Primeros 20 productos únicos:')
for sku, (name, cat) in list(unique.items())[:20]:
    print(f'  {sku} | {cat} | {name[:60]}')
