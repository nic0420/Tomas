const puppeteer = require('puppeteer-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.QA_BASE || 'http://localhost:4173';

(async () => {
  const b = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(BASE, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => document.querySelectorAll('img').length > 10, { timeout: 45000 }).catch(() => {});
  await sleep(1500);

  const results = [];

  // 1. HERO: next arrow should advance + not be covered by social bar
  await p.evaluate(() => window.scrollTo(0, 0));
  const heroInfo = await p.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Siguiente"]');
    if (!btn) return { found: false };
    const r = btn.getBoundingClientRect();
    const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
    const hit = document.elementFromPoint(cx, cy);
    return {
      found: true,
      cx, cy,
      hit: hit ? (hit.closest('button') ? hit.closest('button').getAttribute('aria-label') || hit.closest('button').innerText.slice(0, 12) : hit.tagName) : null,
    };
  });
  let heroOk = false;
  if (heroInfo.found) {
    const dotBefore = await p.evaluate(() => {
      const ds = Array.from(document.querySelectorAll('button[aria-label^="Ir a la diapositiva"]'));
      return ds.findIndex((d) => d.className.includes('w-8 bg-brand-gold'));
    });
    await p.mouse.click(heroInfo.cx, heroInfo.cy);
    await sleep(700);
    const dotAfter = await p.evaluate(() => {
      const ds = Array.from(document.querySelectorAll('button[aria-label^="Ir a la diapositiva"]'));
      return ds.findIndex((d) => d.className.includes('w-8 bg-brand-gold'));
    });
    heroOk = dotBefore !== dotAfter;
    results.push({ check: 'Hero: flecha Siguiente avanza', pass: heroOk, detail: `hit=${heroInfo.hit} dot ${dotBefore}->${dotAfter}` });
  } else {
    results.push({ check: 'Hero: flecha Siguiente avanza', pass: false, detail: 'flecha no encontrada' });
  }

  // 2. SEARCH: type + Enter keeps the filter
  await p.goto(BASE, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => document.querySelectorAll('img').length > 10, { timeout: 45000 }).catch(() => {});
  await sleep(1500);
  await p.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
  const inp = await p.$('header input');
  const box = await inp.boundingBox();
  await p.mouse.click(box.x + 150, box.y + box.height / 2);
  await sleep(400);
  await p.keyboard.type('balines', { delay: 40 });
  await sleep(700);
  const typed = await p.evaluate(() => ({
    grid: !!document.getElementById('product-grid'),
    h2: (() => { const g = document.getElementById('product-grid'); return g && g.querySelector('h2') ? g.querySelector('h2').innerText : ''; })(),
  }));
  results.push({ check: 'Busqueda: filtrar al escribir', pass: typed.grid && typed.h2.toLowerCase().includes('balines'), detail: JSON.stringify(typed) });

  await p.keyboard.press('Enter');
  await sleep(1500);
  const afterEnter = await p.evaluate(() => ({
    grid: !!document.getElementById('product-grid'),
    h2: (() => { const g = document.getElementById('product-grid'); return g && g.querySelector('h2') ? g.querySelector('h2').innerText : ''; })(),
    scrollY: window.scrollY,
    inputVal: document.querySelector('header input').value,
  }));
  results.push({ check: 'Busqueda: Enter mantiene filtro + scroll', pass: afterEnter.grid && afterEnter.h2.toLowerCase().includes('balines') && afterEnter.scrollY > 0 && afterEnter.inputVal === 'balines', detail: JSON.stringify(afterEnter) });

  // 3. SEARCH: click "Ver todos los resultados" (panel must not close on mousedown)
  await p.goto(BASE, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => document.querySelectorAll('img').length > 10, { timeout: 45000 }).catch(() => {});
  await sleep(1500);
  await p.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
  await p.mouse.click(box.x + 150, box.y + box.height / 2);
  await sleep(400);
  await p.keyboard.type('balines', { delay: 40 });
  await sleep(700);
  const panelInfo = await p.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((x) => x.innerText.toLowerCase().includes('ver todos los resultados'));
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return {
      x: r.x + r.width / 2, y: r.y + r.height / 2,
      visible: r.width > 0 && r.height > 0,
      hit: hit ? (hit.closest('button') ? 'BUTTON:' + hit.closest('button').innerText.slice(0, 12) : hit.tagName) : null,
    };
  });
  let clickVerTodosOk = false;
  if (panelInfo) {
    await p.mouse.click(panelInfo.x, panelInfo.y);
    await sleep(1500);
    const st = await p.evaluate(() => ({
      grid: !!document.getElementById('product-grid'),
      h2: (() => { const g = document.getElementById('product-grid'); return g && g.querySelector('h2') ? g.querySelector('h2').innerText : ''; })(),
      scrollY: window.scrollY,
      inputVal: document.querySelector('header input').value,
    }));
    clickVerTodosOk = st.grid && st.h2.toLowerCase().includes('balines') && st.scrollY > 0 && st.inputVal === 'balines';
    results.push({ check: 'Busqueda: click "Ver todos" funciona', pass: clickVerTodosOk, detail: 'panel=' + JSON.stringify(panelInfo) + ' state=' + JSON.stringify(st) });
  } else {
    results.push({ check: 'Busqueda: click "Ver todos" funciona', pass: false, detail: 'boton no visible (panelInfo=null)' });
  }

  // 4. SOCIAL BAR: must be at bottom, not over hero arrow
  const social = await p.evaluate(() => {
    const bar = document.querySelector('a[aria-label="Instagram"]');
    if (!bar) return null;
    const r = bar.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, vh: window.innerHeight };
  });
  const socialOk = social && social.top > 600;
  results.push({ check: 'FloatingSocial fuera del area del hero', pass: !!socialOk, detail: JSON.stringify(social) });

  console.log('=== RESULTADOS ===');
  let allPass = true;
  for (const r of results) {
    console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.check}${r.detail ? '  | ' + r.detail : ''}`);
    if (!r.pass) allPass = false;
  }
  console.log(allPass ? '\nTODOS PASAN' : '\nHAY FALLOS');
  await b.close();
  process.exit(allPass ? 0 : 1);
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
