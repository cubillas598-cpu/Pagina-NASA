import { METRICAS_COMPARADOR, valorMetrica, desgloseIndice, PESOS_SUITABILITY, NOMBRES_INDICE } from '../model.js';
import { num, esc, fechaUtc } from '../format.js';
import { TIPO_ENLACE, etiquetaHorizonte } from './estilos.js';

/** Tabla de tres sitios sobre el mismo periodo, con el mejor valor marcado. */
export function renderComparador(tabla, meta, lista, d) {
  const { filas, comparacion, estado, serie, i0, i1 } = d;

  meta.textContent = `Periodo: ${fechaUtc(serie[i0].ms)} a ${fechaUtc(serie[i1].ms)} (${i1 - i0 + 1} h, UTC). `
    + `Enlace local: ${estado.enlaceActivo ? TIPO_ENLACE[estado.tipoEnlace].toLowerCase() : 'desactivado'}`
    + `${estado.enlaceActivo && estado.tipoEnlace === 'optico' && estado.polvo ? ', con evento de polvo' : ''}. `
    + `Horizonte: ${etiquetaHorizonte(estado.modoHorizonte, d.sitio)}. `
    + `Índice de conveniencia: ${Object.entries(PESOS_SUITABILITY)
      .filter(([k]) => estado.enlaceActivo || k !== 'respaldo')
      .map(([k, w]) => `${num(w, 2)}·${NOMBRES_INDICE[k]}`).join(' + ')} `
    + `(propuesto por el equipo, no es un estándar de NASA; sin enlace local los pesos se reparten entre los demás términos). `
    + 'Resolución horaria: cada cambio se ubica con un margen de ±1 h.';

  const cab = `<thead><tr><th scope="col">Métrica</th>${filas.map((f) => `<th scope="col"><b>${esc(f.sitio.etiqueta)}</b>${esc(f.sitio.nombre_corto)}</th>`).join('')}</tr></thead>`;

  const desgloses = filas.map((f) => desgloseIndice(f.metricas, estado.enlaceActivo, f.metricas.terreno));
  const scores = desgloses.map((x) => x.total);
  const mejorScore = Math.max(...scores);
  const filaScore = `<tr class="fila-score"><th scope="row"><strong>Índice de conveniencia (S)</strong>`
    + `<br><small class="c-neutro">de 0 a 100 · más alto es mejor</small></th>`
    + filas.map((f, k) => {
      const esMejor = Math.abs(scores[k] - mejorScore) < 1e-9;
      return `<td class="${esMejor ? 'mejor' : ''}"><strong>${num(scores[k], 1)}</strong>${esMejor ? '<span class="marca-mejor">Mayor índice</span>' : ''}</td>`;
    }).join('') + `</tr>`;

  // Desglose: puntaje 0-100 de cada término del índice, con su peso.
  const desglose = Object.entries(PESOS_SUITABILITY)
    .filter(([k]) => estado.enlaceActivo || k !== 'respaldo')
    .map(([k, w]) => `<tr class="fila-desglose"><th scope="row">Puntaje: ${NOMBRES_INDICE[k]}<br><small class="c-neutro">peso ${num(w, 2)} · 0 a 100</small></th>`
      + desgloses.map((x) => {
        const v = x.partes[k];
        return `<td>${v === null || v === undefined ? '<span class="c-neutro">sin datos</span>' : num(v, 0)}</td>`;
      }).join('') + '</tr>').join('');

  const UNIDADES = { '°': (v) => `${num(v, 1)}°`, m: (v) => `${num(v, 2)} m`, km: (v) => `${num(v, 1)} km` };
  const cuerpo = METRICAS_COMPARADOR.map((def) => {
    if (def.enlace && !estado.enlaceActivo) {
      return `<tr class="sin-datos"><th scope="row">${def.etiqueta}</th><td colspan="${filas.length}">Activa el enlace local para comparar esta métrica.</td></tr>`;
    }
    const mejores = comparacion.mejores[def.clave] || [];
    const criterio = def.mejor === 'max' ? 'más alto es mejor' : def.mejor === 'min' ? 'más bajo es mejor' : 'informativo';
    const etiqueta = def.clave === 'brecha' && !estado.enlaceActivo ? 'Mayor intervalo sin vista a la Tierra' : def.etiqueta;
    const celdas = filas.map((f) => {
      const v = valorMetrica(f.metricas, def.clave);
      if (v === null || v === undefined) {
        const nota = def.clave === 'hielo' && f.metricas.terreno && f.metricas.terreno.dist_psr_km === null ? 'más de 25 km' : 'sin datos';
        return `<td><span class="c-neutro">${nota}</span></td>`;
      }
      const esMejor = mejores.includes(f.sitio.id);
      const texto = def.unidad === '%' ? `${num(v, 1)} %` : UNIDADES[def.unidad] ? UNIDADES[def.unidad](v) : `${v} h`;
      const HORAS = { pctSol: 'horasSol', pctTierra: 'horasTierra', pctSolTierra: 'horasSolTierra', pctRespaldo: 'horasRespaldo' };
      const ap = f.metricas.terreno?.aproximacion;
      const extra = def.clave === 'aproximacion' && ap ? `<small>llegando desde ${ap.mejor_az_deg}° (azimut)</small>`
        : def.clave === 'hielo' && f.metricas.terreno?.en_psr ? '<small>el sitio está en sombra permanente</small>'
        : def.unidad === '%' && HORAS[def.clave] ? `<small>${f.metricas[HORAS[def.clave]]} h</small>` : '';
      return `<td class="${esMejor ? 'mejor' : ''}">${texto}${extra}${esMejor ? `<span class="marca-mejor">${esc(def.insignia || 'Mejor')}</span>` : ''}</td>`;
    }).join('');
    return `<tr><th scope="row">${etiqueta}<br><small class="c-neutro">${criterio}</small></th>${celdas}</tr>`;
  }).join('');

  tabla.innerHTML = `<caption class="sr">Comparación de los tres sitios en el periodo seleccionado</caption>${cab}<tbody>${filaScore}${desglose}${cuerpo}</tbody>`;
  // Resumen por sitio (qué métricas gana cada uno) y, aparte, los empates.
  const lineas = comparacion.resumen.map((g) => {
    const n = g.metricas.length;
    return `<li><strong>${esc(g.sitio.etiqueta)}, ${esc(g.sitio.nombre_corto)}</strong>: mejor en ${n} de ${g.total} métricas `
      + `(${esc(g.metricas.join(', '))}).</li>`;
  });
  const empates = comparacion.conclusiones.filter((c) => c.includes('empat'));
  lista.innerHTML = [...lineas, ...empates.map((c) => `<li>${esc(c)}</li>`)].join('');
}

/**
 * Tres gráficas alineadas (escala común): luz, Tierra visible y sombra
 * continua más larga. Barras HTML con el valor escrito: se leen sin color.
 */
export function renderBarrasComparador(cont, d) {
  const { filas } = d;
  const maxSombra = Math.max(1, ...filas.map((f) => f.metricas.sombraMax.horas));
  const grupos = [
    { titulo: 'Horas con luz solar', nota: 'Escala 0–100 %. Más es mejor.', valor: (m) => m.pctSol, max: 100, texto: (v, m) => `${num(v, 1)} % · ${m.horasSol} h`, mejor: 'max' },
    { titulo: 'Horas con la Tierra visible', nota: 'Escala 0–100 %. Más es mejor.', valor: (m) => m.pctTierra, max: 100, texto: (v, m) => `${num(v, 1)} % · ${m.horasTierra} h`, mejor: 'max' },
    { titulo: 'Sombra continua más larga', nota: `Escala 0–${maxSombra} h. Menos es mejor.`, valor: (m) => m.sombraMax.horas, max: maxSombra, texto: (v) => `${v} h`, mejor: 'min' },
  ];
  cont.innerHTML = grupos.map((g) => {
    const vals = filas.map((f) => g.valor(f.metricas));
    const obj = g.mejor === 'max' ? Math.max(...vals) : Math.min(...vals);
    const barras = filas.map((f, k) => {
      const v = vals[k];
      const ancho = Math.max(0, Math.min(100, (v / g.max) * 100));
      const mejor = Math.abs(v - obj) < 1e-9;
      return `<li class="cbarra${mejor ? ' cbarra--mejor' : ''}">
        <span class="cbarra__sitio"><b>${esc(f.sitio.etiqueta.slice(-1))}</b> ${esc(f.sitio.nombre_corto)}</span>
        <span class="cbarra__pista" aria-hidden="true"><span class="cbarra__relleno" style="width:${ancho.toFixed(1)}%"></span></span>
        <span class="cbarra__valor">${g.texto(v, f.metricas)}</span>
      </li>`;
    }).join('');
    return `<figure class="grafica-barras"><figcaption><strong>${g.titulo}</strong><small>${g.nota}</small></figcaption><ul>${barras}</ul></figure>`;
  }).join('');
}
