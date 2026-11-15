import { METRICAS_COMPARADOR, valorMetrica, suitabilityScore, PESOS_SUITABILITY } from '../model.js';
import { num, esc, fechaUtc } from '../format.js';
import { TIPO_ENLACE, etiquetaHorizonte } from './estilos.js';

/** Tabla de tres sitios sobre el mismo periodo, con el mejor valor marcado. */
export function renderComparador(tabla, meta, lista, d) {
  const { filas, comparacion, estado, serie, i0, i1 } = d;

  meta.textContent = `Periodo: ${fechaUtc(serie[i0].ms)} a ${fechaUtc(serie[i1].ms)} (${i1 - i0 + 1} h, UTC). `
    + `Enlace local: ${estado.enlaceActivo ? TIPO_ENLACE[estado.tipoEnlace].toLowerCase() : 'desactivado'}`
    + `${estado.enlaceActivo && estado.tipoEnlace === 'optico' && estado.polvo ? ', con evento de polvo' : ''}. `
    + `Horizonte: ${etiquetaHorizonte(estado.modoHorizonte, d.sitio)}. `
    + `Índice de conveniencia: S = ${num(PESOS_SUITABILITY.energia, 2)}·iluminación + `
    + `${num(PESOS_SUITABILITY.comunicacion, 2)}·comunicación directa`
    + `${estado.enlaceActivo ? ` + ${num(PESOS_SUITABILITY.respaldo, 2)}·enlace local` : ''} `
    + `(propuesto por el equipo, no es un estándar de NASA)`
    + `${estado.enlaceActivo ? '; R solo cuenta horas en que el respaldo llega a la Tierra' : ''}. `
    + 'Resolución horaria: cada cambio se ubica con un margen de ±1 h.';

  const cab = `<thead><tr><th scope="col">Métrica</th>${filas.map((f) => `<th scope="col"><b>${esc(f.sitio.etiqueta)}</b>${esc(f.sitio.nombre_corto)}</th>`).join('')}</tr></thead>`;

  const scores = filas.map((f) => suitabilityScore(f.metricas, estado.enlaceActivo));
  const mejorScore = Math.max(...scores);
  const filaScore = `<tr class="fila-score"><th scope="row"><strong>Índice de conveniencia (S)</strong>`
    + `<br><small class="c-neutro">de 0 a 100 · más alto es mejor</small></th>`
    + filas.map((f, k) => {
      const esMejor = Math.abs(scores[k] - mejorScore) < 1e-9;
      return `<td class="${esMejor ? 'mejor' : ''}"><strong>${num(scores[k], 1)}</strong>${esMejor ? '<span class="marca-mejor">Mejor</span>' : ''}</td>`;
    }).join('') + `</tr>`;

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
      const HORAS = { pctSol: 'horasSol', pctTierra: 'horasTierra', pctSolTierra: 'horasSolTierra', pctRespaldo: 'horasRespaldo' };
      const extra = def.unidad === '%' ? `<small>${f.metricas[HORAS[def.clave]]} h</small>` : '';
      return `<td class="${esMejor ? 'mejor' : ''}">${texto}${extra}${esMejor ? '<span class="marca-mejor">Mejor</span>' : ''}</td>`;
    }).join('');
    return `<tr><th scope="row">${etiqueta}<br><small class="c-neutro">${criterio}</small></th>${celdas}</tr>`;
  }).join('');

  tabla.innerHTML = `<caption class="sr">Comparación de los tres sitios en el periodo seleccionado</caption>${cab}<tbody>${filaScore}${cuerpo}</tbody>`;
  // Resumen por sitio (qué métricas gana cada uno) y, aparte, los empates.
  const lineas = comparacion.resumen.map((g) => {
    const n = g.metricas.length;
    return `<li><strong>${esc(g.sitio.etiqueta)}, ${esc(g.sitio.nombre_corto)}</strong>: mejor en ${n} de ${g.total} métricas `
      + `(${esc(g.metricas.join(', '))}).</li>`;
  });
  const empates = comparacion.conclusiones.filter((c) => c.includes('empat'));
  lista.innerHTML = [...lineas, ...empates.map((c) => `<li>${esc(c)}</li>`)].join('');
}
