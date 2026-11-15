// Ejecutar: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  horizonteEn, separacionAngular, clasificar, calcularSerie, metricasPeriodo,
  tramoMasLargo, segmentar, compararSitios, comparativoCsv, segundosPolvoEnHora, horasEventoPolvo, eventosPeriodo,
  suitabilityScore, PESOS_SUITABILITY, desgloseIndice, siguienteInterrupcion, METRICAS_COMPARADOR, puntajeLineal, problemasTerreno, problemasEfemerides, valorMetrica, problemasEscenario, esMarcaHoraria, problemasCoordenadas,
} from '../web/js/model.js';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const leer = (p) => JSON.parse(fs.readFileSync(path.join(raiz, p), 'utf8'));
const escenario = leer('data/escenario_demo.json');

function serieDe(id, extra = {}) {
  const sitio = escenario.sitios.find((s) => s.id === id);
  const horas = leer(sitio.efemerides).horas;
  return calcularSerie(sitio, horas, {
    modoHorizonte: 'perfil', tipoEnlace: 'rf', polvo: false,
    reglas: escenario.enlace_local, eventoPolvo: escenario.evento_polvo, ...extra,
  });
}

test('horizonteEn interpola y da la vuelta en 360°', () => {
  const perfil = { resolucion_deg: 1, elevacion_deg: Array.from({ length: 360 }, (_, i) => (i === 359 ? 2 : i === 0 ? 0 : 1)) };
  assert.equal(horizonteEn(perfil, 0.5), 0.5);
  assert.equal(horizonteEn(perfil, 359.5), 1);
  assert.equal(horizonteEn(perfil, -0.5), 1);
  assert.equal(horizonteEn(null, 123), 0);
});

test('separacionAngular en el horizonte equivale a la diferencia de azimut', () => {
  assert.ok(Math.abs(separacionAngular(10, 0, 30, 0) - 20) < 1e-9);
  assert.ok(Math.abs(separacionAngular(350, 0, 10, 0) - 20) < 1e-9);
  assert.ok(Math.abs(separacionAngular(0, 0, 0, 5) - 5) < 1e-9);
});

test('clasificar toma el factor más limitante', () => {
  const r = clasificar([{ clave: 'a', nivel: 2 }, { clave: 'b', nivel: 1 }, { clave: 'c', nivel: 2 }]);
  assert.equal(r.estado, 'robusto');
  assert.deepEqual(r.limitantes.map((f) => f.clave), ['b']);
});

test('la serie es determinista y cubre todas las horas', () => {
  const a = serieDe('shackleton');
  const b = serieDe('shackleton');
  assert.equal(a.length, leer('data/shackleton.json').horas.length);
  assert.deepEqual(a.map((m) => m.enlace.estado), b.map((m) => m.enlace.estado));
});

test('los totales del periodo coinciden con el número de horas', () => {
  for (const s of escenario.sitios) {
    const serie = serieDe(s.id, { tipoEnlace: 'optico', polvo: true });
    const m = metricasPeriodo(serie, 24, 24 * 10 - 1, true);
    assert.equal(m.horas, 216);
    const e = m.enlace;
    assert.equal(e.rapido + e.robusto + e.sin_enlace, m.horas);
    assert.ok(m.horasSol <= m.horas && m.horasTierra <= m.horas);
    assert.ok(Math.abs(m.pctSol - (100 * m.horasSol) / m.horas) < 1e-9);
  }
});

test('el respaldo exige tramo local y vista del punto de apoyo a la Tierra', () => {
  const serie = serieDe('malapert', { tipoEnlace: 'optico', polvo: true });
  for (const m of serie) {
    assert.equal(m.respaldoTierra, m.enlace.estado !== 'sin_enlace' && m.relevo.tierra);
  }
});

test('el respaldo nunca alarga la mayor interrupción', () => {
  for (const s of escenario.sitios) {
    const serie = serieDe(s.id);
    const sin = metricasPeriodo(serie, 0, serie.length - 1, false).brecha.horas;
    const con = metricasPeriodo(serie, 0, serie.length - 1, true).brecha.horas;
    assert.ok(con <= sin);
  }
});

test('el evento de polvo usa la duración de Apollo y solo afecta al óptico', () => {
  const ev = escenario.evento_polvo;
  assert.ok(ev.duracion_s >= 10 && ev.duracion_s <= 12);
  const opt = serieDe('shackleton', { tipoEnlace: 'optico', polvo: true });
  const [a, b] = horasEventoPolvo(opt, ev);
  assert.equal(a, b, 'un evento de segundos ocupa una sola hora');
  const polvo = opt[a].enlace.factores.find((f) => f.clave === 'polvo');
  assert.equal(polvo.nivel, 1);
  assert.equal(opt.filter((m) => m.enlace.factores.some((f) => f.clave === 'polvo')).length, 1);
  const rf = serieDe('shackleton', { tipoEnlace: 'rf', polvo: true });
  assert.ok(!rf[a].enlace.factores.some((f) => f.clave === 'polvo'));
});

test('segundosPolvoEnHora reparte el evento entre horas', () => {
  const ini = Date.parse('2026-12-06T08:59:55Z');
  const ev = { duracion_s: 12 };
  assert.equal(segundosPolvoEnHora(ev, ini, Date.parse('2026-12-06T08:00:00Z')), 5);
  assert.equal(segundosPolvoEnHora(ev, ini, Date.parse('2026-12-06T09:00:00Z')), 7);
  assert.equal(segundosPolvoEnHora(ev, ini, Date.parse('2026-12-06T10:00:00Z')), 0);
  assert.equal(segundosPolvoEnHora({ duracion_s: 2400 }, Date.parse('2026-12-06T08:00:00Z'), Date.parse('2026-12-06T08:00:00Z')), 2400);
});

test('horizonte plano: el Sol es visible siempre que su elevación sea positiva', () => {
  const serie = serieDe('malapert', { modoHorizonte: 'plano' });
  for (const m of serie) assert.equal(m.sol.visible, m.sol.el > 0);
});

test('tramoMasLargo y segmentar', () => {
  const s = [1, 0, 0, 1, 0, 0, 0].map((v) => ({ v }));
  assert.deepEqual(tramoMasLargo(s, 0, 6, (x) => x.v === 0), { horas: 3, desde: 4, hasta: 6 });
  assert.deepEqual(segmentar(s, 0, 3, (x) => x.v).map((g) => [g.valor, g.desde, g.hasta]), [[1, 0, 0], [0, 1, 2], [1, 3, 3]]);
});

test('comparador marca empates y genera conclusiones prudentes', () => {
  const met = (pctSol, brecha) => ({ pctSol, pctTierra: 10, pctSolTierra: 5, enlace: null, brecha: { horas: brecha },
    ventanaTierra: { horas: 3 }, sombraMax: { horas: 4 }, ventanaSol: { horas: 6 } });
  const filas = [
    { sitio: { id: 'a', etiqueta: 'Sitio A' }, metricas: met(80, 5) },
    { sitio: { id: 'b', etiqueta: 'Sitio B' }, metricas: met(90, 5) },
    { sitio: { id: 'c', etiqueta: 'Sitio C' }, metricas: met(70, 9) },
  ];
  const r = compararSitios(filas, false);
  assert.deepEqual(r.mejores.pctSol, ['b']);
  assert.deepEqual(r.mejores.brecha, ['a', 'b']);
  assert.ok(r.conclusiones.includes('Sitio B presenta más horas de iluminación en el periodo seleccionado.'));
  assert.ok(!r.conclusiones.some((c) => /seguro|ideal/i.test(c)));
  // Resumen por sitio: solo cuenta métricas ganadas sin empate, de más a menos.
  // pctSol -> b; brecha empata a/b; pctTierra, pctSolTierra, ventanas y sombra empatan los tres.
  assert.deepEqual(r.resumen.map((g) => [g.sitio.id, g.metricas]), [['b', ['iluminación solar']]]);
  assert.equal(r.resumen[0].total, Object.keys(r.mejores).length);
});

const TERRENO_EJ = {
  pendiente_media_deg: 10, pendiente_max_deg: 14, pct_llano_500m: 60, rugosidad_100m_m: 1.75,
  aproximacion: { mejor_az_deg: 90, mejor_obstaculo_deg: 6, peor_az_deg: 0, peor_obstaculo_deg: 9 },
  dist_psr_km: 13, en_psr: false,
};
const metricasDe = () => ({ pctSol: 50, pctTierra: 10, pctSolTierra: 5, enlace: null, brecha: { horas: 5 },
  ventanaTierra: { horas: 3 }, sombraMax: { horas: 4 }, ventanaSol: { horas: 6 } });
const MET_EJ = { pctSol: 80, pctTierra: 40, pctRespaldo: 30, sombraMax: { horas: 36 }, brecha: { horas: 0 } };

test('puntajeLineal: 100 en el valor bueno, 0 en el malo y lineal en medio', () => {
  assert.equal(puntajeLineal(5, 5, 15), 100);
  assert.equal(puntajeLineal(15, 5, 15), 0);
  assert.equal(puntajeLineal(10, 5, 15), 50);
  assert.equal(puntajeLineal(-3, 5, 15), 100);
  assert.equal(puntajeLineal(36, 0, 72), 50);
  assert.equal(puntajeLineal(NaN, 0, 1), null);
});

test('índice: pesos suman 1 y la fórmula es exacta con todos los términos', () => {
  const suma = Object.values(PESOS_SUITABILITY).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(suma - 1) < 1e-9);
  const d = desgloseIndice(MET_EJ, true, TERRENO_EJ);
  // terreno = 0.7*pendiente(50) + 0.3*rugosidad(50) = 50; ruta(6°) = 50; hielo(13 km) = 50.
  assert.deepEqual(Object.fromEntries(Object.entries(d.partes).map(([k, v]) => [k, Math.round(v * 1e9) / 1e9])),
    { energia: 80, comunicacion: 40, respaldo: 30, noche: 50, apagon: 100, terreno: 50, aproximacion: 50, hielo: 50 });
  const p = PESOS_SUITABILITY;
  const esperado = p.energia * 80 + p.comunicacion * 40 + p.respaldo * 30 + p.noche * 50 + p.apagon * 100
    + p.terreno * 50 + p.aproximacion * 50 + p.hielo * 50;
  assert.ok(Math.abs(d.total - esperado) < 1e-9);
  assert.ok(Math.abs(suitabilityScore({ ...MET_EJ, terreno: TERRENO_EJ }, true) - esperado) < 1e-9);
});

test('índice: sin enlace ni terreno se renormaliza y sigue en 0-100', () => {
  const d = desgloseIndice(MET_EJ, false, null);
  const p = PESOS_SUITABILITY;
  const w = p.energia + p.comunicacion + p.noche + p.apagon;
  assert.ok(Math.abs(d.total - (p.energia * 80 + p.comunicacion * 40 + p.noche * 50 + p.apagon * 100) / w) < 1e-9);
  assert.equal(d.partes.respaldo, null);
  assert.equal(d.partes.terreno, null);
  assert.ok(d.total >= 0 && d.total <= 100);
});

test('índice: sin sombra permanente en 25 km el término de hielo vale 0', () => {
  const d = desgloseIndice(MET_EJ, true, { ...TERRENO_EJ, dist_psr_km: null });
  assert.equal(d.partes.hielo, 0);
});

test('problemasTerreno rechaza valores fuera de rango y acepta el ejemplo', () => {
  const doc = { sitios: Object.fromEntries(escenario.sitios.map((s) => [s.id, TERRENO_EJ])) };
  assert.deepEqual(problemasTerreno(doc, escenario), []);
  assert.deepEqual(problemasTerreno(null, escenario), []);
  const malo = structuredClone(doc);
  malo.sitios[escenario.sitios[0].id].pendiente_media_deg = 95;
  delete malo.sitios[escenario.sitios[1].id];
  const txt = problemasTerreno(malo, escenario).join(' ');
  assert.match(txt, /pendiente fuera de rango/);
  assert.match(txt, /faltan sus variables de terreno/);
});

test('comparador: las métricas de terreno marcan al mejor y se omiten si falta un sitio', () => {
  const fila = (id, pend) => ({ sitio: { id, etiqueta: id }, metricas: { ...metricasDe(), terreno: pend === null ? null : { ...TERRENO_EJ, pendiente_media_deg: pend } } });
  const r = compararSitios([fila('a', 4), fila('b', 9)], true);
  assert.deepEqual(r.mejores.pendienteMedia, ['a']);
  const r2 = compararSitios([fila('a', 4), fila('b', null)], true);
  assert.equal(r2.mejores.pendienteMedia, undefined);
});

test('CSV: cabecera, una fila por sitio y comillas cuando hacen falta', () => {
  const m = { horas: 2, pctSol: 50, pctTierra: 0, pctSolTierra: 0, pctRespaldo: 50, enlace: { rapido: 1, robusto: 1, sin_enlace: 0 },
    brecha: { horas: 2 }, ventanaTierra: { horas: 0 }, sombraMax: { horas: 1 } };
  const csv = comparativoCsv([{ sitio: { etiqueta: 'Sitio A', nombre_corto: 'Borde, Shackleton' }, metricas: m }],
    { inicio: 'x', fin: 'y', enlaceActivo: true, tipoEnlace: 'optico', polvo: true, modoHorizonte: 'lola_skyline' });
  const lineas = csv.trim().split('\n');
  assert.equal(lineas.length, 2);
  assert.ok(lineas[1].includes('"Borde, Shackleton"'));
  assert.ok(lineas[1].includes(',si,1,1,0,2,lola_skyline'));
  assert.equal(lineas[0].split(',').length, lineas[1].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).length);
  assert.ok(lineas[1].endsWith(',0.0,50.0,0,1,,,,,,')); // sin terreno: columnas vacías
});

test('disponibilidad combinada: comunicación y luz con comunicación', () => {
  for (const activo of [false, true]) {
    const serie = serieDe('malapert', { tipoEnlace: 'optico' });
    const m = metricasPeriodo(serie, 0, serie.length - 1, activo);
    const com = serie.filter((x) => x.tierra.visible || (activo && x.respaldoTierra)).length;
    assert.equal(m.horasComunicacion, com);
    assert.equal(m.horasAmbas, serie.filter((x) => x.sol.visible && (x.tierra.visible || (activo && x.respaldoTierra))).length);
    assert.ok(m.horasAmbas <= Math.min(m.horasSol, m.horasComunicacion));
  }
});

test('eventosPeriodo detecta cambios y la duración del tramo que abren', () => {
  const mk = (sol, tierra) => ({ sol: { visible: sol }, tierra: { visible: tierra }, enlace: { estado: 'rapido' } });
  const serie = [mk(1, 0), mk(1, 1), mk(0, 1), mk(0, 1), mk(1, 0)].map((m, i) => ({ ...m, sol: { visible: !!m.sol.visible }, tierra: { visible: !!m.tierra.visible }, i }));
  const ev = eventosPeriodo(serie, 0, 4, false);
  assert.deepEqual(ev.map((e) => [e.titulo, e.indice, e.horas]), [
    ['Tierra visible', 1, null], ['Inicio de sombra', 2, 2], ['Vuelve el Sol', 4, null], ['Tierra oculta', 4, 1],
  ]);
  const real = serieDe('shackleton');
  for (const e of eventosPeriodo(real, 0, real.length - 1, true)) assert.ok(e.indice > 0);
});

test('R del índice solo cuenta respaldo que llega a la Tierra', () => {
  for (const s of escenario.sitios) {
    const serie = serieDe(s.id, { tipoEnlace: 'optico' });
    const m = metricasPeriodo(serie, 0, serie.length - 1, true);
    assert.equal(m.horasRespaldo, serie.filter((x) => x.respaldoTierra).length);
    assert.ok(m.horasRespaldo <= m.enlace.rapido + m.enlace.robusto);
    const conTodo = { ...m, pctRespaldo: 100 };
    assert.ok(suitabilityScore(m, true) <= suitabilityScore(conTodo, true));
  }
  // Tramo local perfecto sin vista del apoyo a la Tierra: R = 0, no 100.
  const m = { pctSol: 50, pctTierra: 50, horas: 10, pctRespaldo: 0, enlace: { rapido: 10, robusto: 0, sin_enlace: 0 } };
  const p = PESOS_SUITABILITY;
  assert.equal(desgloseIndice(m, true, null).partes.respaldo, 0);
  assert.ok(Math.abs(suitabilityScore(m, true) - (p.energia * 50 + p.comunicacion * 50) / (p.energia + p.comunicacion + p.respaldo)) < 1e-9);
});

test('Sol y Tierra a la vez no incluye el respaldo', () => {
  const serie = serieDe('malapert', { tipoEnlace: 'rf' });
  const con = metricasPeriodo(serie, 0, serie.length - 1, true);
  const sin = metricasPeriodo(serie, 0, serie.length - 1, false);
  assert.equal(con.horasSolTierra, sin.horasSolTierra);
  assert.equal(con.horasSolTierra, serie.filter((x) => x.sol.visible && x.tierra.visible).length);
});

test('ventanas continuas por condición', () => {
  const serie = serieDe('shackleton');
  const m = metricasPeriodo(serie, 0, serie.length - 1, false);
  assert.equal(valorMetrica(m, 'ventanaTierra'), m.ventanaTierra.horas);
  for (let i = m.ventanaTierra.desde; i <= m.ventanaTierra.hasta; i++) assert.ok(serie[i].tierra.visible);
  for (let i = m.sombraMax.desde; i <= m.sombraMax.hasta; i++) assert.ok(!serie[i].sol.visible);
  assert.ok(m.ventanaSol.horas <= m.horasSol);
});

test('compararSitios marca empates en métricas de ventanas', () => {
  const met = (t) => ({ pctSol: 1, pctTierra: 1, pctSolTierra: 1, enlace: null, brecha: { horas: 1 },
    ventanaTierra: { horas: t }, sombraMax: { horas: 2 }, ventanaSol: { horas: 1 } });
  const filas = ['a', 'b', 'c'].map((id, k) => ({ sitio: { id, etiqueta: id.toUpperCase() }, metricas: met([5, 5, 3][k]) }));
  const r = compararSitios(filas, false);
  assert.deepEqual(r.mejores.ventanaTierra, ['a', 'b']);
  assert.deepEqual(r.mejores.sombraMax, ['a', 'b', 'c']);
  assert.ok(!('pctRespaldo' in r.mejores), 'sin enlace activo no se compara el respaldo');
});

test('problemasEfemerides detecta huecos y valores inválidos sin inventar datos', () => {
  const base = [
    { t: '2026-12-01T00:00', sol_el: 1, sol_az: 10, tierra_el: -1, tierra_az: 200 },
    { t: '2026-12-01T01:00', sol_el: 1, sol_az: 11, tierra_el: -1, tierra_az: 200 },
  ];
  assert.deepEqual(problemasEfemerides(base), []);
  assert.equal(problemasEfemerides([]).length, 1);
  assert.match(problemasEfemerides([base[0], { ...base[1], t: '2026-12-01T03:00' }])[0], /salto/);
  assert.match(problemasEfemerides([{ ...base[0], sol_el: 'x' }])[0], /sol_el/);
  assert.match(problemasEfemerides([{ ...base[0], tierra_az: 400 }])[0], /tierra_az/);
  for (const s of escenario.sitios) assert.deepEqual(problemasEfemerides(leer(s.efemerides).horas, s.id), []);
});

test('problemasEscenario rechaza horizontes con null en vez de tratarlos como 0°', () => {
  assert.deepEqual(problemasEscenario(escenario), []);
  const copia = JSON.parse(JSON.stringify(escenario));
  copia.sitios[1].horizonte.elevacion_deg[200] = null;
  assert.match(problemasEscenario(copia).join(' '), /de_gerlache: valor de horizonte no válido en el azimut 200°/);
  const corto = JSON.parse(JSON.stringify(escenario));
  corto.sitios[0].relevo.horizonte.elevacion_deg.pop();
  assert.match(problemasEscenario(corto).join(' '), /punto de apoyo: el horizonte debe tener 360 valores/);
  const sinPolvo = JSON.parse(JSON.stringify(escenario));
  sinPolvo.evento_polvo.inicio = 'no-es-fecha';
  assert.match(problemasEscenario(sinPolvo).join(' '), /evento de polvo/);
});

test('el respaldo sin conexión contiene exactamente los mismos datos que la web', () => {
  const html = fs.readFileSync(path.join(raiz, 'dist/lunar-navigator-demo.html'), 'utf8');
  const m = html.match(/<script type="application\/json" id="datos-demo">([\s\S]*?)<\/script>/);
  assert.ok(m, 'el respaldo debe incrustar los datos');
  const incrustado = JSON.parse(m[1].replace(/<\\\//g, '</'));
  assert.deepEqual(incrustado.escenario, escenario, 'escenario distinto: ejecuta npm run empaquetar');
  for (const s of escenario.sitios) {
    assert.deepEqual(incrustado.efemerides[s.id], leer(s.efemerides).horas, `efemérides de ${s.id} distintas`);
    assert.deepEqual(incrustado.coordenadas[s.id], leer(s.efemerides).sitio, `coordenadas de ${s.id} distintas`);
  }
});

test('esMarcaHoraria exige AAAA-MM-DDTHH:MM real', () => {
  assert.ok(esMarcaHoraria('2026-12-06T08:20'));
  for (const malo of ['no-es-fecha', '2026-12-06', '2026-13-01T00:00', '2026-12-06T8:20', '2026-02-30T00:00', '2026-12-31T24:00', '2026-12-31T23:60', null]) assert.ok(!esMarcaHoraria(malo), String(malo));
  assert.match(problemasEfemerides([{ t: 'x', sol_el: 1, sol_az: 1, tierra_el: 1, tierra_az: 1 }])[0], /fecha válida/);
});

test('problemasCoordenadas: usa las coordenadas de las efemérides y rechaza faltantes', () => {
  const coords = Object.fromEntries(escenario.sitios.map((s) => [s.id, leer(s.efemerides).sitio]));
  assert.deepEqual(problemasCoordenadas(escenario, coords), []);
  const sitiosJson = leer('sitios.json').sitios;
  for (const s of sitiosJson) assert.deepEqual([coords[s.id].lat, coords[s.id].lon], [s.lat, s.lon], `${s.id} coincide con sitios.json`);
  assert.match(problemasCoordenadas(escenario, { ...coords, malapert: { lat: -86 } }).join(' '), /malapert/);
  assert.match(problemasCoordenadas(escenario, { ...coords, shackleton: { lat: -89, lon: -10 } }).join(' '), /shackleton/);
});

test('problemasEscenario rechaza escenarios incoherentes antes de dibujar', () => {
  const casos = [
    [(e) => { e.sitios[1].id = e.sitios[0].id; }, /id está repetido/],
    [(e) => { e.sitios[0].relevo.distancia_km = -4; }, /mayor que 0 km/],
    [(e) => { e.enlace_local.rf.bateria_relevo_h = -72; }, /batería/],
    [(e) => { e.enlace_local.optico.sep_sin_enlace_deg = 20; }, /Umbrales ópticos incoherentes/],
    [(e) => { delete e.fuentes; }, /fuentes/],
    [(e) => { e.evento_polvo.inicio = '2026-02-30T00:00'; }, /evento de polvo/],
  ];
  for (const [mutar, esperado] of casos) {
    const copia = structuredClone(escenario);
    mutar(copia);
    assert.match(problemasEscenario(copia).join(' '), esperado);
  }
});

test('problemasCoordenadas rechaza elevaciones no numéricas', () => {
  const coords = Object.fromEntries(escenario.sitios.map((s) => [s.id, { ...leer(s.efemerides).sitio }]));
  coords[escenario.sitios[0].id].elev_km = 'alto';
  assert.match(problemasCoordenadas(escenario, coords).join(' '), /elevación debe ser numérica/);
});

test('siguienteInterrupcion: salta al próximo inicio y vuelve al primero al final', () => {
  const mk = (t) => ({ tierra: { visible: !!t }, respaldoTierra: false });
  const serie = [1, 0, 0, 1, 1, 0, 1].map(mk);
  assert.equal(siguienteInterrupcion(serie, 0, 6, 0, false), 1);
  assert.equal(siguienteInterrupcion(serie, 0, 6, 1, false), 5);
  assert.equal(siguienteInterrupcion(serie, 0, 6, 5, false), 1);
  assert.equal(siguienteInterrupcion([1, 1].map(mk), 0, 1, 0, false), null);
  // El respaldo que llega a la Tierra cuenta como comunicación con el enlace activo.
  const conRespaldo = serie.map((m) => ({ ...m, respaldoTierra: true }));
  assert.equal(siguienteInterrupcion(conRespaldo, 0, 6, 0, true), null);
});

test('eventos de fin llevan la ventana que abren', () => {
  const mk = (sol) => ({ sol: { visible: sol }, tierra: { visible: true }, enlace: { estado: 'rapido' } });
  const ev = eventosPeriodo([true, false, true, true, false].map(mk), 0, 4, false);
  assert.deepEqual(ev.map((e) => [e.titulo, e.horas, e.ventana]), [
    ['Inicio de sombra', 1, null], ['Vuelve el Sol', null, 2], ['Inicio de sombra', 1, null],
  ]);
});

test('cada métrica comparable tiene una insignia específica', () => {
  for (const d of METRICAS_COMPARADOR) if (d.mejor) assert.ok(d.insignia && !/^Mejor$/.test(d.insignia), d.clave);
});
