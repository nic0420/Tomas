import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';

const CATEGORIES = [
  { name: 'Airsoft', url: 'https://www.arsenalsports.com/produtos/airsoft/filter?d=103' },
  { name: 'Airgun', url: 'https://www.arsenalsports.com/produtos/airgun/filter?d=34' },
  { name: 'Paintball', url: 'https://www.arsenalsports.com/produtos/paintball/filter?d=307' },
  { name: 'Óptica e Iluminación', url: 'https://www.arsenalsports.com/produtos/otica-e-iluminacao/filter?d=273' },
  { name: 'Outdoor & Survival', url: 'https://www.arsenalsports.com/produtos/boat-fishing-energy--survival/filter?d=540' },
  { name: 'Fitness & Recuperación', url: 'https://www.arsenalsports.com/produtos/fitness--recovery/filter?d=1271' },
  { name: 'Relojes', url: 'https://www.arsenalsports.com/produtos/relogios/filter?d=1631' },
  { name: 'Deportes y Ocio', url: 'https://www.arsenalsports.com/produtos/esportes-e-lazer/filter?d=1551' },
  { name: 'Marcadores No Letales', url: 'https://www.arsenalsports.com/produtos/marcadores-nao-letais--defesa-pessoal/filter?d=1563' },
  { name: 'Productos Coca-Cola', url: 'https://www.arsenalsports.com/produtos/produtos-cocacola/filter?d=1679' },
  { name: 'Ofertas y Promociones', url: 'https://www.arsenalsports.com/produtos/ofertas-e-promocoes/filter?d=635' }
];

const CSV_PATH = 'public/productos_nuevo.csv';
const LISTING_CHECKPOINT = 'scripts/checkpoint_listing.json';
const DETAILS_CHECKPOINT = 'scripts/checkpoint_details.json';
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36' };

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

async function crawlListing(category, productsMap, pagesDone) {
  let page = 1;
  const seenOnPage = new Set();
  const done = pagesDone[category.name] || new Set();

  while (true) {
    if (done.has(page)) {
      page++;
      continue;
    }
    const pageUrl = `${category.url}&pagina=${page}`;
    console.log(`\n[${category.name}] Página ${page}`);
    let html;
    try {
      html = await getHtml(pageUrl);
    } catch (error) {
      console.error(`[${category.name}] No se pudo leer la página ${page}. Fin de categoría (se reanudará).`);
      break;
    }

    const $ = cheerio.load(html);
    const productEls = $('div.product');
    console.log(`  Productos en página: ${productEls.length}`);

    if (productEls.length === 0) {
      done.add(page);
      saveListingCheckpoint(productsMap, pagesDone);
      break;
    }

    let newOnPage = 0;
    for (let i = 0; i < productEls.length; i++) {
      const el = $(productEls[i]);
      let linkEl = el.find('h3.product-name a').first();
      let href = linkEl.attr('href');
      let rawTitle = linkEl.text().trim();
      if (!href) {
        const mediaLink = el.find('figure.product-media a').first();
        href = mediaLink.attr('href');
        rawTitle = (mediaLink.attr('title') || mediaLink.attr('alt') || '').replace(/\s+Arsenal Sports$/i, '').trim();
      }
      const title = rawTitle.replace(/^\s*Ref\.?\s*:\s*\d+\s*/i, '').trim();

      const imgEl = el.find('figure.product-media img').first();
      const imgSrc = imgEl.attr('src');
      const imgUrl = imgSrc && imgSrc.startsWith('http') ? imgSrc : (imgSrc ? `https://www.arsenalsports.com${imgSrc}` : '');

      const priceEl = el.find('ins.new-price').first();
      const price = parsePrice(priceEl.text());

      const productId = extractProductId(href, imgSrc);
      const refMatch = rawTitle.match(/Ref\.?\s*:\s*(\d+)/i);
      const sku = refMatch ? refMatch[1] : (productId || '');

      if (!title || price === null || !productId) {
        console.log(`  [SKIP] ${title ? title.substring(0, 40) : 'sin título'} (price=${price}, id=${productId})`);
        continue;
      }

      if (seenOnPage.has(productId)) {
        console.log(`  [DUP en página] ${title.substring(0, 40)}`);
        continue;
      }
      seenOnPage.add(productId);

      if (productsMap.has(productId)) {
        continue;
      }

      productsMap.set(productId, {
        id: productId,
        sku,
        nombre_producto: title,
        categoria: category.name,
        imagen_url: imgUrl,
        precio_usd: price,
        descripcion: '',
        caracteristicas: '',
        url: href ? (href.startsWith('http') ? href : `https://www.arsenalsports.com${href}`) : ''
      });
      newOnPage++;
    }
    console.log(`  Nuevos en página: ${newOnPage} | Total acumulado: ${productsMap.size}`);

    // Check if this is the last page
    const pagLinks = [];
    $('.pagination a.page-link').each((_, a) => {
      const txt = $(a).text().trim();
      if (/^\d+$/.test(txt)) pagLinks.push(parseInt(txt, 10));
    });
    const hrefLinks = [];
    $('.pagination a').each((_, a) => {
      const m = ($(a).attr('href') || '').match(/pagina=(\d+)/);
      if (m) hrefLinks.push(parseInt(m[1], 10));
    });
    const maxPage = Math.max(...pagLinks, ...hrefLinks, page);
    console.log(`  Paginación detectada: max=${maxPage}`);

    done.add(page);
    if (page % 5 === 0 || page === maxPage) {
      saveListingCheckpoint(productsMap, pagesDone);
    }

    await delay(1200);
    page++;

    if (page > maxPage) break;
  }

  saveListingCheckpoint(productsMap, pagesDone);
  console.log(`Checkpoint de listing guardado (${productsMap.size} productos).`);
}

function saveListingCheckpoint(productsMap, pagesDone) {
  const checkpoint = {
    updated: new Date().toISOString(),
    products: Object.fromEntries(productsMap),
    pages: Object.fromEntries(Object.entries(pagesDone).map(([k, v]) => [k, Array.from(v)]))
  };
  fs.writeFileSync(LISTING_CHECKPOINT, JSON.stringify(checkpoint, null, 2));
}

async function scrapeDetails(productsMap) {
  const products = Array.from(productsMap.values()).filter(p => !p.descripcion);
  if (products.length === 0) {
    console.log('  No hay productos sin detalles.');
    return;
  }
  const CONCURRENCY = 3;
  const DELAY_BETWEEN_BATCHES = 900;
  const SAVE_EVERY = 50;

  let done = 0;
  let errors = 0;
  let lastSaved = 0;

  function saveCheckpoint() {
    fs.writeFileSync(DETAILS_CHECKPOINT, JSON.stringify({
      updated: new Date().toISOString(),
      products: Object.fromEntries(products.map(p => [p.id, p]))
    }, null, 2));
    lastSaved = done;
    console.log(`  [CHECKPOINT] ${done} productos con detalles procesados.`);
  }

  async function processProduct(product) {
    if (!product.url) {
      errors++;
      return;
    }
    try {
      const html = await getHtml(product.url);
      const $ = cheerio.load(html);

      let descripcion = $('#product-tab-description').text().trim();
      let caracteristicas = $('#product-tab-additional').text().trim();

      descripcion = descripcion.replace(/\s+/g, ' ').trim();
      caracteristicas = caracteristicas.replace(/\s+/g, ' ').trim();

      if (!descripcion) descripcion = 'La descripción de este producto se actualizará próximamente.';
      if (!caracteristicas) caracteristicas = 'Las características se actualizarán próximamente.';

      const skuEl = $('.product-sku').first();
      const sku = skuEl.text().trim() || product.sku;

      product.descripcion = descripcion;
      product.caracteristicas = caracteristicas;
      product.sku = sku;

      done++;
      if (done % 25 === 0) console.log(`  Progreso: ${done}/${products.length} (${(100 * done / products.length).toFixed(0)}%)`);
    } catch (error) {
      errors++;
      console.error(`  [ERROR] ${product.nombre_producto.substring(0, 40)}: ${error.message}`);
    }
  }

  for (let i = 0; i < products.length; i += CONCURRENCY) {
    const batch = products.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(p => processProduct(p)));

    if (i + CONCURRENCY < products.length) {
      await delay(DELAY_BETWEEN_BATCHES);
    }

    if (done - lastSaved >= SAVE_EVERY) {
      saveCheckpoint();
    }
  }

  saveCheckpoint();
  console.log(`\nDetalles: OK=${done}, ERR=${errors}, total=${products.length}`);
}

async function main() {
  let productsMap = new Map();
  let pagesDone = {};
  for (const cat of CATEGORIES) pagesDone[cat.name] = new Set();

  // Resume from listing checkpoint if exists
  if (fs.existsSync(LISTING_CHECKPOINT)) {
    const cp = JSON.parse(fs.readFileSync(LISTING_CHECKPOINT, 'utf-8'));
    for (const [id, p] of Object.entries(cp.products || {})) {
      productsMap.set(id, p);
    }
    if (cp.pages) {
      pagesDone = Object.fromEntries(
        Object.entries(cp.pages).map(([k, v]) => [k, new Set(v)])
      );
    }
    console.log(`Cargado listing previo: ${productsMap.size} productos.`);
  }

  const resumeMode = process.argv.includes('--resume-details');

  if (!resumeMode) {
    // Fresh listing crawl (or continue pages if checkpoint has products)
    for (const cat of CATEGORIES) {
      await crawlListing(cat, productsMap, pagesDone);
    }
    console.log(`\nListing completo. Total únicos: ${productsMap.size}`);
  } else {
    // Resume details mode: load details checkpoint
    if (fs.existsSync(DETAILS_CHECKPOINT)) {
      const cp = JSON.parse(fs.readFileSync(DETAILS_CHECKPOINT, 'utf-8'));
      productsMap = new Map(Object.entries(cp.products));
      console.log(`Cargado checkpoint de detalles: ${productsMap.size} productos.`);
    }
  }

  // Scrape details for products missing them
  await scrapeDetails(productsMap);

  // Write final CSV
  const products = Array.from(productsMap.values());
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
  await writer.writeRecords(products);
  console.log(`\nCSV final escrito: ${CSV_PATH} (${products.length} productos)`);
}

main().catch(console.error);
