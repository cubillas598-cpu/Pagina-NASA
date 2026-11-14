import { aleatorio, contorno, polar, esc } from '../format.js';
import { COLOR, ENLACE, defsPatrones } from './estilos.js';

const MAPA_W = 1000;
const MAPA_H = 625;

function terreno() {
  const rnd = aleatorio(20261201);
  const capas = [];
  // Cráter Shackleton: borde elevado e interior en sombra permanente.
  const cx = 0.53 * MAPA_W, cy = 0.44 * MAPA_H;
  capas.push(`<ellipse cx="${cx}" cy="${cy}" rx="70" ry="58" fill="url(#g-crater)"/>`);
  for (let k = 0; k < 4; k++) capas.push(`<path class="iso iso--borde" d="${contorno(cx, cy, 78 + k * 16, 66 + k * 14, rnd, 0.06)}"/>`);
  // Macizo Malapert y relieves secundarios.
  const relieves = [
    [0.42 * MAPA_W, 0.86 * MAPA_H, 150, 70, 6], [0.18 * MAPA_W, 0.3 * MAPA_H, 120, 90, 5], [0.84 * MAPA_W, 0.24 * MAPA_H, 110, 80, 5],
    [0.82 * MAPA_W, 0.78 * MAPA_H, 130, 70, 4], [0.24 * MAPA_W, 0.66 * MAPA_H, 70, 50, 3], [0.68 * MAPA_W, 0.6 * MAPA_H, 60, 40, 3],
  ];
  for (const [x, y, rx, ry, n] of relieves) {
    for (let k = n; k >= 1; k--) capas.push(`<path class="iso" d="${contorno(x, y, (rx * k) / n, (ry * k) / n, rnd, 0.14)}"/>`);
  }
  // Pequeños cráteres.
  for (let k = 0; k < 18; k++) {
    const x = rnd() * MAPA_W, y = rnd() * MAPA_H, r = 4 + rnd() * 12;
    capas.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="rgba(7,11,20,.35)" stroke="rgba(168,180,200,.12)"/>`);
  }
  return capas.join('');
}

let construido = false;

export function renderMapa(cont, d, alElegir) {
  if (!construido) {
    cont.innerHTML = `
      <svg viewBox="0 0 ${MAPA_W} ${MAPA_H}" role="group" aria-label="Vista conceptual del terreno con los tres sitios candidatos">
        <defs>
          ${defsPatrones()}
          <radialGradient id="g-suelo" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#1A2335"/><stop offset="1" stop-color="#0B111D"/></radialGradient>
          <radialGradient id="g-crater" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#05080F"/><stop offset=".8" stop-color="#0A0F1A"/><stop offset="1" stop-color="#1A2335"/></radialGradient>
          <filter id="f-brillo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
        </defs>
        <style>
          .iso { fill: none; stroke: rgba(168,180,200,.14); stroke-width: 1; }
          .iso--borde { stroke: rgba(168,180,200,.22); }
          .etq { font: 500 15px var(--fuente); fill: ${COLOR.texto}; }
          .etq2 { font: 400 13px var(--fuente); fill: ${COLOR.texto2}; }
          .rosa text { font: 500 11px var(--fuente); fill: ${COLOR.texto2}; }
        </style>
        <rect width="${MAPA_W}" height="${MAPA_H}" fill="url(#g-suelo)"/>
        <g>${terreno()}</g>
        <text x="${0.53 * MAPA_W}" y="${0.44 * MAPA_H + 140}" text-anchor="middle" class="etq2" opacity=".6">Cráter Shackleton</text>
        <text x="20" y="${MAPA_H - 18}" class="etq2">Polo sur, posiciones ilustrativas, sin escala</text>
        <g id="mapa-dinamico"></g>
      </svg>`;
    construido = true;
    cont.addEventListener('click', (ev) => {
      const g = ev.target.closest('[data-sitio]');
      if (g) alElegir(g.dataset.sitio);
    });
    cont.addEventListener('keydown', (ev) => {
      const g = ev.target.closest('[data-sitio]');
      if (g && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); alElegir(g.dataset.sitio); }
    });
  }

  const { sitios, sitio: activo, muestra: m, estado } = d;
  const capas = [];
  const P = (s) => [s.mapa.x * MAPA_W, s.mapa.y * MAPA_H];
  const [ax, ay] = P(activo);

  // Enlace local hacia el punto de apoyo.
  if (estado.enlaceActivo) {
    const [rx, ry] = polar(ax, ay, 105, activo.relevo.az_deg);
    const e = ENLACE[m.enlace.estado];
    const guion = m.enlace.estado === 'rapido' ? '' : m.enlace.estado === 'robusto' ? 'stroke-dasharray="10 6"' : 'stroke-dasharray="3 7"';
    capas.push(`<line x1="${ax}" y1="${ay}" x2="${rx}" y2="${ry}" stroke="${e.color}" stroke-width="3" stroke-linecap="round" ${guion}/>`);
    if (m.enlace.estado === 'sin_enlace') {
      const mx = (ax + rx) / 2, my = (ay + ry) / 2;
      capas.push(`<path d="M${mx - 7},${my - 7}l14,14M${mx + 7},${my - 7}l-14,14" stroke="${COLOR.error}" stroke-width="2.5" stroke-linecap="round"/>`);
    }
    if (estado.tipoEnlace === 'optico' && estado.polvo && m.enlace.factores.some((f) => f.clave === 'polvo')) {
      capas.push(`<circle cx="${(ax + rx) / 2}" cy="${(ay + ry) / 2}" r="34" fill="url(#p-polvo)" opacity=".9"/>`);
    }
    const rTierra = m.relevo.tierra;
    capas.push(`<g aria-label="${esc(activo.relevo.nombre)}">
      <path d="M${rx},${ry - 11}l10,17h-20z" fill="${COLOR.superficie}" stroke="${COLOR.cian}" stroke-width="2"/>
      <text x="${rx + (rx < ax ? -16 : 16)}" y="${ry - 2}" text-anchor="${rx < ax ? 'end' : 'start'}" class="etq2">${esc(activo.relevo.nombre)}</text>
      <text x="${rx + (rx < ax ? -16 : 16)}" y="${ry + 15}" text-anchor="${rx < ax ? 'end' : 'start'}" class="etq2" fill="${rTierra ? COLOR.tierra : COLOR.texto3}">${rTierra ? 've la Tierra' : 'sin vista a la Tierra'}</text>
    </g>`);
  }

  // Rosa de direcciones del sitio activo: Sol y Tierra por azimut local.
  const R = 54;
  const [sx, sy] = polar(ax, ay, R, m.sol.az);
  const [tx, ty] = polar(ax, ay, R, m.tierra.az);
  const [nx, ny] = polar(ax, ay, R + 12, 0);
  capas.push(`<g class="rosa">
    <circle cx="${ax}" cy="${ay}" r="${R}" fill="none" stroke="rgba(125,211,252,.28)" stroke-dasharray="2 5"/>
    <text x="${nx}" y="${ny + 4}" text-anchor="middle">N</text>
    <line x1="${ax}" y1="${ay}" x2="${sx}" y2="${sy}" stroke="${COLOR.ambar}" stroke-opacity="${m.sol.visible ? 0.7 : 0.25}"/>
    <circle cx="${sx}" cy="${sy}" r="9" fill="${m.sol.visible ? COLOR.ambar : 'none'}" stroke="${COLOR.ambar}" stroke-width="2"/>
    <line x1="${ax}" y1="${ay}" x2="${tx}" y2="${ty}" stroke="${COLOR.tierra}" stroke-opacity="${m.tierra.visible ? 0.7 : 0.25}"/>
    <circle cx="${tx}" cy="${ty}" r="8" fill="${m.tierra.visible ? COLOR.tierra : 'none'}" stroke="${COLOR.tierra}" stroke-width="2"/>
  </g>`);

  // Marcadores seleccionables.
  for (const s of sitios) {
    const [x, y] = P(s);
    const sel = s.id === activo.id;
    const letra = s.etiqueta.slice(-1);
    capas.push(`<g class="marcador" data-sitio="${s.id}" tabindex="0" role="button" aria-pressed="${sel}" aria-label="${esc(s.etiqueta)}: ${esc(s.nombre_corto)}">
      <circle cx="${x}" cy="${y}" r="44" fill="transparent"/>
      ${sel ? `<circle cx="${x}" cy="${y}" r="26" fill="${COLOR.cian}" opacity=".18" filter="url(#f-brillo)"/>` : ''}
      <circle class="marcador__anillo" cx="${x}" cy="${y}" r="17" fill="${sel ? 'rgba(125,211,252,.18)' : 'rgba(16,24,39,.85)'}" stroke="${sel ? COLOR.cian : 'rgba(168,180,200,.5)'}" stroke-width="2"/>
      <text x="${x}" y="${y + 5}" text-anchor="middle" class="etq etq--letra">${letra}</text>
      <text x="${x}" y="${y + (sel ? 84 : 40)}" text-anchor="middle" class="etq2 etq--nombre" ${sel ? `fill="${COLOR.texto}"` : ''}>${esc(s.nombre_corto)}</text>
    </g>`);
  }

  cont.querySelector('#mapa-dinamico').innerHTML = capas.join('');
}

export function leyendaMapa(cont) {
  cont.innerHTML = `
    <li><span class="muestra" style="background:${COLOR.ambar};border-radius:50%"></span>Sol (relleno si es visible)</li>
    <li><span class="muestra" style="background:${COLOR.tierra};border-radius:50%"></span>Tierra (relleno si es visible)</li>
    <li><span class="muestra" style="border:2px solid ${COLOR.cian};border-radius:2px"></span>Punto de apoyo</li>
    <li><span class="muestra" style="background:${COLOR.ok}"></span>Línea continua: rápido</li>
    <li><span class="muestra" style="background:repeating-linear-gradient(90deg,${COLOR.aviso} 0 6px,transparent 6px 9px)"></span>Discontinua: robusto</li>
    <li><span class="muestra" style="background:repeating-linear-gradient(90deg,${COLOR.error} 0 2px,transparent 2px 6px)"></span>Punteada con ✕: sin enlace</li>
    <li>Rosa de azimut local, norte arriba</li>`;
}
