import axios from 'axios';
import * as cheerio from 'cheerio';
import { createObjectCsvWriter } from 'csv-writer';

const CATEGORIES = [
  { name: 'Airsoft', url: 'https://www.arsenalsports.com/produtos/airsoft/filter?d=103' },
  { name: 'Airgun', url: 'https://www.arsenalsports.com/produtos/airgun/filter?d=34' },
  { name: 'Paintball', url: 'https://www.arsenalsports.com/produtos/paintball/filter?d=307' },
  { name: 'Óptica e Iluminación', url: 'https://www.arsenalsports.com/produtos/otica-e-iluminacao/filter?d=273' },
  { name: 'Fitness & Recovery', url: 'https://www.arsenalsports.com/produtos/fitness--recovery/filter?d=1271' },
  { name: 'Outdoor & Survival', url: 'https://www.arsenalsports.com/produtos/boat-fishing-energy--survival/filter?d=540' },
  { name: 'Deportes y Ocio', url: 'https://www.arsenalsports.com/produtos/esportes-e-lazer/filter?d=1551' },
  { name: 'Ofertas', url: 'https://www.arsenalsports.com/produtos/ofertas-e-promocoes/filter?d=635' }
];

const csvWriter = createObjectCsvWriter({
  path: 'public/productos.csv',
  header: [
    { id: 'id', title: 'id' },
    { id: 'nombre_producto', title: 'nombre_producto' },
    { id: 'categoria', title: 'categoria' },
    { id: 'imagen_url', title: 'imagen_url' },
    { id: 'precio_usd', title: 'precio_usd' },
    { id: 'descripcion', title: 'descripcion' },
    { id: 'caracteristicas', title: 'caracteristicas' }
  ]
});

const delay = ms => new Promise(res => setTimeout(res, ms));

async function scrapeProductDetails(productUrl) {
  try {
    const response = await axios.get(productUrl);
    const $ = cheerio.load(response.data);
    
    // Arsenal usually puts description and specs in tabs or specific divs.
    // Assuming .descricao-produto or #tab-descricao for description
    // and #tab-caracteristicas for specs.
    let descripcion = $('#tab-descricao').text().trim() || $('.descricao-produto').text().trim();
    let caracteristicas = $('#tab-caracteristicas').text().trim() || $('.caracteristicas-produto').text().trim();
    
    // Fallback if structure is different
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
  const products = [];

  while (hasMore) {
    try {
      const pageUrl = `${category.url}&page=${page}`;
      console.log(`\n[${category.name}] Scraping página ${page}: ${pageUrl}`);
      
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
        
        const imgEl = $(el).find('figure.product-media img').first();
        const imagenUrl = imgEl.attr('src') || '';

        const titleEl = $(el).find('.product-details h3.product-name a').first();
        const productUrl = titleEl.attr('href');
        let titleRaw = titleEl.text().trim();
        titleRaw = titleRaw.replace(/Ref\.:\s*\d+\s*/g, '').trim();

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
            await delay(1500); // 1.5s delay between products to avoid bans
          }

          products.push({
            id,
            nombre_producto: titleRaw,
            categoria: category.name,
            imagen_url: imagenUrl,
            precio_usd: precioUsd,
            descripcion,
            caracteristicas
          });
        }
      }

      console.log(`[${category.name}] Extraídos ${productElements.length} productos de la página ${page}.`);
      page++;
      await delay(2000); // 2s between pages
      
      // SOLO PARA PRUEBAS: Romper después de la página 1
      hasMore = false; 

    } catch (error) {
      console.error(`[${category.name}] Error en página ${page}:`, error.message);
      hasMore = false;
    }
  }

  return products;
}

async function runScraper() {
  console.log('Iniciando Web Scraper PROFUNDO de Arsenal Sports...');
  console.log('ESTE PROCESO PUEDE TARDAR VARIOS MINUTOS U HORAS PORQUE VISITA CADA PRODUCTO INDIVIDUALMENTE.');
  
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
