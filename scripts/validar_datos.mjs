// Valida data/ con las mismas reglas que usa la demo en el navegador.
// La Action de efemerides lo corre antes de publicar datos nuevos de Horizons.
// Uso: node scripts/validar_datos.mjs
import { readFile } from 'node:fs/promises';
import { validarDatos } from '../web/js/datos.js';

const raiz = new URL('../', import.meta.url);
const leer = async (ruta) => {
  try {
    return JSON.parse(await readFile(new URL(ruta, raiz), 'utf8'));
  } catch (err) {
    throw new Error(`No se pudo leer ${ruta}: ${err.message}`);
  }
};

try {
  const escenario = await leer('data/escenario_demo.json');
  const efemerides = {};
  const coordenadas = {};
  const generado = {};
  for (const s of escenario.sitios) {
    const doc = await leer(s.efemerides);
    efemerides[s.id] = doc.horas;
    coordenadas[s.id] = doc.sitio;
    generado[s.id] = doc.meta?.generado_utc ?? null;
  }
  validarDatos(escenario, efemerides, coordenadas, generado);

  const horas = efemerides[escenario.sitios[0].id];
  const desde = horas[0].t;
  const hasta = horas[horas.length - 1].t;
  const polvo = escenario.evento_polvo.inicio;
  if (polvo < desde || polvo > hasta) {
    throw new Error(`El evento de polvo (${polvo}) quedó fuera del periodo de las efemérides (${desde} a ${hasta}). `
      + 'Ajusta evento_polvo.inicio en data/escenario_demo.json o pide un periodo que lo incluya.');
  }
  console.log(`Datos válidos: ${escenario.sitios.length} sitios, ${horas.length} horas (${desde} a ${hasta} UTC).`);
} catch (err) {
  console.error(`Datos no válidos: ${err.message}`);
  process.exitCode = 1;
}
