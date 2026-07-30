import fs from 'fs';

const html = fs.readFileSync('scripts/real_product.html', 'utf-8');

// Extract product ID from the page
const prodIdMatch = html.match(/product["']?\s*:\s*\{[^}]*"id"\s*:\s*(\d+)/i);
console.log('Product ID from JSON:', prodIdMatch ? prodIdMatch[1] : 'not found');

// Check if there's a simpler URL pattern
const canonicalMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i);
console.log('Canonical URL:', canonicalMatch ? canonicalMatch[1] : 'not found');

// Check for any JSON-LD or structured data
const jsonld = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
if (jsonld) {
  console.log('JSON-LD found, length:', jsonld[1].length);
  try {
    const data = JSON.parse(jsonld[1]);
    console.log('JSON-LD description:', data.description ? data.description.substring(0, 200) : 'none');
    console.log('JSON-LD name:', data.name);
    console.log('JSON-LD sku:', data.sku);
    console.log('JSON-LD url:', data.url);
  } catch(e) {
    console.log('Could not parse JSON-LD:', e.message);
    console.log(jsonld[1].substring(0, 500));
  }
}
