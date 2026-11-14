// Compila los módulos de web/js (incluido Three.js) en un solo archivo:
// web/build/app.js. La página carga ese archivo; las pruebas siguen
// importando los módulos fuente directamente.
//
// Uso: npm run build   (o: node scripts/compilar.mjs)
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

try {
  const r = await build({
    entryPoints: [path.join(raiz, 'web/js/main.js')],
    outfile: path.join(raiz, 'web/build/app.js'),
    bundle: true,
    format: 'esm',
    target: ['es2020'],
    minify: true,
    legalComments: 'eof',
    metafile: true,
    logLevel: 'warning',
  });
  const bytes = Object.values(r.metafile.outputs).reduce((s, o) => s + o.bytes, 0);
  console.log(`Escrito web/build/app.js (${Math.round(bytes / 1024)} KB)`);
} catch (err) {
  console.error(`No se pudo compilar la demo: ${err.message}`);
  process.exit(1);
}
