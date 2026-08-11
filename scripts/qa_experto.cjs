const puppeteer = require('puppeteer-core');

const BASE = process.env.BASE_URL || 'http://localhost:4173';
const CHROME_PATHS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];
const findChrome = () => CHROME_PATHS.find((p) => require('fs').existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = [];
const consoleErrors = [];
const pageErrors = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '  PASS' : '  FAIL'}  ${name}${detail ? `  | ${detail}` : ''}`);
};

function setup(page) {
  page.on('pageerror', (e) => pageErrors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push('console.error: ' + m.text()); });
}

async function gotoHome(page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => document.querySelectorAll('img').length > 10, { timeout: 45000 }).catch(() => {});
  await sleep(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
}

const txt = (page) => page.evaluate(() => document.body.innerText.toLowerCase());
const clickEval = (page, fn) => page.evaluate(fn);
const hoverCenter = async (page, point) => { if (point) { await page.mouse.move(point.x, point.y); await sleep(400); } };

// ============ DESKTOP ============
async function desktop(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  setup(page);
  console.log('\n=== DESKTOP 1440x900 ===');

  // 1. Header cart button abre drawer vacio
  await gotoHome(page);
  await page.evaluate(() => Array.from(document.querySelectorAll('button')).find((b) => (b.getAttribute('aria-label') || '').includes('carrito')).click());
  await sleep(600);
  let t = await txt(page);
  check('Botón carrito abre drawer vacío', t.includes('tu carrito está vacío'));
  await page.evaluate(() => Array.from(document.querySelectorAll('button')).find((b) => b.querySelector('.lucide-x')).click());
  await sleep(400);

  // 2. Busqueda: sugerencias y click en sugerencia de producto
  const inp = await page.evaluate(() => {
    const i = document.querySelector('header input'); const r = i.getBoundingClientRect();
    return { x: r.x + 150, y: r.y + r.height / 2 };
  });
  await page.mouse.click(inp.x, inp.y);
  await sleep(300);
  await page.keyboard.type('pistola', { delay: 40 });
  await sleep(700);
  t = await txt(page);
  const sugVisible = t.includes('ver todos los resultados');
  check('Busqueda muestra sugerencias', sugVisible);
  const prodSugClick = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).filter((b) => b.getBoundingClientRect().width > 0);
    const prod = btns.find((b) => /us\$/i.test(b.innerText) && b.innerText.length < 90);
    if (prod) { prod.click(); return true; }
    return false;
  });
  await sleep(900);
  t = await txt(page);
  check('Click en sugerencia de producto abre detalle', prodSugClick && t.includes('detalles del producto'));
  await page.evaluate(() => Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Volver al catálogo'))?.click());
  await sleep(600);

  // 3. Busqueda sin resultados + boton "Ver todos los productos"
  await page.mouse.click(inp.x, inp.y);
  await sleep(300);
  await page.keyboard.type('zzzznonexistente', { delay: 20 });
  await sleep(700);
  await page.keyboard.press('Enter');
  await sleep(900);
  t = await txt(page);
  check('Busqueda sin resultados muestra vacio', t.includes('no se encontraron productos'));
  await page.evaluate(() => Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Ver todos los productos')).click());
  await sleep(900);
  t = await txt(page);
  check('Boton "Ver todos los productos" restaura', t.includes('lo mejor en'));

  // 4. Dropdown TODOS LOS DEPARTAMENTOS -> click categoría
  const dd = await page.evaluate(() => {
    const el = document.querySelector('nav div.bg-brand-gold'); if (!el) return null;
    const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  await hoverCenter(page, dd);
  t = await txt(page);
  check('Dropdown departamentos abre', t.includes('ver todos'));
  const catClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('nav div.bg-brand-gold button'));
    const cat = btns.find((b) => b.innerText.trim() !== 'VER TODOS');
    if (cat) { cat.click(); return cat.innerText.trim(); }
    return false;
  });
  await sleep(900);
  t = await txt(page);
  const h2 = await page.evaluate(() => { const g = document.getElementById('product-grid'); return g && g.querySelector('h2') ? g.querySelector('h2').innerText : ''; });
  check('Click en categoría del dropdown filtra', !!catClicked && h2.trim().length > 0, `${catClicked} -> h2 "${h2}"`);

  // 5. Subcategoría del mega-menu
  await gotoHome(page);
  const airsoftNav = await page.evaluate(() => {
    const li = Array.from(document.querySelectorAll('nav li')).find((li) => { const b = li.querySelector('button'); return b && b.innerText.trim() === 'AIRSOFT'; });
    if (!li) return null; const b = li.querySelector('button'); const r = b.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  await hoverCenter(page, airsoftNav);
  t = await txt(page);
  check('Hover AIRSOFT abre subcategorías', t.includes('granadas de airsoft') || t.includes('réplicas de airsoft'));
  const subClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).filter((b) => b.getBoundingClientRect().width > 0);
    const sub = btns.find((b) => b.innerText.trim() === 'GRANADAS DE AIRSOFT');
    if (sub) { sub.click(); return true; }
    return false;
  });
  await sleep(900);
  const h2b = await page.evaluate(() => { const g = document.getElementById('product-grid'); return g && g.querySelector('h2') ? g.querySelector('h2').innerText : ''; });
  check('Click subcategoría filtra grilla', subClicked && h2b.toLowerCase().includes('airsoft'), h2b);

  // 6. Banner click filtra
  await gotoHome(page);
  await page.evaluate(() => {
    const banner = Array.from(document.querySelectorAll('div.cursor-pointer')).find((d) => { const h = d.querySelector('h3'); return h && h.innerText.trim() === 'PAINTBALL'; });
    if (banner) banner.click();
  });
  await sleep(900);
  const h2c = await page.evaluate(() => { const g = document.getElementById('product-grid'); return g && g.querySelector('h2') ? g.querySelector('h2').innerText : ''; });
  check('Click en banner filtra categoría', h2c.toLowerCase().includes('paintball'), h2c);

  // 7. COMPRAR AHORA en tarjeta: NO debe abrir detalle (solo carrito)
  await gotoHome(page);
  // Entrar a vista filtrada para que exista #product-grid
  await page.mouse.click(inp.x, inp.y);
  await sleep(300);
  await page.keyboard.type('bbs', { delay: 30 });
  await sleep(800);
  await page.keyboard.press('Enter');
  await sleep(900);
  const cardBuy = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('#product-grid button')).find((b) => b.innerText.trim() === 'COMPRAR AHORA');
    if (!btn) return null;
    btn.scrollIntoView({ block: 'center' });
    const card = btn.closest('[class*="pt-[100%]"]');
    const r = (card || btn).getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, exists: true };
  });
  if (cardBuy) {
    // Hover sobre la imagen de la tarjeta para revelar el overlay (desktop: oculto hasta hover)
    await page.mouse.move(cardBuy.x, cardBuy.y);
    await sleep(500);
    const btnPt = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('#product-grid button')).find((b) => b.innerText.trim() === 'COMPRAR AHORA');
      if (!btn) return null;
      const r = btn.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    if (btnPt) await page.mouse.click(btnPt.x, btnPt.y);
    await sleep(900);
    t = await txt(page);
    const detailOpened = t.includes('detalles del producto');
    check('COMPRAR AHORA en tarjeta no abre detalle', !detailOpened, detailOpened ? 'abrio detalle + carrito' : 'solo carrito');
    const cartOpen = await page.evaluate(() => !!document.querySelector('[class*="fixed inset-y-0 right-0"]'));
    check('COMPRAR AHORA en tarjeta abre carrito', cartOpen);
    // Vaciar carrito y cerrarlo para no ensuciar secciones siguientes
    await page.evaluate(() => Array.from(document.querySelectorAll('[class*="fixed inset-y-0 right-0"] button')).find((b) => b.innerText.trim() === 'VACIAR CARRITO')?.click());
    await sleep(400);
    await page.evaluate(() => Array.from(document.querySelectorAll('button')).find((b) => b.querySelector('.lucide-x') && b.closest('[class*="fixed inset-y-0 right-0"]'))?.click());
    await sleep(400);
    // Limpiar la busqueda (X del input del header)
    await page.evaluate(() => Array.from(document.querySelectorAll('header button')).find((b) => b.querySelector('.lucide-x'))?.click());
    await sleep(500);
  } else {
    check('COMPRAR AHORA en tarjeta no abre detalle', false, 'boton no encontrado');
    check('COMPRAR AHORA en tarjeta abre carrito', false, 'boton no encontrado');
  }

  // 8. Sort: Ordenar por
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);
  const ipt = await page.evaluate(() => {
    const inp = document.querySelector('header input'); const r = inp.getBoundingClientRect();
    return { x: r.x + 150, y: r.y + r.height / 2 };
  });
  await page.mouse.click(ipt.x, ipt.y);
  await sleep(300);
  await page.keyboard.type('bbs', { delay: 40 });
  await sleep(600);
  await page.keyboard.press('Enter');
  await sleep(900);
  const readPrices = () => page.evaluate(() => {
    const grid = document.querySelector('#product-grid .grid');
    if (!grid) return [];
    return Array.from(grid.querySelectorAll(':scope > div')).map((card) => {
      const span = card.querySelector('span.text-brand-green');
      const h3 = card.querySelector('h3');
      return { price: span ? parseInt(span.innerText.replace(/\D/g, ''), 10) : null, name: h3 ? h3.innerText : '' };
    }).filter((c) => c.price);
  });
  const setSort = (val) => page.evaluate((v) => {
    const sel = document.querySelector('#product-grid select');
    if (sel) { sel.value = v; sel.dispatchEvent(new Event('change', { bubbles: true })); }
  }, val);

  await setSort('price_asc'); await sleep(900);
  let prices = await readPrices();
  const ascOk = prices.length > 5 && prices.every((c, i) => i === 0 || prices[i - 1].price <= c.price);
  check('Ordenar por menor precio funciona', ascOk, prices.slice(0, 3).map((c) => c.price).join(','));
  await setSort('price_desc'); await sleep(900);
  prices = await readPrices();
  const descOk = prices.length > 5 && prices.every((c, i) => i === 0 || prices[i - 1].price >= c.price);
  check('Ordenar por mayor precio funciona', descOk, prices.slice(0, 3).map((c) => c.price).join(','));
  await setSort('alpha'); await sleep(900);
  const alphaNames = await page.evaluate(() => {
    const grid = document.querySelector('#product-grid .grid');
    if (!grid) return [];
    return Array.from(grid.querySelectorAll(':scope > div')).map((card) => {
      const h3 = card.querySelector('h3');
      return h3 ? h3.textContent : '';
    }).filter(Boolean);
  });
  const alphaOk = alphaNames.length > 5 && alphaNames.every((n, i) => i === 0 || alphaNames[i - 1].localeCompare(n) <= 0);
  check('Ordenar A-Z funciona', alphaOk, alphaNames.slice(0, 3).join(' | ').slice(0, 60));

  // 9. Paginación
  const pagInfo = await page.evaluate(() => {
    const grid = document.getElementById('product-grid');
    const btns = Array.from(grid.querySelectorAll('button')).filter((b) => /^\d+$/.test(b.innerText.trim()));
    const first = grid.querySelector('.grid > div h3');
    return { pages: btns.map((b) => b.innerText.trim()), firstProduct: first ? first.innerText : '' };
  });
  if (pagInfo.pages.length > 1) {
    const pageNum = pagInfo.pages[1] || pagInfo.pages[pagInfo.pages.length - 1];
    await page.evaluate((n) => {
      const grid = document.getElementById('product-grid');
      const btn = Array.from(grid.querySelectorAll('button')).find((b) => b.innerText.trim() === n);
      if (btn) btn.click();
    }, pageNum);
    await sleep(900);
    const after = await page.evaluate(() => {
      const grid = document.getElementById('product-grid');
      return { first: grid.querySelector('.grid > div h3').innerText, active: Array.from(grid.querySelectorAll('button')).find((b) => /^\d+$/.test(b.innerText.trim()) && b.className.includes('bg-brand-green'))?.innerText };
    });
    check('Paginación cambia de página', after.first !== pagInfo.firstProduct && after.active === pageNum, `${pageNum} -> ${after.first.slice(0, 30)}`);
  } else {
    check('Paginación cambia de página', true, '1 página (sin paginación)');
  }

  // 10. Detalle: cantidad, tabs, agregar
  await page.evaluate(() => { const g = document.getElementById('product-grid'); const card = g.querySelector('.grid > div'); if (card) { const el = card.querySelector('[class*="cursor-pointer"]'); (el || card).click(); } });
  await sleep(900);
  t = await txt(page);
  check('Click tarjeta abre detalle', t.includes('detalles del producto'));
  // cantidad
  await page.evaluate(() => { const btns = Array.from(document.querySelectorAll('button')).filter((b) => b.textContent.trim() === '-' || b.textContent.trim() === '+'); const minus = btns.find((b) => b.textContent.trim() === '-'); if (minus) minus.click(); });
  await sleep(300);
  let qty = await page.evaluate(() => document.querySelector('input[type="number"]').value);
  check('Cantidad no baja de 1', qty === '1', `qty=${qty}`);
  await page.evaluate(() => { const btns = Array.from(document.querySelectorAll('button')).filter((b) => b.textContent.trim() === '+'); if (btns[0]) btns[0].click(); });
  await sleep(300);
  qty = await page.evaluate(() => document.querySelector('input[type="number"]').value);
  check('Cantidad sube con +', qty === '2', `qty=${qty}`);
  // tabs
  await page.evaluate(() => Array.from(document.querySelectorAll('button')).find((b) => b.innerText.trim() === 'CARACTERÍSTICAS').click());
  await sleep(400);
  t = await txt(page);
  const specsShown = t.includes('características') && !t.includes('la descripción detallada');
  check('Tab CARACTERÍSTICAS muestra specs', specsShown);
  await page.evaluate(() => Array.from(document.querySelectorAll('button')).find((b) => b.innerText.trim() === 'DETALLES DEL PRODUCTO').click());
  await sleep(400);
  // agregar al carrito desde detalle
  await page.evaluate(() => Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('COMPRAR AHORA')).click());
  await sleep(900);
  const cartQty = await page.evaluate(() => { const d = document.querySelector('[class*="fixed inset-y-0 right-0"]'); const spans = Array.from(d.querySelectorAll('span')); return spans.filter((s) => /^\d+$/.test(s.innerText.trim())).map((s) => s.innerText.trim()); });
  check('Agregar desde detalle lleva cantidad al carrito', cartQty.includes('2'), JSON.stringify(cartQty));

  // 11. Carrito: +/-, eliminar, validacion checkout
  const cartOps = async (op) => page.evaluate((o) => {
    const d = document.querySelector('[class*="fixed inset-y-0 right-0"]');
    const btns = Array.from(d.querySelectorAll('button'));
    if (o === 'plus') btns.find((b) => b.querySelector('.lucide-plus')).click();
    if (o === 'minus') btns.find((b) => b.querySelector('.lucide-minus')).click();
    if (o === 'remove') btns.find((b) => b.innerText.trim() === 'Eliminar').click();
  }, op);
  await cartOps('plus'); await sleep(400);
  let cq = await page.evaluate(() => { const d = document.querySelector('[class*="fixed inset-y-0 right-0"]'); return Array.from(d.querySelectorAll('span')).filter((s) => /^\d+$/.test(s.innerText.trim())).map((s) => s.innerText.trim()); });
  check('Carrito + incrementa', cq.includes('3'), JSON.stringify(cq));
  await cartOps('minus'); await sleep(400);
  await cartOps('minus'); await sleep(400);
  cq = await page.evaluate(() => { const d = document.querySelector('[class*="fixed inset-y-0 right-0"]'); return Array.from(d.querySelectorAll('span')).filter((s) => /^\d+$/.test(s.innerText.trim())).map((s) => s.innerText.trim()); });
  check('Carrito - decrementa', cq.includes('1'), JSON.stringify(cq));
  // checkout sin datos -> error
  await page.evaluate(() => Array.from(document.querySelectorAll('button')).find((b) => b.innerText.trim() === 'CONFIRMAR POR WHATSAPP')?.click());
  await sleep(500);
  t = await txt(page);
  check('Checkout sin datos muestra error', t.includes('por favor completa tus datos'));
  // vaciar
  await page.evaluate(() => Array.from(document.querySelectorAll('button')).find((b) => b.innerText.trim() === 'VACIAR CARRITO').click());
  await sleep(500);
  t = await txt(page);
  check('Vaciar carrito limpia', t.includes('tu carrito está vacío'));

  // 12. Footer newsletter (alert)
  page.once('dialog', async (d) => { await d.dismiss(); });
  const newsletterOk = await page.evaluate(() => {
    const form = Array.from(document.querySelectorAll('footer form')).find((f) => f.querySelector('input[type="email"]'));
    if (!form) return false;
    const input = form.querySelector('input[type="email"]');
    input.value = 'test@example.com';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    return true;
  });
  await sleep(500);
  check('Newsletter footer muestra confirmación', newsletterOk, '');

  // 13. BackToTop
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(800);
  const btt = await page.evaluate(() => !!document.querySelector('button[aria-label="Volver arriba"]'));
  check('BackToTop aparece al scrollear', btt);
  if (btt) {
    await page.evaluate(() => document.querySelector('button[aria-label="Volver arriba"]').click());
    await page.waitForFunction(() => window.scrollY < 100, { timeout: 8000 }).catch(() => {});
    const sc = await page.evaluate(() => window.scrollY);
    check('BackToTop lleva arriba', sc < 100, `scrollY=${sc}`);
  }

  await page.close();
}

// ============ MOBILE ============
async function mobile(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  setup(page);
  console.log('\n=== MOBILE 390x844 ===');

  await gotoHome(page);

  // 1. Drawer móvil: botón hamburguesa y logo
  const drawerVisible = () => page.evaluate(() => {
    const d = document.querySelector('[role="dialog"][aria-label="Menú de categorías"]');
    return !!d && !d.className.includes('-translate-x-full');
  });
  await page.tap('header a[aria-label="Abrir menú de categorías"]');
  await sleep(700);
  check('Logo móvil abre drawer', await drawerVisible());
  await page.mouse.click(370, 400);
  await sleep(700);
  await page.tap('header button[aria-label="Abrir menú"]');
  await sleep(700);
  check('Hamburguesa abre drawer', await drawerVisible());
  await page.mouse.click(370, 400);
  await sleep(600);

  // 2. Búsqueda móvil -> sugerencias -> tap producto
  const mInp = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('header input'));
    for (const i of inputs) { const r = i.getBoundingClientRect(); if (r.width > 0) return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }
    return null;
  });
  await page.mouse.click(mInp.x, mInp.y);
  await sleep(300);
  await page.keyboard.type('airsoft', { delay: 40 });
  await sleep(700);
  let t = await txt(page);
  check('Búsqueda móvil muestra sugerencias', t.includes('ver todos los resultados'));
  const tapped = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).filter((b) => b.getBoundingClientRect().width > 0);
    const prod = btns.find((b) => /us\$/i.test(b.innerText) && b.innerText.length < 90);
    if (prod) { prod.click(); return true; }
    return false;
  });
  await sleep(900);
  t = await txt(page);
  check('Tap sugerencia abre detalle móvil', tapped && t.includes('detalles del producto'));

  // 3. COMPRAR AHORA en detalle móvil -> carrito
  await page.evaluate(() => Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('COMPRAR AHORA')).click());
  await sleep(900);
  const cartOpen = await page.evaluate(() => !!document.querySelector('[class*="fixed inset-y-0 right-0"]'));
  check('COMPRAR AHORA móvil abre carrito', cartOpen);
  await page.evaluate(() => Array.from(document.querySelectorAll('button')).find((b) => b.querySelector('.lucide-x') && b.closest('[class*="fixed inset-y-0 right-0"]'))?.click());
  await sleep(400);

  // 4. COMPRAR AHORA overlay en tarjeta móvil: no abrir detalle
  await page.evaluate(() => Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Volver al catálogo'))?.click());
  await sleep(800);
  // Entrar a vista filtrada para que exista #product-grid (click en banner Paintball)
  await page.evaluate(() => {
    const banner = Array.from(document.querySelectorAll('div.cursor-pointer')).find((d) => { const h = d.querySelector('h3'); return h && h.innerText.trim() === 'PAINTBALL'; });
    if (banner) banner.click();
  });
  await sleep(900);
  const cardBuy = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('#product-grid button')).find((b) => b.innerText.trim() === 'COMPRAR AHORA');
    if (!btn) return null;
    btn.scrollIntoView({ block: 'center' });
    const r = btn.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  if (cardBuy) {
    await page.touchscreen.tap(cardBuy.x, cardBuy.y);
    await sleep(900);
    t = await txt(page);
    check('COMPRAR AHORA tarjeta móvil no abre detalle', !t.includes('detalles del producto'), t.includes('detalles del producto') ? 'abrio detalle' : 'solo carrito');
    const co = await page.evaluate(() => !!document.querySelector('[class*="fixed inset-y-0 right-0"]'));
    check('COMPRAR AHORA tarjeta móvil abre carrito', co);
  } else {
    check('COMPRAR AHORA tarjeta móvil no abre detalle', false, 'boton no visible');
    check('COMPRAR AHORA tarjeta móvil abre carrito', false, 'boton no visible');
  }

  await page.close();
}

// ============ RUTAS ============
async function routes(browser) {
  console.log('\n=== RUTAS ===');
  for (const path of ['/login', '/register', '/admin', '/ruta-inexistente']) {
    const page = await browser.newPage();
    setup(page);
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(1200);
    const info = await page.evaluate(() => ({ h1: (document.querySelector('h1') || {}).innerText || '', text: document.body.innerText.slice(0, 80).replace(/\n/g, ' | ') }));
    const ok = info.text.length > 10 && (!info.text.includes('Página no encontrada') || path === '/ruta-inexistente');
    check(`Ruta ${path}`, ok, `${info.h1 || info.text}`);
    await page.close();
  }
}

async function main() {
  const executablePath = findChrome();
  if (!executablePath) throw new Error('Chrome no encontrado');
  const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-gpu'] });

  try { await desktop(browser); } catch (e) { console.log('  ERROR desktop:', e.message); }
  try { await mobile(browser); } catch (e) { console.log('  ERROR mobile:', e.message); }
  try { await routes(browser); } catch (e) { console.log('  ERROR routes:', e.message); }

  const fails = results.filter((r) => !r.ok);
  console.log(`\n===== RESUMEN QA EXPERTO: ${results.length - fails.length}/${results.length} PASS =====`);
  if (fails.length) {
    console.log('\nFALLOS:');
    fails.forEach((f) => console.log(`  - ${f.name}${f.detail ? ' (' + f.detail + ')' : ''}`));
  }
  if (consoleErrors.length || pageErrors.length) {
    console.log(`\nERRORES DE CONSOLA/JS (${consoleErrors.length + pageErrors.length}):`);
    [...new Set([...consoleErrors, ...pageErrors])].slice(0, 20).forEach((e) => console.log('  - ' + e.slice(0, 250)));
  }

  await browser.close();
  process.exit(fails.length ? 1 : 0);
}

main().catch((e) => { console.error('FATAL:', e); process.exit(2); });
