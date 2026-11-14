# Resumen de la guia oficial de entrega (Space Apps 2026)

Fuente: https://www.spaceappschallenge.org/resources/project-submission-guide/
(pagina oficial "Project Submission Guide", version del 13-nov-2026, leida completa
el 14-nov-2026 porque opencode/T2 no pudo hacerlo - API key expirada, ver
`mesh/opencode-key-expirada` en PENDIENTES.md de cerebro).

## Fechas (criticas)

- Entrega abre: sabado 14-nov, 9:00 a.m., hora local del Evento Local del equipo.
- **Entrega cierra: domingo 15-nov, 11:59 p.m., hora local del Evento Local.** Hay que
  dar clic en "Submit for Judging" ANTES de esa hora. Lo que quede solo guardado
  (sin submit) despues de esa hora no se evalua.
- Se puede editar y re-enviar cuantas veces se quiera antes del cierre; solo se
  revisa el ultimo envio guardado.

## El "Project Demo" (el video o las slides) - limites duros

**Formato, uno de los dos, no ambos:**
- Video de **30 segundos o menos**, O
- Slide deck de **maximo 7 slides** (incluyendo portada e introduccion).

Si se pasa de 30s o de 7 slides, **el proyecto queda fuera de la evaluacion global**
(no es una recomendacion, es un limite de elegibilidad).

**Idioma**: todo el contenido de la pagina de entrega va en ingles. Si se hace un
video, se puede hablar en otro idioma pero DEBE llevar subtitulos en ingles. El
slide deck debe estar en ingles si o si (no hay excepcion de subtitulos para slides).

**Guion oficial sugerido para el video de 30s** (textual de la guia, timestamps):
- [0:00] Preséntate: tu nombre y el nombre del equipo.
- [0:02] El reto: que reto aborda el proyecto, que inspiro elegirlo.
- [0:05] Nombre del proyecto: titulo y tagline.
- [0:10] Describe la idea: como funciona, imagenes o prototipo, experiencia de
  usuario, como los datos abiertos de NASA/Space Agency Partners lo hicieron posible.
- [0:20-0:30] Mirada a futuro: que podria lograr la solucion.

**Contenido obligatorio si se usa deck de slides**: nombre del equipo, nombres de
los integrantes, el reto elegido, imagen del proyecto, experiencia de usuario, como
los datos de NASA/agencias socias lo hicieron posible.

**Hosting**: el video o las slides NO se suben directo a la plataforma de Space
Apps - se suben a un servicio externo (YouTube, Google Drive, GitHub, OneDrive,
Dropbox) y se comparte un link publico, sin login ni permisos. Probar el link en
una ventana privada antes de entregar.

## Campos del formulario del proyecto (todo en ingles)

- **Project Name**
- **High-Level Project Summary**: que desarrollaron, como atiende el reto, por
  que importa.
- **Link to Project Demo**: el video de 30s o el link al slide deck de 7 slides.
- **Link to Final Project**: link publico al proyecto final (puede ser el repo
  de GitHub).
- **Detailed Project Description**: que hace exactamente, como funciona,
  beneficios, que herramientas/lenguajes/hardware se usaron.
- **Use of Super Intelligence (SI)**: declarar si se uso IA (chatbots, LLMs,
  generacion de imagenes) y como. Imagenes/video generados por IA necesitan
  marca de agua visible; audio y codigo/datos generados por IA necesitan
  reconocerlo en texto descriptivo o metadata. Esta pregunta no la ve el jurado
  directamente, pero el jurado SI puede ver marcas de agua u otras señales
  dentro del proyecto entregado.
- **NASA Data**: que datos/recursos de NASA se usaron. Para ser elegible a premio
  global hay que usar al menos un dato o recurso de NASA (nosotros usamos JPL
  Horizons + LOLA, cumplimos).
- **Space Agency Partner Data and Other References**: listar TODOS los datos,
  codigo, textos e imagenes usados, incluso si son de uso libre/open source.

## Criterios de evaluacion (ya los teniamos, se confirman)

Impact, Creativity, Validity, Relevance, Presentation (5 criterios, ver 2026
Judging and Awards Guide para el detalle de cada uno).

## Que significa esto para nuestro material ya hecho

- `docs/guion-pitch-3min.md` (3 minutos, español, 9 slides para Canva) es para
  el **pitch en vivo del Evento Local**, NO es el "Project Demo" oficial de la
  plataforma - ese tiene sus propios limites (30s o 7 slides, ingles) y es un
  campo distinto del formulario de entrega.
- Falta armar el "Project Demo" oficial por separado: recomendado usar la opcion
  de **7 slides en ingles** (mas controlable que cronometrar un video a 30s
  exactos con el tiempo que queda). Ver `docs/submission-demo-en.md`.
- `docs/descripcion-plataforma.md` ya tiene en ingles el resumen y las citas de
  datos - reusar para los campos "High-Level Project Summary" y "NASA Data" del
  formulario, no reescribir de cero.
