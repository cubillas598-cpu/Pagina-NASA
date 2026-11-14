import { num, horasTexto, esc } from '../format.js';
import { ICONO, TIPO_ENLACE } from './estilos.js';

function indicador(icono, color, etq, valor, detalle, pie) {
  return `<div class="indicador">
    <span class="indicador__icono" style="color:${color}">${icono}</span>
    <div>
      <div class="indicador__etq">${etq}</div>
      <div class="indicador__valor">${valor}${detalle ? `<small>${detalle}</small>` : ''}</div>
      ${pie ? `<div class="indicador__pie">${pie}</div>` : ''}
    </div>
  </div>`;
}

/** Franja superior: tres indicadores calculados para todo el periodo. */
export function renderFranja(cont, d) {
  const { metricas: m, estado } = d;
  let enlace;
  if (m.enlace) {
    const disponibles = m.enlace.rapido + m.enlace.robusto;
    enlace = indicador(ICONO.enlace, 'var(--ok)', `Enlace local, ${TIPO_ENLACE[estado.tipoEnlace].toLowerCase()}`,
      `${num((100 * disponibles) / m.horas, 0)} %`, `${horasTexto(m.horasRespaldo)} llega a la Tierra`);
  } else {
    enlace = indicador(ICONO.enlace, 'var(--texto-3)', 'Enlace local', 'Desactivado', '');
  }
  cont.innerHTML =
    indicador(ICONO.sol, 'var(--naranja-claro)', 'Iluminación solar', `${num(m.pctSol, 0)} %`, `${m.horasSol} de ${m.horas} h`)
    + indicador(ICONO.tierra, 'var(--tierra)', 'Visibilidad de la Tierra', `${num(m.pctTierra, 0)} %`, `${m.horasTierra} de ${m.horas} h`)
    + enlace;
}

/** Módulo de disponibilidad: porcentajes combinados del periodo. */
export function renderDisponibilidad(cont, d) {
  const { metricas: m, estado } = d;
  const via = estado.enlaceActivo ? 'directa o respaldo' : 'solo directa';
  cont.innerHTML = `
    <div class="meta">
      <div class="meta__valor">${num(m.pctSolTierra, 0)} %</div>
      <div class="barra" aria-hidden="true"><span style="width:${m.pctSolTierra}%"></span></div>
      <div class="meta__etq">Sol y Tierra visibles<br>${m.horasSolTierra} h a la vez</div>
    </div>
    <div class="meta">
      <div class="meta__valor">${num(m.pctComunicacion, 0)} %</div>
      <div class="barra barra--tierra" aria-hidden="true"><span style="width:${m.pctComunicacion}%"></span></div>
      <div class="meta__etq">Comunicación<br>${via}</div>
    </div>`;
}

/** Resumen comparativo de los tres sitios en el mismo periodo. */
export function renderMiniComparativo(cont, d) {
  const { filas, sitio } = d;
  const mejor = filas.reduce((a, b) => (b.metricas.pctSolTierra > a.metricas.pctSolTierra ? b : a));
  const empate = filas.filter((f) => Math.abs(f.metricas.pctSolTierra - mejor.metricas.pctSolTierra) < 1e-9).length > 1;
  cont.innerHTML = filas.map(({ sitio: s, metricas: m }) => `
    <div class="mini-fila">
      <span class="mini-fila__nombre ${s.id === sitio.id ? 'activo' : ''}">${esc(s.etiqueta)}</span>
      <span class="mini-fila__barras" role="img" aria-label="${esc(s.etiqueta)}: ${num(m.pctSol, 0)} % de luz, ${num(m.pctTierra, 0)} % con la Tierra visible">
        <span class="barra"><span style="width:${m.pctSol}%"></span></span>
        <span class="barra barra--tierra"><span style="width:${m.pctTierra}%"></span></span>
      </span>
      <span class="mini-fila__valor">${num(m.pctSol, 0)} % luz<br>${num(m.pctTierra, 0)} % Tierra</span>
    </div>`).join('') + `
    <div class="mini-pie">
      <span>${empate ? 'Empate en horas con Sol y Tierra.' : `Más horas con Sol y Tierra: ${esc(mejor.sitio.etiqueta)}`}</span>
      <a href="#comparador">Ver comparador</a>
    </div>`;
}
