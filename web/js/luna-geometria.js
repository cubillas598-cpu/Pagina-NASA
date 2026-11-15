// Geometría de la Luna para el visor: funciones puras, sin Three.js ni DOM.
// Convención de ejes (igual que Three.js): +Y = polo norte lunar,
// +X = (latitud 0°, longitud 0°), longitud este positiva hacia -Z.
// Los cuaterniones son [x, y, z, w].

export const RADIO_LUNA_KM = 1737.4;
const RAD = Math.PI / 180;

/** Punto unitario (o de radio r) para una latitud y una longitud este en grados. */
export function latLonAVector(latDeg, lonDeg, r = 1) {
  const lat = latDeg * RAD;
  const lon = lonDeg * RAD;
  return [r * Math.cos(lat) * Math.cos(lon), r * Math.sin(lat), -r * Math.cos(lat) * Math.sin(lon)];
}

/** Inversa de latLonAVector: devuelve {lat, lon} con lon en [0, 360). */
export function vectorALatLon([x, y, z]) {
  const r = Math.hypot(x, y, z);
  const lat = Math.asin(y / r) / RAD;
  const lon = ((Math.atan2(-z, x) / RAD) % 360 + 360) % 360;
  return { lat, lon };
}

/**
 * Destino geodésico sobre la esfera lunar: desde (lat, lon), recorrer
 * distanciaKm con un azimut inicial (0° = norte, sentido horario).
 */
export function destino(latDeg, lonDeg, azDeg, distanciaKm) {
  const d = distanciaKm / RADIO_LUNA_KM;
  const lat1 = latDeg * RAD;
  const lon1 = lonDeg * RAD;
  const az = azDeg * RAD;
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(az));
  const lon2 = lon1 + Math.atan2(Math.sin(az) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));
  return { lat: lat2 / RAD, lon: (((lon2 / RAD) % 360) + 360) % 360 };
}

/** Distancia de gran círculo en km entre dos puntos de la superficie. */
export function distanciaKm(a, b) {
  const [x1, y1, z1] = latLonAVector(a.lat, a.lon);
  const [x2, y2, z2] = latLonAVector(b.lat, b.lon);
  const c = Math.min(1, Math.max(-1, x1 * x2 + y1 * y2 + z1 * z2));
  return Math.acos(c) * RADIO_LUNA_KM;
}

// ---- Cuaterniones mínimos

export function quatMultiplicar([ax, ay, az, aw], [bx, by, bz, bw]) {
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}

export function quatRotar(q, [vx, vy, vz]) {
  const [x, y, z, w] = q;
  const p = quatMultiplicar(quatMultiplicar(q, [vx, vy, vz, 0]), [-x, -y, -z, w]);
  return [p[0], p[1], p[2]];
}

function normalizar(v) {
  const n = Math.hypot(...v);
  return v.map((c) => c / n);
}

/** Rotación más corta que lleva el vector unitario a hasta b. */
export function quatEntre(a, b) {
  const [ax, ay, az] = normalizar(a);
  const [bx, by, bz] = normalizar(b);
  const d = ax * bx + ay * by + az * bz;
  if (d < -0.999999) {
    // Opuestos: girar 180° sobre cualquier eje perpendicular.
    const eje = Math.abs(ax) < 0.9 ? normalizar([0, -az, ay]) : normalizar([-ay, ax, 0]);
    return [...eje, 0];
  }
  const c = [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
  return normalizar([c[0], c[1], c[2], 1 + d]);
}

/** Interpolación esférica entre cuaterniones unitarios. */
export function quatSlerp(a, b, t) {
  let [bx, by, bz, bw] = b;
  let cos = a[0] * bx + a[1] * by + a[2] * bz + a[3] * bw;
  if (cos < 0) { bx = -bx; by = -by; bz = -bz; bw = -bw; cos = -cos; }
  if (cos > 0.9995) return normalizar(a.map((v, i) => v + t * ([bx, by, bz, bw][i] - v)));
  const ang = Math.acos(cos);
  const s = Math.sin(ang);
  const wa = Math.sin((1 - t) * ang) / s;
  const wb = Math.sin(t * ang) / s;
  return [a[0] * wa + bx * wb, a[1] * wa + by * wb, a[2] * wa + bz * wb, a[3] * wa + bw * wb];
}

/**
 * Orientación del globo para la vista del polo sur: el polo sur mira a la
 * cámara (+Z) y el meridiano 0° (hacia la Tierra) queda arriba en pantalla (+Y),
 * como en los mapas polares habituales.
 */
export function orientacionPoloSur() {
  const q1 = quatEntre([0, -1, 0], [0, 0, 1]);
  const meridiano = quatRotar(q1, [1, 0, 0]);
  // Girar alrededor del eje de visión para que el meridiano 0° apunte a +Y.
  const ang = Math.atan2(meridiano[0], meridiano[1]);
  const q2 = [0, 0, Math.sin(ang / 2), Math.cos(ang / 2)];
  return quatMultiplicar(q2, q1);
}

/**
 * Orientación que pone un sitio frente a la cámara partiendo de la vista
 * polar, con el giro mínimo: el meridiano 0° sigue aproximadamente arriba.
 */
export function orientacionParaSitio(latDeg, lonDeg) {
  const base = orientacionPoloSur();
  const n = quatRotar(base, latLonAVector(latDeg, lonDeg));
  return quatMultiplicar(quatEntre(n, [0, 0, 1]), base);
}

/** Suavizado de 0 a 1 para animaciones de cámara. */
export function suavizar(t) {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

/**
 * Malla del casquete del polo sur que lleva la imagen de relieve LOLA
 * (scripts/relieve_3d.py). La imagen usa el plano azimutal equidistante de los
 * visores de docs/: x = r·sen(lon), z = −r·cos(lon), con r en km
 * (kmPorGrado km por grado de colatitud); la fila 0 de la imagen es z = −semilado.
 * Devuelve arreglos planos para un BufferGeometry.
 */
export function casquetePolar({ semiladoKm = 240, kmPorGrado = 30.32, anillos = 96, sectores = 192, radio = 1 } = {}) {
  const posiciones = [];
  const uvs = [];
  const indices = [];
  for (let i = 0; i <= anillos; i++) {
    const rKm = (semiladoKm * i) / anillos;
    const lat = -(90 - rKm / kmPorGrado);
    for (let j = 0; j <= sectores; j++) {
      const lon = (360 * j) / sectores;
      posiciones.push(...latLonAVector(lat, lon, radio));
      const x = rKm * Math.sin(lon * RAD);
      const z = -rKm * Math.cos(lon * RAD);
      uvs.push((x + semiladoKm) / (2 * semiladoKm), 1 - (z + semiladoKm) / (2 * semiladoKm));
    }
  }
  const fila = sectores + 1;
  for (let i = 0; i < anillos; i++) {
    for (let j = 0; j < sectores; j++) {
      const a = i * fila + j;
      const b = a + fila;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  return { posiciones, uvs, indices };
}
