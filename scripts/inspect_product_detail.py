import requests

html = requests.get('https://www.arsenalsports.com/produto/agm-spring-sniper-svd-dragunov-airsoft-rifle-black-26632.html', headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}, timeout=30).text
idx = html.find('id="product-tab-additional"')
print(html[idx:idx+2000].replace('\n', ' '))
