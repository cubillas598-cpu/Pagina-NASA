// Intermediario para que la demo consulte JPL Horizons desde el navegador.
// La API de JPL no envía cabeceras CORS, así que una página en github.io no
// puede leerla directamente. Este Cloudflare Worker repite la consulta de
// scripts/efemerides.py (efemérides de observador, elevación y azimut por hora)
// y añade CORS solo para los orígenes de la demo.
//
// Solo acepta Sol (10) y Tierra (399), coordenadas lunares válidas y periodos
// de hasta 62 días: no es un proxy abierto. Despliegue: ver worker/README.md.

const HORIZONS = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const CUERPOS = new Set(['10', '399']);
const MAX_DIAS = 62;
const CACHE_S = 6 * 3600;

export function origenPermitido(origen, permitidos) {
  if (!origen) return false;
  if (origen === 'null') return permitidos.includes('null'); // HTML abierto con doble clic (file://)
  if (permitidos.includes(origen)) return true;
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origen) && permitidos.includes('localhost');
}

const esFecha = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));

/** Valida la consulta. Devuelve { error } o { params } para Horizons. */
export function validarConsulta(q) {
  const cuerpo = q.get('cuerpo');
  const lat = Number(q.get('lat'));
  const lon = Number(q.get('lon'));
  const elev = q.has('elev') ? Number(q.get('elev')) : 0;
  const inicio = q.get('inicio');
  const fin = q.get('fin');
  if (!CUERPOS.has(cuerpo)) return { error: 'cuerpo debe ser 10 (Sol) o 399 (Tierra).' };
  if (!q.get('lat') || !q.get('lon') || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || lon < 0 || lon >= 360) {
    return { error: 'lat debe estar entre -90 y 90 y lon entre 0 y 360 (este).' };
  }
  if (!Number.isFinite(elev) || elev < -10 || elev > 12) return { error: 'elev (km) fuera de rango.' };
  if (!esFecha(inicio) || !esFecha(fin)) return { error: 'inicio y fin deben ser fechas YYYY-MM-DD.' };
  const dias = (Date.parse(`${fin}T00:00:00Z`) - Date.parse(`${inicio}T00:00:00Z`)) / 86400000;
  if (dias < 1 || dias > MAX_DIAS) return { error: `El periodo debe ser de 1 a ${MAX_DIAS} días.` };
  return {
    params: new URLSearchParams({
      format: 'json', COMMAND: `'${cuerpo}'`, OBJ_DATA: 'NO', MAKE_EPHEM: 'YES', EPHEM_TYPE: 'OBSERVER',
      CENTER: 'coord@301', COORD_TYPE: 'GEODETIC', SITE_COORD: `'${lon},${lat},${elev}'`,
      START_TIME: `'${inicio}'`, STOP_TIME: `'${fin}'`, STEP_SIZE: "'1h'", QUANTITIES: "'4'",
      ANG_FORMAT: 'DEG', CSV_FORMAT: 'YES', TIME_TYPE: 'UT',
    }),
  };
}

function responder(cuerpo, status, cors, extra = {}) {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...cors, ...extra },
  });
}

export default {
  async fetch(request, env, ctx) {
    const permitidos = String(env.ORIGENES || 'https://cubillas598-cpu.github.io,localhost,null').split(',').map((s) => s.trim());
    const origen = request.headers.get('Origin');
    const cors = origenPermitido(origen, permitidos)
      ? { 'Access-Control-Allow-Origin': origen, Vary: 'Origin' }
      : {};
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { ...cors, 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Max-Age': '86400' } });
    }
    if (request.method !== 'GET') return responder({ error: 'Solo se acepta GET.' }, 405, cors);
    if (origen && !cors['Access-Control-Allow-Origin']) return responder({ error: 'Origen no permitido.' }, 403, {});

    const url = new URL(request.url);
    const v = validarConsulta(url.searchParams);
    if (v.error) return responder({ error: v.error }, 400, cors);

    const destino = `${HORIZONS}?${v.params}`;
    const cache = typeof caches !== 'undefined' ? caches.default : null;
    const clave = new Request(destino);
    let r = cache ? await cache.match(clave) : null;
    if (!r) {
      try {
        r = await fetch(destino, { headers: { 'User-Agent': 'lunar-landing-site-navigator (NASA Space Apps 2026)' } });
      } catch {
        return responder({ error: 'No se pudo contactar a JPL Horizons.' }, 502, cors);
      }
      if (!r.ok) return responder({ error: `JPL Horizons respondió HTTP ${r.status}.` }, 502, cors);
      r = new Response(r.body, r);
      r.headers.set('Cache-Control', `public, max-age=${CACHE_S}`);
      if (cache) ctx.waitUntil(cache.put(clave, r.clone()));
    }
    let datos;
    try {
      datos = await r.json();
    } catch {
      return responder({ error: 'JPL Horizons devolvió una respuesta ilegible.' }, 502, cors);
    }
    if (datos.error) return responder({ error: `JPL Horizons: ${datos.error}` }, 502, cors);
    return responder({ result: datos.result, fuente: HORIZONS, consultado_utc: r.headers.get('date') }, 200, cors,
      { 'Cache-Control': 'public, max-age=600' });
  },
};
