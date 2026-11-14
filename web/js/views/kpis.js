import { num, horasTexto, fechaHoraUtc } from '../format.js';
import { ENLACE, TIPO_ENLACE } from './estilos.js';

/** Indicadores calculados para todo el periodo seleccionado. */
export function renderKpis(cont, d, alIrABrecha) {
  const { metricas: m, estado, serie } = d;
  const pie = `Periodo completo, ${m.horas} h`;

  let enlace;
  if (m.enlace) {
    const orden = ['rapido', 'robusto', 'sin_enlace'];
    enlace = `
      <div class="kpi__valor">${horasTexto(m.enlace.sin_enlace)}<small>sin enlace</small></div>
      <div class="barra-estados" role="img" aria-label="Rápido ${m.enlace.rapido} h, robusto ${m.enlace.robusto} h, sin enlace ${m.enlace.sin_enlace} h">
        ${orden.map((k) => `<span style="flex-grow:${m.enlace[k]};background:${ENLACE[k].color}"></span>`).join('')}
      </div>
      <ul class="lista-estados">
        ${orden.map((k) => `<li><b>${m.enlace[k]} h</b> ${ENLACE[k].texto.toLowerCase()}</li>`).join('')}
      </ul>`;
  } else {
    enlace = `<div class="kpi__valor c-neutro">Desactivado</div><p class="kpi__pie">Activa el enlace local para ver horas por estado.</p>`;
  }

  const b = m.brecha;
  const tituloBrecha = estado.enlaceActivo ? 'Mayor intervalo sin comunicación' : 'Mayor intervalo sin vista a la Tierra';
  const detalleBrecha = estado.enlaceActivo
    ? 'Ni vista directa ni respaldo por el punto de apoyo.'
    : 'Solo vista directa; el respaldo local está desactivado.';
  const brecha = b.horas > 0
    ? `<div class="kpi__valor">${horasTexto(b.horas)}${b.acotada ? '<small>acotado al periodo</small>' : ''}</div>
       <p class="kpi__pie">${detalleBrecha} Desde ${fechaHoraUtc(serie[b.desde].ms)}.</p>
       <button type="button" class="boton--texto" data-ir-brecha>Ir a la interrupción</button>`
    : `<div class="kpi__valor c-ok">0 h</div><p class="kpi__pie">Hay comunicación en todas las horas del periodo.</p>`;

  cont.innerHTML = `
    <article class="vidrio kpi kpi--sol">
      <h3 class="kpi__titulo">Horas con iluminación solar</h3>
      <div class="kpi__valor">${num(m.pctSol, 0)} %<small>${m.horasSol} de ${m.horas} h</small></div>
      <div class="medidor" aria-hidden="true"><span style="width:${m.pctSol}%;background:var(--ambar)"></span></div>
      <p class="kpi__pie">${pie}</p>
    </article>
    <article class="vidrio kpi kpi--tierra">
      <h3 class="kpi__titulo">Horas con vista directa a la Tierra</h3>
      <div class="kpi__valor">${num(m.pctTierra, 0)} %<small>${m.horasTierra} de ${m.horas} h</small></div>
      <div class="medidor" aria-hidden="true"><span style="width:${m.pctTierra}%;background:var(--tierra)"></span></div>
      <p class="kpi__pie">${pie}</p>
    </article>
    <article class="vidrio kpi">
      <h3 class="kpi__titulo">Enlace local${m.enlace ? `, ${TIPO_ENLACE[estado.tipoEnlace].toLowerCase()}` : ''}</h3>
      ${enlace}
    </article>
    <article class="vidrio kpi">
      <h3 class="kpi__titulo">${tituloBrecha}</h3>
      ${brecha}
    </article>`;

  const btn = cont.querySelector('[data-ir-brecha]');
  if (btn) btn.addEventListener('click', alIrABrecha);
}
