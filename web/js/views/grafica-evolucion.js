import { fechaHoraUtc, diaMesUtc, horaUtc } from '../format.js';
import { COLOR } from './estilos.js';

const ME = { izq: 40, der: 14, sup: 40, inf: 30 };

/**
 * Gráfica principal: margen de elevación del Sol y de la Tierra sobre el
 * horizonte local, hora por hora. También sirve para elegir la hora
 * (arrastre, clic o teclado; role="slider").
 */
export function crearGraficaEvolucion(cont, { alCambiarIndice }) {
  let geo = null;
  let datos = null;
  let arrastrando = false;

  cont.setAttribute('role', 'slider');
  cont.setAttribute('tabindex', '0');
  cont.setAttribute('aria-label', 'Hora seleccionada en la gráfica de evolución');

  const indiceDesdeX = (clientX) => {
    const r = cont.getBoundingClientRect();
    const px = ((clientX - r.left) / r.width) * geo.W - ME.izq;
    const k = Math.round((px / geo.ancho) * (geo.n - 1));
    return geo.i0 + Math.max(0, Math.min(geo.n - 1, k));
  };
  cont.addEventListener('pointerdown', (ev) => {
    if (!geo || ev.button > 0) return;
    arrastrando = true;
    cont.setPointerCapture(ev.pointerId);
    cont.focus({ preventScroll: true });
    alCambiarIndice(indiceDesdeX(ev.clientX));
  });
  cont.addEventListener('pointermove', (ev) => { if (arrastrando) alCambiarIndice(indiceDesdeX(ev.clientX)); });
  const soltar = () => { arrastrando = false; };
  cont.addEventListener('pointerup', soltar);
  cont.addEventListener('pointercancel', soltar);
  cont.addEventListener('keydown', (ev) => {
    if (!geo) return;
    const pasos = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: -24, PageDown: 24 };
    let nuevo = null;
    if (ev.key in pasos) nuevo = datos.indice + pasos[ev.key];
    else if (ev.key === 'Home') nuevo = geo.i0;
    else if (ev.key === 'End') nuevo = geo.i1;
    if (nuevo === null) return;
    ev.preventDefault();
    alCambiarIndice(Math.max(geo.i0, Math.min(geo.i1, nuevo)));
  });

  function dibujar(d) {
    datos = d;
    const { serie, i0, i1 } = d;
    const n = i1 - i0 + 1;
    const W = Math.max(300, Math.round(cont.clientWidth || 800));
    const H = W < 600 ? 220 : 300;
    const ancho = W - ME.izq - ME.der;
    const alto = H - ME.sup - ME.inf;

    let min = 0;
    let max = 0;
    for (let i = i0; i <= i1; i++) {
      const s = serie[i];
      min = Math.min(min, s.sol.el - s.sol.horizonte, s.tierra.el - s.tierra.horizonte);
      max = Math.max(max, s.sol.el - s.sol.horizonte, s.tierra.el - s.tierra.horizonte);
    }
    min = Math.floor(min) - 1;
    max = Math.ceil(max) + 1;
    const x = (i) => ME.izq + (n === 1 ? ancho / 2 : ((i - i0) / (n - 1)) * ancho);
    const y = (v) => ME.sup + ((max - v) / (max - min)) * alto;

    const partes = [];
    const paso = max - min > 12 ? 4 : 2;
    for (let v = Math.ceil(min / paso) * paso; v <= max; v += paso) {
      partes.push(`<line x1="${ME.izq}" x2="${W - ME.der}" y1="${y(v)}" y2="${y(v)}" stroke="rgba(255,255,255,${v === 0 ? 0 : 0.06})"/>`);
      partes.push(`<text x="${ME.izq - 8}" y="${y(v) + 4}" text-anchor="end" class="ev-eje">${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v)}°</text>`);
    }
    // Zona visible (sobre el horizonte) apenas sombreada.
    partes.push(`<rect x="${ME.izq}" y="${ME.sup}" width="${ancho}" height="${y(0) - ME.sup}" fill="rgba(255,255,255,.03)"/>`);
    partes.push(`<line x1="${ME.izq}" x2="${W - ME.der}" y1="${y(0)}" y2="${y(0)}" stroke="rgba(255,255,255,.4)" stroke-dasharray="4 5"/>`);

    // Días en el eje x.
    const dias = [];
    for (let i = i0; i <= i1; i++) if (serie[i].t.endsWith('T00:00')) dias.push(i);
    const cada = Math.max(1, Math.ceil(dias.length / Math.floor(ancho / 64)));
    dias.forEach((i, k) => {
      if (k % cada === 0) partes.push(`<text x="${x(i)}" y="${H - 8}" text-anchor="middle" class="ev-eje">${diaMesUtc(serie[i].ms)}</text>`);
    });

    const linea = (f) => {
      let dd = '';
      for (let i = i0; i <= i1; i++) dd += `${i === i0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(f(serie[i])).toFixed(1)}`;
      return dd;
    };
    partes.push(`<path d="${linea((s) => s.tierra.el - s.tierra.horizonte)}" fill="none" stroke="${COLOR.tierra}" stroke-width="2" stroke-linejoin="round" opacity=".9"/>`);
    partes.push(`<path d="${linea((s) => s.sol.el - s.sol.horizonte)}" fill="none" stroke="${COLOR.sol}" stroke-width="2.6" stroke-linejoin="round"/>`);
    // Rótulo del horizonte encima de las curvas, con halo para que se lea al cruzarlas.
    partes.push(`<text x="${W - ME.der}" y="${y(0) + 14}" text-anchor="end" class="ev-eje ev-eje--halo">0° = horizonte local</text>`);

    cont.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
        <style>.ev-eje{font:400 11px var(--fuente);fill:${COLOR.texto3}}.ev-eje--halo{paint-order:stroke;stroke:#22242a;stroke-width:4px;stroke-linejoin:round}.ev-burbuja{font:600 11px var(--fuente);fill:${COLOR.texto}}</style>
        ${partes.join('')}
        <g id="ev-cursor"></g>
      </svg>`;
    geo = { W, H, ancho, n, i0, i1, x, y };
    moverCursor(d);
  }

  function moverCursor(d) {
    datos = d;
    if (!geo) return;
    const { serie, indice } = d;
    const m = serie[indice];
    const cx = geo.x(indice);
    const ys = geo.y(m.sol.el - m.sol.horizonte);
    const yt = geo.y(m.tierra.el - m.tierra.horizonte);
    const texto = `${diaMesUtc(m.ms)}, ${horaUtc(m.ms)}`;
    const anchoB = texto.length * 6.4 + 18;
    const bx = Math.min(Math.max(cx - anchoB / 2, 2), geo.W - anchoB - 2);
    cont.querySelector('#ev-cursor').innerHTML = `
      <line x1="${cx}" x2="${cx}" y1="${ME.sup - 6}" y2="${geo.H - ME.inf}" stroke="rgba(255,255,255,.35)"/>
      <rect x="${bx}" y="6" width="${anchoB}" height="22" rx="11" fill="rgba(17,18,20,.85)" stroke="rgba(255,255,255,.18)"/>
      <text x="${bx + anchoB / 2}" y="21" text-anchor="middle" class="ev-burbuja">${texto}</text>
      <circle cx="${cx}" cy="${yt}" r="5" fill="${m.tierra.visible ? COLOR.tierra : COLOR.fondo}" stroke="${COLOR.tierra}" stroke-width="2"/>
      <circle cx="${cx}" cy="${ys}" r="6" fill="${m.sol.visible ? COLOR.sol : COLOR.fondo}" stroke="#fff" stroke-width="2"/>`;
    cont.setAttribute('aria-valuemin', String(geo.i0));
    cont.setAttribute('aria-valuemax', String(geo.i1));
    cont.setAttribute('aria-valuenow', String(indice));
    cont.setAttribute('aria-valuetext', `${fechaHoraUtc(m.ms)}. Sol ${m.sol.visible ? 'visible' : 'en sombra'}, Tierra ${m.tierra.visible ? 'visible' : 'oculta'}.`);
  }

  return { dibujar, moverCursor };
}
