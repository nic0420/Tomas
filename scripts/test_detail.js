import axios from 'axios';
import * as cheerio from 'cheerio';

async function test() {
  const url = 'https://www.arsenalsports.com/produto/-amoeba-aeg-m4-am014-carbine-airsoft-rifle-black-8345.html';
  const res = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    timeout: 15000
  });
  const $ = cheerio.load(res.data);

  let desc = $('#product-tab-description').text().trim();
  let carac = $('#product-tab-additional').text().trim();

  console.log('=== DESCRIPCION (primeros 300 chars) ===');
  console.log(desc.substring(0, 300));
  console.log('\n=== CARACTERISTICAS ===');
  console.log(carac);
  
  // Test with simple ID-based URL
  console.log('\n\n=== Testing ID-only URL ===');
  const url2 = 'https://www.arsenalsports.com/produto/8345.html';
  const res2 = await axios.get(url2, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    timeout: 15000
  });
  const $2 = cheerio.load(res2.data);
  let desc2 = $2('#product-tab-description').text().trim();
  let carac2 = $2('#product-tab-additional').text().trim();
  console.log('Desc length:', desc2.length);
  console.log('Carac:', carac2.substring(0, 200));
}

test().catch(e => console.error('Error:', e.message));
