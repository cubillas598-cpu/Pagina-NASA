import { METRICAS_COMPARADOR, valorMetrica } from '../model.js';
import { num, esc, fechaUtc } from '../format.js';
import { TIPO_ENLACE, etiquetaHorizonte } from './estilos.js';

/** Tabla de tres sitios sobre el mismo periodo, con el mejor valor marcado. */
export function renderComparador(tabla, meta, lista, d) {
  const { filas, comparacion, estado, serie, i0, i1 } = d;

  meta.textContent = `Periodo: ${fechaUtc(serie[i0].ms)} a ${fechaUtc(serie[i1].ms)} (${i1 - i0 + 1} h, UTC). `
    + `Enlace local: ${estado.enlaceActivo ? TIPO_ENLACE[estado.tipoEnlace].toLowerCase() : 'desactivado'}`
    + `${estado.enlaceActivo && estado.tipoEnlace === 'optico' && estado.polvo ? ', con evento de polvo' : ''}. `
    + `Horizonte: ${etiquetaHorizonte(estado.modoHorizonte, d.sitio)}.`;

  const cab = `<thead><tr><th scope="col">Métrica</th>${filas.map((f) => `<th scope="col"><b>${esc(f.sitio.etiqueta)}</b>${esc(f.sitio.nombre_corto)}</th>`).join('')}</tr></thead>`;

  const cuerpo = METRICAS_COMPARADOR.map((def) => {
    if (def.enlace && !estado.enlaceActivo) {
      return `<tr class="sin-datos"><th scope="row">${def.etiqueta}</th><td colspan="${filas.length}">Activa el enlace local para comparar esta métrica.</td></tr>`;
    }
    const mejores = comparacion.mejores[def.clave] || [];
    const criterio = def.mejor === 'max' ? 'más alto es mejor' : def.mejor === 'min' ? 'más bajo es mejor' : 'informativo';
    const etiqueta = def.clave === 'brecha' && !estado.enlaceActivo ? 'Mayor intervalo sin vista a la Tierra' : def.etiqueta;
    const celdas = filas.map((f) => {
      const v = valorMetrica(f.metricas, def.clave);
      const esMejor = mejores.includes(f.sitio.id);
      const texto = def.unidad === '%' ? `${num(v, 1)} %` : `${v} h`;
      const extra = def.unidad === '%' ? `<small> ${def.clave === 'pctSol' ? f.metricas.horasSol : f.metricas.horasTierra} h</small>` : '';
      return `<td class="${esMejor ? 'mejor' : ''}">${texto}${extra}${esMejor ? '<span class="marca-mejor">Mejor</span>' : ''}</td>`;
    }).join('');
    return `<tr><th scope="row">${etiqueta}<br><small class="c-neutro">${criterio}</small></th>${celdas}</tr>`;
  }).join('');

  tabla.innerHTML = `<caption class="sr">Comparación de los tres sitios en el periodo seleccionado</caption>${cab}<tbody>${cuerpo}</tbody>`;
  lista.innerHTML = comparacion.conclusiones.map((c) => `<li>${esc(c)}</li>`).join('');
}
