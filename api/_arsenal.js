// Lib compartida del scraper de Arsenal Sports.
// Estrategia: el sitemap (/sitemap) enumera todos los productos con su ID en la URL
// (/produto/{slug}-{id}.html). Cada página de producto es server-rendered con
// JSON-LD schema.org/Product (nombre, precio USD, imagen) y breadcrumb con el
// departamento (link /produtos/{slug}/filter?d={id}).

export const ARSENAL_SITEMAP_URL = 'https://www.arsenalsports.com/sitemap';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

// Mapa: id de departamento/subcategoría de Arsenal -> categoría de nuestro catálogo
const DEPT_MAP = {};
const addDept = (categoria, ids) => ids.forEach((id) => { DEPT_MAP[id] = categoria; });
addDept('Airsoft', [103, 124, 114, 104, 163, 176, 184, 191, 229, 214, 423, 424, 256]);
addDept('Airgun', [34, 35, 40, 74, 47, 54, 78]);
addDept('Paintball', [307, 343, 318, 354, 571, 385, 358, 361, 328]);
addDept('Óptica e Iluminación', [273, 1135, 629, 100, 96, 98, 1661, 286, 565, 661, 95, 390, 97, 564]);
addDept('Fitness & Recuperación', [1271, 1429, 1495, 1469, 1399, 1445, 1283]);
addDept('Outdoor & Survival', [540, 1575, 1657, 1645, 1663, 1655, 1665, 1667, 1669, 1593, 1483, 558, 8, 400, 392, 10, 5, 559, 1611]);
addDept('Relojes', [1631]);
addDept('Deportes y Ocio', [1551, 1553, 1555, 1557, 1559, 1561, 1629]);
addDept('Marcadores No Letales', [1563, 1565, 1567, 1569, 1571]);
addDept('Productos Coca-Cola', [1679, 1681, 1683]);
addDept('Ofertas y Promociones', [635, 131]);

// Departamentos de Arsenal sin equivalente en nuestro catálogo: se omiten
export const UNMAPPED_DEPTS = new Set([1, 43, 381, 619]);

async function fetchWithTimeout(url, ms) {
  return fetch(url, {
    headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
    signal: AbortSignal.timeout(ms),
  });
}

// Devuelve [{ id, url }] de todos los productos publicados por Arsenal
export async function fetchArsenalCatalog() {
  const res = await fetchWithTimeout(ARSENAL_SITEMAP_URL, 45000);
  if (!res.ok) throw new Error(`El sitemap de Arsenal respondió HTTP ${res.status}`);
  const text = await res.text();
  const entries = [];
  const re = /<loc>\s*(https:\/\/www\.arsenalsports\.com\/produto\/[^<]+?-\d+\.html)\s*<\/loc>/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const idMatch = m[1].match(/-(\d+)\.html$/);
    if (idMatch) entries.push({ id: parseInt(idMatch[1], 10), url: m[1] });
  }
  if (entries.length === 0) throw new Error('No se pudo leer el catálogo del sitemap de Arsenal.');
  return entries;
}

// Scrapea una página de producto y devuelve los datos normalizados para nuestro catálogo
export async function scrapeArsenalProduct(url) {
  const res = await fetchWithTimeout(url, 20000);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  // 1. JSON-LD Product
  const ldIdx = html.indexOf('application/ld+json');
  if (ldIdx === -1) throw new Error('La página no expone datos de producto (JSON-LD).');
  const ldStart = html.indexOf('{', ldIdx);
  const ldEnd = html.indexOf('</script>', ldIdx);
  let data;
  try {
    data = JSON.parse(html.slice(ldStart, ldEnd));
  } catch {
    throw new Error('JSON-LD de producto inválido.');
  }

  const nombre = String(data.name || '').trim();
  if (!nombre) throw new Error('Producto sin nombre.');

  const precioRaw = String(data.offers?.price ?? '0').replace('.', '').replace(',', '.');
  // "99,00" -> 99.00 ; si viniera "1.299,00" el primer replace quita el miles -> 1299.00
  const precioUsd = parseFloat(precioRaw) || 0;
  // Los productos sin stock se publican con precio "0,00": no sirven para vender.
  if (!(precioUsd > 0)) {
    return { omitido: true, motivo: 'sin precio publicado', url };
  }

  // 2. Departamento desde el breadcrumb. Puede tener varios niveles
  //    (p. ej. 124 réplicas > 147 rifles > 144 AEG): se toma el ID más profundo
  //    que esté mapeado a una categoría nuestra recorriendo de atrás hacia adelante.
  let categoria = null;
  let deptoId = null;
  const bcStart = html.indexOf('class="breadcrumb"');
  if (bcStart !== -1) {
    const bcEnd = html.indexOf('</ul>', bcStart);
    const bc = html.slice(bcStart, bcEnd);
    const ds = [...bc.matchAll(/[?&]d=(\d+)/g)].map((x) => parseInt(x[1], 10));
    for (let i = ds.length - 1; i >= 0; i--) {
      if (DEPT_MAP[ds[i]]) { deptoId = ds[i]; break; }
      if (UNMAPPED_DEPTS.has(ds[i])) { deptoId = ds[i]; break; }
    }
  }
  if (deptoId !== null && UNMAPPED_DEPTS.has(deptoId)) {
    return { omitido: true, motivo: 'categoría sin equivalente', url };
  }
  if (deptoId !== null) categoria = DEPT_MAP[deptoId] || null;

  // El productID/sku interno de Arsenal NO coincide con el ID de la URL del
  // sitemap (p. ej. url -8345.html tiene productID 269216). Se devuelven ambos:
  // urlId como clave de dedup y arsenalId como SKU visible.
  const urlId = Number(url.match(/-(\d+)\.html$/)?.[1]) || 0;
  return {
    omitido: false,
    urlId,
    arsenalId: Number(data.productID) || urlId,
    url,
    nombre,
    precioUsd,
    imagen: data.image || '',
    categoria,
    descripcion: String(data.description || '').trim(),
  };
}
