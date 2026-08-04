import axios from 'axios';
import * as cheerio from 'cheerio';

const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };

const url = 'https://www.arsenalsports.com/produtos/airsoft/filter?d=103&pagina=1';
const response = await axios.get(url, { headers: HEADERS, timeout: 20000 });
const $ = cheerio.load(response.data);

const productEls = $('div.product');
console.log('Productos en página:', productEls.length);

let shown = 0;
for (let i = 0; i < productEls.length; i++) {
  const el = $(productEls[i]);
  const linkEl = el.find('h3.product-name a').first();
  const href = linkEl.attr('href');
  const rawTitle = linkEl.text().trim();
  const title = rawTitle.replace(/^\s*Ref\.?\s*:\s*\d+\s*/i, '').trim();
  const imgSrc = el.find('figure.product-media img').first().attr('src');
  const priceText = el.find('ins.new-price').first().text();
  const m = (href || '').match(/-(\d+)\.html$/);
  const ref = rawTitle.match(/Ref\.?\s*:\s*(\d+)/i);
  if (shown < 8) {
    console.log({ title: title.substring(0, 50), ref: ref && ref[1], href: (href || '').substring(0, 70), img: (imgSrc || '').substring(0, 60), priceText });
  }
  shown++;
}
console.log('Total mostrados:', shown);
