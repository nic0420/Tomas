// POST /api/arsenal-check
// Body: { knownIds: number[] } — IDs de Arsenal ya registrados/importados.
// Compara contra el sitemap y devuelve los productos nuevos.
import { fetchArsenalCatalog } from './_arsenal.js';

export const maxDuration = 60;
export const config = { api: { bodyParser: { sizeLimit: '2mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usá POST.' });
  }
  try {
    const knownIds = Array.isArray(req.body?.knownIds) ? req.body.knownIds : [];
    const known = new Set(knownIds);
    const catalog = await fetchArsenalCatalog();

    // Primera ejecución: se devuelve el listado completo de IDs para registrar
    // el catálogo actual como base (sin importar nada).
    if (known.size === 0) {
      return res.status(200).json({
        primeraVez: true,
        totalArsenal: catalog.length,
        idsBase: catalog.map((e) => e.id),
      });
    }

    const nuevos = catalog.filter((e) => !known.has(e.id));
    return res.status(200).json({
      primeraVez: false,
      totalArsenal: catalog.length,
      totalNuevos: nuevos.length,
      nuevos: nuevos.slice(0, 300),
    });
  } catch (err) {
    console.error('arsenal-check error:', err.message);
    return res.status(500).json({ error: err.message || 'Error revisando el catálogo de Arsenal.' });
  }
}
