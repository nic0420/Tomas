import requests

url = 'https://www.arsenalsports.com/produtos/airsoft/filter?d=103&pagina=2'
r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}, timeout=30)
html = r.text

idx = html.find('AGM SPRING SNIPER SVD')
print(html[idx:idx+3000])
