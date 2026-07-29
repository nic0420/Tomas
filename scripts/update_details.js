import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
import Papa from 'papaparse';

const CSV_PATH = 'public/productos.csv';

async function extractProductId(imageUrl) {
  const match = imageUrl.match(/\/img\/(\d+)\/produtos\//);
  return match ? match[1] : null;
}

async function fetchProductDetails(productUrl) {
  const response = await axios.get(productUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    timeout: 15000
  });
  const $ = cheerio.load(response.data);

  let descripcion = $('#product-tab-description').text().trim();
  let caracteristicas = $('#product-tab-additional').text().trim();

  const PLACEHOLDER_DESC = 'La descripción de este producto se actualizará próximamente.';
  const PLACEHOLDER_CARAC = 'Las características se actualizarán próximamente.';

  if (!descripcion || descripcion === PLACEHOLDER_DESC) {
    descripcion = $('.product-description').text().trim() || PLACEHOLDER_DESC;
  }
  if (!caracteristicas || caracteristicas === PLACEHOLDER_CARAC) {
    caracteristicas = $('.product-specifications').text().trim() || PLACEHOLDER_CARAC;
  }

  // Clean up whitespace
  descripcion = descripcion.replace(/\s+/g, ' ').trim();
  caracteristicas = caracteristicas.replace(/\s+/g, ' ').trim();

  return { descripcion, caracteristicas };
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('Leyendo CSV existente...');
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
  const records = parsed.data;

  console.log(`Total registros: ${records.length}`);

  const PLACEHOLDER_DESC = 'La descripción de este producto se actualizará próximamente.';
  const PLACEHOLDER_CARAC = 'Las características se actualizarán próximamente.';

  const toUpdate = records.filter(r =>
    r.descripcion === PLACEHOLDER_DESC || r.caracteristicas === PLACEHOLDER_CARAC
  );

  console.log(`Registros con detalles faltantes: ${toUpdate.length}`);

  if (toUpdate.length === 0) {
    console.log('No hay registros por actualizar.');
    return;
  }

  let updated = 0;
  let errors = 0;
  let saved = 0;
  const CONCURRENCY = 3;
  const DELAY_BETWEEN_BATCHES = 1000;
  const SAVE_EVERY = 100;

  async function saveCsv() {
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
    await writer.writeRecords(records);
    saved = updated;
    console.log(`  [CHECKPOINT] CSV guardado (${saved} actualizados hasta ahora)`);
  }

  async function processRecord(record) {
    const prodId = await extractProductId(record.imagen_url);
    if (!prodId) {
      console.log(`  [SKIP] No se pudo extraer ID de: ${record.imagen_url}`);
      errors++;
      return;
    }

    const slug = slugify(record.nombre_producto);
    const productUrl = `https://www.arsenalsports.com/produto/-${slug}-${prodId}.html`;

    try {
      console.log(`  [${updated + 1}/${toUpdate.length}] Fetching: ${record.nombre_producto.substring(0, 40)}...`);
      const details = await fetchProductDetails(productUrl);

      if (details.descripcion && details.descripcion !== PLACEHOLDER_DESC) {
        record.descripcion = details.descripcion;
      }
      if (details.caracteristicas && details.caracteristicas !== PLACEHOLDER_CARAC) {
        record.caracteristicas = details.caracteristicas;
      }

      updated++;
      console.log(`    OK - Desc: ${details.descripcion.substring(0, 50)}... | Carac: ${details.caracteristicas.substring(0, 50)}...`);
    } catch (err) {
      errors++;
      console.log(`    ERROR: ${err.message}`);
    }
  }

  const MAX_RECORDS = parseInt(process.argv[2]) || toUpdate.length;
  const processCount = Math.min(toUpdate.length, MAX_RECORDS);
  console.log(`Procesando ${processCount} registros...`);

  for (let i = 0; i < processCount; i += CONCURRENCY) {
    const batch = toUpdate.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(record => processRecord(record)));

    if (i + CONCURRENCY < processCount) {
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_BATCHES));
    }

    if ((i / CONCURRENCY + 1) % 50 === 0) {
      console.log(`\nProgreso: ${updated + errors}/${processCount} (OK: ${updated}, ERR: ${errors})\n`);
    }

    if (updated - saved >= SAVE_EVERY) {
      await saveCsv();
    }
  }

  console.log(`\nProcesados: ${processCount} | Actualizados: ${updated} | Errores: ${errors}`);

  if (updated > saved) {
    await saveCsv();
    console.log('CSV final guardado exitosamente.');
  } else if (updated === 0) {
    console.log('No hubo actualizaciones.');
  }
}

main().catch(console.error);
