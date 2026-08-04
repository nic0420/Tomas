# -*- coding: utf-8 -*-
import csv
import time
import json
import re
from deep_translator import GoogleTranslator

CHECKPOINT = 'scripts/translation_checkpoint.json'
with open(CHECKPOINT, 'r', encoding='utf-8') as f:
    translated_map = json.load(f)

with open('public/productos.csv', encoding='utf-8') as f:
    rows = list(csv.reader(f))

uniq = set()
for row in rows[1:]:
    for fi in (6, 7):
        t = row[fi].strip()
        if len(t) >= 10:
            uniq.add(t)

missing = [t for t in uniq if t not in translated_map]
print(f'{len(missing)} pendientes')

MAX_CHUNK = 4500

def chunk_text(text):
    if len(text) <= MAX_CHUNK:
        return [text]
    sentences = re.split(r'(?<=[.;!?])\s+', text)
    chunks = []
    current = ''
    for s in sentences:
        if len(current) + len(s) + 1 > MAX_CHUNK and current:
            chunks.append(current)
            current = s
        else:
            current = current + (' ' if current else '') + s
    if current:
        chunks.append(current)
    return chunks

ok = 0
for i, t in enumerate(missing):
    chunks = chunk_text(t)
    try:
        translated_chunks = []
        for j, c in enumerate(chunks):
            for attempt in range(5):
                try:
                    tr = GoogleTranslator(source='pt', target='es', retries=3)
                    r = tr.translate(c)
                    if r and r.strip():
                        translated_chunks.append(r)
                        break
                except Exception as e:
                    print(f'  [{i}] chunk {j} attempt {attempt}: {type(e).__name__}')
                time.sleep(10 * (attempt + 1))
        if len(translated_chunks) == len(chunks):
            translated_map[t] = ' '.join(translated_chunks)
            ok += 1
            print(f'  [{i}] OK ({len(chunks)} chunks)')
        else:
            print(f'  [{i}] FALLO: {len(translated_chunks)}/{len(chunks)} chunks')
    except Exception as e:
        print(f'  [{i}] error general: {type(e).__name__}')
    time.sleep(2)

with open(CHECKPOINT, 'w', encoding='utf-8') as f:
    json.dump(translated_map, f, ensure_ascii=False)
print(f'traducidos: {ok} | total: {len(translated_map)}')
