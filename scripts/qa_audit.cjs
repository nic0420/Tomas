const puppeteer = require('puppeteer-core');

const BASE = process.env.BASE_URL || 'https://tomas-hazel.vercel.app';
const CHROME_PATHS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];
const findChrome = () => require('fs').existsSync ? CHROME_PATHS.find((p) => require('fs').existsSync(p)) : null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = [];
const check = (section, name, ok, detail = '') => {
  results.push({ section, name, ok, detail });
  console.log(`${ok ? '  PASS' : '  FAIL'}  [${section}] ${name}${detail ? `  -> ${detail}` : ''}`);
};

function setup(page, errors) {
  page.on('pageerror', (e) => errors.push({ type: 'pageerror', text: e.message }));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push({ type: 'console', text: m.text() });
  });
}

async function waitForProducts(page) {
  await page.waitForFunction(() => document.querySelectorAll('img').length > 10, { timeout: 45000 }).catch(() => {});
  await sleep(1200);
}

async function auditDesktop(browser) {
  const errors = [];
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  setup(page, errors);

  console.log('\n=== DESKTOP 1440x900 ===');
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitForProducts(page);

  // 1. Header y layout
  const header = await page.evaluate(() => ({
    logo: document.body.innerText.includes('TOMMY') && document.body.innerText.includes('GUNS'),
    navTodos: Array.from(document.querySelectorAll('span')).some((s) => s.innerText.includes('TODOS LOS DEPARTAMENTOS')),
    categoryNav: document.body.innerText.includes('AIRSOFT'),
    cartButton: !!Array.from(document.querySelectorAll('button')).find((b) => (b.getAttribute('aria-label') || '').includes('carrito')),
    hasHero: document.body.innerText.includes('PRODUCTO DESTACADO') || document.body.innerText.includes('Cargando destacados'),
    heroDots: document.querySelectorAll('button[aria-label^="Ir a la diapositiva"]').length,
  }));
  check('DESKTOP', 'Header + nav + carrito + hero render', header.logo && header.navTodos && header.categoryNav && header.cartButton && header.hasHero, JSON.stringify(header));

  // 2. Overflow horizontal
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check('DESKTOP', 'Sin overflow horizontal', overflow <= 1, `px extra: ${overflow}`);

  // 3. Hero slider arrows
  const heroSlide = async () => page.evaluate(() => {
    const active = document.querySelector('button[aria-label^="Ir a la diapositiva"]');
    const dots = Array.from(document.querySelectorAll('button[aria-label^="Ir a la diapositiva"]'));
    return dots.findIndex((d) => d.className.includes('w-8'));
  });
  const before = await heroSlide();
  const nextBtn = await page.$('button[aria-label="Siguiente"]');
  if (nextBtn) { await nextBtn.click(); await sleep(600); }
  const after = await heroSlide();
  check('DESKTOP', 'Flechas del HeroSlider funcionan', before !== after && after !== -1, `${before} -> ${after}`);

  // 4. Brands carousel arrow
  const brandsBefore = await page.evaluate(() => {
    const el = document.querySelectorAll('button[aria-label="Marcas siguientes"]')[0];
    return !!el;
  });
  check('DESKTOP', 'Carrusel de marcas con flechas', brandsBefore);

  // 5. Dropdown "TODOS LOS DEPARTAMENTOS" abre y selecciona categoría
  const ddTrigger = await page.evaluate(() => {
    const el = document.querySelector('nav div.bg-brand-gold');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  let ddOpened = false;
  if (ddTrigger) {
    await page.mouse.move(ddTrigger.x, ddTrigger.y);
    await sleep(600);
    ddOpened = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button')).some((b) => b.innerText.trim() === 'AIRSOFT' && b.className.includes('uppercase'))
    );
  }
  check('DESKTOP', 'Dropdown TODOS LOS DEPARTAMENTOS abre', !!ddTrigger && ddOpened);

  // click category via hover + click sobre la nav horizontal (más confiable)
  const navAirsoft = await page.evaluate(() => {
    const li = Array.from(document.querySelectorAll('nav li')).find((li) => {
      const b = li.querySelector('button');
      return b && b.innerText.trim() === 'AIRSOFT';
    });
    if (!li) return null;
    const b = li.querySelector('button');
    const r = b.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  if (navAirsoft) {
    await page.mouse.move(navAirsoft.x, navAirsoft.y);
    await sleep(500);
    await page.mouse.click(navAirsoft.x, navAirsoft.y);
  }
  await sleep(900);
  const filtered = await page.evaluate(() => {
    const h2 = document.querySelector('h2');
    const grid = document.getElementById('product-grid');
    return { title: h2 ? h2.innerText : '', imgs: grid ? grid.querySelectorAll('img').length : 0 };
  });
  check('DESKTOP', 'Seleccionar AIRSOFT filtra grilla', filtered.title.toLowerCase().includes('airsoft') && filtered.imgs > 0, JSON.stringify(filtered));

  // 6. Buscar "balines" -> resultados
  await page.evaluate(() => {
    useStoreReset();
    function useStoreReset() {}
  }).catch(() => {});
  await page.type('header input[type="text"]', 'balines');
  await sleep(600);
  const suggestions = await page.evaluate(() => document.body.innerText.includes('Categorías Sugeridas') || document.body.innerText.includes('balines'));
  await page.keyboard.press('Enter');
  await sleep(900);
  const searchResult = await page.evaluate(() => {
    const grid = document.getElementById('product-grid');
    const h2 = grid ? grid.querySelector('h2').innerText : '';
    const imgs = grid ? grid.querySelectorAll('img').length : 0;
    return { h2, imgs };
  });
  check('DESKTOP', 'Búsqueda "balines" devuelve resultados', searchResult.imgs > 0, JSON.stringify(searchResult));

  // 7. Abrir detalle de producto
  await page.evaluate(() => {
    const firstImg = document.querySelector('#product-grid img, [class*="pt-[100%]"] img');
    firstImg ? firstImg.closest('[class*="cursor-pointer"], div').click() : null;
  }).catch(() => {});
  await sleep(800);
  const detail = await page.evaluate(() => ({
    detail: document.body.innerText.includes('DETALLES DEL PRODUCTO'),
    comprar: document.body.innerText.includes('COMPRAR AHORA'),
    back: Array.from(document.querySelectorAll('button')).some((b) => b.innerText.includes('Volver al catálogo')),
  }));
  check('DESKTOP', 'Detalle de producto abre', detail.detail && detail.comprar && detail.back, JSON.stringify(detail));

  // 8. Agregar al carrito
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const buy = btns.find((b) => b.innerText.includes('COMPRAR AHORA'));
    if (buy) buy.click();
  });
  await sleep(800);
  const cart = await page.evaluate(() => ({
    drawer: document.body.innerText.toLowerCase().includes('tu carrito'),
    hasItems: document.body.innerText.toLowerCase().includes('confirmar por whatsapp'),
  }));
  check('DESKTOP', 'Agregar al carrito abre drawer', cart.drawer && cart.hasItems, JSON.stringify(cart));

  // 9. Cantidad + y total
  const beforeTotal = await page.evaluate(() => document.body.innerText.includes('12x'));
  await page.evaluate(() => {
    const d = document.querySelector('[class*="fixed inset-y-0 right-0"]');
    const plus = Array.from(d.querySelectorAll('button')).find((b) => b.querySelector('[class*="lucide-plus"]'));
    if (plus) plus.click();
  }).catch(() => {});
  await sleep(500);
  const qty = await page.evaluate(() => {
    const d = document.querySelector('[class*="fixed inset-y-0 right-0"]');
    const spans = Array.from(d.querySelectorAll('span'));
    return spans.filter((s) => /^\d+$/.test(s.innerText.trim())).map((s) => s.innerText.trim());
  });
  check('DESKTOP', 'Cantidad en carrito incrementa', qty.includes('2'), JSON.stringify(qty));

  // 10. Footer
  const footer = await page.evaluate(() => document.body.innerText.toLowerCase().includes('sobre la empresa') && document.body.innerText.includes('Todos los derechos reservados'));
  check('DESKTOP', 'Footer presente', footer);

  await page.close();
  return errors;
}

async function auditMobile(browser) {
  const errors = [];
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  setup(page, errors);

  console.log('\n=== MOBILE 390x844 ===');
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitForProducts(page);

  // 1. Overflow
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check('MOBILE', 'Sin overflow horizontal', overflow <= 2, `px extra: ${overflow}`);

  // 2. Drawer móvil
  await page.tap('header a[aria-label="Abrir menú de categorías"]');
  await sleep(700);
  const drawer = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    if (!d) return null;
    return { left: Math.round(d.getBoundingClientRect().left), cats: d.innerText.includes('AIRSOFT') && d.innerText.includes('RELOJES') };
  });
  check('MOBILE', 'Drawer móvil abre con categorías', !!drawer && drawer.left === 0 && drawer.cats, JSON.stringify(drawer));

  // 3. Cerrar con backdrop
  await page.mouse.click(370, 400);
  await sleep(700);
  const closed = await page.evaluate(() => !document.querySelector('[role="dialog"]'));
  check('MOBILE', 'Drawer cierra con backdrop', closed);

  // 4. Búsqueda móvil
  const mSearch = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('header input[type="text"]'));
    for (const i of inputs) { const r = i.getBoundingClientRect(); if (r.width > 0 && r.height > 0) return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }
    return null;
  });
  if (mSearch) {
    await page.mouse.click(mSearch.x, mSearch.y);
    await sleep(400);
    await page.keyboard.type('repuestos', { delay: 40 });
    await sleep(600);
    await page.keyboard.press('Enter');
  }
  await sleep(900);
  const search = await page.evaluate(() => {
    const grid = document.getElementById('product-grid');
    return grid ? grid.querySelectorAll('img').length : 0;
  });
  check('MOBILE', 'Búsqueda móvil "repuestos"', search > 0, `productos: ${search}`);

  // 5. Detalle móvil + agregar a carrito
  await page.evaluate(() => {
    const first = document.querySelector('#product-grid img');
    if (first) {
      const card = first.closest('[class*="cursor-pointer"], div');
      (card || first).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  }).catch(() => {});
  await sleep(800);
  const detailOpen = await page.evaluate(() => document.body.innerText.includes('COMPRAR AHORA') && document.body.innerText.includes('DETALLES DEL PRODUCTO'));
  check('MOBILE', 'Detalle de producto en móvil', detailOpen);
  await page.evaluate(() => {
    const buy = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('COMPRAR AHORA'));
    if (buy) buy.click();
  });
  await sleep(800);
  const cart = await page.evaluate(() => document.body.innerText.toLowerCase().includes('tu carrito') && document.body.innerText.toLowerCase().includes('confirmar por whatsapp'));
  check('MOBILE', 'Carrito en móvil abre', cart);

  // 6. Volver atrás
  await page.evaluate(() => {
    const back = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Volver al catálogo'));
    if (back) back.click();
  });
  await sleep(600);
  const home = await page.evaluate(() => document.body.innerText.includes('PRODUCTO DESTACADO') || document.body.innerText.includes('LO MEJOR EN'));
  check('MOBILE', 'Volver al catálogo desde detalle', home);

  await page.close();
  return errors;
}

async function auditRoutes(browser) {
  const errors = [];
  console.log('\n=== RUTAS ===');
  for (const path of ['/login', '/register', '/profile', '/admin', '/admin/dashboard', '/ruta-inexistente']) {
    const page = await browser.newPage();
    const errs = [];
    setup(page, errs);
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(1500);
    const info = await page.evaluate(() => ({
      url: location.pathname,
      h1: (document.querySelector('h1') || {}).innerText || '',
      text: document.body.innerText.slice(0, 120).replace(/\n/g, ' | '),
    }));
    const consoleErrs = errs.filter((e) => e.type === 'console').length;
    const pageErrs = errs.filter((e) => e.type === 'pageerror').length;
    const ok = !info.text.includes('Página no encontrada') || path === '/ruta-inexistente';
    check('RUTAS', `/${path} renderiza (console:${consoleErrs}, crash:${pageErrs})`, ok, `${info.url} - ${info.h1 || info.text.slice(0, 60)}`);
    if (errs.length) errors.push(...errs);
    await page.close();
  }
  return errors;
}

async function main() {
  const executablePath = findChrome();
  if (!executablePath) throw new Error('Chrome no encontrado');
  const browser = await puppeteer.launch({
    executablePath, headless: true, args: ['--no-sandbox', '--disable-gpu'],
  });

  const allErrors = [];
  try { allErrors.push(...await auditDesktop(browser)); } catch (e) { console.log('  ERROR en auditDesktop:', e.message); }
  try { allErrors.push(...await auditMobile(browser)); } catch (e) { console.log('  ERROR en auditMobile:', e.message); }
  try { allErrors.push(...await auditRoutes(browser)); } catch (e) { console.log('  ERROR en auditRoutes:', e.message); }

  const fails = results.filter((r) => !r.ok);
  console.log(`\n===== RESUMEN: ${results.length - fails.length}/${results.length} PASS =====`);
  if (fails.length) {
    console.log('\nFALLOS:');
    fails.forEach((f) => console.log(`  - [${f.section}] ${f.name}${f.detail ? ' (' + f.detail + ')' : ''}`));
  }

  const consoleErrs = allErrors.filter((e) => e.type === 'console').map((e) => e.text);
  const pageErrs = allErrors.filter((e) => e.type === 'pageerror').map((e) => e.text);
  if (consoleErrs.length) {
    console.log(`\nCONSOLE.ERROR (${consoleErrs.length}):`);
    [...new Set(consoleErrs)].slice(0, 15).forEach((e) => console.log('  - ' + e.slice(0, 200)));
  }
  if (pageErrs.length) {
    console.log(`\nPAGEERROR (${pageErrs.length}):`);
    [...new Set(pageErrs)].slice(0, 10).forEach((e) => console.log('  - ' + e.slice(0, 200)));
  }

  await browser.close();
  process.exit(fails.length ? 1 : 0);
}

main().catch((e) => { console.error('FATAL:', e); process.exit(2); });
