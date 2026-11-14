// Colores, textos e iconos compartidos por las vistas.
// Cada estado combina color + texto + patrón o icono: nunca solo color.

export const COLOR = {
  fondo: '#1a1512',
  superficie: '#2a231e',
  texto: '#F7F3EE',
  texto2: 'rgba(247,243,238,.72)',
  texto3: 'rgba(247,243,238,.52)',
  naranja: '#F5822A',
  naranjaClaro: '#FFA552',
  ambar: '#FFA552',
  tierra: '#EDEFF2',
  ok: '#7BDBA2',
  aviso: '#FFC857',
  error: '#FF8A80',
  neutro: 'rgba(255,255,255,.10)',
  sombra: 'rgba(20,16,13,.55)',
  cian: '#FFA552',
};

export const ENLACE = {
  rapido: { texto: 'Rápido', color: COLOR.ok, clase: 'c-ok', patron: null,
    ayuda: 'El tramo local tiene margen: transmite a tasa alta.' },
  robusto: { texto: 'Robusto', color: COLOR.aviso, clase: 'c-aviso', patron: 'p-rayas',
    ayuda: 'Hay degradación: el enlace sigue, pero en modo de baja tasa con más protección.' },
  sin_enlace: { texto: 'Sin enlace', color: COLOR.error, clase: 'c-error', patron: 'p-cruces',
    ayuda: 'El tramo local no funciona en esa hora.' },
};

export const TIPO_ENLACE = { rf: 'Radiofrecuencia', optico: 'Óptico' };
const NOMBRE_FUENTE_HORIZONTE = { lola_skyline: 'LOLA (DEM real)', sintetico: 'perfil sintético' };

/** Nombre del horizonte en uso: la fuente del perfil del sitio o el plano de 0°. */
export function etiquetaHorizonte(modo, sitio) {
  if (modo === 'plano') return 'plano (0°)';
  return NOMBRE_FUENTE_HORIZONTE[sitio.horizonte.fuente] || sitio.horizonte.fuente;
}

/** Valor para el CSV: la fuente real del perfil o "plano". */
export function codigoHorizonte(modo, sitio) {
  return modo === 'plano' ? 'plano' : sitio.horizonte.fuente;
}

export const ICONO = {
  sol: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="4" fill="currentColor"/><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M10 1.5v2.2M10 16.3v2.2M1.5 10h2.2M16.3 10h2.2M4 4l1.6 1.6M14.4 14.4 16 16M4 16l1.6-1.6M14.4 5.6 16 4"/></g></svg>',
  tierra: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 7.5c2 .5 3 2 2.5 3.5S9 13 10 15M12 3.5c-.5 2 1 3 3 3.5M11.5 10.5c1.5-.5 3 .5 3.5 2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  enlace: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 15 10 5l7 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="10" cy="5" r="2" fill="currentColor"/><path d="M6.5 3a5 5 0 0 0 0 4M13.5 3a5 5 0 0 1 0 4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  eclipse: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 4a6 6 0 0 1 0 12z" fill="currentColor"/></svg>',
  respaldo: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 16h4l3-5 3 5h4M10 11V4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="3.5" r="1.8" fill="currentColor"/></svg>',
};

/** Definiciones de patrones SVG para estados degradados (accesibles sin color). */
export function defsPatrones() {
  return `
    <pattern id="p-rayas" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="6" height="6" fill="${COLOR.aviso}"/><rect width="2.2" height="6" fill="rgba(40,24,8,.38)"/>
    </pattern>
    <pattern id="p-cruces" width="7" height="7" patternUnits="userSpaceOnUse">
      <rect width="7" height="7" fill="${COLOR.error}"/><path d="M0 0l7 7M7 0 0 7" stroke="rgba(40,16,10,.45)" stroke-width="1.4"/>
    </pattern>
    <pattern id="p-polvo" width="5" height="5" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r=".9" fill="rgba(241,245,249,.55)"/><circle cx="4" cy="3.8" r=".6" fill="rgba(241,245,249,.4)"/>
    </pattern>`;
}

export function rellenoEnlace(estado) {
  const e = ENLACE[estado];
  return e.patron ? `url(#${e.patron})` : e.color;
}
