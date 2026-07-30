import fs from 'fs';
import Papa from 'papaparse';
import axios from 'axios';
import * as cheerio from 'cheerio';

const csvPath = 'public/productos.csv';
const outPath = 'public/productos.csv.tmp';

async function fetchRealSku(productId) {
  try {
    const res = await axios.get(`https://www.arsenalsports.com/produto/-${productId}.html`, { timeout: 10000 });
    const $ = cheerio.load(res.data);
    const sku = $('.product-sku').text().trim();
    if (sku) return sku;
    // fallback
    const textSku = $('*:contains("SKU:")').text().match(/SKU:\s*([^\s]+)/);
    if (textSku && textSku[1]) return textSku[1];
    return productId;
  } catch (e) {
    console.error(`Failed to fetch SKU for ${productId}:`, e.message);
    return productId;
  }
}

async function main() {
  const csvData = fs.readFileSync(csvPath, 'utf8');
  
  const parsed = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
  });
  
  const rows = parsed.data;
  console.log(`Found ${rows.length} products to process.`);
  
  const skuCache = new Map();
  let processed = 0;
  
  // Collect all unique product IDs
  const uniqueIds = new Set();
  for (const row of rows) {
    if (row.sku && row.sku !== 'sku') {
      uniqueIds.add(row.sku);
    }
  }
  
  console.log(`Unique SKUs to fetch: ${uniqueIds.size}`);
  
  const uniqueIdsArray = Array.from(uniqueIds);
  const chunkSize = 20;
  for (let i = 0; i < uniqueIdsArray.length; i += chunkSize) {
    const chunk = uniqueIdsArray.slice(i, i + chunkSize);
    const promises = chunk.map(async (productId) => {
      const realSku = await fetchRealSku(productId);
      skuCache.set(productId, realSku);
      console.log(`Product ${productId} -> Real SKU: ${realSku}`);
    });
    
    await Promise.all(promises);
    processed += chunk.length;
    console.log(`Fetched ${processed}/${uniqueIdsArray.length} unique SKUs`);
  }
  
  // Apply the mappings to all rows
  for (const row of rows) {
    if (row.sku && row.sku !== 'sku') {
      if (skuCache.has(row.sku)) {
        row.sku = skuCache.get(row.sku);
      }
    }
  }
  
  const newCsv = Papa.unparse(rows);
  fs.writeFileSync(outPath, newCsv);
  fs.renameSync(outPath, csvPath);
  console.log('Done! Updated productos.csv with real SKUs');
}

main().catch(console.error);
