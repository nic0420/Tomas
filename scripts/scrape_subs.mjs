import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

const CSV_PATH = 'public/productos.csv';
const SUBS_CHECKPOINT = 'scripts/checkpoint_subs.json';
const DETAILS_CHECKPOINT = 'scripts/checkpoint_subs_details.json';
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36' };

const SUBCATEGORIES = [
  { name: 'BBS', categoria: 'Airsoft', url: 'https://www.arsenalsports.com/produtos/airsoft-bbs-/filter?d=163' },
  { name: 'GreenGas-CO2-HPA', categoria: 'Airsoft', url: 'https://www.arsenalsports.com/produtos/airsoft-green-gas--co2--hpa/filter?d=176' },
  { name: 'PecasExternas', categoria: 'Airsoft', url: 'https://www.arsenalsports.com/produtos/airsoft-pecas-externas-para-replicas-de-airsoft/filter?d=191' },
  { name: 'PecasInternas', categoria: 'Airsoft', url: 'https://www.arsenalsports.com/produtos/airsoft-pecas-internas-para-replicas-de-airsoft/filter?d=229' },
  { name: 'Granadas', categoria: 'Airsoft', url: 'https://www.arsenalsports.com/produtos/airsoft-granadas-de-airsoft/filter?d=184' },
  { name: 'Magazines', categoria: 'Airsoft', url: 'https://www.arsenalsports.com/produtos/airsoft-magazines-para-replicas-de-airsoft/filter?d=114' },
  { name: 'Baterias', categoria: 'Airsoft', url: 'https://www.arsenalsports.com/produtos/airsoft-baterias--carregadores/filter?d=104' },
  { name: 'Chumbos', categoria: 'Airgun', url: 'https://www.arsenalsports.com/produtos/airgun-chumbos-e-projecteis/filter?d=47' },
  { name: 'PartesAirgun', categoria: 'Airgun', url: 'https://www.arsenalsports.com/produtos/airgun-partes--accessorios/filter?d=78' },
  { name: 'AirgunMagazines', categoria: 'Airgun', url: 'https://www.arsenalsports.com/produtos/airgun-magazines/filter?d=74' },
  { name: 'AirgunHPA', categoria: 'Airgun', url: 'https://www.arsenalsports.com/produtos/airgun-hpa--co2-/filter?d=54' },
];

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function getHtml(url, retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, { headers: HEADERS, timeout: 60000 });
      return response.data;
    } catch (error) {
      console.error(`  [HTTP] Intento ${attempt}/${retries} para ${url}: ${error.message}`);
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

const existingIds = loadExisting();

function loadExisting() {
  const existing = new Set();
  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/\/img\/(\d+)\/produtos\//);
    if (m) existing.add(m[1]);
  }
  console.log(`Productos ya en CSV: ${existing.size}`);
  return existing;
}

function saveCheckpoint(cp) {
  fs.writeFileSync(SUBS_CHECKPOINT, JSON.stringify(cp, null, 2));
}

async function crawlSubcategory(sub, productsMap, pagesDone) {
  let page = 1;
  const done = pagesDone[sub.name] || new Set();
  let lastPageReached = false;

  while (!lastPageReached) {
    if (done.has(page)) {
      const pagLinks = [];
      const hrefLinks = [];
      let html;
      try {
        html = await getHtml(`${sub.url}&pagina=${page}`);
        const $ = cheerio.load(html);
        $('.pagination a').each((_, a) => {
          const m = ($(a).attr('href') || '').match(/pagina=(\d+)/);
          if (m) hrefLinks.push(parseInt(m[1], 10));
          const txt = $(a).text().trim();
          if (/^\d+$/.test(txt)) pagLinks.push(parseInt(txt, 10));
        });
      } catch { }
      const maxPage = Math.max(...pagLinks, ...hrefLinks, page);
      if (page >= maxPage) lastPageReached = true;
      page++;
      continue;
    }

    const pageUrl = `${sub.url}&pagina=${page}`;
    console.log(`\n[${sub.name}] Página ${page}`);
    let html;
    try {
      html = await getHtml(pageUrl);
    } catch (error) {
      console.error(`[${sub.name}] Error en página ${page}. Deteniendo categoría.`);
      break;
    }

    const $ = cheerio.load(html);
    const productEls = $('div.product');
    console.log(`  Productos en página: ${productEls.length}`);

    if (productEls.length === 0) {
      done.add(page);
      saveCheckpoint({ updated: new Date().toISOString(), products: Object.fromEntries(productsMap), pages: pagesDone });
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

      const price = parsePrice(el.find('ins.new-price').first().text());
      const productId = extractProductId(href, imgSrc);
      const refMatch = rawTitle.match(/Ref\.?\s*:\s*(\d+)/i);
      const sku = refMatch ? refMatch[1] : (productId || '');

      if (!title || price === null || !productId) {
        console.log(`  [SKIP] ${title ? title.substring(0, 40) : 'sin título'} (price=${price}, id=${productId})`);
        continue;
      }

      if (productsMap.has(productId)) continue;
      if (existingIds.has(productId)) continue;

      productsMap.set(productId, {
        id: productId,
        sku,
        nombre_producto: title,
        categoria: sub.categoria,
        imagen_url: imgUrl,
        precio_usd: price,
        descripcion: '',
        caracteristicas: '',
        url: href ? (href.startsWith('http') ? href : `https://www.arsenalsports.com${href}`) : ''
      });
      newOnPage++;
    }
    console.log(`  Nuevos en página: ${newOnPage} | Acumulado sub: ${productsMap.size}`);

    const pagLinks = [];
    const hrefLinks = [];
    $('.pagination a').each((_, a) => {
      const m = ($(a).attr('href') || '').match(/pagina=(\d+)/);
      if (m) hrefLinks.push(parseInt(m[1], 10));
      const txt = $(a).text().trim();
      if (/^\d+$/.test(txt)) pagLinks.push(parseInt(txt, 10));
    });
    const maxPage = Math.max(...pagLinks, ...hrefLinks, page);
    console.log(`  Paginación: max=${maxPage}`);

    done.add(page);
    if (page % 5 === 0) saveCheckpoint({ updated: new Date().toISOString(), products: Object.fromEntries(productsMap), pages: pagesDone });

    await delay(900);
    page++;
    if (page > maxPage) lastPageReached = true;
  }

  saveCheckpoint({ updated: new Date().toISOString(), products: Object.fromEntries(productsMap), pages: pagesDone });
  console.log(`[${sub.name}] Terminada (${productsMap.size} acumulados).`);
}

async function scrapeDetails(productsMap) {
  const products = Array.from(productsMap.values()).filter(p => !p.descripcion);
  if (products.length === 0) {
    console.log('  No hay productos sin detalles.');
    return;
  }
  const CONCURRENCY = 3;
  const DELAY_BETWEEN_BATCHES = 700;
  const SAVE_EVERY = 40;

  let done = 0;
  let errors = 0;
  let lastSaved = 0;

  function saveCheckpointDetails() {
    fs.writeFileSync(DETAILS_CHECKPOINT, JSON.stringify({
      updated: new Date().toISOString(),
      products: Object.fromEntries(productsMap)
    }, null, 2));
    lastSaved = done;
    console.log(`  [CHECKPOINT] ${done} procesados, ${productsMap.size} totales.`);
  }

  async function processProduct(product) {
    if (!product.url) { errors++; return; }
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
      console.error(`  [ERROR] ${(product.nombre_producto || '').substring(0, 40)}: ${error.message}`);
    }
  }

  for (let i = 0; i < products.length; i += CONCURRENCY) {
    const batch = products.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(p => processProduct(p)));
    if (i + CONCURRENCY < products.length) await delay(DELAY_BETWEEN_BATCHES);
    if (done - lastSaved >= SAVE_EVERY) saveCheckpointDetails();
  }
  saveCheckpointDetails();
  console.log(`\nDetalles: OK=${done}, ERR=${errors}, total=${products.length}`);
}

async function main() {
  let productsMap = new Map();
  let pagesDone = {};
  for (const sub of SUBCATEGORIES) pagesDone[sub.name] = new Set();

  const resumeMode = process.argv.includes('--resume-details');
  const listingOnly = process.argv.includes('--listing-only');

  if (fs.existsSync(SUBS_CHECKPOINT)) {
    const cp = JSON.parse(fs.readFileSync(SUBS_CHECKPOINT, 'utf-8'));
    for (const [id, p] of Object.entries(cp.products || {})) productsMap.set(id, p);
    if (cp.pages) {
      pagesDone = Object.fromEntries(
        Object.entries(cp.pages).map(([k, v]) => [k, new Set(Array.isArray(v) ? v : Object.values(v))])
      );
    }
    console.log(`Cargado checkpoint subs: ${productsMap.size} productos.`);
  }

  if (resumeMode && fs.existsSync(DETAILS_CHECKPOINT)) {
    const cp = JSON.parse(fs.readFileSync(DETAILS_CHECKPOINT, 'utf-8'));
    for (const [id, p] of Object.entries(cp.products || {})) {
      if (productsMap.has(id)) {
        const merged = { ...productsMap.get(id), ...p };
        productsMap.set(id, merged);
      } else {
        productsMap.set(id, p);
      }
    }
    console.log(`Cargado checkpoint detalles: ${Object.keys(cp.products || {}).length} con detalles aplicados sobre ${productsMap.size} totales.`);
  } else if (!resumeMode) {
    for (const sub of SUBCATEGORIES) {
      await crawlSubcategory(sub, productsMap, pagesDone);
    }
    console.log(`\nListing completo. Nuevos únicos: ${productsMap.size}`);
  }

  if (listingOnly) {
    console.log(`\n[LISTING-ONLY] Total nuevos a scrapear detalles: ${productsMap.size}`);
    return;
  }

  await scrapeDetails(productsMap);

  const products = Array.from(productsMap.values());
  const crlf = fs.readFileSync(CSV_PATH, 'utf-8').endsWith('\r\n') ? '\r\n' : '\n';
  const lines = products.map((p) => {
    return [
      p.id,
      p.sku,
      p.nombre_producto,
      p.categoria,
      p.imagen_url,
      p.precio_usd,
      p.descripcion,
      p.caracteristicas
    ].map((v, i) => {
      if (i === 0 || i === 1 || i === 4 || i === 5) return String(v);
      const s = String(v ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(',');
  });
  fs.appendFileSync(CSV_PATH, crlf + lines.join(crlf) + crlf);
  console.log(`\nCSV actualizado: +${products.length} productos nuevos en ${CSV_PATH}`);
}

main().catch(console.error);
