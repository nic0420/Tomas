// POST /api/arsenal-scrape
// Body: { urls: string[] } — hasta 8 URLs de productos de Arsenal.
// Scrapea cada página y devuelve los datos listos para importar al catálogo.
import { scrapeArsenalProduct } from './_arsenal.js';

export const maxDuration = 60;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usá POST.' });
  }
  const urls = Array.isArray(req.body?.urls) ? req.body.urls.slice(0, 8) : [];
  if (urls.length === 0) {
    return res.status(400).json({ error: 'Falta el array de URLs.' });
  }
  const products = [];
  const errors = [];
  let omitidos = 0;
  for (const url of urls) {
    try {
      const p = await scrapeArsenalProduct(url);
      if (p.omitido) { omitidos++; continue; }
      products.push(p);
    } catch (err) {
      errors.push({ url, error: err.message });
    }
  }
  return res.status(200).json({ products, errors, omitidos });
}
