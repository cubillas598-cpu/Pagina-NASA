import { problemasEfemerides, problemasEscenario, problemasCoordenadas } from './model.js';

// Carga de datos locales. En la versión empaquetada (un solo HTML) los datos
// vienen incrustados en <script type="application/json" id="datos-demo">.

export async function cargarDatos(base = '../') {
  const incrustado = document.getElementById('datos-demo');
  if (incrustado) {
    const doc = JSON.parse(incrustado.textContent);
    return validarDatos(doc.escenario, doc.efemerides, doc.coordenadas, doc.generado);
  }
  const leer = async (ruta) => {
    const r = await fetch(base + ruta, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`No se pudo leer ${ruta} (HTTP ${r.status}).`);
    return r.json();
  };
  const escenario = await leer('data/escenario_demo.json');
  const efemerides = {};
  const coordenadas = {};
  const generado = {};
  await Promise.all(escenario.sitios.map(async (s) => {
    const doc = await leer(s.efemerides);
    efemerides[s.id] = doc.horas;
    coordenadas[s.id] = doc.sitio;
    generado[s.id] = doc.meta?.generado_utc ?? null;
  }));
  return validarDatos(escenario, efemerides, coordenadas, generado);
}

// Las coordenadas de cada sitio vienen de los archivos de efemérides (las mismas
// que usó JPL Horizons) y se copian al sitio del escenario como lat/lon.
// `generado` (opcional): fecha UTC en que cada archivo se pidió a Horizons.
// Exportada para que scripts/validar_datos.mjs aplique las mismas reglas.
export function validarDatos(escenario, efemerides, coordenadas, generado = {}) {
  const malEscenario = problemasEscenario(escenario);
  if (malEscenario.length) throw new Error(`Escenario no válido. ${malEscenario.slice(0, 5).join(' ')}`);
  const malCoord = problemasCoordenadas(escenario, coordenadas);
  if (malCoord.length) throw new Error(`Coordenadas no válidas. ${malCoord.join(' ')}`);
  for (const s of escenario.sitios) Object.assign(s, { lat: coordenadas[s.id].lat, lon: coordenadas[s.id].lon, elev_km: coordenadas[s.id].elev_km ?? 0 });
  const ids = escenario.sitios.map((s) => s.id);
  const ref = efemerides[ids[0]];
  for (const id of ids) {
    const h = efemerides[id];
    const problemas = problemasEfemerides(h, id);
    if (problemas.length) throw new Error(`Datos de efemérides no válidos. ${problemas.join(' ')}`);
    if (h.length !== ref.length || h[0].t !== ref[0].t || h[h.length - 1].t !== ref[ref.length - 1].t) {
      throw new Error(`Las efemérides de ${id} no cubren las mismas horas que ${ids[0]}.`);
    }
  }
  const fechas = Object.values(generado || {}).filter(Boolean).sort();
  escenario.generado_utc = fechas.length ? fechas[0] : null;
  return { escenario, efemerides };
}
