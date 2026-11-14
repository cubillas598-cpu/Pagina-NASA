import { WebGLRenderer, Scene, PerspectiveCamera, SphereGeometry, MeshStandardMaterial, Mesh, Group,
  AmbientLight, DirectionalLight, TextureLoader, CanvasTexture, SRGBColorSpace } from 'three';
import {
  latLonAVector, orientacionPoloSur, orientacionParaSitio, quatMultiplicar, quatRotar, quatSlerp, suavizar,
} from '../luna-geometria.js';
import { esc } from '../format.js';

// Visor lunar 3D. La textura y la luz son solo visuales: los estados de Sol,
// Tierra y enlace siguen saliendo de model.js. Si el navegador no ofrece
// WebGL, crearLuna devuelve null y la página usa el mapa polar 2D.

const DIST_POLAR = 4.3; // globo completo visto desde el polo sur
const DIST_TRES = 1.32; // encuadra los tres sitios
const DIST_SITIO = 1.2; // acercamiento a un sitio (más cerca, la textura de 2k se pixela)
const DIST_MIN = 1.03;
const DIST_MAX = 4.5;
const DURACION_MS = 1000;
const UMBRAL_ETIQUETAS = 1.6; // por encima, los tres sitios se agrupan

function webglDisponible() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

/** Textura provisional procedural (gris con cráteres), marcada como tal en la interfaz. */
function texturaProvisional() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#8d8d8a';
  g.fillRect(0, 0, c.width, c.height);
  let semilla = 7;
  const rnd = () => { semilla = (semilla * 16807) % 2147483647; return semilla / 2147483647; };
  for (let k = 0; k < 900; k++) {
    const x = rnd() * c.width;
    const y = rnd() * c.height;
    const r = 2 + rnd() ** 3 * 34;
    const tono = 95 + Math.floor(rnd() * 70);
    g.fillStyle = `rgba(${tono},${tono},${tono - 3},${0.25 + rnd() * 0.35})`;
    // En una proyección equirrectangular un cráter circular se ensancha 1/cos(lat).
    const lat = (0.5 - y / c.height) * Math.PI;
    const ancho = Math.min(c.width / 3, r / Math.max(0.06, Math.cos(lat)));
    g.beginPath();
    g.ellipse(x, y, ancho, r * (0.85 + rnd() * 0.15), 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = `rgba(210,210,205,${0.12 + rnd() * 0.15})`;
    g.lineWidth = Math.max(1, r * 0.12);
    g.stroke();
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/**
 * @param cont   contenedor del visor (vacío)
 * @param alElegir(id)  callback al seleccionar un sitio desde el globo
 * @returns {render(d), destruir()} o null si no hay WebGL
 */
export function crearLuna(cont, { alElegir, urlTextura, reducirMovimiento }) {
  if (!webglDisponible()) return null;

  let renderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = SRGBColorSpace;

  cont.classList.add('luna');
  cont.innerHTML = `
    <div class="luna__lienzo" tabindex="0" role="group" aria-roledescription="visor 3D" aria-label="Luna interactiva. Arrastra o usa las flechas para girar, + y - para acercar, 0 para volver a la vista del polo sur."></div>
    <div class="luna__marcadores"></div>
    <div class="luna__controles" role="group" aria-label="Controles del visor">
      <button type="button" class="boton-icono" data-accion="polo" aria-label="Vista del polo sur"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7"/><circle cx="10" cy="10" r="2"/></svg></button>
      <button type="button" class="boton-icono" data-accion="mas" aria-label="Acercar"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 5v10M5 10h10"/></svg></button>
      <button type="button" class="boton-icono" data-accion="menos" aria-label="Alejar"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10h10"/></svg></button>
    </div>
    <p class="luna__credito"></p>`;
  const lienzo = cont.querySelector('.luna__lienzo');
  const capaMarcadores = cont.querySelector('.luna__marcadores');
  const credito = cont.querySelector('.luna__credito');
  lienzo.append(renderer.domElement);

  const escena = new Scene();
  const camara = new PerspectiveCamera(35, 1, 0.001, 50);
  const globo = new Group();
  const material = new MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0 });
  globo.add(new Mesh(new SphereGeometry(1, 160, 120), material));
  escena.add(globo);
  escena.add(new AmbientLight(0xffffff, 0.55));
  const sol = new DirectionalLight(0xfff4e0, 2.2);
  sol.position.set(-2, 1.5, 3);
  escena.add(sol);

  // ---- Estado de la vista (declarado antes de cargar la textura, que puede pedir un cuadro)
  let q = orientacionPoloSur();
  let dist = DIST_POLAR;
  let anim = null;
  let sitios = [];
  let activoId = null;
  let visible = true;
  let pendiente = false;

  function usarTexturaProvisional() {
    material.map = texturaProvisional();
    material.needsUpdate = true;
    credito.textContent = 'Textura provisional (decorativa). Posiciones de los sitios: sitios.json.';
    pedirCuadro();
  }
  if (urlTextura) {
    new TextureLoader().load(urlTextura, (t) => {
      t.colorSpace = SRGBColorSpace;
      t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      material.map = t;
      material.needsUpdate = true;
      credito.textContent = 'Textura: NASA SVS, CGI Moon Kit (LRO). Uso visual; no es el dato científico del modelo.';
      pedirCuadro();
    }, undefined, usarTexturaProvisional);
  } else {
    usarTexturaProvisional();
  }


  function aplicar() {
    globo.quaternion.set(q[0], q[1], q[2], q[3]);
    camara.position.set(0, 0, dist);
    camara.lookAt(0, 0, 0);
  }

  function animarHacia(qDestino, distDestino) {
    if (reducirMovimiento()) {
      anim = null;
      q = qDestino;
      dist = distDestino;
      pedirCuadro();
      return;
    }
    // Si llega otro destino a mitad de camino, se parte del punto actual.
    anim = { q0: q, d0: dist, q1: qDestino, d1: distDestino, t0: performance.now() };
    pedirCuadro();
  }

  function rotarPantalla(ejeX, ejeY, ang) {
    const n = Math.hypot(ejeX, ejeY);
    if (!n) return;
    const s = Math.sin(ang / 2) / n;
    q = quatMultiplicar([ejeX * s, ejeY * s, 0, Math.cos(ang / 2)], q);
    const m = Math.hypot(...q);
    q = q.map((v) => v / m);
  }

  function zoom(factor) {
    anim = null;
    dist = Math.min(DIST_MAX, Math.max(DIST_MIN, 1 + (dist - 1) * factor));
    pedirCuadro();
  }

  // ---- Marcadores HTML (accesibles) sincronizados con la proyección
  function proyectar(v) {
    const p = quatRotar(q, v);
    const vec = { x: p[0], y: p[1], z: p[2] };
    // Visible si la normal mira a la cámara (cara frontal del globo).
    const haciaCamara = vec.z * (dist - vec.z) - vec.x * vec.x - vec.y * vec.y > 0;
    const w = lienzo.clientWidth;
    const h = lienzo.clientHeight;
    const pr = { x: p[0], y: p[1], z: p[2] - dist };
    const f = 1 / Math.tan((camara.fov * Math.PI) / 360);
    const sx = (w / 2) * (1 + (f / camara.aspect) * (pr.x / -pr.z));
    const sy = (h / 2) * (1 - f * (pr.y / -pr.z));
    return { sx, sy, visible: haciaCamara };
  }

  function dibujarMarcadores() {
    const agrupar = dist > UMBRAL_ETIQUETAS;
    if (agrupar) {
      const centro = proyectar(latLonAVector(-89, 60));
      capaMarcadores.innerHTML = centro.visible
        ? `<button type="button" class="luna__grupo" data-accion="tres" style="left:${centro.sx}px;top:${centro.sy}px">${sitios.length} sitios del polo sur</button>`
        : '';
      return;
    }
    capaMarcadores.innerHTML = sitios.map((s) => {
      const p = proyectar(latLonAVector(s.lat, s.lon));
      if (!p.visible) return '';
      const sel = s.id === activoId;
      return `<button type="button" class="luna__sitio${sel ? ' activo' : ''}" data-sitio="${s.id}" aria-pressed="${sel}" style="left:${p.sx}px;top:${p.sy}px" aria-label="${esc(s.etiqueta)}: ${esc(s.nombre_corto)}">
        <span class="luna__punto" aria-hidden="true">${esc(s.etiqueta.slice(-1))}</span><span class="luna__nombre">${esc(s.nombre_corto)}</span></button>`;
    }).join('');
  }

  // ---- Bucle de dibujo bajo demanda
  function pedirCuadro() {
    if (pendiente || !visible) return;
    pendiente = true;
    requestAnimationFrame(cuadro);
  }

  function cuadro(ahora) {
    pendiente = false;
    if (anim) {
      const t = suavizar((ahora - anim.t0) / DURACION_MS);
      q = quatSlerp(anim.q0, anim.q1, t);
      dist = Math.exp(Math.log(anim.d0 - 1) + (Math.log(anim.d1 - 1) - Math.log(anim.d0 - 1)) * t) + 1;
      if (t >= 1) anim = null;
    }
    aplicar();
    renderer.render(escena, camara);
    dibujarMarcadores();
    if (anim) pedirCuadro();
  }

  function ajustarTamano() {
    const w = Math.max(1, lienzo.clientWidth);
    const h = Math.max(1, lienzo.clientHeight);
    renderer.setSize(w, h, false);
    camara.aspect = w / h;
    camara.updateProjectionMatrix();
    pedirCuadro();
  }
  const ro = new ResizeObserver(ajustarTamano);
  ro.observe(lienzo);
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting && !document.hidden; if (visible) pedirCuadro(); });
  io.observe(cont);
  const alCambiarVisibilidad = () => { visible = !document.hidden; if (visible) pedirCuadro(); };
  document.addEventListener('visibilitychange', alCambiarVisibilidad);

  // ---- Interacción: arrastre, rueda, pellizco y teclado
  const punteros = new Map();
  let pellizco = null;
  lienzo.addEventListener('pointerdown', (ev) => {
    lienzo.setPointerCapture(ev.pointerId);
    punteros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    anim = null;
  });
  lienzo.addEventListener('pointermove', (ev) => {
    const previo = punteros.get(ev.pointerId);
    if (!previo) return;
    punteros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (punteros.size === 2) {
      const [a, b] = [...punteros.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pellizco) zoom(pellizco / d);
      pellizco = d;
      return;
    }
    const dx = ev.clientX - previo.x;
    const dy = ev.clientY - previo.y;
    const k = (2.2 * (dist - 1)) / Math.max(200, lienzo.clientHeight);
    rotarPantalla(dy, dx, Math.hypot(dx, dy) * k);
    pedirCuadro();
  });
  const soltar = (ev) => { punteros.delete(ev.pointerId); if (punteros.size < 2) pellizco = null; };
  lienzo.addEventListener('pointerup', soltar);
  lienzo.addEventListener('pointercancel', soltar);
  lienzo.addEventListener('wheel', (ev) => { ev.preventDefault(); zoom(Math.exp(ev.deltaY * 0.0012)); }, { passive: false });
  lienzo.addEventListener('keydown', (ev) => {
    const paso = 0.15 * (dist - 1);
    const giros = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] };
    if (ev.key in giros) { rotarPantalla(...giros[ev.key], paso); anim = null; pedirCuadro(); }
    else if (ev.key === '+' || ev.key === '=') zoom(0.8);
    else if (ev.key === '-' || ev.key === '_') zoom(1.25);
    else if (ev.key === '0') animarHacia(orientacionPoloSur(), DIST_POLAR);
    else return;
    ev.preventDefault();
  });

  function verTres() {
    animarHacia(orientacionParaSitio(-88.4, 330), DIST_TRES);
  }
  cont.addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    if (b.dataset.sitio) alElegir(b.dataset.sitio);
    else if (b.dataset.accion === 'polo') animarHacia(orientacionPoloSur(), DIST_POLAR);
    else if (b.dataset.accion === 'mas') zoom(0.7);
    else if (b.dataset.accion === 'menos') zoom(1.4);
    else if (b.dataset.accion === 'tres') verTres();
  });

  ajustarTamano();

  return {
    render(d) {
      sitios = d.sitios;
      const nuevo = d.sitio.id;
      if (activoId !== null && nuevo !== activoId) {
        animarHacia(orientacionParaSitio(d.sitio.lat, d.sitio.lon), DIST_SITIO);
      }
      activoId = nuevo;
      pedirCuadro();
    },
    enfocarSitio(s) {
      animarHacia(orientacionParaSitio(s.lat, s.lon), DIST_SITIO);
    },
    verTres,
    destruir() {
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      renderer.dispose();
    },
  };
}
