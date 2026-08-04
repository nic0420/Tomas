import requests
import re

html = requests.get('https://www.arsenalsports.com/', headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}, timeout=60).text

# Top-level categories in the vertical-menu (Toda Loja): <li> > <a href=".../produtos/<slug>/filter?d=N">NAME</a> then <ul class="megamenu"
top = re.findall(r'<li>\s*<a style="text-decoration: none" href="https://www\.arsenalsports\.com/produtos/([^/]+)/filter\?d=(\d+)"[^>]*>\s*(?:<img[^>]*>)?\s*([^<]+?)\s*</a>\s*<ul class="megamenu"', html, re.S)
for slug, d, name in top:
    print(f'{d}: {name.strip()}  (/{slug}/)')
