import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  latLonAVector, vectorALatLon, destino, distanciaKm, quatRotar, quatEntre, quatSlerp,
  orientacionPoloSur, orientacionParaSitio, suavizar, RADIO_LUNA_KM,
} from '../web/js/luna-geometria.js';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sitios = JSON.parse(fs.readFileSync(path.join(raiz, 'sitios.json'), 'utf8')).sitios;
const cerca = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
const cercaV = (a, b, tol = 1e-9) => a.every((v, i) => cerca(v, b[i], tol));

test('latLonAVector: polos, meridiano 0° y longitud este', () => {
  assert.ok(cercaV(latLonAVector(-90, 0), [0, -1, 0]));
  assert.ok(cercaV(latLonAVector(90, 123), [0, 1, 0]));
  assert.ok(cercaV(latLonAVector(0, 0), [1, 0, 0]));
  assert.ok(cercaV(latLonAVector(0, 90), [0, 0, -1]));
});

test('vectorALatLon invierte latLonAVector para los tres sitios sin cambiar signos', () => {
  for (const s of sitios) {
    const r = vectorALatLon(latLonAVector(s.lat, s.lon));
    assert.ok(cerca(r.lat, s.lat, 1e-9), s.id);
    assert.ok(cerca(r.lon, s.lon, 1e-9), s.id);
    assert.ok(r.lat < -85, `${s.id} debe quedar en el hemisferio sur`);
  }
});

test('destino y distanciaKm son coherentes', () => {
  const a = { lat: -89.01701, lon: 126.27302 };
  for (const [az, km] of [[112, 6.5], [305, 4], [60, 9]]) {
    const b = destino(a.lat, a.lon, az, km);
    assert.ok(cerca(distanciaKm(a, b), km, 1e-6), `${az}°`);
  }
  // Hacia el norte desde el ecuador: solo cambia la latitud.
  const n = destino(0, 10, 0, (Math.PI / 2) * RADIO_LUNA_KM / 9);
  assert.ok(cerca(n.lat, 10, 1e-9) && cerca(n.lon, 10, 1e-9));
});

test('cuaterniones: quatEntre lleva a hasta b, incluidos vectores opuestos', () => {
  for (const [a, b] of [[[1, 0, 0], [0, 1, 0]], [[0, -1, 0], [0, 0, 1]], [[0, 0, 1], [0, 0, -1]]]) {
    assert.ok(cercaV(quatRotar(quatEntre(a, b), a), b, 1e-9));
  }
  const q = quatEntre([1, 0, 0], [0, 1, 0]);
  assert.ok(cercaV(quatSlerp([0, 0, 0, 1], q, 1), q, 1e-9));
  assert.ok(cercaV(quatSlerp([0, 0, 0, 1], q, 0), [0, 0, 0, 1], 1e-9));
});

test('vista polar: polo sur hacia la cámara y meridiano 0° arriba', () => {
  const q = orientacionPoloSur();
  assert.ok(cercaV(quatRotar(q, [0, -1, 0]), [0, 0, 1], 1e-9));
  const m = quatRotar(q, latLonAVector(-80, 0));
  assert.ok(m[1] > 0 && cerca(m[0], 0, 1e-9), 'el meridiano 0° queda arriba');
  // Visto desde fuera sobre el polo sur, la longitud este crece en sentido
  // horario: 90° E a la derecha, 180° abajo, 270° E a la izquierda (como LROC).
  assert.ok(quatRotar(q, latLonAVector(-80, 90))[0] > 0);
  assert.ok(quatRotar(q, latLonAVector(-80, 180))[1] < 0);
  assert.ok(quatRotar(q, latLonAVector(-80, 270))[0] < 0);
});

test('orientacionParaSitio pone cada sitio frente a la cámara', () => {
  for (const s of sitios) {
    assert.ok(cercaV(quatRotar(orientacionParaSitio(s.lat, s.lon), latLonAVector(s.lat, s.lon)), [0, 0, 1], 1e-9), s.id);
  }
});

test('suavizar va de 0 a 1 y se acota fuera del rango', () => {
  assert.equal(suavizar(0), 0);
  assert.equal(suavizar(1), 1);
  assert.equal(suavizar(-3), 0);
  assert.equal(suavizar(7), 1);
  assert.ok(cerca(suavizar(0.5), 0.5));
});
