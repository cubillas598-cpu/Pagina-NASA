import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizarFecha, parsearHorizons, unirSolTierra, consultarHorizons, urlConsulta } from '../web/js/horizons.js';
import worker, { validarConsulta, origenPermitido } from '../worker/horizons-proxy.js';

const respuesta = (filas, enc = ' Date__(UT)__HR:MN, , , Azi_(a-app), Elev_(a-app),') =>
  `Target body name: Sun (10)\n*****\n${enc}\n*****\n$$SOE\n${filas.join('\n')}\n$$EOE\n*****\n`;

test('normalizarFecha convierte el formato de Horizons', () => {
  assert.equal(normalizarFecha('2026-Dec-01 00:00'), '2026-12-01T00:00');
  assert.equal(normalizarFecha(' 2027-Jan-31 23:00 '), '2027-01-31T23:00');
  assert.throws(() => normalizarFecha('2026-12-01 00:00'));
});

test('parsearHorizons ubica columnas por encabezado', () => {
  assert.deepEqual(parsearHorizons(respuesta([' 2026-Dec-01 00:00, *, , 153.798584, 0.588174,'])),
    [{ t: '2026-12-01T00:00', el: 0.588174, az: 153.798584 }]);
  assert.deepEqual(parsearHorizons(respuesta([' 2026-Dec-01 00:00, -0.5, 10,'], ' Date__(UT)__HR:MN, Elev_(a-app), Azi_(a-app),')),
    [{ t: '2026-12-01T00:00', el: -0.5, az: 10 }]);
});

test('parsearHorizons rechaza respuestas incompletas', () => {
  assert.throws(() => parsearHorizons('No ephemeris'), /bloque/);
  assert.throws(() => parsearHorizons(respuesta([])), /vacío/);
  assert.throws(() => parsearHorizons(respuesta([' 2026-Dec-01 00:00, *, , n.a., n.a.,'])), /ilegible/);
  assert.throws(() => parsearHorizons(respuesta([' 2026-Dec-01 00:00, *, , , ,'])), /ilegible/);
  assert.throws(() => parsearHorizons(undefined), /bloque/);
});

test('unirSolTierra une por hora y exige las mismas horas', () => {
  const sol = [{ t: 'a', el: 1, az: 2 }, { t: 'b', el: 3, az: 4 }];
  assert.deepEqual(unirSolTierra(sol, [{ t: 'b', el: -3, az: -4 }, { t: 'a', el: -1, az: -2 }], 'x')[0],
    { t: 'a', sol_el: 1, sol_az: 2, tierra_el: -1, tierra_az: -2 });
  assert.throws(() => unirSolTierra(sol, [{ t: 'a', el: 0, az: 0 }], 'x'), /Tierra/);
  assert.throws(() => unirSolTierra(sol, [...sol, { t: 'c', el: 0, az: 0 }], 'x'), /mismas horas/);
});

test('consultarHorizons pide Sol y Tierra por sitio y devuelve horas unidas', async () => {
  const pedidos = [];
  const fetchFn = async (url) => {
    pedidos.push(new URL(url).searchParams.get('cuerpo'));
    return { ok: true, json: async () => ({ result: respuesta([' 2026-Dec-01 00:00, *, , 10, 1,']) }) };
  };
  const sitios = [{ id: 's1', lat: -89, lon: 126 }, { id: 's2', lat: -88, lon: 10 }];
  const r = await consultarHorizons({ proxy: 'https://p.example/', sitios, inicio: '2026-12-01', fin: '2026-12-02', fetchFn });
  assert.deepEqual(Object.keys(r).sort(), ['s1', 's2']);
  assert.equal(pedidos.length, 4);
  assert.deepEqual(r.s1[0], { t: '2026-12-01T00:00', sol_el: 1, sol_az: 10, tierra_el: 1, tierra_az: 10 });
});

test('consultarHorizons convierte fallos en mensajes claros', async () => {
  const base = { proxy: 'https://p.example/', sitios: [{ id: 's', lat: -89, lon: 126 }], inicio: '2026-12-01', fin: '2026-12-02' };
  await assert.rejects(consultarHorizons({ ...base, fetchFn: async () => { throw new TypeError('x'); } }), /conexión/);
  await assert.rejects(consultarHorizons({ ...base, fetchFn: async () => ({ ok: false, status: 502, json: async () => ({ error: 'JPL caído' }) }) }), /JPL caído/);
  await assert.rejects(consultarHorizons({ ...base, fetchFn: async () => ({ ok: false, status: 500, json: async () => { throw new Error(); } }) }), /HTTP 500/);
  await assert.rejects(consultarHorizons({ ...base, fetchFn: async () => ({ ok: true, json: async () => ({}) }) }), /inesperada/);
  const lento = (_u, { signal }) => new Promise((_, rej) => signal.addEventListener('abort', () => rej(Object.assign(new Error(), { name: 'AbortError' }))));
  await assert.rejects(consultarHorizons({ ...base, fetchFn: lento, timeoutMs: 10 }), /tardó/);
});

test('urlConsulta arma la consulta del intermediario', () => {
  const u = new URL(urlConsulta('https://p.example/x', '399', { lat: -89.5, lon: 222.7, elev_km: 0.5 }, '2026-12-01', '2026-12-31'));
  assert.equal(u.pathname, '/x');
  assert.deepEqual(Object.fromEntries(u.searchParams), { cuerpo: '399', lat: '-89.5', lon: '222.7', inicio: '2026-12-01', fin: '2026-12-31' });
});

test('el Worker valida cuerpo, coordenadas y periodo', () => {
  const q = (o) => new URLSearchParams({ cuerpo: '10', lat: '-89', lon: '126', inicio: '2026-12-01', fin: '2026-12-31', ...o });
  const ok = validarConsulta(q({}));
  assert.equal(ok.params.get('SITE_COORD'), "'126,-89,0'");
  assert.equal(ok.params.get('TIME_TYPE'), 'UT');
  assert.equal(ok.params.get('COMMAND'), "'10'");
  for (const malo of [{ cuerpo: '301' }, { lat: '-91' }, { lon: '360' }, { lat: '' }, { lon: 'x' }, { inicio: '2026-13-01' },
    { inicio: '2026-02-30', fin: '2026-03-03' }, { fin: '2026-12-32' },
    { fin: '2026-12-01' }, { fin: '2027-03-01' }, { elev: '50' }]) {
    assert.ok(validarConsulta(q(malo)).error, JSON.stringify(malo));
  }
});

test('el Worker solo da CORS a los orígenes de la demo', () => {
  const p = ['https://cubillas598-cpu.github.io', 'localhost', 'null'];
  assert.ok(origenPermitido('https://cubillas598-cpu.github.io', p));
  assert.ok(origenPermitido('http://localhost:8765', p));
  assert.ok(origenPermitido('http://127.0.0.1', p));
  assert.ok(origenPermitido('null', p));
  assert.ok(!origenPermitido('https://otro.example', p));
  assert.ok(!origenPermitido('http://localhost.evil.example', p));
  assert.ok(!origenPermitido('null', ['https://cubillas598-cpu.github.io']));
});

test('el Worker reenvía a Horizons y responde con CORS', async () => {
  const original = globalThis.fetch;
  let pedido = null;
  globalThis.fetch = async (url) => {
    pedido = new URL(url);
    return new Response(JSON.stringify({ result: respuesta([' 2026-Dec-01 00:00, *, , 10, 1,']) }), { headers: { date: 'Sun, 15 Nov 2026 01:00:00 GMT' } });
  };
  try {
    const env = { ORIGENES: 'https://cubillas598-cpu.github.io' };
    const ctx = { waitUntil() {} };
    const req = (q, origen = 'https://cubillas598-cpu.github.io') =>
      new Request(`https://w.example/?${q}`, { headers: origen ? { Origin: origen } : {} });
    const r = await worker.fetch(req('cuerpo=399&lat=-89&lon=126&inicio=2026-12-01&fin=2026-12-02'), env, ctx);
    assert.equal(r.status, 200);
    assert.equal(r.headers.get('Access-Control-Allow-Origin'), 'https://cubillas598-cpu.github.io');
    assert.equal(pedido.host, 'ssd.jpl.nasa.gov');
    assert.equal(pedido.searchParams.get('COMMAND'), "'399'");
    assert.match((await r.json()).result, /\$\$SOE/);

    assert.equal((await worker.fetch(req('cuerpo=5&lat=-89&lon=126&inicio=2026-12-01&fin=2026-12-02'), env, ctx)).status, 400);
    assert.equal((await worker.fetch(req('cuerpo=10&lat=-89&lon=126&inicio=2026-12-01&fin=2026-12-02', 'https://otro.example'), env, ctx)).status, 403);
    globalThis.fetch = async () => new Response('caido', { status: 503 });
    assert.equal((await worker.fetch(req('cuerpo=10&lat=-89&lon=126&inicio=2026-12-01&fin=2026-12-02'), env, ctx)).status, 502);
    globalThis.fetch = async () => { throw new TypeError('red'); };
    assert.equal((await worker.fetch(req('cuerpo=10&lat=-89&lon=126&inicio=2026-12-01&fin=2026-12-02'), env, ctx)).status, 502);
  } finally {
    globalThis.fetch = original;
  }
});

test('el Worker sigue funcionando si la caché falla', async () => {
  const originalFetch = globalThis.fetch;
  const originalCaches = globalThis.caches;
  const pendientes = [];
  globalThis.caches = { default: {
    match: async () => { throw new Error('caché caída'); },
    put: async () => { throw new Error('caché llena'); },
  } };
  globalThis.fetch = async () => new Response(JSON.stringify({ result: respuesta([' 2026-Dec-01 00:00, *, , 10, 1,']) }));
  try {
    const req = new Request('https://w.example/?cuerpo=10&lat=-89&lon=126&inicio=2026-12-01&fin=2026-12-02',
      { headers: { Origin: 'https://cubillas598-cpu.github.io' } });
    const r = await worker.fetch(req, { ORIGENES: 'https://cubillas598-cpu.github.io' }, { waitUntil: (p) => pendientes.push(p) });
    assert.equal(r.status, 200);
    assert.match((await r.json()).result, /\$\$SOE/);
    await Promise.all(pendientes); // el put fallido no rechaza
  } finally {
    globalThis.fetch = originalFetch;
    if (originalCaches === undefined) delete globalThis.caches; else globalThis.caches = originalCaches;
  }
});
