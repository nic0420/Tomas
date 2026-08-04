# -*- coding: utf-8 -*-
import csv
import time
import sys
import os
import json
import threading
from deep_translator import GoogleTranslator

SRC = 'public/productos.csv'
DST = 'public/productos_es.csv'
CHECKPOINT = 'scripts/translation_checkpoint.json'
N_WORKERS = 5
MAX_PASSES = 5

translator_cache = {}

def make_translator():
    return GoogleTranslator(source='pt', target='es', retries=2)

translated_map = {}
if os.path.exists(CHECKPOINT):
    try:
        with open(CHECKPOINT, 'r', encoding='utf-8') as f:
            translated_map = json.load(f)
        print(f'Checkpoint cargado: {len(translated_map)} textos ya traducidos.')
    except Exception:
        pass

with open(SRC, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    headers = next(reader)
    rows = list(reader)

unique_texts = {}
for i, row in enumerate(rows):
    for fi in (6, 7):
        txt = row[fi].strip()
        if len(txt) >= 10:
            unique_texts.setdefault(txt, []).append((i, fi))

pending = [t for t in unique_texts if t not in translated_map]
print(f'Filas: {len(rows)} | únicos: {len(unique_texts)} | pendientes: {len(pending)}')

lock = threading.Lock()
stats = {'ok': 0, 'fail': 0}
last_save = [0]

def save_checkpoint():
    with lock:
        with open(CHECKPOINT, 'w', encoding='utf-8') as f:
            json.dump(translated_map, f, ensure_ascii=False)

def maybe_save():
    if stats['ok'] - last_save[0] >= 100:
        last_save[0] = stats['ok']
        save_checkpoint()
        print(f'  [checkpoint] {stats["ok"]} traducidos', flush=True)

def run_pass(batch, pass_no):
    failures = []
    fail_lock = threading.Lock()

    def worker(indices):
        t = make_translator()
        for i in indices:
            txt = batch[i]
            ok = False
            for attempt in range(3):
                try:
                    r = t.translate(txt)
                    if r and r.strip():
                        with lock:
                            translated_map[txt] = r
                            stats['ok'] += 1
                        ok = True
                        break
                except Exception:
                    pass
                time.sleep(2 * (attempt + 1))
            if not ok:
                with fail_lock:
                    failures.append(txt)
            maybe_save()

    threads = []
    for w in range(N_WORKERS):
        indices = list(range(w, len(batch), N_WORKERS))
        th = threading.Thread(target=worker, args=(indices,))
        th.start()
        threads.append(th)
    for th in threads:
        th.join()

    save_checkpoint()
    print(f'  Pass {pass_no}: ok={stats["ok"]} acumulado, fallos en este pass={len(failures)}')
    return failures

t0 = time.time()
current = pending
for pass_no in range(1, MAX_PASSES + 1):
    if not current:
        break
    print(f'Pass {pass_no}: {len(current)} textos pendientes')
    current = run_pass(current, pass_no)
    elapsed = (time.time() - t0) / 60
    print(f'  elapsed={elapsed:.1f}min')

save_checkpoint()
print(f'Traducción final: {len(translated_map)}/{len(unique_texts)} textos en {(time.time()-t0)/60:.1f}min')
print(f'Quedaron sin traducir: {len([t for t in unique_texts if t not in translated_map])}')

for i, row in enumerate(rows):
    for fi in (6, 7):
        txt = row[fi].strip()
        if txt in translated_map:
            row[fi] = translated_map[txt]

with open(DST, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(headers)
    writer.writerows(rows)

print(f'Archivo escrito: {DST}')
