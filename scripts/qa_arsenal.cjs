/* QA E2E del botón "Revisar Novedades Arsenal" contra PRODUCCIÓN.
   Flujo: login admin → baseline → simular novedad (borrar un ID visto) → detectar → importar → verificar tabla y localStorage. */
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const BASE = 'https://tomas-hazel.vercel.app';
const TARGET_ID = 8345; // AMOEBA AEG M4 AM-014

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^\s*VITE_ADMIN_PASSWORD\s*=\s*(.+)\s*$/);
    if (m) return m[1].trim();
  }
  throw new Error('VITE_ADMIN_PASSWORD no encontrada en .env');
}

let pass = 0;
let fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log(`PASS: ${name}`); }
  else { fail++; console.log(`FAIL: ${name}`); }
}

(async () => {
  const password = loadEnv();
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox'],
  });  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  page.setDefaultTimeout(180000);

  try {
    // 1. Login admin
    await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[type="password"]');
    await page.type('input[type="password"]', password);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {}),
      page.click('button[type="submit"]'),
    ]);
    await page.waitForFunction(() => document.body.textContent.toLowerCase().includes('dashboard'));
    check('Login admin', true);

    // 2. Ir a productos y esperar el botón
    await page.goto(`${BASE}/admin/products`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() =>
      [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Revisar Novedades Arsenal'))
    );
    check('Botón Revisar Novedades Arsenal visible', true);

    // 3. Primera corrida: baseline
    await page.evaluate(() => {
      [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Revisar Novedades Arsenal')).click();
    });
    await page.waitForFunction(() => document.body.textContent.includes('Catálogo base registrado'));
    const baseTxt = await page.evaluate(() => document.body.textContent);
    const mBase = baseTxt.match(/Catálogo base registrado:\s*([\d.,]+) productos/);
    check(`Baseline registra catálogo (${mBase ? mBase[1] : '?'})`, !!mBase && mBase[1].replace(/[.,]/g, '') === '15233');

    // Cerrar modal
    await page.evaluate(() => {
      [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Entendido').click();
    });
    await new Promise((r) => setTimeout(r, 500));

    // 4. Simular novedad: sacar el ID objetivo de los vistos y recargar (rehidratar store)
    const removed = await page.evaluate((id) => {
      const raw = JSON.parse(localStorage.getItem('tomas-admin-storage'));
      const before = raw.state.arsenalSeenIds.length;
      raw.state.arsenalSeenIds = raw.state.arsenalSeenIds.filter((x) => x !== id);
      localStorage.setItem('tomas-admin-storage', JSON.stringify(raw));
      return before - raw.state.arsenalSeenIds.length;
    }, TARGET_ID);
    check('ID objetivo eliminado del registro base', removed === 1);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() =>
      [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Revisar Novedades Arsenal'))
    );

    // 5. Segunda corrida: debe detectar exactamente 1 nuevo con preview
    await page.evaluate(() => {
      [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Revisar Novedades Arsenal')).click();
    });
    await page.waitForFunction(() => document.body.textContent.includes('producto nuevo en Arsenal'));
    const readyTxt = await page.evaluate(() => document.body.textContent);
    check('Detecta 1 producto nuevo', /1 producto nuevo en Arsenal/.test(readyTxt));
    check('Preview muestra el AMOEBA AEG M4', readyTxt.includes('AMOEBA AEG M4 AM-014'));
    check('Preview clasifica como Airsoft', /AIRSOFT/i.test(readyTxt));

    // 6. Importar
    await page.evaluate(() => {
      [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Importar los')).click();
    });
    await page.waitForFunction(() => /Importados? 1 producto nuevo al catálogo/.test(document.body.textContent));
    const doneTxt = await page.evaluate(() => document.body.textContent);
    check('Resumen de importación correcto', /Importados? 1 producto nuevo al catálogo/.test(doneTxt));

    // 7. Verificar en la tabla (buscar por nombre)
    await page.evaluate(() => {
      const inp = document.querySelector('input[placeholder*="Buscar"], input[type="text"]');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(inp, 'AMOEBA');
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForFunction(() => document.body.textContent.includes('ARS-8345'));
    check('Producto importado visible en la tabla (ARS-8345)', true);

    // 8. Verificar localStorage: localProducts + seenIds restaurado
    const stored = await page.evaluate((id) => {
      const s = JSON.parse(localStorage.getItem('tomas-admin-storage')).state;
      const p = (s.localProducts || []).find((x) => x.id === `ARS-${id}`);
      return {
        tieneProducto: !!p,
        producto: p || null,
        seenRestaurado: s.arsenalSeenIds.includes(id),
        totalLocal: (s.localProducts || []).length,
      };
    }, TARGET_ID);
    check('localProducts contiene ARS-8345', stored.tieneProducto);
    if (stored.producto) {
      const p = stored.producto;
      check('sku = id de Arsenal', p.sku === String(TARGET_ID));
      check('categoría Airsoft', p.categoria === 'Airsoft');
      check('precio_usd 210', p.precio_usd === 210);
      check('caracteristicas = URL origen', typeof p.caracteristicas === 'string' && p.caracteristicas.includes('/produto/'));
      check('subcategoria autocalculada', typeof p.subcategoria === 'string' && p.subcategoria.length > 0);
    }
    check('ID vuelto a marcar como visto', stored.seenRestaurado);

    console.log(`\nRESULTADO: ${pass} PASS / ${fail} FAIL`);
  } catch (err) {
    console.error('ERROR:', err.message);
    fail++;
    console.log(`\nRESULTADO: ${pass} PASS / ${fail} FAIL`);
  } finally {
    await browser.close();
  }
  process.exit(fail > 0 ? 1 : 0);
})();
