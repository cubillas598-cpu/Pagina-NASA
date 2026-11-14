// Calculos puros de la demo. Sin DOM: se prueban con `node --test`.
// Todas las horas estan en UTC; cada muestra representa un intervalo de 1 h.

export const ESTADOS_ENLACE = {
  rapido: { nivel: 2, etiqueta: 'Rápido' },
  robusto: { nivel: 1, etiqueta: 'Robusto' },
  sin_enlace: { nivel: 0, etiqueta: 'Sin enlace' },
};
const ESTADO_POR_NIVEL = ['sin_enlace', 'robusto', 'rapido'];

export function parseUtc(t) {
  return Date.parse(`${t}:00Z`);
}

export function normalizarAz(az) {
  return ((az % 360) + 360) % 360;
}

/** Elevacion del horizonte (grados) en un azimut. Perfil null => horizonte plano. */
export function horizonteEn(perfil, az) {
  if (!perfil) return 0;
  const valores = perfil.elevacion_deg;
  const n = valores.length;
  const pos = normalizarAz(az) / perfil.resolucion_deg;
  const i0 = Math.floor(pos) % n;
  const i1 = (i0 + 1) % n;
  const f = pos - Math.floor(pos);
  return valores[i0] * (1 - f) + valores[i1] * f;
}

/** Separacion angular entre dos direcciones (az/el en grados). */
export function separacionAngular(az1, el1, az2, el2) {
  const r = Math.PI / 180;
  const c =
    Math.sin(el1 * r) * Math.sin(el2 * r) +
    Math.cos(el1 * r) * Math.cos(el2 * r) * Math.cos((az1 - az2) * r);
  return Math.acos(Math.min(1, Math.max(-1, c))) / r;
}

function factor(clave, nivel, texto) {
  return { clave, nivel, texto };
}

/**
 * Clasificador generico de tres estados: cada tipo de enlace aporta sus
 * factores (nivel 0..2) y el estado final es el factor mas limitante.
 */
export function clasificar(factores) {
  const nivel = Math.min(...factores.map((f) => f.nivel));
  return {
    estado: ESTADO_POR_NIVEL[nivel],
    limitantes: factores.filter((f) => f.nivel === nivel),
    factores,
  };
}

/**
 * Serie horaria completa de un sitio.
 * @param sitio      entrada de escenario_demo.json
 * @param horas      lista de efemerides {t, sol_el, sol_az, tierra_el, tierra_az}
 * @param opciones   {modoHorizonte:'sintetico'|'plano', tipoEnlace:'rf'|'optico',
 *                    polvo:boolean, reglas, eventoPolvo}
 */
export function calcularSerie(sitio, horas, opciones) {
  const plano = opciones.modoHorizonte === 'plano';
  const hSitio = plano ? null : sitio.horizonte;
  const hRelevo = plano ? null : sitio.relevo.horizonte;
  const relevo = sitio.relevo;
  const reglas = opciones.reglas;
  const losLocal = relevo.el_deg > horizonteEn(hSitio, relevo.az_deg);

  const polvoIni = opciones.eventoPolvo ? parseUtc(opciones.eventoPolvo.inicio) : NaN;
  const hora = 3600e3;

  let sombraRelevo = 0;
  return horas.map((h, i) => {
    const ms = parseUtc(h.t);
    const solHor = horizonteEn(hSitio, h.sol_az);
    const tierraHor = horizonteEn(hSitio, h.tierra_az);
    const solVisible = h.sol_el > solHor;
    const tierraVisible = h.tierra_el > tierraHor;
    // El relevo esta a pocos km: se aproxima con las mismas efemerides.
    const relevoSol = h.sol_el > horizonteEn(hRelevo, h.sol_az);
    const relevoTierra = h.tierra_el > horizonteEn(hRelevo, h.tierra_az);
    sombraRelevo = relevoSol ? 0 : sombraRelevo + 1;

    const factores = [
      losLocal
        ? factor('geometria', 2, 'Línea de vista despejada hacia el punto de apoyo.')
        : factor('geometria', 0, 'El terreno bloquea la línea de vista hacia el punto de apoyo.'),
    ];
    let separacionSol = null;

    if (opciones.tipoEnlace === 'rf') {
      if (relevoSol) {
        factores.push(factor('energia', 2, 'Punto de apoyo iluminado: transmite a tasa alta.'));
      } else if (sombraRelevo <= reglas.rf.bateria_relevo_h) {
        factores.push(factor('energia', 1, `Punto de apoyo en sombra (${sombraRelevo} h): opera con batería a tasa reducida.`));
      } else {
        factores.push(factor('energia', 0, `Punto de apoyo en sombra más de ${reglas.rf.bateria_relevo_h} h: batería agotada (supuesto).`));
      }
    } else {
      const candidatos = [];
      if (solVisible) candidatos.push(separacionAngular(h.sol_az, h.sol_el, relevo.az_deg, relevo.el_deg));
      if (relevoSol) candidatos.push(separacionAngular(h.sol_az, h.sol_el, relevo.az_deg + 180, -relevo.el_deg));
      if (candidatos.length === 0) {
        factores.push(factor('sol', 2, 'Sol bajo el horizonte: no deslumbra el enlace.'));
      } else {
        separacionSol = Math.min(...candidatos);
        const s = separacionSol.toFixed(1);
        const o = reglas.optico;
        if (separacionSol < o.sep_sin_enlace_deg) {
          factores.push(factor('sol', 0, `Sol a ${s}° de la línea de vista: el receptor queda deslumbrado.`));
        } else if (separacionSol < o.sep_robusto_deg) {
          factores.push(factor('sol', 1, `Sol a ${s}° de la línea de vista: más ruido, modo de baja tasa.`));
        } else {
          factores.push(factor('sol', 2, `Sol a ${s}° de la línea de vista: margen suficiente.`));
        }
      }
      if (opciones.polvo && opciones.eventoPolvo) {
        const ev = opciones.eventoPolvo;
        const dh = (ms - polvoIni) / hora;
        if (dh >= 0 && dh < ev.horas_severo) {
          factores.push(factor('polvo', 0, 'Evento de polvo: dispersión severa sobre la línea de vista.'));
        } else if (dh >= ev.horas_severo && dh < ev.horas_severo + ev.horas_degradado) {
          factores.push(factor('polvo', 1, 'Polvo en suspensión: la señal se atenúa.'));
        }
      }
    }

    const enlace = clasificar(factores);
    const respaldoTierra = enlace.estado !== 'sin_enlace' && relevoTierra;
    return {
      i,
      t: h.t,
      ms,
      sol: { el: h.sol_el, az: h.sol_az, horizonte: solHor, visible: solVisible },
      tierra: { el: h.tierra_el, az: h.tierra_az, horizonte: tierraHor, visible: tierraVisible },
      relevo: { sol: relevoSol, tierra: relevoTierra, sombraH: sombraRelevo, lineaDeVista: losLocal },
      enlace: { ...enlace, separacionSol },
      respaldoTierra,
    };
  });
}

export function hayComunicacion(m, enlaceActivo) {
  return m.tierra.visible || (enlaceActivo && m.respaldoTierra);
}

/** Tramo continuo mas largo donde `pred` es verdadero, dentro de [i0, i1]. */
export function tramoMasLargo(serie, i0, i1, pred) {
  let mejor = { horas: 0, desde: null, hasta: null };
  let inicio = null;
  for (let i = i0; i <= i1 + 1; i++) {
    const activo = i <= i1 && pred(serie[i]);
    if (activo && inicio === null) inicio = i;
    if (!activo && inicio !== null) {
      const horas = i - inicio;
      if (horas > mejor.horas) mejor = { horas, desde: inicio, hasta: i - 1 };
      inicio = null;
    }
  }
  return mejor;
}

/** Indicadores del periodo [i0, i1] (indices inclusivos). */
export function metricasPeriodo(serie, i0, i1, enlaceActivo) {
  const horas = i1 - i0 + 1;
  let sol = 0;
  let tierra = 0;
  const enlace = { rapido: 0, robusto: 0, sin_enlace: 0 };
  for (let i = i0; i <= i1; i++) {
    const m = serie[i];
    if (m.sol.visible) sol++;
    if (m.tierra.visible) tierra++;
    enlace[m.enlace.estado]++;
  }
  const brecha = tramoMasLargo(serie, i0, i1, (m) => !hayComunicacion(m, enlaceActivo));
  brecha.acotada = brecha.horas > 0 && (brecha.desde === i0 || brecha.hasta === i1);
  return {
    horas,
    horasSol: sol,
    horasTierra: tierra,
    pctSol: (100 * sol) / horas,
    pctTierra: (100 * tierra) / horas,
    enlace: enlaceActivo ? enlace : null,
    brecha,
  };
}

/** Segmentos contiguos con la misma clave (para dibujar franjas). */
export function segmentar(serie, i0, i1, clave) {
  const out = [];
  for (let i = i0; i <= i1; i++) {
    const k = clave(serie[i]);
    const ultimo = out[out.length - 1];
    if (ultimo && ultimo.valor === k) ultimo.hasta = i;
    else out.push({ valor: k, desde: i, hasta: i });
  }
  return out;
}

export const METRICAS_COMPARADOR = [
  { clave: 'pctSol', etiqueta: 'Horas con iluminación solar', unidad: '%', mejor: 'max',
    frase: (s) => `${s} presenta más horas de iluminación en el periodo seleccionado.` },
  { clave: 'pctTierra', etiqueta: 'Horas con vista directa a la Tierra', unidad: '%', mejor: 'max',
    frase: (s) => `${s} mantiene más horas de vista directa a la Tierra.` },
  { clave: 'rapido', etiqueta: 'Enlace local rápido', unidad: 'h', mejor: 'max', enlace: true,
    frase: (s) => `${s} acumula más horas de enlace local rápido.` },
  { clave: 'robusto', etiqueta: 'Enlace local robusto', unidad: 'h', mejor: null, enlace: true },
  { clave: 'sin_enlace', etiqueta: 'Sin enlace local', unidad: 'h', mejor: 'min', enlace: true,
    frase: (s) => `${s} pasa menos horas sin enlace local.` },
  { clave: 'brecha', etiqueta: 'Mayor intervalo sin comunicación', unidad: 'h', mejor: 'min',
    frase: (s) => `${s} tiene la interrupción continua más corta.` },
];

export function valorMetrica(met, clave) {
  if (clave === 'pctSol' || clave === 'pctTierra') return met[clave];
  if (clave === 'brecha') return met.brecha.horas;
  return met.enlace ? met.enlace[clave] : null;
}

/**
 * @param filas [{sitio, metricas}]
 * @returns {mejores: {clave: [ids]}, conclusiones: [string]}
 */
export function compararSitios(filas, enlaceActivo) {
  const mejores = {};
  const conclusiones = [];
  for (const def of METRICAS_COMPARADOR) {
    if (!def.mejor || (def.enlace && !enlaceActivo)) continue;
    const vals = filas.map((f) => valorMetrica(f.metricas, def.clave));
    const objetivo = def.mejor === 'max' ? Math.max(...vals) : Math.min(...vals);
    const ganadores = filas.filter((_, k) => Math.abs(vals[k] - objetivo) < 1e-9);
    mejores[def.clave] = ganadores.map((f) => f.sitio.id);
    if (ganadores.length === filas.length) {
      conclusiones.push(`${def.etiqueta}: los tres sitios empatan.`);
    } else if (ganadores.length > 1) {
      conclusiones.push(`${def.etiqueta}: empate entre ${ganadores.map((f) => f.sitio.etiqueta).join(' y ')}.`);
    } else {
      conclusiones.push(def.frase(ganadores[0].sitio.etiqueta));
    }
  }
  return { mejores, conclusiones };
}

function celdaCsv(v) {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function comparativoCsv(filas, contexto) {
  const cab = [
    'sitio', 'nombre', 'primera_hora_utc', 'ultima_hora_utc', 'horas', 'pct_iluminacion',
    'pct_tierra_directa', 'enlace_local', 'tipo_enlace', 'evento_polvo',
    'horas_rapido', 'horas_robusto', 'horas_sin_enlace',
    'mayor_intervalo_sin_comunicacion_h', 'horizonte',
  ];
  const lineas = [cab.join(',')];
  for (const { sitio, metricas: m } of filas) {
    lineas.push([
      sitio.etiqueta, sitio.nombre_corto, contexto.inicio, contexto.fin, m.horas,
      m.pctSol.toFixed(1), m.pctTierra.toFixed(1),
      contexto.enlaceActivo ? 'activado' : 'desactivado',
      contexto.enlaceActivo ? contexto.tipoEnlace : '',
      contexto.enlaceActivo && contexto.tipoEnlace === 'optico' && contexto.polvo ? 'si' : 'no',
      m.enlace ? m.enlace.rapido : '', m.enlace ? m.enlace.robusto : '', m.enlace ? m.enlace.sin_enlace : '',
      m.brecha.horas, contexto.modoHorizonte,
    ].map(celdaCsv).join(','));
  }
  return lineas.join('\n') + '\n';
}
