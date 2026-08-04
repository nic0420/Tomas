# -*- coding: utf-8 -*-
import csv
import time
import threading
from deep_translator import GoogleTranslator

texts = []
with open('public/productos.csv', encoding='utf-8-sig') as f:
    for row in csv.DictReader(f):
        for k in ('descripcion', 'caracteristicas'):
            t = (row[k] or '').strip()
            if len(t) >= 10:
                texts.append(t)
texts = list(dict.fromkeys(texts))
print(f'unicos: {len(texts)}')

N = 200
sample = texts[:N]
results = [None] * N
failures = []

def worker(worker_id, indices):
    t = GoogleTranslator(source='pt', target='es', retries=2)
    for i in indices:
        try:
            results[i] = t.translate(sample[i])
        except Exception:
            failures.append(i)

start = time.time()
threads = []
NW = 5
for w in range(NW):
    indices = list(range(w, N, NW))
    th = threading.Thread(target=worker, args=(w, indices))
    th.start()
    threads.append(th)
for th in threads:
    th.join()
elapsed = time.time() - start
ok = sum(1 for r in results if r)
print(f'{N} en {elapsed:.1f}s -> {elapsed/N:.2f}s/texto, ok={ok}, fallos={failures}')
print(f'ETA para {len(texts)}: {elapsed/N*len(texts)/60:.1f} min')
