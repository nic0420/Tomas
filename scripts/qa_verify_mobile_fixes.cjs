const puppeteer = require('puppeteer-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://localhost:4173';

(async () => {
  const b = await puppeteer.launch({
    executablePath: chrome, headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--window-size=390,844'],
    defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 },
  });
  const p = await b.newPage();
  await p.goto(BASE, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => document.querySelectorAll('img').length > 10, { timeout: 45000 }).catch(() => {});
  await sleep(1500);

  const results = [];

  // HERO: next arrow (visible mobile)
  const heroInfo = await p.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Siguiente"]');
    if (!btn) return { found: false };
    const r = btn.getBoundingClientRect();
    const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return { found: true, cx: r.x + r.width / 2, cy: r.y + r.height / 2, hit: hit ? (hit.closest('button') ? hit.closest('button').getAttribute('aria-label') || 'btn' : hit.tagName) : null };
  });
  if (heroInfo.found) {
    const d0 = await p.evaluate(() => { const ds = Array.from(document.querySelectorAll('button[aria-label^="Ir a la diapositiva"]')); return ds.findIndex((d) => d.className.includes('w-8 bg-brand-gold')); });
    await p.mouse.click(heroInfo.cx, heroInfo.cy);
    await sleep(700);
    const d1 = await p.evaluate(() => { const ds = Array.from(document.querySelectorAll('button[aria-label^="Ir a la diapositiva"]')); return ds.findIndex((d) => d.className.includes('w-8 bg-brand-gold')); });
    results.push({ check: 'Mobile hero: flecha Siguiente avanza', pass: d0 !== d1, detail: `hit=${heroInfo.hit} dot ${d0}->${d1}` });
  } else results.push({ check: 'Mobile hero flecha', pass: false, detail: 'no encontrada' });

  // MOBILE SEARCH: type + suggestions + click a product suggestion
  await p.evaluate(() => window.scrollTo(0, 0));
  const inpPos = await p.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('header input'));
    for (const i of inputs) { const r = i.getBoundingClientRect(); if (r.width > 0 && r.height > 0) return { x: r.x, y: r.y, w: r.width, h: r.height }; }
    return null;
  });
  await p.mouse.click(inpPos.x + inpPos.w / 2, inpPos.y + inpPos.h / 2);
  await sleep(400);
  await p.keyboard.type('balines', { delay: 40 });
  await sleep(700);
  const panel = await p.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const sug = btns.find((x) => x.innerText.toLowerCase().includes('ver todos los resultados') && x.getBoundingClientRect().width > 0);
    const prod = btns.filter((x) => x.innerText.toLowerCase().includes('us$') && x.getBoundingClientRect().width > 0);
    const r = sug ? sug.getBoundingClientRect() : null;
    const hit = r ? document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) : null;
    return {
      sugVisible: !!r && r.width > 0,
      prodSugCount: prod.length,
      hit: hit ? (hit.closest('button') ? 'BUTTON' : hit.tagName) : null,
      y: r ? r.y : null,
    };
  });
  results.push({ check: 'Mobile search: panel + sugerencias', pass: panel.sugVisible && panel.prodSugCount >= 5, detail: JSON.stringify(panel) });

  if (panel.sugVisible && panel.y !== null) {
    await p.touchscreen.tap(195, panel.y + 10);
    await sleep(1500);
    const afterTap = await p.evaluate(() => ({
      grid: !!document.getElementById('product-grid'),
      h2: (() => { const g = document.getElementById('product-grid'); return g && g.querySelector('h2') ? g.querySelector('h2').innerText : ''; })(),
      scrollY: window.scrollY,
    }));
    results.push({ check: 'Mobile search: tap en Ver todos', pass: afterTap.grid && afterTap.h2.toLowerCase().includes('balines'), detail: JSON.stringify(afterTap) });
  } else results.push({ check: 'Mobile search: tap en Ver todos', pass: false, detail: 'sin boton' });

  console.log('=== MOBILE VERIFY ===');
  let all = true;
  for (const r of results) { console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.check}${r.detail ? ' | ' + r.detail : ''}`); if (!r.pass) all = false; }
  console.log(all ? 'TODOS PASAN' : 'HAY FALLOS');
  await b.close();
  process.exit(all ? 0 : 1);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
