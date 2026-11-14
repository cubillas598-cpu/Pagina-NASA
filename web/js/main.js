import { cargarDatos } from './datos.js';
import { calcularSerie, metricasPeriodo, compararSitios, comparativoCsv, parseUtc } from './model.js';
import { isoDia, aleatorio, contorno, esc } from './format.js';
import { ENLACE } from './views/estilos.js';
import { renderKpis } from './views/kpis.js';
import { renderPanelEstado } from './views/panel-estado.js';
import { renderMapa, leyendaMapa } from './views/mapa.js';
import { renderGraficaHorizonte, leyendaHorizonte } from './views/grafica-horizonte.js';
import { crearLineaTiempo, leyendaTiempo } from './views/linea-tiempo.js';
import { renderComparador } from './views/comparador.js';

const $ = (sel) => document.querySelector(sel);
const VISTAS = ['explorador', 'comparador', 'metodologia'];

function estadoInicial(serieRef) {
  return {
    vista: 'explorador',
    sitioId: 'shackleton',
    desde: isoDia(serieRef[0].ms),
    hasta: isoDia(serieRef[serieRef.length - 1].ms),
    tipoEnlace: 'rf',
    enlaceActivo: true,
    polvo: false,
    modoHorizonte: 'sintetico',
    indice: 0,
    paso: 1,
  };
}

async function iniciar() {
  let datos;
  try {
    datos = await cargarDatos();
  } catch (err) {
    $('#contenido').insertAdjacentHTML('afterbegin',
      `<div class="vidrio panel" role="alert"><h2>No se pudieron cargar los datos</h2><p>${esc(err.message)} Abre la demo con un servidor local (ver README) o usa la versión empaquetada.</p></div>`);
    return;
  }
  const { escenario, efemerides } = datos;
  const sitios = escenario.sitios;
  const horasRef = efemerides[sitios[0].id];
  const msRef = horasRef.map((h) => parseUtc(h.t));

  let estado = estadoInicial(horasRef.map((h, i) => ({ ms: msRef[i] })));
  estado.vista = VISTAS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'explorador';

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

  // ---- Controles
  const c = {
    sitio: $('#c-sitio'), desde: $('#c-desde'), hasta: $('#c-hasta'), nota: $('#c-fechas-nota'),
    rf: $('#c-rf'), optico: $('#c-optico'), enlace: $('#c-enlace'), polvo: $('#c-polvo'),
    polvoEnv: $('#c-polvo-envoltura'), horizonte: $('#c-horizonte'),
  };
  c.sitio.innerHTML = sitios.map((s) => `<option value="${s.id}">${esc(s.etiqueta)}: ${esc(s.nombre_corto)}</option>`).join('');
  const minDia = isoDia(msRef[0]);
  const maxDia = isoDia(msRef[msRef.length - 1]);
  for (const el of [c.desde, c.hasta]) { el.min = minDia; el.max = maxDia; }

  function sincronizarControles() {
    c.sitio.value = estado.sitioId;
    c.desde.value = estado.desde;
    c.hasta.value = estado.hasta;
    c.rf.checked = estado.tipoEnlace === 'rf';
    c.optico.checked = estado.tipoEnlace === 'optico';
    c.rf.disabled = c.optico.disabled = !estado.enlaceActivo;
    c.enlace.checked = estado.enlaceActivo;
    c.polvo.checked = estado.polvo;
    c.polvoEnv.hidden = !(estado.enlaceActivo && estado.tipoEnlace === 'optico');
    c.horizonte.value = estado.modoHorizonte;
  }

  function actualizar(cambios, { completo = true } = {}) {
    estado = { ...estado, ...cambios };
    const [i0, i1] = rangoIndices();
    estado.indice = Math.max(i0, Math.min(i1, estado.indice));
    render(completo);
  }

  c.sitio.addEventListener('change', () => actualizar({ sitioId: c.sitio.value }));
  function cambiarFechas() {
    let desde = c.desde.value || minDia;
    let hasta = c.hasta.value || maxDia;
    const acotar = (v) => (v < minDia ? minDia : v > maxDia ? maxDia : v);
    let nota = '';
    if (desde !== acotar(desde) || hasta !== acotar(hasta)) nota = `Los datos disponibles van del ${minDia} al ${maxDia}; ajusté el periodo.`;
    desde = acotar(desde); hasta = acotar(hasta);
    if (desde > hasta) { [desde, hasta] = [hasta, desde]; nota = 'La fecha final era anterior a la inicial; las intercambié.'; }
    c.nota.textContent = nota;
    actualizar({ desde, hasta });
  }
  c.desde.addEventListener('change', cambiarFechas);
  c.hasta.addEventListener('change', cambiarFechas);
  c.rf.addEventListener('change', () => actualizar({ tipoEnlace: 'rf' }));
  c.optico.addEventListener('change', () => actualizar({ tipoEnlace: 'optico' }));
  c.enlace.addEventListener('change', () => actualizar({ enlaceActivo: c.enlace.checked }));
  c.polvo.addEventListener('change', () => {
    const cambios = { polvo: c.polvo.checked };
    // Al activar el polvo, llevar el cursor al inicio del evento si cae en el periodo.
    if (c.polvo.checked) {
      const iEv = horasRef.findIndex((h) => h.t === escenario.evento_polvo.inicio);
      const [i0, i1] = rangoIndices();
      if (iEv >= i0 && iEv <= i1) cambios.indice = iEv;
    }
    actualizar(cambios);
  });
  c.horizonte.addEventListener('change', () => actualizar({ modoHorizonte: c.horizonte.value }));
  $('#c-reset').addEventListener('click', () => {
    detener();
    c.nota.textContent = '';
    const vista = estado.vista;
    estado = { ...estadoInicial(msRef.map((ms) => ({ ms }))), vista };
    $('#t-paso').value = '1';
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
  const etiquetaEstado = { en_uso: ['En uso', 'var(--ok)'], prevista: ['Integración prevista', 'var(--ambar)'] };
  $('#fuentes').innerHTML = Object.values(escenario.fuentes).map((f) => {
    const [txt, col] = etiquetaEstado[f.estado] || [f.estado, 'var(--texto-2)'];
    return `<div><dt>${esc(f.nombre)} <span class="estado-fuente" style="color:${col}">${txt}</span></dt><dd>${esc(f.detalle)}</dd></div>`;
  }).join('') + `<div><dt>Punto de apoyo, umbrales y evento de polvo <span class="estado-fuente" style="color:var(--ambar)">Supuestos de demostración</span></dt><dd>Precedentes: concepto de relevo LunaNet / Lunar Communications Relay (RF), láser O2O de Artemis II y “horizon glow” observado desde Apollo (óptico).</dd></div>`;
  const r = escenario.enlace_local;
  $('#reglas-enlace').innerHTML = `
    <li><strong>Radiofrecuencia:</strong> requiere línea de vista al punto de apoyo. Si el punto de apoyo queda en sombra opera con batería (robusto); tras ${r.rf.bateria_relevo_h} h en sombra se considera sin enlace.</li>
    <li><strong>Óptico:</strong> si el Sol queda a menos de ${r.optico.sep_robusto_deg}° de la línea de vista el enlace pasa a robusto; a menos de ${r.optico.sep_sin_enlace_deg}° queda sin enlace. El evento de polvo sintético deja el enlace sin servicio ${escenario.evento_polvo.horas_severo} h y degradado ${escenario.evento_polvo.horas_degradado} h más.</li>`;

  // ---- Navegación
  function mostrarVista() {
    for (const v of VISTAS) $(`#vista-${v}`).hidden = v !== estado.vista;
    document.querySelectorAll('.nav__item').forEach((a) => {
      if (a.dataset.vista === estado.vista) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    $('#controles').hidden = estado.vista === 'metodologia';
  }
  window.addEventListener('hashchange', () => {
    const v = location.hash.slice(1);
    if (VISTAS.includes(v)) { estado.vista = v; mostrarVista(); render(true); }
  });

  // ---- Línea de tiempo y reproducción
  const tiempo = crearLineaTiempo($('#tiempo'), $('#tooltip'), {
    alCambiarIndice: (i) => { if (i !== estado.indice) actualizar({ indice: i }, { completo: false }); },
  });
  let temporizador = null;
  const btnPlay = $('#t-play');
  function detener() {
    clearInterval(temporizador); temporizador = null;
    btnPlay.setAttribute('aria-pressed', 'false'); btnPlay.setAttribute('aria-label', 'Reproducir');
  }
  function reproducir() {
    const [i0, i1] = rangoIndices();
    if (estado.indice >= i1) actualizar({ indice: i0 }, { completo: false });
    btnPlay.setAttribute('aria-pressed', 'true'); btnPlay.setAttribute('aria-label', 'Pausar');
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

  // ---- CSV
  // Publicada en claude.ai, la página guarda con la capacidad `downloads`;
  // servida localmente o abierta como archivo, usa una descarga normal.
  const descargasHost = window.claude?.use ? window.claude.use('downloads').catch(() => null) : Promise.resolve(null);
  const btnCsv = $('#exportar-csv');
  btnCsv.addEventListener('click', async () => {
    const d = derivar();
    const csv = '﻿' + comparativoCsv(d.filas, {
      inicio: `${d.serie[d.i0].t}Z`, fin: `${d.serie[d.i1].t}Z`, enlaceActivo: estado.enlaceActivo,
      tipoEnlace: estado.tipoEnlace, polvo: estado.polvo, modoHorizonte: estado.modoHorizonte,
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

  // ---- Render
  const irABrecha = () => {
    const d = derivar();
    if (d.metricas.brecha.horas > 0) {
      actualizar({ indice: d.metricas.brecha.desde }, { completo: false });
      $('#tiempo').scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      $('#tiempo').focus({ preventScroll: true });
    }
  };
  const elegirSitio = (id) => actualizar({ sitioId: id });

  function render(completo) {
    const d = derivar();
    if (completo) {
      sincronizarControles();
      mostrarVista();
      leyendaHorizonte($('#leyenda-horizonte'), estado);
      leyendaTiempo($('#leyenda-tiempo'), estado);
    }
    if (estado.vista === 'explorador') {
      if (completo) {
        renderKpis($('#kpis'), d, irABrecha);
        tiempo.dibujar(d);
      } else {
        tiempo.moverCursor(d);
      }
      renderPanelEstado($('#estado'), d);
      renderMapa($('#mapa'), d, elegirSitio);
      renderGraficaHorizonte($('#grafica-horizonte'), d);
    } else if (estado.vista === 'comparador') {
      renderComparador($('#tabla-comparador'), $('#comparador-meta'), $('#conclusiones'), d);
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
  dibujarFondo();
  render(true);
}

function dibujarFondo() {
  const rnd = aleatorio(7);
  const caminos = [];
  for (const [cx, cy, rx, ry, n] of [[1050, 120, 260, 180, 7], [140, 720, 300, 200, 6]]) {
    for (let k = 1; k <= n; k++) caminos.push(`<path d="${contorno(cx, cy, (rx * k) / n, (ry * k) / n, rnd, 0.1)}"/>`);
  }
  document.getElementById('fondo-topo-lineas').innerHTML = caminos.join('');
}

iniciar();
