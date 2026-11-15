import { destino } from '../luna-geometria.js';
import { esc, polar } from '../format.js';
import { COLOR, ENLACE, defsPatrones } from './estilos.js';

// Mapa polar sur con coordenadas reales (proyección azimutal equidistante
// centrada en el polo): radio = distancia angular al polo, meridiano 0° arriba
// y longitud este creciendo en sentido horario, igual que la vista 3D.
// No dibuja relieve: el fondo solo lleva la retícula.

const MAPA_W = 1000;
const MAPA_H = 760;
const CX = MAPA_W / 2;
const CY = MAPA_H / 2;
const RADIO_PX = 340;
const EXTENSION_DEG = 4.6; // la retícula llega hasta 85.4° S

const KM_POR_GRADO = (Math.PI / 180) * 1737.4;

/** Coordenadas de pantalla para una latitud sur y una longitud este. */
export function proyectarPolar(lat, lon) {
  const r = ((90 + lat) / EXTENSION_DEG) * RADIO_PX;
  const a = (lon * Math.PI) / 180;
  return [CX + r * Math.sin(a), CY - r * Math.cos(a)];
}

function reticula() {
  const p = [];
  for (let k = 1; k <= 4; k++) {
    const r = (k / EXTENSION_DEG) * RADIO_PX;
    p.push(`<circle cx="${CX}" cy="${CY}" r="${r}" class="ret"/>`);
    p.push(`<text x="${CX + 8}" y="${CY + r + 20}" class="ret-etq">${90 - k}° S</text>`);
  }
  for (let lon = 0; lon < 360; lon += 30) {
    const [x, y] = proyectarPolar(-90 + EXTENSION_DEG, lon);
    p.push(`<line x1="${CX}" y1="${CY}" x2="${x}" y2="${y}" class="ret"/>`);
    const [tx, ty] = proyectarPolar(-90 + EXTENSION_DEG + 0.32, lon);
    const etq = lon === 0 ? '0°' : lon === 180 ? '180°' : `${lon}° E`;
    p.push(`<text x="${tx}" y="${ty + 4}" text-anchor="middle" class="ret-etq">${etq}</text>`);
  }
  p.push(`<circle cx="${CX}" cy="${CY}" r="3" fill="${COLOR.texto3}"/><text x="${CX}" y="${CY - 10}" text-anchor="middle" class="ret-etq">Polo sur</text>`);
  // Barra de escala de 25 km.
  const px25 = (25 / KM_POR_GRADO / EXTENSION_DEG) * RADIO_PX;
  p.push(`<line x1="40" y1="${MAPA_H - 40}" x2="${40 + px25}" y2="${MAPA_H - 40}" stroke="${COLOR.texto2}" stroke-width="2"/><text x="40" y="${MAPA_H - 50}" class="ret-etq">25 km</text>`);
  return p.join('');
}

/**
 * Crea un mapa polar en `cont`. `alElegir(id)` se llama al pulsar un sitio.
 * Devuelve render(d) para redibujar el estado de la hora seleccionada.
 */
export function crearMapaPolar(cont, alElegir) {
  cont.innerHTML = `
    <svg viewBox="0 0 ${MAPA_W} ${MAPA_H}" role="group" aria-label="Mapa polar sur con las coordenadas de los tres sitios">
      <defs>${defsPatrones()}</defs>
      <style>
        .ret { fill: none; stroke: rgba(255,255,255,.09); stroke-width: 1; }
        .ret-etq { font: 400 18px var(--fuente); fill: ${COLOR.texto3}; }
        .etq { font: 600 20px var(--fuente); fill: ${COLOR.texto}; }
        .etq2 { font: 500 22px var(--fuente); fill: ${COLOR.texto2}; }
      </style>
      <rect width="${MAPA_W}" height="${MAPA_H}" fill="rgba(10,11,13,.35)"/>
      <g>${reticula()}</g>
      <g class="mapa-dinamico"></g>
    </svg>`;
  cont.addEventListener('click', (ev) => {
    const g = ev.target.closest('[data-sitio]');
    if (g) alElegir(g.dataset.sitio);
  });
  cont.addEventListener('keydown', (ev) => {
    const g = ev.target.closest('[data-sitio]');
    if (g && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); alElegir(g.dataset.sitio); }
  });
  const capa = cont.querySelector('.mapa-dinamico');

  function render(d) {
    const { sitios, sitio: activo, muestra: m, estado } = d;
    const capas = [];
    const [ax, ay] = proyectarPolar(activo.lat, activo.lon);

    if (estado.enlaceActivo) {
      const r = destino(activo.lat, activo.lon, activo.relevo.az_deg, activo.relevo.distancia_km);
      const [rx, ry] = proyectarPolar(r.lat, r.lon);
      const e = ENLACE[m.enlace.estado];
      const guion = m.enlace.estado === 'rapido' ? '' : m.enlace.estado === 'robusto' ? 'stroke-dasharray="8 5"' : 'stroke-dasharray="2 6"';
      capas.push(`<line x1="${ax}" y1="${ay}" x2="${rx}" y2="${ry}" stroke="${e.color}" stroke-width="3" stroke-linecap="round" ${guion}/>`);
      capas.push(`<path d="M${rx},${ry - 9}l8,14h-16z" fill="${COLOR.superficie}" stroke="${COLOR.acento}" stroke-width="2"><title>${esc(activo.relevo.nombre)}: ${activo.relevo.distancia_km} km a ${activo.relevo.az_deg}° (supuesto)</title></path>`);
    }

    // Rosa de azimut local: el norte local apunta hacia fuera del polo.
    const norte = Math.atan2(ax - CX, -(ay - CY));
    const dir = (az) => (az * Math.PI) / 180 + norte;
    const R = 46;
    const [sx, sy] = polar(ax, ay, R, (dir(m.sol.az) * 180) / Math.PI);
    const [tx, ty] = polar(ax, ay, R, (dir(m.tierra.az) * 180) / Math.PI);
    const [nx, ny] = polar(ax, ay, R + 14, (norte * 180) / Math.PI);
    capas.push(`<g>
      <circle cx="${ax}" cy="${ay}" r="${R}" fill="none" stroke="rgba(226,201,144,.35)" stroke-dasharray="2 5"/>
      <text x="${nx}" y="${ny + 4}" text-anchor="middle" class="ret-etq">N</text>
      <line x1="${ax}" y1="${ay}" x2="${sx}" y2="${sy}" stroke="${COLOR.sol}" stroke-opacity="${m.sol.visible ? 0.8 : 0.3}"/>
      <circle cx="${sx}" cy="${sy}" r="8" fill="${m.sol.visible ? COLOR.sol : 'none'}" stroke="${COLOR.sol}" stroke-width="2"/>
      <line x1="${ax}" y1="${ay}" x2="${tx}" y2="${ty}" stroke="${COLOR.tierra}" stroke-opacity="${m.tierra.visible ? 0.8 : 0.3}"/>
      <circle cx="${tx}" cy="${ty}" r="7" fill="${m.tierra.visible ? COLOR.tierra : 'none'}" stroke="${COLOR.tierra}" stroke-width="2"/>
    </g>`);

    // Las etiquetas salen hacia fuera del polo con una línea guía: los sitios A y B
    // están a unos 30 km y sus nombres se encimarían junto al marcador.
    for (const s of sitios) {
      const [x, y] = proyectarPolar(s.lat, s.lon);
      const sel = s.id === activo.id;
      const letra = s.etiqueta.slice(-1);
      const ang = Math.atan2(x - CX, -(y - CY));
      const rSitio = Math.hypot(x - CX, y - CY);
      // Cerca del borde superior o inferior no hay sitio hacia fuera: la etiqueta va a la derecha.
      const vertical = rSitio > 200 && Math.abs(Math.cos(ang)) > 0.9;
      const rEtq = vertical ? rSitio : Math.max(rSitio + 70, 165);
      const ex = vertical ? x + 14 : CX + rEtq * Math.sin(ang);
      const ey = vertical ? y + 44 : CY - rEtq * Math.cos(ang);
      const lado = vertical || ex >= CX ? 'start' : 'end';
      const sep = lado === 'start' ? 8 : -8;
      const gx = x + 19 * Math.sin(ang);
      const gy = y - 19 * Math.cos(ang);
      capas.push(`<g class="marcador" data-sitio="${s.id}" tabindex="0" role="button" aria-pressed="${sel}" aria-label="${esc(s.etiqueta)}: ${esc(s.nombre_corto)}, ${Math.abs(s.lat).toFixed(3)}° S, ${s.lon.toFixed(3)}° E">
        <circle cx="${x}" cy="${y}" r="26" fill="transparent"/>
        ${vertical ? '' : `<line x1="${gx}" y1="${gy}" x2="${ex}" y2="${ey}" stroke="${sel ? COLOR.acentoClaro : 'rgba(255,255,255,.3)'}" stroke-width="1.2"/>`}
        <circle class="marcador__anillo" cx="${x}" cy="${y}" r="17" fill="${sel ? 'rgba(198,168,106,.3)' : 'rgba(27,29,33,.9)'}" stroke="${sel ? COLOR.acentoClaro : 'rgba(255,255,255,.45)'}" stroke-width="2"/>
        <text x="${x}" y="${y + 5}" text-anchor="middle" class="etq etq--letra">${letra}</text>
        <text x="${ex + sep}" y="${ey + 1}" text-anchor="${lado}" class="etq2 etq--nombre" ${sel ? `fill="${COLOR.texto}"` : ''}>${esc(s.nombre_corto)}</text>
        <text x="${ex + sep}" y="${ey + 24}" text-anchor="${lado}" class="ret-etq etq--coord">${Math.abs(s.lat).toFixed(3)}° S, ${s.lon.toFixed(3)}° E</text>
      </g>`);
    }
    capa.innerHTML = capas.join('');
  }
  return { render };
}

export function leyendaMapa(cont) {
  cont.innerHTML = `
    <li>Proyección polar azimutal equidistante; coordenadas de sitios.json</li>
    <li><span class="muestra" style="background:${COLOR.sol};border-radius:50%"></span>Sol (relleno si es visible)</li>
    <li><span class="muestra" style="background:${COLOR.tierra};border-radius:50%"></span>Tierra (relleno si es visible)</li>
    <li><span class="muestra" style="border:2px solid ${COLOR.acento};border-radius:2px"></span>Punto de apoyo (ubicación supuesta)</li>
    <li><span class="muestra" style="background:${COLOR.ok}"></span>Continua: rápido</li>
    <li><span class="muestra" style="background:repeating-linear-gradient(90deg,${COLOR.aviso} 0 6px,transparent 6px 9px)"></span>Discontinua: robusto</li>
    <li><span class="muestra" style="background:repeating-linear-gradient(90deg,${COLOR.error} 0 2px,transparent 2px 6px)"></span>Punteada: sin enlace</li>`;
}
