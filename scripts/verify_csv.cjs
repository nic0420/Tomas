const fs = require('fs');
const c = fs.readFileSync('public/productos.csv', 'utf8');

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\r') { /* skip */ }
      else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else field += ch;
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const rows = parseCSV(c).filter(r => r.length && r[0] !== 'id');
console.log('filas:', rows.length);

const ids = new Set();
let dup = 0;
const cat = {};
const bad = [];
for (const r of rows) {
  if (ids.has(r[0])) dup++;
  ids.add(r[0]);
  cat[r[3]] = (cat[r[3]] || 0) + 1;
  if (r.length !== 8) bad.push({ id: r[0], len: r.length, cat: r[3] });
}
console.log('ids duplicados:', dup);
console.log('filas con distinto num de columnas:', bad.length, bad.slice(0, 10));
console.log('categorias:', cat);

let bbs = 0, chumbo = 0, peca = 0;
for (const r of rows) {
  const clean = (r[2] || '').replace(/^"|"$/g, '');
  if (/\bBBS\b/i.test(clean)) bbs++;
  if (/CHUMBO|PELLET|DIABOLO|SLUGS|BALIN/i.test(clean)) chumbo++;
  if (/PECA|PART|INTERNAL|GEARBOX|NOZZLE|SPRING|O-RING|VALVE|PISTON|HOPUP|BARREL/i.test(clean)) peca++;
}
console.log('nombres con BBS:', bbs);
console.log('nombres balines/chumbos/pellets:', chumbo);
console.log('nombres repuestos/partes:', peca);
