import requests
import re

ids = ['32187', '35115', '16270']
for pid in ids:
    # find via listing search - fetch the category pages won't be trivial; use Arsenal's own search
    # Arsenal has a search? Let's try the site search
    url = f'https://www.arsenalsports.com/produto?id={pid}'
    r = requests.get(f'https://www.arsenalsports.com/buscar?q={pid}', headers={'User-Agent':'Mozilla/5.0'}, timeout=30)
    print(pid, r.status_code, len(r.text))
    # try google-free: Arsenal search page
    m = re.findall(r'produto/[^"]*-' + pid + r'\.html', r.text)
    print('  links:', set(m))
