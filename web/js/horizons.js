// Consulta en vivo a JPL Horizons desde la página, a través de un intermediario
// (worker/horizons-proxy.js): la API de JPL no permite peticiones desde otras
// páginas (CORS). Mismo formato y mismas reglas que scripts/efemerides.py.

const MESES = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
export const CUERPOS = { sol: '10', tierra: '399' };

/** "2026-Dec-01 00:00" -> "2026-12-01T00:00". */
export function normalizarFecha(raw) {
  const m = /^(\d{4})-([A-Za-z]{3})-(\d{2}) (\d{2}):(\d{2})$/.exec(String(raw).trim());
  const mes = m && MESES[m[2].toLowerCase()];
  if (!mes) throw new Error(`Fecha de Horizons no reconocida: ${raw}`);
  return `${m[1]}-${String(mes).padStart(2, '0')}-${m[3]}T${m[4]}:${m[5]}`;
}

/** Extrae [{t, el, az}] del CSV de Horizons; las columnas se ubican por el encabezado. */
export function parsearHorizons(texto) {
  if (typeof texto !== 'string' || !texto.includes('$$SOE') || !texto.includes('$$EOE')) {
    throw new Error('Horizons no devolvió un bloque de datos.');
  }
  const [antes, resto] = texto.split('$$SOE');
  const bloque = resto.split('$$EOE')[0].trim();
  let iAz = 3;
  let iEl = 4;
  const previas = antes.trim().split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('*'));
  if (previas.length) {
    const cols = previas[previas.length - 1].split(',').map((c) => c.trim().toLowerCase());
    const az = cols.findIndex((c) => c.startsWith('azi'));
    const el = cols.findIndex((c) => c.startsWith('elev'));
    if (az >= 0 && el >= 0) { iAz = az; iEl = el; }
  }
  const filas = bloque.split('\n').filter((l) => l.trim()).map((linea) => {
    const p = linea.split(',').map((x) => x.trim());
    const az = Number(p[iAz]);
    const el = Number(p[iEl]);
    if (p[iAz] === '' || p[iEl] === '' || !Number.isFinite(az) || !Number.isFinite(el)) {
      throw new Error(`Fila de Horizons ilegible: ${linea.trim()}`);
    }
    return { t: normalizarFecha(p[0]), el, az };
  });
  if (!filas.length) throw new Error('Horizons devolvió un bloque vacío.');
  return filas;
}

/** Une Sol y Tierra por marca de tiempo; ambas deben cubrir las mismas horas. */
export function unirSolTierra(sol, tierra, id) {
  const porT = new Map(tierra.map((f) => [f.t, f]));
  const horas = sol.map((s) => {
    const t = porT.get(s.t);
    if (!t) throw new Error(`${id}: Horizons no devolvió la Tierra para ${s.t}.`);
    return { t: s.t, sol_el: s.el, sol_az: s.az, tierra_el: t.el, tierra_az: t.az };
  });
  if (horas.length !== porT.size) throw new Error(`${id}: Sol y Tierra no cubren las mismas horas.`);
  return horas;
}

/** URL del intermediario para un cuerpo visto desde un sitio. */
export function urlConsulta(proxy, cuerpo, sitio, inicio, fin) {
  const u = new URL(proxy);
  u.search = new URLSearchParams({ cuerpo, lat: String(sitio.lat), lon: String(sitio.lon), inicio, fin }).toString();
  return u.toString();
}

/**
 * Pide Sol y Tierra para cada sitio. Devuelve { [id]: horas } o lanza un Error
 * con un mensaje para mostrar. `fetchFn` se inyecta en las pruebas.
 */
export async function consultarHorizons({ proxy, sitios, inicio, fin, fetchFn = fetch, timeoutMs = 45000 }) {
  const pedir = async (cuerpo, sitio) => {
    const ctrl = new AbortController();
    const reloj = setTimeout(() => ctrl.abort(), timeoutMs);
    let r;
    try {
      r = await fetchFn(urlConsulta(proxy, cuerpo, sitio, inicio, fin), { signal: ctrl.signal });
    } catch (err) {
      throw new Error(err?.name === 'AbortError' ? 'JPL Horizons tardó demasiado en responder.' : 'No hay conexión con el intermediario de JPL Horizons.');
    } finally {
      clearTimeout(reloj);
    }
    let cuerpoJson = null;
    try { cuerpoJson = await r.json(); } catch { /* respuesta no JSON */ }
    if (!r.ok) throw new Error(cuerpoJson?.error || `El intermediario respondió HTTP ${r.status}.`);
    if (typeof cuerpoJson?.result !== 'string') throw new Error('Respuesta inesperada del intermediario.');
    return parsearHorizons(cuerpoJson.result);
  };
  const salida = {};
  await Promise.all(sitios.map(async (s) => {
    const [sol, tierra] = await Promise.all([pedir(CUERPOS.sol, s), pedir(CUERPOS.tierra, s)]);
    salida[s.id] = unirSolTierra(sol, tierra, s.id);
  }));
  return salida;
}
