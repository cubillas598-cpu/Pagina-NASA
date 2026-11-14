// Pagina estatica: lee los JSON precalculados (data/<sitio>.json) y dibuja
// la linea de tiempo de 24 horas por sitio para la fecha elegida.
//
// NOTA HONESTA (ver docs/propuesta.md): por ahora "Sol visible" y "Tierra
// visible" se calculan comparando la elevacion contra 0 grados (horizonte
// matematico), NO contra el horizonte real del terreno todavia. Eso llega
// cuando el bloque de horizonte (LOLA DEM) se integre aqui - ya existe el
// calculo en scripts/horizonte.py, falta conectarlo. La franja de enlace
// local tampoco esta conectada todavia (bloque 5 del plan).

const SITIOS = ["shackleton", "de_gerlache", "malapert"];
const cacheDatos = {};

function escapeHtml(texto) {
  const div = document.createElement("div");
  div.textContent = String(texto);
  return div.innerHTML;
}

async function cargarSitio(id) {
  if (cacheDatos[id]) return cacheDatos[id];
  const resp = await fetch(`data/${id}.json`);
  if (!resp.ok) throw new Error(`No se pudo cargar data/${id}.json`);
  const doc = await resp.json();
  cacheDatos[id] = doc;
  return doc;
}

function horasDeFecha(doc, fechaISO) {
  return doc.horas.filter((h) => h.t.startsWith(fechaISO));
}

function claseEstado(valor) {
  if (valor === null || valor === undefined) return "sin-enlace";
  if (valor > 2) return "rapido";
  if (valor > 0) return "robusto";
  return "sin-enlace";
}

function dibujarFranja(titulo, horas, campo) {
  const barra = horas
    .map((h) => {
      const clase = claseEstado(h[campo]);
      const color = `var(--${clase})`;
      const detalle = h[campo] != null ? `${h[campo].toFixed(1)} deg` : "sin dato";
      const titulo = escapeHtml(`${h.t}: ${detalle}`);
      return `<span style="width:${100 / horas.length}%; background:${color}" title="${titulo}"></span>`;
    })
    .join("");
  return `
    <div class="franja">
      <div class="franja-titulo"><span>${titulo}</span></div>
      <div class="franja-barra">${barra || '<span style="width:100%"></span>'}</div>
    </div>`;
}

function tarjetaSitio(nombre, horas) {
  return `
    <div class="sitio-card">
      <h2>${escapeHtml(nombre)}</h2>
      ${dibujarFranja("Sol sobre el horizonte", horas, "sol_el")}
      ${dibujarFranja("Tierra sobre el horizonte", horas, "tierra_el")}
      <div class="franja">
        <div class="franja-titulo"><span>Enlace local</span><span>pendiente (bloque 5)</span></div>
        <div class="franja-barra"><span style="width:100%; background:#2a3250"></span></div>
      </div>
    </div>`;
}

async function render() {
  const fecha = document.getElementById("selector-fecha").value;
  const contenedor = document.getElementById("contenedor-sitios");
  if (!fecha) {
    contenedor.innerHTML = '<p class="estado-vacio">Elige una fecha arriba.</p>';
    return;
  }
  contenedor.innerHTML = '<p class="estado-vacio">Cargando...</p>';
  try {
    const docs = await Promise.all(SITIOS.map(cargarSitio));
    const tarjetas = docs.map((doc) => {
      const horas = horasDeFecha(doc, fecha);
      return tarjetaSitio(doc.sitio.nombre, horas);
    });
    contenedor.innerHTML = tarjetas.join("") ||
      '<p class="estado-vacio">Sin datos para esa fecha (rango disponible: revisar sitios.json).</p>';
  } catch (err) {
    contenedor.innerHTML = `<p class="estado-vacio">Error cargando datos: ${escapeHtml(err.message)}</p>`;
  }
}

document.getElementById("selector-fecha").addEventListener("change", render);
document.getElementById("selector-hora").addEventListener("input", (e) => {
  document.getElementById("valor-hora").textContent = `${e.target.value}:00`;
});

// Fecha inicial: primer dia del rango que ya generamos (1-dic-2026)
document.getElementById("selector-fecha").value = "2026-12-01";
render();
