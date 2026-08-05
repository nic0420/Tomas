const puppeteer = require('puppeteer-core');

const BASE = process.env.BASE_URL || 'http://localhost:4173';

const CHROME_PATHS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];

function findChrome() {
  const { existsSync } = require('fs');
  return CHROME_PATHS.find((p) => existsSync(p));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const executablePath = findChrome();
  if (!executablePath) throw new Error('Chrome/Edge no encontrado');

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--window-size=390,844'],
    defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 },
  });

  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text()); });

  const results = [];
  const check = (name, ok, detail = '') => {
    results.push({ name, ok, detail });
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -> ' + detail : ''}`);
  };

  console.log('Cargando ' + BASE);
  await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 });

  // Esperar a que el CSV cargue y aparezcan productos
  await page.waitForFunction(() => {
    return document.querySelectorAll('img').length > 10;
  }, { timeout: 30000 }).catch(() => {});
  await sleep(1500);

  // 1. Verificar que el logo existe
  const logoText = await page.evaluate(() => {
    const a = document.querySelector('header a[aria-label="Abrir menú de categorías"]');
    return a ? a.innerText.replace(/\s+/g, ' ').trim() : null;
  });
  check('Logo TOMMY GUNS visible en header móvil', !!logoText && logoText.includes('TOMMY'), logoText);

  // 2. Tocar el logo abre el drawer
  await page.tap('header a[aria-label="Abrir menú de categorías"]');
  await sleep(700);
  const drawerAfterLogo = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"][aria-label="Menú de categorías"]');
    if (!d) return null;
    const r = d.getBoundingClientRect();
    return { left: Math.round(r.left), width: Math.round(r.width), items: d.querySelectorAll('button').length };
  });
  check('Tocar logo abre drawer lateral izquierdo', !!drawerAfterLogo && drawerAfterLogo.left === 0, JSON.stringify(drawerAfterLogo));
  check('Drawer tiene contenido (botones)', (drawerAfterLogo?.items || 0) > 5, String(drawerAfterLogo?.items));

  // 3. Verificar categorías principales presentes
  const cats = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const btns = Array.from(d.querySelectorAll('button')).map((b) => b.innerText.trim());
    return btns.filter((t) => ['AIRSOFT', 'AIRGUN', 'PAINTBALL', 'RELOJES'].includes(t));
  });
  check('Categorías principales en el drawer', cats.length >= 4, cats.join(', '));

  // 4. Backdrop cierra el drawer
  await page.mouse.click(370, 400);
  await sleep(700);
  const drawerClosedByBackdrop = await page.evaluate(() => {
    return document.querySelector('[role="dialog"][aria-label="Menú de categorías"]') === null;
  });
  check('Backdrop cierra el drawer', drawerClosedByBackdrop);

  // 5. Reabrir, expandir subcategorías
  await page.tap('header a[aria-label="Abrir menú de categorías"]');
  await sleep(600);
  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const airsoft = Array.from(d.querySelectorAll('button')).find((b) => b.innerText.trim() === 'AIRSOFT');
    airsoft.click();
  });
  await sleep(600);
  const expanded = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const txt = d.innerText;
    return {
      hasSubs: txt.includes('RÉPLICAS DE AIRSOFT') && txt.includes('GRANADAS DE AIRSOFT'),
      verTodo: txt.includes('Ver todo en AIRSOFT'),
    };
  });
  check('AIRSOFT expande subcategorías', expanded.hasSubs && expanded.verTodo, JSON.stringify(expanded));

  // 6. Seleccionar subcategoría filtra y cierra drawer
  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const sub = Array.from(d.querySelectorAll('button')).find((b) => b.innerText.trim() === 'GRANADAS DE AIRSOFT');
    sub.click();
  });
  await sleep(800);
  const afterSelect = await page.evaluate(() => {
    const dialogOpen = !!document.querySelector('[role="dialog"]');
    const grid = document.getElementById('product-grid');
    const count = grid ? grid.querySelectorAll('img').length : 0;
    const heading = grid ? (grid.querySelector('h2') || {}).innerText : '';
    return { dialogOpen, count, heading };
  });
  check('Seleccionar subcategoría cierra drawer', !afterSelect.dialogOpen);
  check('Filtra productos en la grilla', afterSelect.count > 0, `productos: ${afterSelect.count} - ${afterSelect.heading}`);

  // 7. Screenshots
  await page.screenshot({ path: 'scripts/qa_mobile_home.png' });
  await page.tap('header a[aria-label="Abrir menú de categorías"]');
  await sleep(600);
  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const airsoft = Array.from(d.querySelectorAll('button')).find((b) => b.innerText.trim() === 'AIRSOFT');
    airsoft.click();
  });
  await sleep(600);
  await page.screenshot({ path: 'scripts/qa_mobile_drawer.png' });

  // 8. Escape cierra
  await page.keyboard.press('Escape');
  await sleep(700);
  const closedByEsc = await page.evaluate(() => !document.querySelector('[role="dialog"]'));
  check('Escape cierra el drawer', closedByEsc);

  // 9. Body scroll bloqueado mientras abierto
  await page.tap('header a[aria-label="Abrir menú de categorías"]');
  await sleep(600);
  const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
  check('Scroll de body bloqueado con drawer abierto', bodyOverflow === 'hidden', bodyOverflow);

  const fails = results.filter((r) => !r.ok);
  console.log(`\n==== RESULTADO: ${results.length - fails.length}/${results.length} PASS ====`);
  if (fails.length) {
    console.log('FALLOS:');
    fails.forEach((f) => console.log(' - ' + f.name));
  }
  if (errors.length) {
    console.log('\nErrores de consola detectados:');
    errors.forEach((e) => console.log(' - ' + e));
  }

  await browser.close();
  process.exit(fails.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('ERROR FATAL:', e.message);
  process.exit(2);
});
