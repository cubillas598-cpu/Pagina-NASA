import { fechaUtc, horaUtc, diaMesUtc, horasTexto, esc } from '../format.js';
import { ENLACE, ICONO, TIPO_ENLACE } from './estilos.js';

const SI = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="currentColor" opacity=".2"/><path d="M4.8 8.2 7 10.3l4.2-4.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const NO = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const MEDIO = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 1a7 7 0 0 1 0 14z" fill="currentColor"/></svg>';
const icono = (estado) => ({ si: SI, no: NO, medio: MEDIO }[estado]);
const fila = (estado, texto) => `<li class="${estado}">${icono(estado)}${texto}</li>`;

/** Hora y fecha UTC del cursor bajo el selector de sitio. */
export function renderHora(horaEl, fechaEl, m) {
  horaEl.textContent = horaUtc(m.ms);
  fechaEl.textContent = fechaUtc(m.ms);
}

/** Tarjeta destacada: resumen del sitio activo y sus condiciones en la hora seleccionada. */
export function renderDestacada(cont, d) {
  const { sitio, muestra: m, estado } = d;
  const filas = [
    fila(m.sol.visible ? 'si' : 'no', m.sol.visible ? 'Sol visible' : 'Sombra'),
    fila(m.tierra.visible ? 'si' : 'no', m.tierra.visible ? 'Tierra visible' : 'Tierra oculta'),
  ];
  if (estado.enlaceActivo) {
    const e = m.enlace.estado;
    filas.push(fila(e === 'rapido' ? 'si' : e === 'robusto' ? 'medio' : 'no', `Enlace ${TIPO_ENLACE[estado.tipoEnlace].toLowerCase()}: ${ENLACE[e].texto}`));
  } else {
    filas.push(fila('no', 'Enlace local desactivado'));
  }
  const hora = horaUtc(m.ms).replace(' UTC', '');
  cont.innerHTML = `
    <div class="destacada__cab">
      <span class="destacada__sitio">${esc(sitio.etiqueta)}</span>
      <span class="destacada__etq">Condiciones ahora</span>
    </div>
    <div class="destacada__nombre">${esc(sitio.nombre_corto)}</div>
    <div class="destacada__cuerpo">
      <ul class="destacada__estados">${filas.join('')}</ul>
      <div class="destacada__hora"><small>UTC</small><b>${hora}</b><small>${diaMesUtc(m.ms)}</small></div>
    </div>`;
}

const ICONO_EVENTO = { sol: [ICONO.eclipse, ICONO.sol], tierra: [ICONO.tierra, ICONO.tierra], enlace: [ICONO.enlace, ICONO.enlace] };
const COLOR_EVENTO = { sol: 'var(--acento-claro)', tierra: 'var(--tierra)', enlace: 'var(--error)' };

/**
 * Eventos calculados del periodo. Muestra los próximos a partir del cursor
 * (o los últimos si ya no quedan); un clic lleva el cursor al evento.
 */
export function renderEventos(lista, total, d, eventos, alElegir, maximo = 4) {
  total.textContent = eventos.length === 1 ? '1 cambio' : `${eventos.length} cambios`;
  if (!eventos.length) {
    lista.innerHTML = '<li class="eventos__vacio">Sin cambios de estado en este periodo.</li>';
    return;
  }
  let desde = eventos.findIndex((e) => e.indice >= d.indice);
  if (desde < 0) desde = Math.max(0, eventos.length - maximo);
  const visibles = eventos.slice(desde, desde + maximo);
  lista.innerHTML = visibles.map((e) => {
    const m = d.serie[e.indice];
    const icono = ICONO_EVENTO[e.tipo][e.inicio ? 0 : 1];
    const color = e.inicio ? COLOR_EVENTO[e.tipo] : e.tipo === 'enlace' ? 'var(--ok)' : COLOR_EVENTO[e.tipo];
    const pastilla = e.inicio
      ? `<span class="evento__duracion">${horasTexto(e.horas)}</span>`
      : '<span class="evento__duracion evento__duracion--neutro">Fin</span>';
    return `<li><button type="button" class="evento" data-indice="${e.indice}">
      <span class="evento__icono" style="color:${color}">${icono}</span>
      <span><span class="evento__titulo">${e.titulo}</span><span class="evento__fecha">${fechaUtc(m.ms)}, ${horaUtc(m.ms)}</span></span>
      ${pastilla}
    </button></li>`;
  }).join('');
  lista.querySelectorAll('[data-indice]').forEach((b) => b.addEventListener('click', () => alElegir(Number(b.dataset.indice))));
}

const NOMBRE_FACTOR = { geometria: 'Línea de vista', energia: 'Energía del relevo', sol: 'Ángulo del Sol', polvo: 'Polvo' };

/** Explicación del estado del enlace local en la hora seleccionada (vista Enlace local). */
export function renderPorque(cont, d) {
  const { muestra: m, estado, sitio } = d;
  if (!estado.enlaceActivo) {
    cont.innerHTML = '<h3>Enlace local desactivado</h3><p class="tarjeta__sub">Actívalo en el panel derecho para ver cómo se clasifica cada hora.</p>';
    return;
  }
  const e = ENLACE[m.enlace.estado];
  const nivel = ['Sin enlace', 'Robusto', 'Rápido'];
  const clase = ['c-error', 'c-aviso', 'c-ok'];
  cont.innerHTML = `
    <header class="tarjeta__cab" style="margin-bottom:0">
      <div>
        <h3>Por qué el enlace está así a las ${horaUtc(m.ms)}</h3>
        <p class="tarjeta__sub">${esc(sitio.etiqueta)}, ${TIPO_ENLACE[estado.tipoEnlace].toLowerCase()}. Gana el factor más limitante.</p>
      </div>
      <span class="pastilla ${e.clase}">${e.texto}</span>
    </header>
    <ul class="factores">
      ${m.enlace.factores.map((f) => `<li><span class="${clase[f.nivel]}"><b>${NOMBRE_FACTOR[f.clave]}</b><br><small>${nivel[f.nivel]}</small></span><span>${esc(f.texto)}</span></li>`).join('')}
      <li><span class="${m.respaldoTierra ? 'c-ok' : 'c-error'}"><b>Respaldo</b><br><small>${m.respaldoTierra ? 'Disponible' : 'No disponible'}</small></span><span>${m.respaldoTierra ? `${esc(sitio.relevo.nombre)} ve la Tierra y el tramo local funciona.` : m.enlace.estado === 'sin_enlace' ? 'El tramo local no funciona en esta hora.' : `${esc(sitio.relevo.nombre)} no ve la Tierra en esta hora.`}</span></li>
    </ul>`;
}
