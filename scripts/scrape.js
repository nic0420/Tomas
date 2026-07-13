import axios from 'axios';
import * as cheerio from 'cheerio';
import { createObjectCsvWriter } from 'csv-writer';

// Categorías principales de Arsenal Sports
const CATEGORIES = [
  { name: 'Airsoft', url: 'https://www.arsenalsports.com/produtos/airsoft/filter?d=103' },
  // Descomenta para añadir más categorías al scraper final
  // { name: 'Airgun', url: 'https://www.arsenalsports.com/produtos/airgun/filter?d=34' },
  // { name: 'Paintball', url: 'https://www.arsenalsports.com/produtos/paintball/filter?d=307' }
];

const csvWriter = createObjectCsvWriter({
  path: 'productos.csv',
  header: [
    { id: 'id', title: 'id' },
    { id: 'nombre_producto', title: 'nombre_producto' },
    { id: 'categoria', title: 'categoria' },
    { id: 'imagen_url', title: 'imagen_url' },
    { id: 'precio_usd', title: 'precio_usd' }
  ]
});

// Función para pausar la ejecución (delay)
const delay = ms => new Promise(res => setTimeout(res, ms));

async function scrapeCategory(category) {
  let page = 1;
  let hasMore = true;
  const products = [];

  while (hasMore) {
    try {
      const pageUrl = `${category.url}&page=${page}`;
      console.log(`[${category.name}] Scraping página ${page}: ${pageUrl}`);
      
      const response = await axios.get(pageUrl);
      const $ = cheerio.load(response.data);
      
      const productElements = $('.product');
      
      if (productElements.length === 0) {
        console.log(`[${category.name}] No hay más productos en la página ${page}. Fin de la categoría.`);
        hasMore = false;
        break;
      }

      productElements.each((i, el) => {
        // Extraer imagen
        const imgEl = $(el).find('figure.product-media img').first();
        const imagenUrl = imgEl.attr('src') || '';

        // Extraer título
        const titleEl = $(el).find('.product-details h3.product-name a').first();
        let titleRaw = titleEl.text().trim();
        // Limpiar el texto (suele venir con "Ref.: XXXXX \n TITULO")
        titleRaw = titleRaw.replace(/Ref\.:\s*\d+\s*/g, '').trim();

        // Extraer precio
        const priceEl = $(el).find('.product-price ins.new-price').first();
        let priceStr = priceEl.text().trim(); // ej: "USD 249,00"
        
        // Formatear a número flotante
        let precioUsd = 0;
        if (priceStr.includes('USD')) {
          priceStr = priceStr.replace('USD', '').trim();
          // Reemplazar coma por punto para el parseo
          priceStr = priceStr.replace('.', '').replace(',', '.');
          precioUsd = parseFloat(priceStr) || 0;
        }

        // Generar un ID simple basado en el timestamp y el index
        const id = `${Date.now()}_${i}`;

        if (titleRaw && precioUsd > 0) {
          products.push({
            id: id,
            nombre_producto: titleRaw,
            categoria: category.name,
            imagen_url: imagenUrl,
            precio_usd: precioUsd
          });
        }
      });

      console.log(`[${category.name}] Extraídos ${productElements.length} productos de la página ${page}.`);
      
      page++;
      // Delay de 2 segundos para evitar bloqueos por rate-limiting
      await delay(2000);
      
      // SOLO PARA PRUEBAS: Romper después de la página 1.
      // Descomentar lo siguiente para un scraping completo.
      hasMore = false; 

    } catch (error) {
      console.error(`[${category.name}] Error en página ${page}:`, error.message);
      hasMore = false;
    }
  }

  return products;
}

async function runScraper() {
  console.log('Iniciando Web Scraper de Arsenal Sports...');
  let allProducts = [];

  for (const cat of CATEGORIES) {
    const catProducts = await scrapeCategory(cat);
    allProducts = allProducts.concat(catProducts);
  }

  console.log(`\nScraping completado. Total de productos extraídos: ${allProducts.length}`);
  
  if (allProducts.length > 0) {
    await csvWriter.writeRecords(allProducts);
    console.log('Archivo "productos.csv" generado correctamente.');
  } else {
    console.log('No se extrajeron productos.');
  }
}

runScraper();
