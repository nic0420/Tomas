# -*- coding: utf-8 -*-
from deep_translator import GoogleTranslator

t = GoogleTranslator(source='pt', target='es')
tests = [
    "Rifle de pressão de alta precisão, ideal para tiro esportivo.",
    "Características: material de alta qualidade, resistente à água.",
]
try:
    r = t.translate(tests[0])
    print('OK single:', r)
except Exception as e:
    print('FAIL single:', type(e).__name__, str(e)[:120])

try:
    r = t.translate_batch(tests)
    print('OK batch:', r)
except Exception as e:
    print('FAIL batch:', type(e).__name__, str(e)[:120])
