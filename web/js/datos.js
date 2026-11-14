import { problemasEfemerides, problemasEscenario } from './model.js';

// Carga de datos locales. En la versión empaquetada (un solo HTML) los datos
// vienen incrustados en <script type="application/json" id="datos-demo">.

export async function cargarDatos(base = '../') {
  const incrustado = document.getElementById('datos-demo');
  if (incrustado) {
    const doc = JSON.parse(incrustado.textContent);
    return validar(doc.escenario, doc.efemerides);
  }
  const leer = async (ruta) => {
    const r = await fetch(base + ruta, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`No se pudo leer ${ruta} (HTTP ${r.status}).`);
    return r.json();
  };
  const escenario = await leer('data/escenario_demo.json');
  const efemerides = {};
  await Promise.all(escenario.sitios.map(async (s) => {
    efemerides[s.id] = (await leer(s.efemerides)).horas;
  }));
  return validar(escenario, efemerides);
}

function validar(escenario, efemerides) {
  const malEscenario = problemasEscenario(escenario);
  if (malEscenario.length) throw new Error(`Escenario no válido. ${malEscenario.slice(0, 5).join(' ')}`);
  const ids = escenario.sitios.map((s) => s.id);
  const ref = efemerides[ids[0]];
  for (const id of ids) {
    const h = efemerides[id];
    const problemas = problemasEfemerides(h, id);
    if (problemas.length) throw new Error(`Datos de efemérides no válidos. ${problemas.join(' ')}`);
    if (h.length !== ref.length || h[0].t !== ref[0].t || h[h.length - 1].t !== ref[ref.length - 1].t) {
      throw new Error(`Las efemérides de ${id} no cubren las mismas horas que ${ids[0]}.`);
    }
  }
  return { escenario, efemerides };
}
