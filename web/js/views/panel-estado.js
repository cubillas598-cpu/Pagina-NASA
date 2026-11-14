import { fechaUtc, horaUtc, conSigno, grados, esc } from '../format.js';
import { ENLACE, ICONO, TIPO_ENLACE } from './estilos.js';

function fila(icono, claseIcono, nombre, valor, claseValor, detalle) {
  return `<li class="fila-estado">
    <span class="fila-estado__icono ${claseIcono}" style="background:rgba(255,255,255,.04)">${icono}</span>
    <div>
      <div class="fila-estado__nombre">${nombre}</div>
      <div class="fila-estado__valor ${claseValor}"><span class="pastilla">${valor}</span></div>
      <div class="fila-estado__detalle">${detalle}</div>
    </div>
  </li>`;
}

/** Valores instantáneos de la hora seleccionada. */
export function renderPanelEstado(cont, d) {
  const { muestra: m, sitio, estado } = d;
  const sol = m.sol;
  const tierra = m.tierra;
  const filas = [
    fila(ICONO.sol, 'c-sol', 'Sol', sol.visible ? 'Sol visible' : 'Sombra', sol.visible ? 'c-sol' : 'c-neutro',
      `Elevación ${grados(sol.el, 2)}, horizonte ${grados(sol.horizonte, 2)} en azimut ${grados(sol.az, 0)} (margen ${conSigno(sol.el - sol.horizonte, 2)}).`),
    fila(ICONO.tierra, 'c-tierra', 'Comunicación directa', tierra.visible ? 'Tierra visible' : 'Tierra oculta', tierra.visible ? 'c-tierra' : 'c-neutro',
      `Elevación ${grados(tierra.el, 2)}, horizonte ${grados(tierra.horizonte, 2)} en azimut ${grados(tierra.az, 0)} (margen ${conSigno(tierra.el - tierra.horizonte, 2)}).`),
  ];

  if (estado.enlaceActivo) {
    const e = ENLACE[m.enlace.estado];
    const motivo = m.enlace.limitantes.map((f) => esc(f.texto)).join(' ');
    filas.push(fila(ICONO.enlace, e.clase, `Enlace local, ${TIPO_ENLACE[estado.tipoEnlace].toLowerCase()}`, e.texto, e.clase, motivo));
    let respaldo;
    if (m.respaldoTierra) respaldo = `${esc(sitio.relevo.nombre)} ve la Tierra y el tramo local funciona.`;
    else if (m.enlace.estado === 'sin_enlace') respaldo = 'El tramo local no funciona en esta hora.';
    else respaldo = `${esc(sitio.relevo.nombre)} tampoco ve la Tierra en esta hora.`;
    filas.push(fila(ICONO.respaldo, m.respaldoTierra ? 'c-ok' : 'c-error', 'Respaldo hacia la Tierra',
      m.respaldoTierra ? 'Disponible' : 'No disponible', m.respaldoTierra ? 'c-ok' : 'c-error', respaldo));
  }

  const hayCom = tierra.visible || (estado.enlaceActivo && m.respaldoTierra);
  const resumen = tierra.visible
    ? 'Comunicación por vista directa.'
    : hayCom ? 'Sin vista directa: la comunicación sigue por el respaldo local.'
      : estado.enlaceActivo ? 'Sin comunicación en esta hora: ni vista directa ni respaldo.' : 'Sin vista directa a la Tierra en esta hora.';

  cont.innerHTML = `
    <header class="panel__cab" style="margin-bottom:var(--e-2)">
      <h3 id="t-estado">Hora seleccionada</h3>
      <span class="panel__meta">Valor instantáneo</span>
    </header>
    <p class="estado__sitio"><b>${esc(sitio.etiqueta)}</b>, ${esc(sitio.nombre_corto)}</p>
    <p class="estado__hora">${horaUtc(m.ms)}</p>
    <p class="estado__fecha">${fechaUtc(m.ms)}</p>
    <ul class="estado__lista">${filas.join('')}</ul>
    <p class="estado__nota ${hayCom ? '' : 'c-error'}">${resumen}</p>
    <p class="estado__nota">Los indicadores de arriba resumen todo el periodo; este panel describe solo la hora del cursor.</p>`;
}
