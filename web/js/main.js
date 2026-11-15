import { cargarDatos } from './datos.js';
import { HORIZONS_PROXY_URL } from './config.js';
import { consultarHorizons } from './horizons.js';
import { problemasEfemerides, calcularSerie, metricasPeriodo, compararSitios, comparativoCsv, parseUtc, horasEventoPolvo, eventosPeriodo } from './model.js';
import { isoDia, esc } from './format.js';
import { ENLACE, etiquetaHorizonte, codigoHorizonte } from './views/estilos.js';
import { renderFranja, renderDisponibilidad, renderMiniComparativo } from './views/resumen.js';
import { crearGraficaEvolucion } from './views/grafica-evolucion.js';
import { renderHora, renderDestacada, renderEventos, renderPorque } from './views/panel-derecho.js';
import { renderPanelEstado } from './views/panel-estado.js';
import { crearMapaPolar, leyendaMapa } from './views/mapa.js';
import { crearLuna } from './views/luna.js';
import { renderSitiosLuna, renderFichaLuna } from './views/ficha-luna.js';
import { renderGraficaHorizonte, leyendaHorizonte } from './views/grafica-horizonte.js';
import { crearLineaTiempo, leyendaTiempo } from './views/linea-tiempo.js';
import { renderComparador } from './views/comparador.js';

const $ = (sel) => document.querySelector(sel);
const VISTAS = ['resumen', 'sitios', 'comparador', 'enlace', 'metodologia'];
const SUBTITULOS = {
  resumen: 'Luz, comunicación y enlace local del sitio activo en el periodo elegido.',
  sitios: 'Ubicación real y horizonte LOLA del sitio en la hora seleccionada.',
  comparador: 'Los tres sitios sobre el mismo periodo y los mismos supuestos.',
  enlace: 'Estado del enlace de respaldo hora por hora y por qué cambia.',
  metodologia: 'Qué se calcula, con qué datos y qué límites tiene la demo.',
};

function estadoInicial(msRef) {
  return {
    vista: 'resumen',
    sitioId: 'shackleton',
    desde: isoDia(msRef[0]),
    hasta: isoDia(msRef[msRef.length - 1]),
    tipoEnlace: 'rf',
    enlaceActivo: true,
    polvo: false,
    modoHorizonte: 'perfil',
    indice: 0,
    paso: 1,
  };
}

async function iniciar() {
  let datos;
  try {
    datos = await cargarDatos();
  } catch (err) {
    $('.principal').insertAdjacentHTML('afterbegin',
      `<div class="tarjeta" role="alert"><h2>No se pudieron cargar los datos</h2><p>${esc(err.message)} Abre la demo con un servidor local (ver README) o usa la versión empaquetada.</p></div>`);
    return;
  }
  const { escenario, efemerides } = datos;
  const sitios = escenario.sitios;
  const horasRef = efemerides[sitios[0].id];
  const msRef = horasRef.map((h) => parseUtc(h.t));

  let estado = estadoInicial(msRef);
  const vistaHash = location.hash.slice(1);
  if (VISTAS.includes(vistaHash)) estado.vista = vistaHash;
  // ?sitio=<id> (enlaces de la portada): abre la demo con ese sitio activo.
  const sitioPedido = sitios.find((s) => s.id === new URLSearchParams(location.search).get('sitio'));
  if (sitioPedido) estado.sitioId = sitioPedido.id;

  // ---- Derivados con caché: las series solo cambian con los supuestos del modelo.
  let claveSeries = '';
  let series = {};
  function derivar() {
    const clave = [estado.tipoEnlace, estado.polvo, estado.modoHorizonte].join('|');
    if (clave !== claveSeries) {
      series = {};
      for (const s of sitios) {
        series[s.id] = calcularSerie(s, efemerides[s.id], {
          modoHorizonte: estado.modoHorizonte, tipoEnlace: estado.tipoEnlace, polvo: estado.polvo,
          reglas: escenario.enlace_local, eventoPolvo: escenario.evento_polvo,
        });
      }
      claveSeries = clave;
    }
    const [i0, i1] = rangoIndices();
    const sitio = sitios.find((s) => s.id === estado.sitioId);
    const serie = series[sitio.id];
    const filas = sitios.map((s) => ({ sitio: s, metricas: metricasPeriodo(series[s.id], i0, i1, estado.enlaceActivo) }));
    return {
      escenario, sitios, sitio, serie, i0, i1, estado, indice: estado.indice,
      muestra: serie[estado.indice],
      metricas: filas.find((f) => f.sitio.id === sitio.id).metricas,
      filas, comparacion: compararSitios(filas, estado.enlaceActivo),
    };
  }

  function rangoIndices() {
    const a = parseUtc(`${estado.desde}T00`);
    const b = parseUtc(`${estado.hasta}T23`);
    let i0 = msRef.findIndex((ms) => ms >= a);
    let i1 = msRef.length - 1;
    while (i1 > 0 && msRef[i1] > b) i1--;
    if (i0 < 0) i0 = 0;
    if (i1 < i0) i1 = i0;
    return [i0, i1];
  }

  // ---- Controles del panel derecho
  const c = {
    sitio: $('#c-sitio'), rf: $('#c-rf'), optico: $('#c-optico'), enlace: $('#c-enlace'),
    polvo: $('#c-polvo'), polvoEnv: $('#c-polvo-envoltura'), horizonte: $('#c-horizonte'),
  };
  c.sitio.innerHTML = sitios.map((s) => `<option value="${s.id}">${esc(s.etiqueta)}: ${esc(s.nombre_corto)}</option>`).join('');
  const minDia = isoDia(msRef[0]);
  const maxDia = isoDia(msRef[msRef.length - 1]);

  // ---- Selectores de periodo (gráfica principal y comparador comparten estado)
  const periodos = [...document.querySelectorAll('[data-periodo]')].map((caja, k) => {
    caja.innerHTML = `
      <span aria-hidden="true">Periodo UTC</span>
      <label class="sr" for="p${k}-desde">Desde</label><input type="date" id="p${k}-desde" min="${minDia}" max="${maxDia}" required>
      <span aria-hidden="true">a</span>
      <label class="sr" for="p${k}-hasta">Hasta</label><input type="date" id="p${k}-hasta" min="${minDia}" max="${maxDia}" required>
      <p class="periodo__nota" aria-live="polite"></p>`;
    const desde = caja.querySelector(`#p${k}-desde`);
    const hasta = caja.querySelector(`#p${k}-hasta`);
    const nota = caja.querySelector('.periodo__nota');
    const cambiar = () => {
      let a = desde.value || minDia;
      let b = hasta.value || maxDia;
      const acotar = (v) => (v < minDia ? minDia : v > maxDia ? maxDia : v);
      let texto = '';
      if (a !== acotar(a) || b !== acotar(b)) texto = `Los datos disponibles van del ${minDia} al ${maxDia}; ajusté el periodo.`;
      a = acotar(a); b = acotar(b);
      if (a > b) { [a, b] = [b, a]; texto = 'La fecha final era anterior a la inicial; las intercambié.'; }
      periodos.forEach((p) => { p.nota.textContent = texto; });
      actualizar({ desde: a, hasta: b });
    };
    desde.addEventListener('change', cambiar);
    hasta.addEventListener('change', cambiar);
    return { desde, hasta, nota };
  });

  function sincronizarControles() {
    c.sitio.value = estado.sitioId;
    for (const p of periodos) { p.desde.value = estado.desde; p.hasta.value = estado.hasta; }
    c.rf.checked = estado.tipoEnlace === 'rf';
    c.optico.checked = estado.tipoEnlace === 'optico';
    c.rf.disabled = c.optico.disabled = !estado.enlaceActivo;
    c.enlace.checked = estado.enlaceActivo;
    c.polvo.checked = estado.polvo;
    c.polvoEnv.hidden = !(estado.enlaceActivo && estado.tipoEnlace === 'optico');
    c.horizonte.options[0].textContent = etiquetaHorizonte('perfil', sitios.find((s) => s.id === estado.sitioId));
    c.horizonte.value = estado.modoHorizonte;
    $('#t-paso').value = String(estado.paso);
  }

  function actualizar(cambios, { completo = true } = {}) {
    estado = { ...estado, ...cambios };
    const [i0, i1] = rangoIndices();
    estado.indice = Math.max(i0, Math.min(i1, estado.indice));
    render(completo);
  }

  c.sitio.addEventListener('change', () => actualizar({ sitioId: c.sitio.value }));
  c.rf.addEventListener('change', () => actualizar({ tipoEnlace: 'rf' }));
  c.optico.addEventListener('change', () => actualizar({ tipoEnlace: 'optico' }));
  c.enlace.addEventListener('change', () => actualizar({ enlaceActivo: c.enlace.checked }));
  c.polvo.addEventListener('change', () => {
    const cambios = { polvo: c.polvo.checked };
    // Al activar el polvo, llevar el cursor a la hora del evento si cae en el periodo.
    if (c.polvo.checked) {
      const ev = horasEventoPolvo(msRef.map((ms) => ({ ms })), escenario.evento_polvo);
      const [i0, i1] = rangoIndices();
      if (ev && ev[0] >= i0 && ev[0] <= i1) cambios.indice = ev[0];
    }
    actualizar(cambios);
  });
  c.horizonte.addEventListener('change', () => actualizar({ modoHorizonte: c.horizonte.value }));
  $('#c-reset').addEventListener('click', () => {
    detener();
    periodos.forEach((p) => { p.nota.textContent = ''; });
    estado = { ...estadoInicial(msRef), vista: estado.vista };
    render(true);
  });

  // ---- Ayuda
  const dialogo = $('#dialogo-ayuda');
  $('#ayuda-estados').innerHTML = `
    <dt>Sol visible / Sombra</dt><dd>El Sol está por encima o por debajo del horizonte local en esa hora.</dd>
    <dt>Tierra visible / Tierra oculta</dt><dd>Hay o no vista directa a la Tierra para comunicar sin intermediarios.</dd>
    ${Object.values(ENLACE).map((e) => `<dt class="${e.clase}">${e.texto}</dt><dd>${e.ayuda}</dd>`).join('')}
    <dt>Respaldo hacia la Tierra</dt><dd>Disponible solo si el tramo local funciona y el punto de apoyo ve la Tierra.</dd>`;
  $('#c-ayuda').addEventListener('click', () => dialogo.showModal());

  // ---- Metodología: fuentes y reglas desde el propio escenario.
  const etiquetaEstado = { en_uso: ['En uso', 'var(--ok)'], prevista: ['Integración prevista', 'var(--acento-claro)'] };
  $('#fuentes').innerHTML = Object.values(escenario.fuentes).map((f) => {
    const [txt, col] = etiquetaEstado[f.estado] || [f.estado, 'var(--texto-2)'];
    const fecha = f === escenario.fuentes.efemerides && escenario.generado_utc
      ? ` Datos pedidos a Horizons el ${esc(escenario.generado_utc.replace('T', ' ').replace('Z', ' UTC'))}.` : '';
    return `<div><dt>${esc(f.nombre)} <span class="estado-fuente" style="color:${col}">${txt}</span></dt><dd>${esc(f.detalle)}${fecha}</dd></div>`;
  }).join('') + `<div><dt>Punto de apoyo, umbrales y momento del evento de polvo <span class="estado-fuente" style="color:var(--acento-claro)">Supuestos de demostración</span></dt><dd>Precedentes: concepto de relevo LunaNet / Lunar Communications Relay (RF), láser O2O de Artemis II y “horizon glow” observado desde Apollo (óptico).</dd></div>`;
  const r = escenario.enlace_local;
  $('#reglas-enlace').innerHTML = `
    <li><strong>Radiofrecuencia:</strong> requiere línea de vista al punto de apoyo. Si el punto de apoyo queda en sombra opera con batería (robusto); tras ${r.rf.bateria_relevo_h} h en sombra se considera sin enlace.</li>
    <li><strong>Óptico:</strong> si el Sol queda a menos de ${r.optico.sep_robusto_deg}° de la línea de vista el enlace pasa a robusto; a menos de ${r.optico.sep_sin_enlace_deg}° queda sin enlace. El evento de polvo dura ${escenario.evento_polvo.duracion_s} s, calibrado con Apollo (10–12 s de polvo visible en el descenso final). Como cada muestra vale una hora, esa hora pasa a robusto; solo un evento de media hora o más la dejaría sin enlace. El momento del aterrizaje cercano es un supuesto.</li>`;

  // ---- Consulta en vivo a JPL Horizons (solo si hay intermediario configurado).
  // Pide el mismo periodo que los datos publicados; si responde bien, reemplaza
  // las efemérides en memoria y muestra cuánto difieren de las publicadas.
  if (HORIZONS_PROXY_URL) {
    const boton = $('#consultar-horizons');
    const aviso = $('#estado-horizons');
    $('#consulta-vivo').hidden = false;
    const mostrarAviso = (texto, error = false) => {
      aviso.textContent = texto;
      aviso.classList.toggle('consulta-vivo__estado--error', error);
    };
    boton.addEventListener('click', async () => {
      boton.disabled = true;
      boton.textContent = 'Consultando…';
      mostrarAviso(`Pidiendo a JPL Horizons el Sol y la Tierra de ${sitios.length} sitios…`);
      try {
        // El intermediario pide días completos con fin incluido; se pide hasta el
        // día siguiente a la última muestra y se conservan solo las horas publicadas.
        const ultimo = new Date(parseUtc(horasRef[horasRef.length - 1].t) + 86400000).toISOString().slice(0, 10);
        const crudos = await consultarHorizons({
          proxy: HORIZONS_PROXY_URL, sitios, inicio: horasRef[0].t.slice(0, 10), fin: ultimo,
        });
        const horasPublicadas = new Set(horasRef.map((h) => h.t));
        const nuevos = Object.fromEntries(Object.entries(crudos).map(([id, h]) => [id, h.filter((x) => horasPublicadas.has(x.t))]));
        let difMax = 0;
        for (const s of sitios) {
          const h = nuevos[s.id];
          const mal = problemasEfemerides(h, s.id);
          if (mal.length) throw new Error(mal[0]);
          const actual = efemerides[s.id];
          if (h.length !== actual.length || h.some((x, i) => x.t !== actual[i].t)) {
            throw new Error(`Horizons devolvió otras horas para ${s.id}; se conservan los datos publicados.`);
          }
          for (let i = 0; i < h.length; i++) {
            for (const k of ['sol_el', 'sol_az', 'tierra_el', 'tierra_az']) {
              let d = Math.abs(h[i][k] - actual[i][k]);
              if (k.endsWith('_az')) d = Math.min(d, 360 - d);
              difMax = Math.max(difMax, d);
            }
          }
        }
        Object.assign(efemerides, nuevos);
        claveSeries = '';
        render(true);
        const hora = new Date().toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
        mostrarAviso(`Datos en vivo de JPL Horizons (${hora}). Diferencia máxima con los publicados: ${difMax.toFixed(6)}°.`);
      } catch (err) {
        mostrarAviso(`${err.message} La demo sigue con los datos publicados.`, true);
      } finally {
        boton.disabled = false;
        boton.textContent = 'Consultar JPL Horizons ahora';
      }
    });
  }

  // ---- Navegación lateral
  function mostrarVista() {
    for (const v of VISTAS) {
      const el = $(`#vista-${v}`);
      const visible = v === estado.vista;
      if (visible && el.hidden) {
        el.classList.remove('vista--entra');
        void el.offsetWidth; // reinicia la animación de entrada
        el.classList.add('vista--entra');
      }
      el.hidden = !visible;
    }
    document.querySelectorAll('.lateral__item').forEach((a) => {
      if (a.dataset.vista === estado.vista) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    $('#contenido').dataset.vista = estado.vista;
    $('#cab-sub').textContent = SUBTITULOS[estado.vista];
    $('#luna-tarjeta').hidden = estado.vista !== 'resumen';
  }
  window.addEventListener('hashchange', () => {
    const v = location.hash.slice(1);
    if (VISTAS.includes(v)) { estado.vista = v; render(true); }
  });

  // ---- Tiempo: gráfica principal, línea de tiempo detallada y reproducción
  const alCambiarIndice = (i) => { if (i !== estado.indice) actualizar({ indice: i }, { completo: false }); };
  const evolucion = crearGraficaEvolucion($('#evolucion'), { alCambiarIndice });
  const tiempo = crearLineaTiempo($('#tiempo'), $('#tooltip'), { alCambiarIndice });
  let temporizador = null;
  const btnPlay = $('#t-play');
  function detener() {
    clearInterval(temporizador); temporizador = null;
    btnPlay.setAttribute('aria-pressed', 'false');
    btnPlay.querySelector('.accion__texto').textContent = 'Reproducir';
  }
  function reproducir() {
    const [i0, i1] = rangoIndices();
    if (estado.indice >= i1) actualizar({ indice: i0 }, { completo: false });
    btnPlay.setAttribute('aria-pressed', 'true');
    btnPlay.querySelector('.accion__texto').textContent = 'Pausar';
    temporizador = setInterval(() => {
      const [, fin] = rangoIndices();
      const sig = estado.indice + estado.paso;
      if (sig > fin) { actualizar({ indice: fin }, { completo: false }); detener(); return; }
      actualizar({ indice: sig }, { completo: false });
    }, 160);
  }
  btnPlay.addEventListener('click', () => (temporizador ? detener() : reproducir()));
  $('#t-paso').addEventListener('change', (e) => { estado.paso = Number(e.target.value); });
  $('#t-adelante').addEventListener('click', () => actualizar({ indice: estado.indice + estado.paso }, { completo: false }));
  $('#t-atras').addEventListener('click', () => actualizar({ indice: estado.indice - estado.paso }, { completo: false }));
  $('#t-inicio').addEventListener('click', () => actualizar({ indice: rangoIndices()[0] }, { completo: false }));
  $('#ir-brecha').addEventListener('click', () => {
    const d = derivar();
    if (d.metricas.brecha.horas > 0) actualizar({ indice: d.metricas.brecha.desde }, { completo: false });
  });

  // ---- CSV
  // Publicada en claude.ai, la página guarda con la capacidad `downloads`;
  // servida localmente o abierta como archivo, usa una descarga normal.
  const descargasHost = window.claude?.use ? window.claude.use('downloads').catch(() => null) : Promise.resolve(null);
  $('#exportar-csv').addEventListener('click', async () => {
    const d = derivar();
    const csv = '﻿' + comparativoCsv(d.filas, {
      inicio: `${d.serie[d.i0].t}Z`, fin: `${d.serie[d.i1].t}Z`, enlaceActivo: estado.enlaceActivo,
      tipoEnlace: estado.tipoEnlace, polvo: estado.polvo, modoHorizonte: codigoHorizonte(estado.modoHorizonte, d.sitio),
    });
    const nombre = `comparativo-sitios_${estado.desde}_${estado.hasta}.csv`;
    const host = await descargasHost;
    if (host) {
      try { await host.save({ filename: nombre, data: csv }); } catch (err) {
        if (err?.code !== 'declined') $('#comparador-meta').textContent += ' No se pudo exportar el CSV en esta vista.';
      }
      return;
    }
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: nombre });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  // ---- Luna 3D (o mapa polar 2D si no hay WebGL) y mapa polar de Sitios
  const reducirMovimiento = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const elegirSitio = (id) => {
    if (id === estado.sitioId && luna) luna.enfocarSitio(sitios.find((s) => s.id === id));
    else actualizar({ sitioId: id });
  };
  const luna = crearLuna($('#luna'), {
    alElegir: elegirSitio,
    urlTextura: document.getElementById('textura-luna')?.getAttribute('href') || null,
    urlPolo: document.getElementById('relieve-polo')?.getAttribute('href') || null,
    reducirMovimiento,
  });
  const mapaRespaldo = luna ? null : crearMapaPolar($('#luna'), elegirSitio);
  if (!luna) $('#luna').classList.add('luna--sin-webgl');
  const mapaSitios = crearMapaPolar($('#mapa'), elegirSitio);
  $('#luna-sitios').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    if (b.dataset.sitio) elegirSitio(b.dataset.sitio);
    else if (b.dataset.accion === 'tres' && luna) luna.verTres();
  });

  // ---- Render
  let eventos = [];

  function render(completo) {
    const d = derivar();
    if (completo) {
      sincronizarControles();
      mostrarVista();
      eventos = eventosPeriodo(d.serie, d.i0, d.i1, estado.enlaceActivo);
    }
    // Columna derecha: siempre visible.
    renderHora($('#hora-utc'), $('#fecha-utc'), d.muestra);
    renderDestacada($('#destacada'), d);
    renderEventos($('#eventos'), $('#eventos-total'), d, eventos, (i) => actualizar({ indice: i }, { completo: false }));

    if (estado.vista === 'resumen') {
      renderSitiosLuna($('#luna-sitios'), d, !!luna);
      renderFichaLuna($('#luna-ficha'), d, !!luna);
      if (luna) luna.render(d); else mapaRespaldo.render(d);
      if (completo) {
        renderFranja($('#franja'), d);
        renderDisponibilidad($('#disponibilidad'), d);
        renderMiniComparativo($('#mini-comparativo'), d);
        evolucion.dibujar(d);
      } else {
        evolucion.moverCursor(d);
      }
    } else if (estado.vista === 'sitios') {
      if (completo) leyendaHorizonte($('#leyenda-horizonte'), estado);
      renderPanelEstado($('#estado'), d);
      mapaSitios.render(d);
      renderGraficaHorizonte($('#grafica-horizonte'), d);
    } else if (estado.vista === 'comparador') {
      if (completo) renderComparador($('#tabla-comparador'), $('#comparador-meta'), $('#conclusiones'), d);
    } else if (estado.vista === 'enlace') {
      if (completo) {
        leyendaTiempo($('#leyenda-tiempo'), estado);
        tiempo.dibujar(d);
      } else {
        tiempo.moverCursor(d);
      }
      renderPorque($('#porque'), d);
    }
  }

  // Redibujar al cambiar el ancho (gráficas a tamaño real).
  let anchoPrevio = window.innerWidth;
  let espera = null;
  window.addEventListener('resize', () => {
    if (window.innerWidth === anchoPrevio) return;
    anchoPrevio = window.innerWidth;
    clearTimeout(espera);
    espera = setTimeout(() => render(true), 150);
  });

  leyendaMapa($('#leyenda-mapa'));
  render(true);
  // Con un sitio pedido desde la portada, el globo va del polo a ese sitio.
  if (sitioPedido && luna && estado.vista === 'resumen') setTimeout(() => luna.enfocarSitio(sitioPedido), 450);
}

iniciar();
