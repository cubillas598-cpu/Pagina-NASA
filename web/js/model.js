// Calculos puros de la demo. Sin DOM: se prueban con `node --test`.
// Todas las horas estan en UTC; cada muestra representa un intervalo de 1 h.

export const ESTADOS_ENLACE = {
  rapido: { nivel: 2, etiqueta: 'Rápido' },
  robusto: { nivel: 1, etiqueta: 'Robusto' },
  sin_enlace: { nivel: 0, etiqueta: 'Sin enlace' },
};
const ESTADO_POR_NIVEL = ['sin_enlace', 'robusto', 'rapido'];

const FORMATO_HORA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/**
 * true si t tiene la forma AAAA-MM-DDTHH:MM y es una fecha real. Date.parse
 * "corrige" fechas imposibles (30 de febrero, hora 24), así que el resultado
 * se vuelve a escribir y debe coincidir con el texto original.
 */
export function esMarcaHoraria(t) {
  if (typeof t !== 'string' || !FORMATO_HORA.test(t)) return false;
  const ms = Date.parse(`${t}:00Z`);
  return !Number.isNaN(ms) && new Date(ms).toISOString().slice(0, 16) === t;
}

export function parseUtc(t) {
  return Date.parse(`${t}:00Z`);
}

const CAMPOS_EFEMERIDE = ['sol_el', 'sol_az', 'tierra_el', 'tierra_az'];

/**
 * Revisa una serie de efemérides antes de usarla: marcas de tiempo válidas y
 * consecutivas cada hora, y ángulos numéricos dentro de rango. Devuelve la
 * lista de problemas (vacía si la serie es válida); nunca rellena huecos.
 */
export function problemasEfemerides(horas, id = 'sitio') {
  const problemas = [];
  if (!Array.isArray(horas) || horas.length === 0) return [`${id}: no hay muestras horarias.`];
  let previo = null;
  for (let k = 0; k < horas.length && problemas.length < 5; k++) {
    const h = horas[k];
    const ms = h && esMarcaHoraria(h.t) ? parseUtc(h.t) : NaN;
    if (Number.isNaN(ms)) { problemas.push(`${id}: la muestra ${k} no tiene una fecha válida.`); continue; }
    if (previo !== null && ms - previo !== 3600e3) problemas.push(`${id}: hay un salto en los datos antes de ${h.t}.`);
    previo = ms;
    for (const c of CAMPOS_EFEMERIDE) {
      const v = h[c];
      const fuera = c.endsWith('_el') ? Math.abs(v) > 90 : v < 0 || v > 360;
      if (typeof v !== 'number' || !Number.isFinite(v) || fuera) {
        problemas.push(`${id}: ${c} no es un ángulo válido en ${h.t}.`);
        break;
      }
    }
  }
  return problemas;
}

function problemasPerfil(perfil, etiqueta) {
  if (!perfil || !Array.isArray(perfil.elevacion_deg)) return [`${etiqueta}: falta el perfil de horizonte.`];
  const res = perfil.resolucion_deg;
  if (typeof res !== 'number' || !(res > 0) || Math.abs(360 / res - Math.round(360 / res)) > 1e-9) {
    return [`${etiqueta}: resolución de horizonte no válida.`];
  }
  const v = perfil.elevacion_deg;
  if (v.length !== Math.round(360 / res)) return [`${etiqueta}: el horizonte debe tener ${Math.round(360 / res)} valores y tiene ${v.length}.`];
  const malo = v.findIndex((x) => typeof x !== 'number' || !Number.isFinite(x) || Math.abs(x) > 90);
  return malo >= 0 ? [`${etiqueta}: valor de horizonte no válido en el azimut ${malo * res}°.`] : [];
}

/**
 * Revisa el escenario antes de usarlo: perfiles de horizonte completos y
 * numéricos (un null no puede convertirse en 0°), geometría del punto de
 * apoyo, umbrales y evento de polvo. Devuelve la lista de problemas.
 */
export function problemasEscenario(escenario) {
  const problemas = [];
  const num = (x) => typeof x === 'number' && Number.isFinite(x);
  if (!escenario || !Array.isArray(escenario.sitios) || escenario.sitios.length === 0) return ['El escenario no tiene sitios.'];
  const vistos = new Set();
  for (const s of escenario.sitios) {
    const id = s && s.id ? s.id : 'sitio sin id';
    if (!s || !s.id) problemas.push('Hay un sitio sin id.');
    else if (vistos.has(s.id)) problemas.push(`${id}: el id está repetido.`);
    else vistos.add(s.id);
    problemas.push(...problemasPerfil(s.horizonte, id));
    const r = s.relevo;
    if (!r || ![r.az_deg, r.el_deg, r.distancia_km].every(num)) problemas.push(`${id}: el punto de apoyo necesita azimut, elevación y distancia numéricos.`);
    else {
      if (r.distancia_km <= 0) problemas.push(`${id}: la distancia al punto de apoyo debe ser mayor que 0 km.`);
      if (r.az_deg < 0 || r.az_deg >= 360 || Math.abs(r.el_deg) > 90) problemas.push(`${id}: azimut o elevación del punto de apoyo fuera de rango.`);
      problemas.push(...problemasPerfil(r.horizonte, `${id}/punto de apoyo`));
    }
  }
  const e = escenario.enlace_local;
  if (!e || !num(e.rf?.bateria_relevo_h) || !num(e.optico?.sep_sin_enlace_deg) || !num(e.optico?.sep_robusto_deg)) {
    problemas.push('Faltan umbrales numéricos del enlace local.');
  } else {
    if (e.rf.bateria_relevo_h <= 0) problemas.push('La batería del punto de apoyo debe durar más de 0 h.');
    if (e.optico.sep_sin_enlace_deg < 0 || e.optico.sep_sin_enlace_deg >= e.optico.sep_robusto_deg) {
      problemas.push('Umbrales ópticos incoherentes: la separación "sin enlace" debe ser menor que la de "robusto".');
    }
  }
  const f = escenario.fuentes;
  if (!f || typeof f !== 'object' || !f.efemerides || !Object.values(f).every((x) => x && typeof x.nombre === 'string')) {
    problemas.push('Faltan las fuentes del escenario (nombre de cada una, incluida la de efemérides).');
  }
  const p = escenario.evento_polvo;
  if (!p || !esMarcaHoraria(p.inicio) || !num(p.duracion_s) || p.duracion_s < 0) problemas.push('El evento de polvo necesita inicio y duración válidos.');
  return problemas;
}

/**
 * Variables de terreno (data/terreno_sitios.json). Opcionales: si faltan, el
 * índice se calcula sin esos términos. Devuelve la lista de problemas.
 */
export function problemasTerreno(doc, escenario) {
  if (!doc) return [];
  if (typeof doc !== 'object' || !doc.sitios || typeof doc.sitios !== 'object') return ['El archivo de terreno no tiene sitios.'];
  const problemas = [];
  const rango = (v, a, b) => typeof v === 'number' && Number.isFinite(v) && v >= a && v <= b;
  for (const s of escenario.sitios) {
    const t = doc.sitios[s.id];
    if (!t) { problemas.push(`${s.id}: faltan sus variables de terreno.`); continue; }
    if (!rango(t.pendiente_media_deg, 0, 90) || !rango(t.pendiente_max_deg, 0, 90) || t.pendiente_max_deg < t.pendiente_media_deg) {
      problemas.push(`${s.id}: pendiente fuera de rango.`);
    }
    if (!rango(t.pct_llano_500m, 0, 100)) problemas.push(`${s.id}: % de área llana fuera de rango.`);
    if (t.rugosidad_100m_m !== null && !rango(t.rugosidad_100m_m, 0, 1000)) problemas.push(`${s.id}: rugosidad no válida.`);
    if (!t.aproximacion || !rango(t.aproximacion.mejor_obstaculo_deg, -90, 90)) problemas.push(`${s.id}: ruta de aproximación no válida.`);
    if ('dist_psr_km' in t && t.dist_psr_km !== null && !rango(t.dist_psr_km, 0, 1000)) problemas.push(`${s.id}: distancia a sombra permanente no válida.`);
  }
  return problemas;
}

/** Coordenadas por sitio: latitud y longitud este numéricas y en rango. */
export function problemasCoordenadas(escenario, coordenadas) {
  const problemas = [];
  for (const s of escenario.sitios) {
    const c = coordenadas && coordenadas[s.id];
    const ok = c && Number.isFinite(c.lat) && Number.isFinite(c.lon) && Math.abs(c.lat) <= 90 && c.lon >= 0 && c.lon < 360;
    if (!ok) problemas.push(`${s.id}: faltan latitud o longitud válidas.`);
    else if (c.elev_km !== undefined && !Number.isFinite(c.elev_km)) problemas.push(`${s.id}: la elevación debe ser numérica.`);
  }
  return problemas;
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
 * @param opciones   {modoHorizonte:'perfil'|'plano', tipoEnlace:'rf'|'optico',
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
        // Segundos del evento que caen dentro de esta muestra horaria.
        const s = segundosPolvoEnHora(opciones.eventoPolvo, polvoIni, ms);
        if (s >= 1800) {
          factores.push(factor('polvo', 0, `Polvo del penacho sobre la línea de vista durante ${Math.round(s)} s de esta hora.`));
        } else if (s > 0) {
          factores.push(factor('polvo', 1, `Polvo del penacho bloquea la línea de vista unos ${Math.round(s)} s en esta hora: el enlace reintenta en baja tasa.`));
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

/**
 * Segundos de un evento de polvo {inicio, duracion_s} dentro de la hora que
 * empieza en `ms`. Con muestras horarias, un evento de segundos degrada esa
 * hora a "robusto"; solo si cubre la mitad de la hora o más queda "sin enlace".
 */
export function segundosPolvoEnHora(evento, inicioMs, ms) {
  const fin = inicioMs + evento.duracion_s * 1000;
  const solape = Math.min(fin, ms + 3600e3) - Math.max(inicioMs, ms);
  return Math.max(0, solape) / 1000;
}

/** Primera y última muestra horaria que toca el evento de polvo, o null. */
export function horasEventoPolvo(serie, evento) {
  const ini = parseUtc(evento.inicio);
  const fin = ini + evento.duracion_s * 1000;
  const a = serie.findIndex((m) => m.ms + 3600e3 > ini);
  if (a < 0 || serie[a].ms >= fin) return null;
  let b = a;
  while (b + 1 < serie.length && serie[b + 1].ms < fin) b++;
  return [a, b];
}

export function hayComunicacion(m, enlaceActivo) {
  return m.tierra.visible || (enlaceActivo && m.respaldoTierra);
}

/**
 * Índice donde empieza la próxima interrupción de comunicación después de
 * `desde` dentro de [i0, i1]; si no queda ninguna adelante, la primera del
 * periodo. null si el periodo no tiene interrupciones.
 */
export function siguienteInterrupcion(serie, i0, i1, desde, enlaceActivo) {
  const empieza = (i) => !hayComunicacion(serie[i], enlaceActivo)
    && (i === i0 || hayComunicacion(serie[i - 1], enlaceActivo));
  for (let i = Math.max(i0, desde + 1); i <= i1; i++) if (empieza(i)) return i;
  for (let i = i0; i <= Math.min(desde, i1); i++) if (empieza(i)) return i;
  return null;
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
  let comunicacion = 0;
  let ambas = 0;
  let solTierra = 0;
  let respaldo = 0;
  const enlace = { rapido: 0, robusto: 0, sin_enlace: 0 };
  for (let i = i0; i <= i1; i++) {
    const m = serie[i];
    const com = hayComunicacion(m, enlaceActivo);
    if (m.sol.visible) sol++;
    if (m.tierra.visible) tierra++;
    if (com) comunicacion++;
    if (com && m.sol.visible) ambas++;
    if (m.sol.visible && m.tierra.visible) solTierra++;
    if (enlaceActivo && m.respaldoTierra) respaldo++;
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
    horasComunicacion: comunicacion,
    horasAmbas: ambas,
    pctComunicacion: (100 * comunicacion) / horas,
    pctAmbas: (100 * ambas) / horas,
    horasSolTierra: solTierra,
    pctSolTierra: (100 * solTierra) / horas,
    horasRespaldo: enlaceActivo ? respaldo : null,
    pctRespaldo: enlaceActivo ? (100 * respaldo) / horas : null,
    ventanaSol: tramoMasLargo(serie, i0, i1, (m) => m.sol.visible),
    ventanaTierra: tramoMasLargo(serie, i0, i1, (m) => m.tierra.visible),
    sombraMax: tramoMasLargo(serie, i0, i1, (m) => !m.sol.visible),
    enlace: enlaceActivo ? enlace : null,
    brecha,
  };
}

const TIPOS_EVENTO = {
  sol: { inicio: 'Inicio de sombra', fin: 'Vuelve el Sol' },
  tierra: { inicio: 'Tierra oculta', fin: 'Tierra visible' },
  enlace: { inicio: 'Enlace local sin servicio', fin: 'Enlace local restablecido' },
};

/**
 * Cambios de estado dentro de (i0, i1]: inicio/fin de sombra, pérdida y
 * recuperación de la Tierra y, con el enlace activo, caídas del enlace local.
 * Cada evento de inicio lleva la duración del tramo que abre (acotada al periodo).
 */
export function eventosPeriodo(serie, i0, i1, enlaceActivo) {
  const fuentes = [
    ['sol', (m) => m.sol.visible],
    ['tierra', (m) => m.tierra.visible],
  ];
  if (enlaceActivo) fuentes.push(['enlace', (m) => m.enlace.estado !== 'sin_enlace']);
  const eventos = [];
  for (const [tipo, ok] of fuentes) {
    for (let i = i0 + 1; i <= i1; i++) {
      const antes = ok(serie[i - 1]);
      const ahora = ok(serie[i]);
      if (antes === ahora) continue;
      const inicio = antes && !ahora;
      // Duración del tramo que abre el evento: la sombra o pérdida (inicio) o la
      // ventana recuperada (fin), acotada al periodo.
      let j = i;
      while (j <= i1 && ok(serie[j]) === ahora) j++;
      const horas = inicio ? j - i : null;
      const ventana = inicio ? null : j - i;
      eventos.push({ tipo, indice: i, inicio, horas, ventana, titulo: TIPOS_EVENTO[tipo][inicio ? 'inicio' : 'fin'] });
    }
  }
  return eventos.sort((a, b) => a.indice - b.indice || a.tipo.localeCompare(b.tipo));
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
  { clave: 'pctSol', insignia: 'Más horas de luz', corta: 'iluminación solar', etiqueta: 'Horas con iluminación solar', unidad: '%', mejor: 'max',
    frase: (s) => `${s} presenta más horas de iluminación en el periodo seleccionado.` },
  { clave: 'pctTierra', insignia: 'Más horas con la Tierra', corta: 'vista directa a la Tierra', etiqueta: 'Horas con vista directa a la Tierra', unidad: '%', mejor: 'max',
    frase: (s) => `${s} mantiene más horas de vista directa a la Tierra.` },
  { clave: 'pctSolTierra', insignia: 'Más horas con ambos', corta: 'Sol y Tierra a la vez', etiqueta: 'Horas con Sol y Tierra visibles a la vez', unidad: '%', mejor: 'max',
    frase: (s) => `${s} tiene más horas con Sol y vista directa a la Tierra al mismo tiempo.` },
  { clave: 'ventanaTierra', insignia: 'Ventana más larga', corta: 'ventana continua con la Tierra', etiqueta: 'Mayor ventana continua con la Tierra visible', unidad: 'h', mejor: 'max',
    frase: (s) => `${s} ofrece la ventana continua más larga con la Tierra visible.` },
  { clave: 'sombraMax', insignia: 'Sombra más corta', corta: 'sombra continua más corta', etiqueta: 'Mayor periodo continuo en sombra', unidad: 'h', mejor: 'min',
    frase: (s) => `${s} tiene el periodo en sombra más corto.` },
  { clave: 'pctRespaldo', insignia: 'Más respaldo', corta: 'respaldo que llega a la Tierra', etiqueta: 'Horas con respaldo que llega a la Tierra', unidad: '%', mejor: 'max', enlace: true,
    frase: (s) => `${s} tiene más horas de respaldo efectivo hacia la Tierra.` },
  { clave: 'rapido', insignia: 'Más enlace rápido', corta: 'enlace local rápido', etiqueta: 'Enlace local rápido', unidad: 'h', mejor: 'max', enlace: true,
    frase: (s) => `${s} acumula más horas de enlace local rápido.` },
  { clave: 'robusto', etiqueta: 'Enlace local robusto', unidad: 'h', mejor: null, enlace: true },
  { clave: 'sin_enlace', insignia: 'Menos horas sin enlace', corta: 'menos horas sin enlace local', etiqueta: 'Sin enlace local', unidad: 'h', mejor: 'min', enlace: true,
    frase: (s) => `${s} pasa menos horas sin enlace local.` },
  { clave: 'brecha', insignia: 'Menor interrupción', corta: 'interrupción más corta', etiqueta: 'Mayor intervalo sin comunicación', unidad: 'h', mejor: 'min',
    frase: (s) => `${s} tiene la interrupción continua más corta.` },
  // Terreno del sitio (LOLA 20 m, data/terreno_sitios.json): no depende del periodo.
  { clave: 'pendienteMedia', insignia: 'Más plano', terreno: 'pendiente_media_deg', corta: 'pendiente más suave', etiqueta: 'Pendiente media (100 m de radio)', unidad: '°', mejor: 'min',
    frase: (s) => `${s} tiene la pendiente media más suave.` },
  { clave: 'pendienteMax', insignia: 'Pendiente máxima más baja', terreno: 'pendiente_max_deg', corta: 'pendiente máxima más baja', etiqueta: 'Pendiente máxima (100 m de radio)', unidad: '°', mejor: 'min',
    frase: (s) => `${s} tiene la pendiente máxima más baja.` },
  { clave: 'llano', insignia: 'Más área llana', terreno: 'pct_llano_500m', corta: 'más área llana', etiqueta: 'Área con menos de 10° (500 m de radio)', unidad: '%', mejor: 'max',
    frase: (s) => `${s} tiene más área llana alrededor.` },
  { clave: 'rugosidad', insignia: 'Más liso', terreno: 'rugosidad_100m_m', corta: 'terreno más liso', etiqueta: 'Rugosidad a 100 m', unidad: 'm', mejor: 'min',
    frase: (s) => `${s} tiene el terreno más liso.` },
  { clave: 'aproximacion', insignia: 'Llegada más despejada', terreno: 'aproximacion.mejor_obstaculo_deg', corta: 'llegada más despejada', etiqueta: 'Obstáculo en la mejor ruta de llegada', unidad: '°', mejor: 'min',
    frase: (s) => `${s} tiene la ruta de llegada más despejada.` },
  { clave: 'hielo', insignia: 'Más cerca del hielo', terreno: 'dist_psr_km', corta: 'hielo más cerca', etiqueta: 'Distancia a sombra permanente (posible hielo)', unidad: 'km', mejor: 'min',
    frase: (s) => `${s} está más cerca de una zona en sombra permanente, donde puede haber hielo.` },
];

function leerRuta(obj, ruta) {
  return ruta.split('.').reduce((o, k) => (o == null ? null : o[k]), obj);
}

export function valorMetrica(met, clave) {
  const def = METRICAS_COMPARADOR.find((x) => x.clave === clave);
  if (def && def.terreno) {
    const v = leerRuta(met.terreno, def.terreno);
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  }
  if (['pctSol', 'pctTierra', 'pctSolTierra', 'pctRespaldo'].includes(clave)) return met[clave];
  if (['brecha', 'ventanaTierra', 'sombraMax', 'ventanaSol'].includes(clave)) return met[clave].horas;
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
    if (vals.some((v) => v === null || v === undefined)) continue; // sin datos para algún sitio
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
  return { mejores, conclusiones, resumen: resumirGanadores(filas, mejores) };
}

/**
 * Agrupa las métricas ganadas por cada sitio (sin empates), de más a menos.
 * @returns [{sitio, metricas: [corta], total}] y solo sitios con al menos una.
 */
export function resumirGanadores(filas, mejores) {
  const total = Object.keys(mejores).length;
  return filas
    .map((f) => ({
      sitio: f.sitio,
      metricas: METRICAS_COMPARADOR
        .filter((def) => mejores[def.clave] && mejores[def.clave].length === 1 && mejores[def.clave][0] === f.sitio.id)
        .map((def) => def.corta),
      total,
    }))
    .filter((g) => g.metricas.length > 0)
    .sort((a, b) => b.metricas.length - a.metricas.length);
}

/**
 * Índice de conveniencia del sitio (0-100): promedio ponderado de puntajes
 * 0-100. Propuesto por el equipo para comparar sitios de un vistazo; NO es un
 * estándar oficial de NASA. Los umbrales de cada puntaje son supuestos del
 * equipo (ver UMBRALES_INDICE) y se muestran en la metodología.
 *
 *   energía       % de horas con Sol visible
 *   comunicación  % de horas con vista directa a la Tierra
 *   respaldo      % de horas con respaldo que llega a la Tierra (solo con enlace local)
 *   noche         sombra continua más larga: 0 h = 100, ≥ 72 h (autonomía supuesta) = 0
 *   apagón        corte de comunicación más largo: 0 h = 100, ≥ 72 h = 0
 *   terreno       70 % pendiente media (≤ 5° = 100, ≥ 15° = 0) + 30 % rugosidad (≤ 0.5 m = 100, ≥ 3 m = 0)
 *   aproximación  obstáculo en la mejor ruta de llegada: ≤ 2° = 100, ≥ 10° = 0
 *   hielo         distancia a sombra permanente: ≤ 1 km = 100, ≥ 25 km o ninguna = 0
 *
 * Si falta un término (enlace desactivado o sin datos de terreno), los pesos
 * presentes se renormalizan para que el índice siga en escala 0-100.
 */
export const PESOS_SUITABILITY = {
  energia: 0.25, comunicacion: 0.20, respaldo: 0.10, noche: 0.10, apagon: 0.05,
  terreno: 0.15, aproximacion: 0.05, hielo: 0.10,
};

export const UMBRALES_INDICE = {
  horasAutonomia: 72, pendienteBuena: 5, pendienteMala: 15, rugosidadBuena: 0.5, rugosidadMala: 3,
  obstaculoBueno: 2, obstaculoMalo: 10, hieloCerca: 1, hieloLejos: 25,
};

export const NOMBRES_INDICE = {
  energia: 'iluminación', comunicacion: 'Tierra directa', respaldo: 'respaldo', noche: 'noche más larga',
  apagon: 'apagón más largo', terreno: 'terreno', aproximacion: 'ruta de llegada', hielo: 'cercanía al hielo',
};

/** 100 en `bueno` o mejor, 0 en `malo` o peor, lineal entre ambos. */
export function puntajeLineal(v, bueno, malo) {
  if (!Number.isFinite(v)) return null;
  const t = (v - malo) / (bueno - malo);
  return 100 * Math.min(1, Math.max(0, t));
}

/**
 * Puntajes 0-100 de cada término y total. `terreno`: entrada del sitio en
 * data/terreno_sitios.json (o null).
 */
export function desgloseIndice(metricas, enlaceActivo, terreno = null, pesos = PESOS_SUITABILITY) {
  const u = UMBRALES_INDICE;
  const partes = {
    energia: metricas.pctSol,
    comunicacion: metricas.pctTierra,
    respaldo: enlaceActivo ? metricas.pctRespaldo : null,
    noche: metricas.sombraMax ? puntajeLineal(metricas.sombraMax.horas, 0, u.horasAutonomia) : null,
    apagon: metricas.brecha ? puntajeLineal(metricas.brecha.horas, 0, u.horasAutonomia) : null,
    terreno: null,
    aproximacion: null,
    hielo: null,
  };
  if (terreno) {
    const p = puntajeLineal(terreno.pendiente_media_deg, u.pendienteBuena, u.pendienteMala);
    const r = puntajeLineal(terreno.rugosidad_100m_m, u.rugosidadBuena, u.rugosidadMala);
    partes.terreno = p === null ? null : r === null ? p : 0.7 * p + 0.3 * r;
    partes.aproximacion = puntajeLineal(terreno.aproximacion?.mejor_obstaculo_deg, u.obstaculoBueno, u.obstaculoMalo);
    if ('dist_psr_km' in terreno) {
      partes.hielo = terreno.dist_psr_km === null ? 0 : puntajeLineal(terreno.dist_psr_km, u.hieloCerca, u.hieloLejos);
    }
  }
  let suma = 0;
  let pesoUsado = 0;
  for (const [k, w] of Object.entries(pesos)) {
    const v = partes[k];
    if (v === null || v === undefined || !Number.isFinite(v)) continue;
    suma += w * v;
    pesoUsado += w;
  }
  return { total: pesoUsado > 0 ? suma / pesoUsado : 0, partes, pesoUsado };
}

export function suitabilityScore(metricas, enlaceActivo, pesos = PESOS_SUITABILITY, terreno = metricas.terreno ?? null) {
  return desgloseIndice(metricas, enlaceActivo, terreno, pesos).total;
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
    'mayor_intervalo_sin_comunicacion_h', 'horizonte', 'indice_conveniencia',
    'pct_sol_y_tierra', 'pct_respaldo_tierra', 'mayor_ventana_tierra_h', 'mayor_sombra_h',
    'pendiente_media_deg', 'pendiente_max_deg', 'pct_llano_500m', 'rugosidad_100m_m',
    'obstaculo_mejor_llegada_deg', 'distancia_sombra_permanente_km',
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
      suitabilityScore(m, contexto.enlaceActivo).toFixed(1),
      m.pctSolTierra.toFixed(1), m.pctRespaldo === null ? '' : m.pctRespaldo.toFixed(1),
      m.ventanaTierra.horas, m.sombraMax.horas,
      ...['pendienteMedia', 'pendienteMax', 'llano', 'rugosidad', 'aproximacion', 'hielo'].map((k) => valorMetrica(m, k) ?? ''),
    ].map(celdaCsv).join(','));
  }
  return lineas.join('\n') + '\n';
}
