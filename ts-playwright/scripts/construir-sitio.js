// Arma la carpeta sitio/ que se publica en GitHub Pages: la página de rutas, el banco en línea y las evidencias.
const fs = require('fs');
const path = require('path');

const SALIDA = 'sitio';
const BANCO = path.join(SALIDA, 'banco');
const PUBLICO = path.join('demo-banco', 'public');
fs.rmSync(SALIDA, { recursive: true, force: true });
fs.mkdirSync(BANCO, { recursive: true });

const NOMBRES = { login: 'index', otp: 'otp', inicio: 'inicio', transferir: 'transferir', buzon: 'buzon' };
for (const [origen, destino] of Object.entries(NOMBRES)) {
  const html = fs.readFileSync(path.join(PUBLICO, `${origen}.html`), 'utf8')
    .replace('href="/estilos.css"', 'href="estilos.css"')
    .replace('<script src="/comun.js"></script>', '<script src="reglas.js"></script><script src="api-estatica.js"></script><script src="comun.js"></script>')
    .replace(/href="\/(otp|inicio|transferir|buzon)"/g, 'href="$1.html"')
    .replace(/location\.href = '\/(otp|inicio)'/g, "location.href = '$1.html'");
  fs.writeFileSync(path.join(BANCO, `${destino}.html`), html);
}
fs.copyFileSync(path.join(PUBLICO, 'estilos.css'), path.join(BANCO, 'estilos.css'));
fs.copyFileSync(path.join(PUBLICO, 'api-estatica.js'), path.join(BANCO, 'api-estatica.js'));
fs.writeFileSync(path.join(BANCO, 'comun.js'), fs.readFileSync(path.join(PUBLICO, 'comun.js'), 'utf8').replace(/location\.href = '\/'/g, "location.href = 'index.html'"));
fs.writeFileSync(path.join(BANCO, 'reglas.js'),
  `(() => { const module = { exports: {} };\n${fs.readFileSync('demo-banco/reglas.js', 'utf8')}\nwindow.ReglasBanco = module.exports; })();\n`);

if (fs.existsSync('evidencias.html')) fs.copyFileSync('evidencias.html', path.join(SALIDA, 'evidencias.html'));
if (fs.existsSync('playwright-report')) fs.cpSync('playwright-report', path.join(SALIDA, 'reporte'), { recursive: true });
const traza = path.join('test-results');
if (fs.existsSync(traza)) {
  const carpeta = fs.readdirSync(traza).find((c) => c.startsWith('02-otp') && fs.existsSync(path.join(traza, c, 'trace.zip')));
  if (carpeta) fs.copyFileSync(path.join(traza, carpeta, 'trace.zip'), path.join(SALIDA, 'traza.zip'));
}
fs.copyFileSync(path.join('demo-banco', 'portada.html'), path.join(SALIDA, 'index.html'));
console.log('sitio/ listo');
