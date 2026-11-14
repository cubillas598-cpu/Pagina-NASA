import { esc } from '../format.js';
import { ENLACE, TIPO_ENLACE } from './estilos.js';

const coord = (s) => `${Math.abs(s.lat).toFixed(3)}° S, ${s.lon.toFixed(3)}° E`;

/** Botones para elegir sitio junto al visor (alternativa a pulsar el globo). */
export function renderSitiosLuna(cont, d, hayLuna) {
  cont.innerHTML = d.sitios.map((s) => {
    const sel = s.id === d.sitio.id;
    return `<button type="button" class="chip-sitio${sel ? ' activo' : ''}" data-sitio="${s.id}" aria-pressed="${sel}">
      <span aria-hidden="true">${esc(s.etiqueta.slice(-1))}</span>${esc(s.nombre_corto)}</button>`;
  }).join('') + (hayLuna ? '<button type="button" class="chip-sitio" data-accion="tres">Ver los tres</button>' : '');
}

/** Ficha bajo el visor: sitio activo, coordenadas y estado en la hora seleccionada. */
export function renderFichaLuna(cont, d, hayLuna) {
  const { sitio, muestra: m, estado } = d;
  const pastilla = (ok, si, no, clase) => `<span class="pastilla ${ok ? clase : 'c-neutro'}">${ok ? si : no}</span>`;
  const enlace = estado.enlaceActivo
    ? `<span class="pastilla ${ENLACE[m.enlace.estado].clase}">Enlace ${TIPO_ENLACE[estado.tipoEnlace].toLowerCase()}: ${ENLACE[m.enlace.estado].texto}</span>`
    : '<span class="pastilla c-neutro">Enlace local desactivado</span>';
  cont.innerHTML = `
    <div>
      <p class="luna-ficha__nombre">${esc(sitio.etiqueta)}: ${esc(sitio.nombre_corto)}</p>
      <p class="luna-ficha__coord">${coord(sitio)}</p>
    </div>
    <div class="luna-ficha__estados">
      ${pastilla(m.sol.visible, 'Sol visible', 'Sombra', 'c-sol')}
      ${pastilla(m.tierra.visible, 'Tierra visible', 'Tierra oculta', 'c-tierra')}
      ${enlace}
    </div>
    ${hayLuna ? '' : '<p class="luna-ficha__aviso">Este navegador no ofrece WebGL: se muestra el mapa polar 2D con las mismas coordenadas.</p>'}`;
}
