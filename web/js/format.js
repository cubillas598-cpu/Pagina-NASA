// Formato de fechas, números y utilidades de SVG. Todo en UTC.

const fmtFecha = new Intl.DateTimeFormat('es-MX', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' });
const fmtDiaMes = new Intl.DateTimeFormat('es-MX', { timeZone: 'UTC', day: 'numeric', month: 'short' });
const fmtHora = new Intl.DateTimeFormat('es-MX', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

export const limpiarPunto = (s) => s.replace('.', '');

export function fechaUtc(ms) { return limpiarPunto(fmtFecha.format(ms)); }
export function diaMesUtc(ms) { return limpiarPunto(fmtDiaMes.format(ms)); }
export function horaUtc(ms) { return `${fmtHora.format(ms)} UTC`; }
export function fechaHoraUtc(ms) { return `${fechaUtc(ms)}, ${horaUtc(ms)}`; }
export function isoDia(ms) { return new Date(ms).toISOString().slice(0, 10); }

export function num(v, dec = 1) {
  return v.toLocaleString('es-MX', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
export function grados(v, dec = 1) { return `${num(v, dec)}°`; }
export function conSigno(v, dec = 1) { return `${v >= 0 ? '+' : '−'}${num(Math.abs(v), dec)}°`; }
export function horasTexto(h) { return h === 1 ? '1 h' : `${h} h`; }

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Generador pseudoaleatorio determinista (mulberry32). */
export function aleatorio(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Contorno cerrado ondulado alrededor de (cx, cy), para líneas topográficas. */
export function contorno(cx, cy, rx, ry, rnd, amplitud = 0.12, puntos = 48) {
  const fases = [rnd() * 6.28, rnd() * 6.28, rnd() * 6.28];
  const pts = [];
  for (let k = 0; k < puntos; k++) {
    const a = (k / puntos) * Math.PI * 2;
    const f = 1 + amplitud * (Math.sin(3 * a + fases[0]) * 0.6 + Math.sin(5 * a + fases[1]) * 0.3 + Math.sin(2 * a + fases[2]) * 0.4);
    pts.push([cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f]);
  }
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let k = 0; k < puntos; k++) {
    const p0 = pts[(k - 1 + puntos) % puntos], p1 = pts[k], p2 = pts[(k + 1) % puntos], p3 = pts[(k + 2) % puntos];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return `${d}Z`;
}

/** Punto en pantalla desde un azimut (0° arriba, sentido horario). */
export function polar(cx, cy, r, az) {
  const a = (az * Math.PI) / 180;
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
}
