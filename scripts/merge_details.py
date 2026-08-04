import json
import csv
import sys

# Merge: listing checkpoint (4,177 products) + old CSV (3,228 with descriptions)
listing = json.load(open('scripts/checkpoint_listing.json', encoding='utf-8'))['products']

old = {}
with open('public/productos_nuevo.csv', encoding='utf-8-sig') as f:
    for row in csv.DictReader(f):
        old[row['id']] = row

filled = 0
for pid, p in listing.items():
    if pid in old:
        o = old[pid]
        if not p.get('descripcion') and o.get('descripcion'):
            p['descripcion'] = o['descripcion']
            p['caracteristicas'] = o.get('caracteristicas', '')
            if o.get('sku'):
                p['sku'] = o['sku']
            filled += 1

need = sum(1 for p in listing.values() if not p.get('descripcion'))
print(f'Productos: {len(listing)} | descripciones restauradas: {filled} | sin descripcion (a scrapear): {need}')

# Merge with existing details checkpoint for the ~51 already processed
det_path = 'scripts/checkpoint_details.json'
try:
    det = json.load(open(det_path, encoding='utf-8'))['products']
except Exception:
    det = {}
for pid, p in det.items():
    if p.get('descripcion') and pid in listing:
        listing[pid]['descripcion'] = p['descripcion']
        listing[pid]['caracteristicas'] = p['caracteristicas']

need2 = sum(1 for p in listing.values() if not p.get('descripcion'))
print(f'Despues de merge con details: sin descripcion: {need2}')

out = {'updated': '', 'products': listing}
with open(det_path, 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False)
print('details checkpoint actualizado')
