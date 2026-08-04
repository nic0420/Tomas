const fs = require('fs');

function normalizeText(text) {
  if (!text) return '';
  return String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const SYNONYMS = {
  'balines': ['bbs', 'bb', 'pellet', 'pellets', 'chumbo', 'chumbos', 'proyectil', 'proyectiles', 'perdigon', 'perdigones', 'diabolo', 'esfera'],
  'balin': ['bbs', 'bb', 'pellet', 'pellets', 'chumbo', 'chumbos', 'proyectil', 'proyectiles', 'perdigon', 'perdigones', 'diabolo', 'esfera'],
  'bbs': ['bb', 'pellet', 'pellets', 'chumbo', 'chumbos', 'proyectil', 'proyectiles', 'bolinha'],
  'bb': ['bbs', 'pellet', 'pellets', 'chumbo', 'chumbos'],
  'repuesto': ['part', 'parts', 'peca', 'pecas', 'pieza', 'piezas', 'spare', 'replacement', 'reposicao', 'accesorio', 'acessorios', 'internal', 'kit'],
  'repuestos': ['part', 'parts', 'peca', 'pecas', 'pieza', 'piezas', 'spare', 'replacement', 'reposicao', 'accesorio', 'acessorios', 'internal', 'kit'],
};

function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
      else field += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\r') { }
      else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else field += ch;
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const rows = parseCSV(fs.readFileSync('public/productos.csv', 'utf8')).filter(r => r.length >= 2 && r[0] !== 'id');

const products = rows.map(r => ({
  id: r[0], sku: r[1], nombre_producto: r[2], categoria: r[3],
  imagen_url: r[4], precio_usd: r[5], descripcion: r[6], caracteristicas: r[7]
}));

function buildSearchString(p) {
  return normalizeText(`${p.nombre_producto} ${p.categoria} ${p.descripcion} ${p.caracteristicas} ${p.sku || ''}`);
}

function containsWord(text, word) {
  if (!word) return false;
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`).test(text);
}

function searchCurrent(query) {
  const terms = normalizeText(query).split(/\s+/).filter(Boolean);
  return products.filter(p => {
    const s = buildSearchString(p);
    return terms.every(t => {
      const alts = [t, ...(SYNONYMS[t] || [])];
      return alts.some(a => containsWord(s, a));
    });
  });
}

for (const q of ['balines', 'bbs', 'bb', 'repuestos', 'chumbo', 'pellet']) {
  const r = searchCurrent(q);
  console.log(q.padEnd(10), '=>', r.length);
}

// Check false positives: 'bb' matching GBB/blowback
const bb = searchCurrent('bb');
const falsePos = bb.filter(p => /gbb|blowback/i.test(p.nombre_producto) && !/\bBBS\b/i.test(p.nombre_producto) && !/\bBB\b/i.test(p.nombre_producto));
console.log('\n"bb" resultados que son GBB/blowback (falsos positivos):', falsePos.length);
// Inspect where the match comes from for one
if (falsePos[0]) {
  const p = falsePos[0];
  const s = buildSearchString(p);
  const name = normalizeText(p.nombre_producto);
  console.log('  -', p.nombre_producto.substring(0, 60));
  console.log('    name has standalone bb/bbs:', /\b(bb|bbs)\b/.test(name), '| desc has:', /\b(bb|bbs)\b/.test(normalizeText(p.descripcion || '')), '| feats has:', /\b(bb|bbs)\b/.test(normalizeText(p.caracteristicas || '')));
  const m = s.match(/.{20}\bbb\b.{20}/i) || s.match(/.{20}\bbbs\b.{20}/i);
  if (m) console.log('    match ctx:', JSON.stringify(m[0]));
}
