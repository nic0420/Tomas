import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function inspectHtml() {
  try {
    const url = 'https://www.arsenalsports.com/produtos/airsoft/filter?d=103';
    console.log(`Fetching ${url}...`);
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Attempt to find product elements
    const products = [];
    $('.product, .product-wrap, .item, .grid-item').each((i, el) => {
      // Just extract raw text to see what's inside
      products.push($(el).text().trim().substring(0, 100));
    });

    console.log(`Found ${products.length} potential products.`);
    if (products.length > 0) {
      fs.writeFileSync('./scripts/product_sample.html', $('.product').first().prop('outerHTML') || 'No outerHTML');
      console.log('Saved first product HTML to product_sample.html');
    } else {
      console.log('No elements matched common classes. Saving first 5000 characters of HTML to inspect.html...');
      fs.writeFileSync('./scripts/inspect.html', response.data.substring(0, 5000));
    }

  } catch (error) {
    console.error('Error fetching page:', error.message);
  }
}

inspectHtml();
