import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';

const CATEGORIES = [
  { name: 'Airgun', url: 'https://www.arsenalsports.com/produtos/airgun/filter?d=34' },
  { name: 'Paintball', url: 'https://www.arsenalsports.com/produtos/paintball/filter?d=307' },
  { name: 'Outdoor & Survival', url: 'https://www.arsenalsports.com/produtos/boat-fishing-energy--survival/filter?d=540' }
];

const CSV_PATH = 'public/productos_nuevo.csv';
const LISTING_CHECKPOINT = 'scripts/checkpoint_listing.json';
const DETAILS_CHECKPOINT = 'scripts/checkpoint_details.json';
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function getHtml(url, retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, { headers: HEADERS, timeout: 60000 });
      return response.data;
    } catch (error) {
      console.error(`  [HTTP] Intento ${attempt}/${retries} falló para ${url}: ${error.message}`);
      if (attempt === retries) throw error;
      await delay(5000 * attempt);
    }
  }
}

function parsePrice(text) {
  const match = (text || '').match(/USD\s*([\d.,]+)/);
  if (!match) return null;
  const cleaned = match[1].replace(/\./g, '').replace(',', '.');
  const price = parseFloat(cleaned);
  return isNaN(price) ? null : price;
}

function extractProductId(href, imgSrc) {
  const fromUrl = (href || '').match(/-(\d+)\.html$/);
  if (fromUrl) return fromUrl[1];
  const fromImg = (imgSrc || '').match(/\/img\/(\d+)\/produtos\//);
  if (fromImg) return fromImg[1];
  return null;
}

function parseCards($, productsMap, categoryName) {
  let newCount = 0;
  $('div.product').each((_, el) => {
    const $el = $(el);
    let linkEl = $el.find('h3.product-name a').first();
    let href = linkEl.attr('href');
    let rawTitle = linkEl.text().trim();
    if (!href) {
      const mediaLink = $el.find('figure.product-media a').first();
      href = mediaLink.attr('href');
      rawTitle = (mediaLink.attr('title') || mediaLink.attr('alt') || '').replace(/\s+Arsenal Sports$/i, '').trim();
    }
    const title = rawTitle.replace(/^\s*Ref\.?\s*:\s*\d+\s*/i, '').trim();
    const imgEl = $el.find('figure.product-media img').first();
    const imgSrc = imgEl.attr('src');
    const imgUrl = imgSrc && imgSrc.startsWith('http') ? imgSrc : (imgSrc ? `https://www.arsenalsports.com${imgSrc}` : '');
    const price = parsePrice($el.find('ins.new-price').first().text());
    const productId = extractProductId(href, imgSrc);
    const refMatch = rawTitle.match(/Ref\.?\s*:\s*(\d+)/i);
    const sku = refMatch ? refMatch[1] : (productId || '');

    if (!title || price === null || !productId) {
      console.log(`  [SKIP] ${title ? title.substring(0, 40) : 'sin título'} (price=${price}, id=${productId})`);
      return;
    }
    if (productsMap.has(productId)) return;
    productsMap.set(productId, {
      id: productId,
      sku,
      nombre_producto: title,
      categoria: categoryName,
      imagen_url: imgUrl,
      precio_usd: price,
      descripcion: '',
      caracteristicas: '',
      url: href ? (href.startsWith('http') ? href : `https://www.arsenalsports.com${href}`) : ''
    });
    newCount++;
  });
  return newCount;
}

async function main() {
  let productsMap = new Map();
  if (fs.existsSync(LISTING_CHECKPOINT)) {
    const cp = JSON.parse(fs.readFileSync(LISTING_CHECKPOINT, 'utf-8'));
    for (const [id, p] of Object.entries(cp.products)) productsMap.set(id, p);
    console.log(`Cargado listing previo: ${productsMap.size} productos.`);
  }

  for (const cat of CATEGORIES) {
    let page = 1;
    let maxPage = null;
    while (true) {
      const pageUrl = `${cat.url}&pagina=${page}`;
      console.log(`\n[${cat.name}] Página ${page}`);
      let html;
      try {
        html = await getHtml(pageUrl);
      } catch (error) {
        console.error(`[${cat.name}] No se pudo leer página ${page}. Fin de categoría.`);
        break;
      }
      const $ = cheerio.load(html);
      if ($('div.product').length === 0) break;

      const before = productsMap.size;
      parseCards($, productsMap, cat.name);
      console.log(`  Nuevos en página: ${productsMap.size - before} | Total: ${productsMap.size}`);

      const hrefLinks = [];
      $('.pagination a').each((_, a) => {
        const m = ($(a).attr('href') || '').match(/pagina=(\d+)/);
        if (m) hrefLinks.push(parseInt(m[1], 10));
      });
      maxPage = Math.max(...hrefLinks, page, maxPage || 1);
      console.log(`  Paginación: max=${maxPage}`);
      await delay(1500);
      page++;
      if (page > maxPage) break;
    }
  }

  const listingCheckpoint = { updated: new Date().toISOString(), products: Object.fromEntries(productsMap) };
  fs.writeFileSync(LISTING_CHECKPOINT, JSON.stringify(listingCheckpoint, null, 2));
  console.log(`\nListing guardado: ${productsMap.size} productos.`);

  // Scrape details for products missing them
  const needDetails = Array.from(productsMap.values()).filter(p => !p.descripcion);
  console.log(`\nScrapeando detalles de ${needDetails.length} productos nuevos...`);
  const CONCURRENCY = 2;
  let done = 0;
  async function processProduct(product) {
    if (!product.url) return;
    try {
      const html = await getHtml(product.url);
      const $ = cheerio.load(html);
      let descripcion = $('#product-tab-description').text().trim().replace(/\s+/g, ' ').trim();
      let caracteristicas = $('#product-tab-additional').text().trim().replace(/\s+/g, ' ').trim();
      if (!descripcion) descripcion = 'La descripción de este producto se actualizará próximamente.';
      if (!caracteristicas) caracteristicas = 'Las características se actualizarán próximamente.';
      const skuEl = $('.product-sku').first();
      product.descripcion = descripcion;
      product.caracteristicas = caracteristicas;
      product.sku = skuEl.text().trim() || product.sku;
      done++;
    } catch (error) {
      console.error(`  [ERROR] ${product.nombre_producto.substring(0, 40)}: ${error.message}`);
    }
  }
  for (let i = 0; i < needDetails.length; i += CONCURRENCY) {
    const batch = needDetails.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(p => processProduct(p)));
    if (i + CONCURRENCY < needDetails.length) await delay(900);
  }
  console.log(`Detalles: ${done}/${needDetails.length}`);

  fs.writeFileSync(DETAILS_CHECKPOINT, JSON.stringify({
    updated: new Date().toISOString(),
    products: Object.fromEntries(productsMap)
  }, null, 2));

  const writer = createObjectCsvWriter({
    path: CSV_PATH,
    header: [
      { id: 'id', title: 'id' },
      { id: 'sku', title: 'sku' },
      { id: 'nombre_producto', title: 'nombre_producto' },
      { id: 'categoria', title: 'categoria' },
      { id: 'imagen_url', title: 'imagen_url' },
      { id: 'precio_usd', title: 'precio_usd' },
      { id: 'descripcion', title: 'descripcion' },
      { id: 'caracteristicas', title: 'caracteristicas' }
    ]
  });
  await writer.writeRecords(Array.from(productsMap.values()));
  console.log(`CSV final: ${CSV_PATH} (${productsMap.size} productos)`);
}

main().catch(console.error);
