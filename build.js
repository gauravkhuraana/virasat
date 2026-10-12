// Builds two outputs from src/virasat.src.html:
//  dist/index.html       -> page body for the Claude artifact preview (libraries from cdnjs)
//  dist/site/index.html  -> the deployable page: libraries inlined, strict CSP that blocks all outgoing requests
const fs = require('fs');
const src = fs.readFileSync('src/virasat.src.html', 'utf8');
fs.mkdirSync('dist', { recursive: true });

const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;650;700&family=IBM+Plex+Mono:wght@400;600&family=Young+Serif&display=swap">';
const CDN = ['exceljs/4.4.0/exceljs.min.js','jspdf/2.5.1/jspdf.umd.min.js','jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'].map(x => `<script src="https://cdnjs.cloudflare.com/ajax/libs/${x}"></script>`).join('');

const artifact = src.replace('<!--@HEAD-->', FONTS).replace('<!--@LIBS-->', CDN);
fs.writeFileSync('dist/index.html', artifact);

const inl = f => '<script>' + fs.readFileSync(f, 'utf8').replace(/<\/script/gi, '<\\/script').replace(/\/\/# sourceMappingURL=.*$/mg, '') + '</script>';
const lib = ['node_modules/exceljs/dist/exceljs.min.js','node_modules/jspdf/dist/jspdf.umd.min.js','node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.min.js'].map(inl).join('\n');
const CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline' https://fonts.googleapis.com; img-src data: blob:; font-src https://fonts.gstatic.com; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-src 'none'; object-src 'none'; worker-src 'none'";
const body = src
  .replace('<title>Virasat</title>', '')
  .replace('<!--@HEAD-->', '')
  .replace('<!--@LIBS-->', () => lib)
  .replace('/*@OFFLINE*/false', 'true');
const offline = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="referrer" content="no-referrer">
<title>Virasat</title>
${FONTS}
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head><body>
${body}
</body></html>`;
fs.mkdirSync('dist/site', { recursive: true });
fs.writeFileSync('dist/site/index.html', offline);
console.log('index.html', (artifact.length / 1024).toFixed(0) + ' KB; site', (offline.length / 1024).toFixed(0) + ' KB');
