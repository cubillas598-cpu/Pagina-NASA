// Ejecutar: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  horizonteEn, separacionAngular, clasificar, calcularSerie, metricasPeriodo,
  tramoMasLargo, segmentar, compararSitios, comparativoCsv,
} from '../web/js/model.js';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const leer = (p) => JSON.parse(fs.readFileSync(path.join(raiz, p), 'utf8'));
const escenario = leer('data/escenario_demo.json');

function serieDe(id, extra = {}) {
  const sitio = escenario.sitios.find((s) => s.id === id);
  const horas = leer(sitio.efemerides).horas;
  return calcularSerie(sitio, horas, {
    modoHorizonte: 'sintetico', tipoEnlace: 'rf', polvo: false,
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
  assert.equal(a.length, 721);
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

test('el evento de polvo solo degrada el enlace óptico', () => {
  const ev = escenario.evento_polvo;
  const opt = serieDe('shackleton', { tipoEnlace: 'optico', polvo: true });
  const i = opt.findIndex((m) => m.t === ev.inicio);
  assert.equal(opt[i].enlace.estado, 'sin_enlace');
  assert.ok(opt[i].enlace.limitantes.some((f) => f.clave === 'polvo'));
  const rf = serieDe('shackleton', { tipoEnlace: 'rf', polvo: true });
  assert.ok(!rf[i].enlace.factores.some((f) => f.clave === 'polvo'));
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
  const met = (pctSol, brecha) => ({ pctSol, pctTierra: 10, enlace: null, brecha: { horas: brecha } });
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
});

test('CSV: cabecera, una fila por sitio y comillas cuando hacen falta', () => {
  const m = { horas: 2, pctSol: 50, pctTierra: 0, enlace: { rapido: 1, robusto: 1, sin_enlace: 0 }, brecha: { horas: 2 } };
  const csv = comparativoCsv([{ sitio: { etiqueta: 'Sitio A', nombre_corto: 'Borde, Shackleton' }, metricas: m }],
    { inicio: 'x', fin: 'y', enlaceActivo: true, tipoEnlace: 'optico', polvo: true, modoHorizonte: 'sintetico' });
  const lineas = csv.trim().split('\n');
  assert.equal(lineas.length, 2);
  assert.ok(lineas[1].includes('"Borde, Shackleton"'));
  assert.ok(lineas[1].includes(',si,1,1,0,2,sintetico'));
});
