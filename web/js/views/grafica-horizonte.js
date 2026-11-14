import { horizonteEn } from '../model.js';
import { grados, esc } from '../format.js';
import { COLOR } from './estilos.js';

// El SVG se dibuja a tamaño real (1 unidad = 1 px) para que el texto no se
// encoja en pantallas pequeñas; por debajo de 560 px el contenedor se desplaza.
let W = 1000;
let H = 300;
const M = { izq: 52, der: 18, sup: 18, inf: 46 };
let EL_MIN = -4;
let EL_MAX = 8;

const x = (az) => M.izq + (az / 360) * (W - M.izq - M.der);
const y = (el) => M.sup + ((EL_MAX - el) / (EL_MAX - EL_MIN)) * (H - M.sup - M.inf);
const yc = (el) => y(Math.max(EL_MIN, Math.min(EL_MAX, el)));

function banda(az, ancho, color, opacidad) {
  const out = [];
  const a0 = az - ancho, a1 = az + ancho;
  const tramo = (p, q) => out.push(`<rect x="${x(p)}" y="${M.sup}" width="${x(q) - x(p)}" height="${H - M.sup - M.inf}" fill="${color}" opacity="${opacidad}"/>`);
  if (a0 < 0) { tramo(0, a1); tramo(360 + a0, 360); } else if (a1 > 360) { tramo(a0, 360); tramo(0, a1 - 360); } else tramo(a0, a1);
  return out.join('');
}

function marcador(az, el, color, relleno, etiqueta, horizonte) {
  const cx = x(az), cy = yc(el);
  const fuera = el > EL_MAX || el < EL_MIN;
  const lx = cx > W - 140 ? cx - 14 : cx + 14;
  const ancla = cx > W - 140 ? 'end' : 'start';
  return `
    <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${yc(horizonte)}" stroke="${color}" stroke-dasharray="3 3" opacity=".7"/>
    <circle cx="${cx}" cy="${cy}" r="8" fill="${relleno ? color : COLOR.fondo}" stroke="${color}" stroke-width="2"/>
    <text x="${lx}" y="${cy - 10}" text-anchor="${ancla}" fill="${color}" class="g-etq">${esc(etiqueta)}${fuera ? ' (fuera de escala)' : ''}</text>`;
}

/** Elevación del terreno por azimut con la posición del Sol, la Tierra y el punto de apoyo. */
export function renderGraficaHorizonte(cont, d) {
  const { sitio, muestra: m, estado, escenario } = d;
  const plano = estado.modoHorizonte === 'plano';
  const perfil = plano ? null : sitio.horizonte;
  W = Math.max(560, Math.round(cont.clientWidth || 1000));
  H = W < 760 ? 260 : 300;
  // Escala vertical fija por sitio (no cambia al mover el cursor).
  const perfilVals = perfil ? perfil.elevacion_deg : [0];
  const maxSerie = d.serie.reduce((mx, s) => Math.max(mx, s.sol.el, s.tierra.el), Math.max(...perfilVals));
  const minSerie = d.serie.reduce((mn, s) => Math.min(mn, s.sol.el, s.tierra.el), Math.min(...perfilVals));
  EL_MAX = Math.max(6, Math.ceil(maxSerie / 2) * 2 + 2);
  EL_MIN = Math.min(-4, Math.floor(minSerie / 2) * 2);

  const partes = [];
  // Rejilla y ejes.
  const pasoEl = EL_MAX - EL_MIN > 18 ? 4 : 2;
  for (let el = EL_MIN; el <= EL_MAX; el += pasoEl) {
    const yy = y(el);
    partes.push(`<line x1="${M.izq}" x2="${W - M.der}" y1="${yy}" y2="${yy}" stroke="rgba(255,255,255,${el === 0 ? 0.35 : 0.08})"/>`);
    partes.push(`<text x="${M.izq - 8}" y="${yy + 4}" text-anchor="end" class="g-eje">${el}°</text>`);
  }
  const cardinales = { 0: 'N', 90: 'E', 180: 'S', 270: 'O', 360: 'N' };
  for (let az = 0; az <= 360; az += 45) {
    partes.push(`<line y1="${M.sup}" y2="${H - M.inf}" x1="${x(az)}" x2="${x(az)}" stroke="rgba(255,255,255,.08)"/>`);
    partes.push(`<text x="${x(az)}" y="${H - M.inf + 18}" text-anchor="middle" class="g-eje">${az}°${cardinales[az] ? ` ${cardinales[az]}` : ''}</text>`);
  }
  partes.push(`<text x="${(M.izq + W - M.der) / 2}" y="${H - 6}" text-anchor="middle" class="g-titulo">Azimut (°)</text>`);
  partes.push(`<text transform="translate(14 ${(M.sup + H - M.inf) / 2}) rotate(-90)" text-anchor="middle" class="g-titulo">Elevación (°)</text>`);

  // Zonas de deslumbramiento del enlace óptico (supuesto).
  if (estado.enlaceActivo && estado.tipoEnlace === 'optico') {
    const o = escenario.enlace_local.optico;
    for (const az of [sitio.relevo.az_deg, (sitio.relevo.az_deg + 180) % 360]) {
      partes.push(banda(az, o.sep_robusto_deg, COLOR.aviso, 0.08));
      partes.push(banda(az, o.sep_sin_enlace_deg, COLOR.error, 0.14));
    }
  }

  // Perfil del terreno.
  const pts = [];
  for (let az = 0; az <= 360; az += 1) pts.push(`${x(az).toFixed(1)},${yc(horizonteEn(perfil, az)).toFixed(1)}`);
  partes.push(`<path d="M${x(0)},${H - M.inf} L${pts.join(' L')} L${x(360)},${H - M.inf} Z" fill="url(#g-terreno)"/>`);
  partes.push(`<polyline points="${pts.join(' ')}" fill="none" stroke="${COLOR.texto2}" stroke-width="1.5"/>`);

  // Punto de apoyo.
  if (estado.enlaceActivo) {
    const r = sitio.relevo;
    const rx = x(r.az_deg), ry = yc(r.el_deg);
    partes.push(`<path d="M${rx},${ry - 9}l8,14h-16z" fill="${COLOR.superficie}" stroke="${COLOR.acento}" stroke-width="2"/>`);
    partes.push(`<text x="${rx - 12}" y="${ry + 22}" text-anchor="end" class="g-etq" fill="${COLOR.acento}">Punto de apoyo</text>`);
  }

  partes.push(marcador(m.tierra.az, m.tierra.el, COLOR.tierra, m.tierra.visible, `Tierra ${grados(m.tierra.el)}`, m.tierra.horizonte));
  partes.push(marcador(m.sol.az, m.sol.el, COLOR.sol, m.sol.visible, `Sol ${grados(m.sol.el)}`, m.sol.horizonte));

  cont.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Horizonte de ${esc(sitio.etiqueta)}: Sol a ${grados(m.sol.el)} de elevación, ${m.sol.visible ? 'visible' : 'tapado por el terreno'}; Tierra a ${grados(m.tierra.el)}, ${m.tierra.visible ? 'visible' : 'oculta'}.">
      <defs><linearGradient id="g-terreno" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#55585E" stop-opacity=".9"/><stop offset="1" stop-color="#1B1D21" stop-opacity=".9"/></linearGradient></defs>
      <style>
        .g-eje { font: 400 12px var(--fuente); fill: ${COLOR.texto3}; }
        .g-titulo { font: 500 12px var(--fuente); fill: ${COLOR.texto2}; }
        .g-etq { font: 600 13px var(--fuente); }
      </style>
      ${partes.join('')}
    </svg>`;
}

export function leyendaHorizonte(cont, estado) {
  const optico = estado.enlaceActivo && estado.tipoEnlace === 'optico';
  cont.innerHTML = `
    <li><span class="muestra" style="background:#55585E;border-top:2px solid ${COLOR.texto2}"></span>Terreno (elevación por azimut)</li>
    <li><span class="muestra" style="background:${COLOR.sol};border-radius:50%"></span>Sol: relleno si supera el horizonte</li>
    <li><span class="muestra" style="background:${COLOR.tierra};border-radius:50%"></span>Tierra: relleno si supera el horizonte</li>
    ${estado.enlaceActivo ? `<li><span class="muestra" style="border:2px solid ${COLOR.acento}"></span>Punto de apoyo</li>` : ''}
    ${optico ? `<li><span class="muestra" style="background:${COLOR.error};opacity:.6"></span><span class="muestra" style="background:${COLOR.aviso};opacity:.35"></span>Zonas donde el Sol deslumbra el enlace (supuesto)</li>` : ''}
    <li>Unidades: grados; azimut desde el norte local</li>`;
}
