import axios from 'axios';
import * as cheerio from 'cheerio';

axios.get('https://www.arsenalsports.com/produto/-33433.html').then(res => {
  const $ = cheerio.load(res.data);
  console.log('SKU:', $('.product-sku').text().trim());
}).catch(e => {
  console.log('Failed:', e.response ? e.response.status : e.message);
});
