import axios from 'axios';
import * as cheerio from 'cheerio';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';

const CATEGORIES = [
  { name: 'Airsoft', url: 'https://www.arsenalsports.com/produtos/airsoft/filter?d=103' },
  { name: 'Airgun', url: 'https://www.arsenalsports.com/produtos/airgun/filter?d=34' },
  { name: 'Paintball', url: 'https://www.arsenalsports.com/produtos/paintball/filter?d=307' },
  { name: 'Óptica e Iluminación', url: 'https://www.arsenalsports.com/produtos/otica-e-iluminacao/filter?d=273' },
  { name: 'Outdoor & Survival', url: 'https://www.arsenalsports.com/produtos/boat-fishing-energy--survival/filter?d=540' },
  { name: 'Ofertas', url: 'https://www.arsenalsports.com/produtos/ofertas-e-promocoes/filter?d=635' }
];

const CSV_PATH = 'public/productos.csv';
const fileExists = fs.existsSync(CSV_PATH);

let existingTitles = new Set();
if (fileExists) {
  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = content.split('\n');
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(',');
    if (parts.length > 1) {
      let title = parts[1];
      if (title.startsWith('"')) {
        const match = line.match(/^[^,]+,"([^"]+)"/);
        if (match) title = match[1];
      }
      existingTitles.add(title.trim());
    }
  }
  console.log(`Encontrados ${existingTitles.size} productos ya scrapeados. Se omitirán para retomar desde donde quedó.`);
}

const csvWriter = createObjectCsvWriter({
  path: CSV_PATH,
  header: [
    { id: 'id', title: 'id' },
    { id: 'nombre_producto', title: 'nombre_producto' },
    { id: 'categoria', title: 'categoria' },
    { id: 'imagen_url', title: 'imagen_url' },
    { id: 'precio_usd', title: 'precio_usd' },
    { id: 'descripcion', title: 'descripcion' },
    { id: 'caracteristicas', title: 'caracteristicas' }
  ],
  append: fileExists
});

const delay = ms => new Promise(res => setTimeout(res, ms));

async function scrapeProductDetails(productUrl) {
  try {
    const response = await axios.get(productUrl);
    const $ = cheerio.load(response.data);
    
    let descripcion = $('#tab-descricao').text().trim() || $('.descricao-produto').text().trim();
    let caracteristicas = $('#tab-caracteristicas').text().trim() || $('.caracteristicas-produto').text().trim();
    
    if (!descripcion) descripcion = "La descripción de este producto se actualizará próximamente.";
    if (!caracteristicas) caracteristicas = "Las características se actualizarán próximamente.";
    
    return { descripcion, caracteristicas };
  } catch (error) {
    console.error(`Error scrapeando detalles de ${productUrl}:`, error.message);
    return { 
      descripcion: "Error al cargar la descripción.", 
      caracteristicas: "Error al cargar características." 
    };
  }
}

async function scrapeCategory(category) {
  let page = 1;
  let hasMore = true;
  let scrapedCount = 0;

  while (hasMore) {
    try {
      const pageUrl = `${category.url}&page=${page}`;
      console.log(`\n[${category.name}] Revisando página ${page}: ${pageUrl}`);
      
      const response = await axios.get(pageUrl);
      const $ = cheerio.load(response.data);
      
      const productElements = $('.product');
      
      if (productElements.length === 0) {
        console.log(`[${category.name}] No hay más productos. Fin de la categoría.`);
        hasMore = false;
        break;
      }

      for (let i = 0; i < productElements.length; i++) {
        const el = productElements[i];
        
        const titleEl = $(el).find('.product-details h3.product-name a').first();
        let titleRaw = titleEl.text().trim();
        titleRaw = titleRaw.replace(/Ref\.:\s*\d+\s*/g, '').trim();

        if (existingTitles.has(titleRaw)) {
          console.log(`    -> Saltando (ya scrapeado): ${titleRaw.substring(0,30)}...`);
          continue;
        }

        const imgEl = $(el).find('figure.product-media img').first();
        const imagenUrl = imgEl.attr('src') || '';
        const productUrl = titleEl.attr('href');

        const priceEl = $(el).find('.product-price ins.new-price').first();
        let priceStr = priceEl.text().trim(); 
        
        let precioUsd = 0;
        if (priceStr.includes('USD')) {
          priceStr = priceStr.replace('USD', '').trim();
          priceStr = priceStr.replace('.', '').replace(',', '.');
          precioUsd = parseFloat(priceStr) || 0;
        }

        const id = `${Date.now()}_${i}`;

        if (titleRaw && precioUsd > 0) {
          console.log(`    -> Scrapeando detalles de: ${titleRaw.substring(0,30)}...`);
          
          let descripcion = "";
          let caracteristicas = "";
          
          if (productUrl) {
            const details = await scrapeProductDetails(productUrl);
            descripcion = details.descripcion;
            caracteristicas = details.caracteristicas;
            await delay(1500);
          }

          const product = {
            id,
            nombre_producto: titleRaw,
            categoria: category.name,
            imagen_url: imagenUrl,
            precio_usd: precioUsd,
            descripcion,
            caracteristicas
          };

          await csvWriter.writeRecords([product]);
          existingTitles.add(titleRaw);
          scrapedCount++;
        }
      }

      console.log(`[${category.name}] Progreso en la página ${page}.`);
      page++;
      await delay(2000);

    } catch (error) {
      console.error(`[${category.name}] Error en página ${page}:`, error.message);
      hasMore = false;
    }
  }

  return scrapedCount;
}

async function runScraper() {
  console.log('Iniciando Web Scraper PROFUNDO de Arsenal Sports...');
  console.log('Modo REANUDAR: Se saltarán los productos ya guardados en el CSV.');
  
  let totalScraped = 0;

  for (const cat of CATEGORIES) {
    const count = await scrapeCategory(cat);
    totalScraped += count;
  }

  console.log(`\nScraping completado. Total de NUEVOS productos extraídos hoy: ${totalScraped}`);
}

runScraper();
