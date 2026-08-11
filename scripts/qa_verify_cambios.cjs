const puppeteer = require('puppeteer-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://localhost:4173';

(async () => {
  const b = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(BASE, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => document.querySelectorAll('img').length > 10, { timeout: 45000 }).catch(() => {});
  await sleep(1500);

  const results = [];

  // 1. No "cuotas" ni "12x" ni "sin interés" en la home
  const home = await p.evaluate(() => {
    const t = document.body.innerText.toLowerCase();
    return {
      cuotas: t.includes('cuota'),
      docex: t.includes('12x'),
      sinInteres: t.includes('sin interés'),
      disponibilidadBar: t.includes('disponibilidad'),
    };
  });
  results.push({ check: 'Home sin cuotas/12x/sin interés', pass: !home.cuotas && !home.docex && !home.sinInteres, detail: JSON.stringify(home) });
  results.push({ check: 'FeaturesBar muestra DISPONIBILIDAD', pass: home.disponibilidadBar, detail: '' });

  // 2. Card: disponibilidad
  const card = await p.evaluate(() => {
    const t = document.body.innerText.toLowerCase();
    return { disp3dias: t.includes('disponible 3 días después de su compra') };
  });
  results.push({ check: 'Card muestra disponibilidad', pass: card.disp3dias, detail: '' });

  // 3. Abrir detalle y verificar
  await p.evaluate(() => {
    const card = document.querySelector('#product-grid img, [class*="pt-[100%]"] img');
    if (card) { const el = card.closest('[class*="cursor-pointer"]') || card; el.click(); }
  }).catch(() => {});
  await sleep(900);
  const detail = await p.evaluate(() => {
    const t = document.body.innerText.toLowerCase();
    return {
      cuotas: t.includes('cuota'),
      docex: t.includes('12x'),
      sinInteres: t.includes('sin interés'),
      disponible: t.includes('disponible 3 días después de su compra'),
    };
  });
  results.push({ check: 'Detalle: sin cuotas/12x/sin interés', pass: !detail.cuotas && !detail.docex && !detail.sinInteres, detail: JSON.stringify(detail) });
  results.push({ check: 'Detalle: muestra disponibilidad', pass: detail.disponible, detail: '' });

  // 4. Fondo
  const bg = await p.evaluate(() => {
    const root = document.querySelector('.min-h-screen');
    return root ? getComputedStyle(root).backgroundColor : '';
  });
  results.push({ check: 'Fondo oscurecido (no #f4f5f3)', pass: bg && bg !== 'rgb(244, 245, 243)', detail: bg });

  console.log('=== RESULTADOS ===');
  let all = true;
  for (const r of results) { console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.check}${r.detail ? ' | ' + r.detail : ''}`); if (!r.pass) all = false; }
  console.log(all ? 'TODOS PASAN' : 'HAY FALLOS');
  await b.close();
  process.exit(all ? 0 : 1);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
