const { chromium } = require('playwright');
const path = require('path');
const OUT = path.resolve('test-out'); require('fs').mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errors = [], requests = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('request', r => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:') && !r.url().startsWith('blob:') && !/fonts\.(googleapis|gstatic)\.com/.test(r.url())) requests.push(r.url()); });
  const url = 'file://' + path.resolve('dist/site/index.html');
  await page.goto(url);
  await page.screenshot({ path: OUT + '/1-setup.png', fullPage: false });

  // sample
  await page.click('[data-act="sample"]');
  await page.screenshot({ path: OUT + '/2-overview.png', fullPage: true });
  const dl = async (sel) => { const [d] = await Promise.all([page.waitForEvent('download'), page.click(sel)]); const p = OUT + '/' + d.suggestedFilename(); await d.saveAs(p); return p; };
  await page.click('#exportBtn'); const xlsx = await dl('[data-act="exportXlsx"]');
  await page.click('[data-act="close"]');
  await page.click('#exportBtn'); const pdf = await dl('[data-act="exportPdf"]'); require('fs').renameSync(pdf, OUT + '/open.pdf');
  await page.click('[data-act="close"]');
  await page.click('#exportBtn'); await page.fill('#pdfPass', 'secret123'); const pdf2 = await dl('[data-act="exportPdf"]'); require('fs').renameSync(pdf2, OUT + '/locked.pdf'); console.log('locked pdf saved');
  console.log('exported', xlsx);
  await page.click('[data-act="close"]');
  await page.click('[data-v="upcoming"]');
  await page.screenshot({ path: OUT + '/3-upcoming.png', fullPage: true });
  const ics = await dl('[data-act="ics"]');
  console.log('ics', ics);

  // add entry with safety warnings
  await page.click('[data-v="cat:bank"]');
  await page.click('[data-act="add"]');
  await page.fill('#fld-bank', 'Canara Bank');
  await page.fill('#fld-last4', '123456789012');
  const w1 = await page.textContent('[data-warn="last4"]');
  await page.click('details.more summary');
  await page.fill('#fld-notes', 'mpin is 4455');
  const w2 = await page.textContent('[data-warn="notes"]');
  console.log('warn last4:', w1, '| warn notes:', w2);
  await page.fill('#fld-last4', '9012'); await page.fill('#fld-notes', 'Old account');
  await page.fill('#fld-balance', '25,000');
  await page.click('form[data-form="entry"] button[type="submit"]');
  await page.screenshot({ path: OUT + '/4-bank.png', fullPage: true });
  const bankCount = await page.$$eval('.card', c => c.length);
  console.log('bank cards after add:', bankCount);
  // edit form view screenshot
  await page.click('[data-v="cat:life"]');
  await page.click('.card [data-act="edit"]');
  await page.screenshot({ path: OUT + '/5-form.png', fullPage: true });
  await page.click('[data-act="cancel"]');

  // v2: untouched form -> free navigation
  await page.click('[data-v="cat:mf"]');
  await page.click('[data-act="add"]');
  await page.click('[data-v="cat:demat"]');
  console.log('untouched form navigated freely:', (await page.textContent('.cat-h h2')).trim(), '| banner hidden:', await page.isHidden('#unsaved'));
  // edited form -> banner
  await page.click('[data-act="add"]');
  await page.fill('#fld-broker', 'Upstox');
  await page.click('[data-v="cat:mf"]');
  console.log('banner shown on edited form:', await page.isVisible('#unsaved'), '| text:', (await page.textContent('#unsavedMsg')).trim());
  await page.screenshot({ path: OUT + '/10-unsaved.png' });
  await page.click('[data-act="uSave"]');
  console.log('after save+continue on:', (await page.textContent('.cat-h h2')).trim(), '| demat count:', await page.evaluate(() => S.entries.demat.length));
  // terms chip
  await page.click('.term[data-t="Folio"]');
  console.log('term box:', (await page.textContent('#termBox')).trim().slice(0, 60));
  // CSV import, broker-style with preamble
  const fs = require('fs');
  fs.writeFileSync(OUT + '/holdings.csv', 'Holdings statement as on 12-10-2026\nClient ID,AB1234\n\nInstrument,ISIN,Qty.,Avg. cost,LTP,Cur. val,P&L\nINFY,INE009A01021,25,"1,420.50",1810,"45,250.00",9737\nHDFCBANK,INE040A01034,60,1500,1720,"1,03,200",13200\nTotal,,,,,"1,48,450",\n');
  fs.writeFileSync(OUT + '/mf.csv', 'Scheme Name,AMC,Folio No,Units,Current Value (Rs.),Registrar\nAxis Bluechip Fund - Direct Growth,Axis MF,91234567/89,120.5,"62,300",KFintech\nPPFAS Flexi Cap - Direct,PPFAS MF,1234567,800,"68,000",CAMS\n');
  await page.click('[data-v="cat:holdings"]');
  await page.setInputFiles('#csvIn', OUT + '/holdings.csv');
  await page.waitForSelector('[data-act="csvGo"]');
  await page.fill('#fill-broker', 'Zerodha'); await page.dispatchEvent('#fill-broker', 'change');
  await page.screenshot({ path: OUT + '/11-csv.png' });
  console.log('csv button:', (await page.textContent('[data-act="csvGo"]')).trim());
  await page.click('[data-act="csvGo"]');
  console.log('holdings now:', JSON.stringify(await page.evaluate(() => S.entries.holdings.slice(-2))));
  await page.click('[data-v="cat:mf"]');
  await page.setInputFiles('#csvIn', OUT + '/mf.csv');
  await page.waitForSelector('[data-act="csvGo"]');
  await page.click('[data-act="csvGo"]');
  console.log('mf imported:', JSON.stringify(await page.evaluate(() => S.entries.mf.slice(-2))));
  await page.click('[data-v="glossary"]');
  await page.fill('#glossQ', 'depositor');
  console.log('glossary visible items:', await page.$$eval('.gloss > div', d => d.filter(x => !x.hidden).map(x => x.querySelector('dt').textContent)));
  await page.click('[data-v="find"]');
  await page.screenshot({ path: OUT + '/12-find.png', fullPage: true });
  await page.click('[data-v="cat:bank"]');
  await page.click('.card [data-act="edit"]');
  await page.click('details.more summary');
  await page.screenshot({ path: OUT + '/13-bankform.png', fullPage: true });
  await page.click('[data-act="cancel"]');

  // template + sample xlsx
  await page.click('[data-act="home"]');
  const tpl = await dl('[data-act="template"]');
  console.log('template', tpl);

  // re-import exported file in fresh page
  const p2 = await ctx.newPage();
  p2.on('pageerror', e => errors.push('p2 pageerror: ' + e.message));
  await p2.goto(url);
  await p2.setInputFiles('#fileIn', xlsx);
  await p2.waitForSelector('.stats');
  const toastTxt = await p2.textContent('#toast');
  console.log('import toast:', toastTxt);
  const stats = await p2.$$eval('.stat b', b => b.map(x => x.textContent));
  console.log('imported stats:', stats);
  const statsOrig = await page.evaluate(() => { S.view = 'summary'; render(); return [...document.querySelectorAll('.stat b')].map(x => x.textContent); });
  console.log('original stats (incl. new bank entry):', statsOrig);
  // compare entries deeply for sample (before the added bank entry): use p2 state vs fresh sample in p2
  const diff = await p2.evaluate(() => {
    const s = sampleState(); if (JSON.stringify(S.ids) !== JSON.stringify(s.ids)) return { issues:['ids mismatch ' + JSON.stringify(S.ids)] }; if (JSON.stringify(S.common) !== JSON.stringify(s.common)) return { issues:['common mismatch ' + JSON.stringify(S.common)] }; const issues = [];
    for (const k in s.entries) { const a = s.entries[k], b = S.entries[k] || [];
      if (a.length !== b.length) issues.push(`${k}: count ${a.length} vs ${b.length}`);
      a.forEach((e, i) => { const o = b[i] || {}; for (const f in e) { if (f === 'id') continue; const x = String(e[f]), y = String(o[f] ?? ''); if (x !== y) issues.push(`${k}[${i}].${f}: "${x}" vs "${y}"`); } }); }
    return { issues, mode: S.mode, people: S.people };
  });
  console.log('round-trip diff:', JSON.stringify(diff, null, 1));

  // mobile
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  m.on('pageerror', e => errors.push('m pageerror: ' + e.message));
  await m.goto(url);
  await m.screenshot({ path: OUT + '/6-mobile-setup.png', fullPage: false });
  await m.click('[data-act="sample"]');
  await m.click('[data-v="upcoming"]');
  await m.screenshot({ path: OUT + '/7-mobile-upcoming.png', fullPage: false });
  const overflow = await m.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  await m.click('[data-v="cat:life"]'); await m.click('.card [data-act="edit"]');
  await m.screenshot({ path: OUT + '/8-mobile-form.png', fullPage: false });
  const overflow2 = await m.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log('mobile horizontal overflow:', overflow, overflow2);
  // dark
  const dk = await browser.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: 'dark' });
  await dk.goto(url); await dk.click('[data-act="sample"]'); await dk.click('[data-v="upcoming"]');
  await dk.screenshot({ path: OUT + '/9-dark.png' });

  console.log('errors:', errors);
  console.log('external requests:', requests);
  await browser.close();

  const failures = [];
  if (diff.issues && diff.issues.length) failures.push('Excel round trip changed data: ' + diff.issues.join('; '));
  if (overflow || overflow2) failures.push('phone layout scrolls sideways');
  if (errors.length) failures.push('console errors: ' + errors.join(' | '));
  if (requests.length) failures.push('page made outgoing requests: ' + requests.join(', '));
  if (failures.length) { console.error('FAILED\n- ' + failures.join('\n- ')); process.exit(1); }
  console.log('ALL CHECKS PASSED');
})().catch(err => { console.error(err); process.exit(1); });
