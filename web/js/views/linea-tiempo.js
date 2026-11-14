import { segmentar, horasEventoPolvo } from '../model.js';
import { diaMesUtc, fechaHoraUtc, horasTexto, esc } from '../format.js';
import { COLOR, ENLACE, defsPatrones, rellenoEnlace } from './estilos.js';

const ALTO_CARRIL = 26;
const SEP = 30;
const EJE = 28;
const M_IZQ = 8;
const M_DER = 8;

/**
 * Línea de tiempo con dos o tres franjas. El contenedor funciona como un
 * control deslizante accesible (role="slider"): flechas, Re Pág/Av Pág, Inicio/Fin.
 */
export function crearLineaTiempo(cont, tooltip, { alCambiarIndice }) {
  let geo = null; // geometría del último dibujo
  let datos = null;
  let arrastrando = false;

  cont.setAttribute('role', 'slider');
  cont.setAttribute('tabindex', '0');
  cont.setAttribute('aria-label', 'Hora seleccionada en la línea de tiempo');

  const indiceDesdeX = (clientX) => {
    const r = cont.querySelector('svg').getBoundingClientRect();
    const escala = geo.W / r.width;
    const px = (clientX - r.left) * escala - M_IZQ;
    const k = Math.floor((px / geo.ancho) * geo.n);
    return geo.i0 + Math.max(0, Math.min(geo.n - 1, k));
  };

  function textoHora(m, estado) {
    const items = [
      `<li>${m.sol.visible ? 'Sol visible' : 'Sombra'}: el Sol está ${m.sol.visible ? 'sobre' : 'bajo'} el horizonte local.</li>`,
      `<li>${m.tierra.visible ? 'Tierra visible' : 'Tierra oculta'}: ${m.tierra.visible ? 'hay' : 'no hay'} vista directa para comunicar.</li>`,
    ];
    if (estado.enlaceActivo) {
      items.push(`<li>Enlace local ${ENLACE[m.enlace.estado].texto.toLowerCase()}: ${esc(m.enlace.limitantes[0].texto)}</li>`);
    }
    return `<b>${fechaHoraUtc(m.ms)}</b><ul>${items.join('')}</ul>`;
  }

  function mostrarTooltip(ev) {
    if (!geo || arrastrando) return;
    const i = indiceDesdeX(ev.clientX);
    tooltip.innerHTML = textoHora(datos.serie[i], datos.estado);
    tooltip.hidden = false;
    const ancho = tooltip.offsetWidth;
    const izq = Math.min(window.innerWidth - ancho - 12, Math.max(12, ev.clientX + 14));
    tooltip.style.left = `${izq}px`;
    tooltip.style.top = `${ev.clientY + 18}px`;
  }

  cont.addEventListener('pointerdown', (ev) => {
    if (!geo || ev.button > 0) return;
    arrastrando = true;
    tooltip.hidden = true;
    cont.setPointerCapture(ev.pointerId);
    cont.focus({ preventScroll: true });
    alCambiarIndice(indiceDesdeX(ev.clientX));
  });
  cont.addEventListener('pointermove', (ev) => {
    if (arrastrando) alCambiarIndice(indiceDesdeX(ev.clientX));
    else if (ev.pointerType === 'mouse') mostrarTooltip(ev);
  });
  const soltar = () => { arrastrando = false; };
  cont.addEventListener('pointerup', soltar);
  cont.addEventListener('pointercancel', soltar);
  cont.addEventListener('pointerleave', () => { tooltip.hidden = true; });

  cont.addEventListener('keydown', (ev) => {
    if (!geo) return;
    const actual = datos.indice;
    const pasos = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: -24, PageDown: 24 };
    let nuevo = null;
    if (ev.key in pasos) nuevo = actual + pasos[ev.key];
    else if (ev.key === 'Home') nuevo = geo.i0;
    else if (ev.key === 'End') nuevo = geo.i1;
    if (nuevo === null) return;
    ev.preventDefault();
    alCambiarIndice(Math.max(geo.i0, Math.min(geo.i1, nuevo)));
  });

  function dibujar(d) {
    datos = d;
    const { serie, i0, i1, estado, metricas } = d;
    const n = i1 - i0 + 1;
    const W = Math.max(760, Math.round(cont.parentElement.clientWidth || 1000));
    const ancho = W - M_IZQ - M_DER;
    const xi = (i) => M_IZQ + ((i - i0) / n) * ancho;

    const carriles = [
      { nombre: 'Iluminación', clave: (m) => (m.sol.visible ? 'si' : 'no'),
        relleno: (v) => (v === 'si' ? COLOR.ambar : COLOR.sombra), texto: (v) => (v === 'si' ? 'Sol visible' : 'Sombra') },
      { nombre: 'Comunicación directa', clave: (m) => (m.tierra.visible ? 'si' : 'no'),
        relleno: (v) => (v === 'si' ? COLOR.tierra : COLOR.sombra), texto: (v) => (v === 'si' ? 'Tierra visible' : 'Tierra oculta') },
    ];
    if (estado.enlaceActivo) {
      carriles.push({ nombre: `Enlace local (${estado.tipoEnlace === 'rf' ? 'radiofrecuencia' : 'óptico'})`, clave: (m) => m.enlace.estado,
        relleno: rellenoEnlace, texto: (v) => ENLACE[v].texto });
    }

    const partes = [];
    // Eje de días.
    const diasPorEtiqueta = Math.max(1, Math.ceil((n / 24) / (ancho / 70)));
    let dia = 0;
    for (let i = i0; i <= i1; i++) {
      if (!serie[i].t.endsWith('T00:00')) continue;
      const xx = xi(i);
      partes.push(`<line x1="${xx}" x2="${xx}" y1="${EJE - 8}" y2="${EJE + carriles.length * (ALTO_CARRIL + SEP)}" stroke="rgba(255,245,235,.1)"/>`);
      if (dia % diasPorEtiqueta === 0) partes.push(`<text x="${xx + 3}" y="${EJE - 12}">${diaMesUtc(serie[i].ms)}</text>`);
      dia++;
    }

    carriles.forEach((c, k) => {
      const yTit = EJE + k * (ALTO_CARRIL + SEP) + 14;
      const yBar = yTit + 8;
      partes.push(`<text class="carril__nombre" x="${M_IZQ}" y="${yTit}">${c.nombre}</text>`);
      partes.push(`<rect x="${M_IZQ}" y="${yBar}" width="${ancho}" height="${ALTO_CARRIL}" rx="6" fill="${COLOR.neutro}"/>`);
      for (const s of segmentar(serie, i0, i1, c.clave)) {
        const x0 = xi(s.desde), x1 = xi(s.hasta + 1);
        partes.push(`<rect x="${x0.toFixed(2)}" y="${yBar}" width="${Math.max(0.6, x1 - x0).toFixed(2)}" height="${ALTO_CARRIL}" fill="${c.relleno(s.valor)}"><title>${c.texto(s.valor)}, ${horasTexto(s.hasta - s.desde + 1)}</title></rect>`);
      }
    });
    const yFin = EJE + carriles.length * (ALTO_CARRIL + SEP) + 4;

    // Evento de polvo sintético.
    const ev = d.escenario.evento_polvo;
    if (estado.enlaceActivo && estado.tipoEnlace === 'optico' && estado.polvo) {
      const rango = horasEventoPolvo(serie, ev);
      if (rango && rango[1] >= i0 && rango[0] <= i1) {
        const a = Math.max(i0, rango[0]), b = Math.min(i1, rango[1]) + 1;
        // Una hora puede medir menos de 1 px: el marcador tiene un ancho mínimo visible.
        const x0 = xi(a), ancho = Math.max(6, xi(b) - x0);
        partes.push(`<rect x="${x0 - (ancho - (xi(b) - x0)) / 2}" y="${EJE + 2}" width="${ancho}" height="${yFin - EJE - 2}" fill="url(#p-polvo)" opacity=".7" stroke="${COLOR.texto}" stroke-opacity=".5"/>`);
        const izq = x0 > W - 260;
        partes.push(`<text x="${izq ? x0 - 6 : x0 + ancho + 4}" y="${yFin + 14}" text-anchor="${izq ? 'end' : 'start'}" fill="${COLOR.texto}">Evento de polvo: ${ev.duracion_s} s (referencia Apollo)</text>`);
      }
    }

    // Mayor intervalo sin comunicación.
    const br = metricas.brecha;
    if (br.horas > 0) {
      const a = xi(br.desde), b = xi(br.hasta + 1);
      const yB = yFin + 34;
      partes.push(`<path d="M${a},${yB - 6}V${yB}H${b}V${yB - 6}" fill="none" stroke="${COLOR.cian}" stroke-width="1.5"/>`);
      const etiqueta = `${estado.enlaceActivo ? 'Mayor intervalo sin comunicación' : 'Mayor intervalo sin vista a la Tierra'}: ${horasTexto(br.horas)}`;
      const cx = Math.min(Math.max((a + b) / 2, M_IZQ + 150), W - M_DER - 150);
      partes.push(`<text x="${cx}" y="${yB + 16}" text-anchor="middle" fill="${COLOR.cian}">${etiqueta}</text>`);
    }
    const H = yFin + 60;

    cont.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">
        <defs>${defsPatrones()}</defs>
        ${partes.join('')}
        <g id="cursor">
          <rect class="cursor__marco" x="-7" y="${EJE - 4}" width="14" height="${yFin - EJE + 2}" rx="7" fill="rgba(245,130,42,.14)" stroke="rgba(255,165,82,.5)"/>
          <line class="cursor__linea" x1="0" x2="0" y1="${EJE - 4}" y2="${yFin - 2}" stroke="${COLOR.texto}" stroke-width="2"/>
        </g>
      </svg>`;
    geo = { W, ancho, n, i0, i1 };
    moverCursor(d);
  }

  function moverCursor(d) {
    datos = d;
    if (!geo) return;
    const { indice, serie } = d;
    const xx = M_IZQ + ((indice - geo.i0 + 0.5) / geo.n) * geo.ancho;
    cont.querySelector('#cursor').setAttribute('transform', `translate(${xx.toFixed(2)} 0)`);
    cont.setAttribute('aria-valuemin', String(geo.i0));
    cont.setAttribute('aria-valuemax', String(geo.i1));
    cont.setAttribute('aria-valuenow', String(indice));
    cont.setAttribute('aria-valuetext', fechaHoraUtc(serie[indice].ms));
    // Mantener el cursor visible cuando la línea se desplaza en pantallas pequeñas.
    const scroller = cont.parentElement;
    if (scroller.scrollWidth > scroller.clientWidth) {
      const r = cont.querySelector('svg').getBoundingClientRect();
      const px = xx * (r.width / geo.W);
      if (px < scroller.scrollLeft + 24 || px > scroller.scrollLeft + scroller.clientWidth - 24) {
        scroller.scrollLeft = px - scroller.clientWidth / 2;
      }
    }
  }

  return { dibujar, moverCursor };
}

export function leyendaTiempo(cont, estado) {
  const items = [
    `<li><span class="muestra" style="background:${COLOR.ambar}"></span>Sol visible</li>`,
    `<li><span class="muestra" style="background:${COLOR.tierra}"></span>Tierra visible</li>`,
    `<li><span class="muestra" style="background:${COLOR.sombra};border:1px solid rgba(255,245,235,.3)"></span>Sombra / Tierra oculta</li>`,
  ];
  if (estado.enlaceActivo) {
    items.push(
      `<li><span class="muestra" style="background:${COLOR.ok}"></span>Rápido</li>`,
      `<li><span class="muestra" style="background:repeating-linear-gradient(45deg,${COLOR.aviso} 0 3px,#8a6a3a 3px 5px)"></span>Robusto</li>`,
      `<li><span class="muestra" style="background:repeating-linear-gradient(45deg,${COLOR.error} 0 2px,#7a3c3c 2px 4px)"></span>Sin enlace</li>`,
    );
  }
  items.push('<li>Cada columna es una hora UTC</li>');
  cont.innerHTML = items.join('');
}
