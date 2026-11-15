# Guion de pitch, 3 minutos — presenta Irvin

**Versión vigente: la 2 (historia real de Athena), abajo.**

Basado en el taller **"Elevator Pitch — NASA Space Apps Challenge"** (14-nov-2026,
previo al concurso, impartido en la Universidad Tecnologica). Fuentes: transcripcion
local del audio (44 min, faster-whisper, cobertura verificada) + 10 fotos reales de las
slides del taller, ambas en este repo (`docs/taller-pitch-storytelling/`). El hook de
esta version fusiona la pregunta retorica del borrador independiente "Speech 1" que
Irvin escribio en el Google Doc de propuesta del equipo (14-nov-2026) con el resto del
guion ya validado contra la estructura oficial del taller.

**Validado 2026-11-14**: el hook ("¿Y si el exito de una mision lunar no dependiera
solo de llegar a la Luna, sino de elegir exactamente donde aterrizar?...") y el cierre
("...empieza mucho antes, cuando elegimos donde queremos llegar") de este guion se
compararon linea por linea contra el "Speech 1" del Google Doc
(docs.google.com/document/d/11sfH6Q9cexkyh-bcjTfUE5msVOp63FTCJLX-pTlx71o) y coinciden en
esencia (texto adaptado al tono hablado del resto del guion, mismo contenido). El cuerpo
(problema, historia del error de Shackleton, diferenciador RF/optico, indice de
conveniencia) no viene del Doc - es el que ya estaba validado contra el taller. Version
final, lista para presentar.

**Estructura oficial del taller** (las slides usan dos nombres para los mismos 4 pasos):

| Paso | Nombre (slide "Estructura") | Nombre (slide comic de ejemplo) | Que hace |
|---|---|---|---|
| 1 | Hook | Conexion | Captura atencion, genera vinculo |
| 2 | Problema | Presentacion | Dolor especifico, explica la idea clara y breve |
| 3 | Solucion | Valor | Tu prototipo, destaca beneficio y potencial |
| 4 | Impacto | Cierre | El gran cierre, invita a la accion (call to action) |

**Taxonomia oficial de tipos de historia** (slide "Tipos de historias utiles"):
1. Historias de identidad y proposito
2. Historias de impacto y validacion: historia del cliente/usuario, historia de exito
   o caso de estudio, **historia de superacion de crisis**
3. Historias de vision y cambio: historia del futuro, David contra Goliat, educativa/analogica

Estructura narrativa base: **Inicio -> Conflicto -> Resolucion**. "Las personas recuerdan
historias, no datos" (cita literal de la slide).

**La nuestra es "Historia de superacion de crisis"** (definicion exacta de la slide:
"cuenta como se enfrento un error, un fracaso o un obstaculo inesperado, y que
aprendizajes fortalecieron al proyecto") — es literal lo que paso hoy con el bug de
Shackleton. No se fuerza la historia, ya existe.

No se espera prototipo terminado. Lo que se evalua es la idea y como se cuenta (dicho
explicito en el taller: a la NASA, a los inversionistas, lo que les interesa es la idea,
no el producto 100% terminado).

---

## Versión 2 (15-nov-2026): historia real y tono natural

Historia: misión IM-2 de Intuitive Machines (lander Athena), 6-mar-2025. Datos
verificados en prensa (CBS News, Spaceflight Now, SpacePolicyOnline, TechCrunch):
quedó de lado dentro de un cráter cerca del polo sur, a unos 250 m del punto
elegido; la empresa dijo que, por la dirección del Sol, la orientación de los
paneles y el frío del cráter, no podría recargar baterías; la misión terminó unas
13 horas después de aterrizar, cuando estaba planeada para unos 10 días.
Cifras de la demo (diciembre de 2026, 744 h, horizonte LOLA): Malapert 98 % de
horas con Sol y 100 % con la Tierra visible; Shackleton 66 % y 41 %.

Ojo al contarla: a Athena la tumbó el aterrizaje, no la elección del sitio. Lo que
sí conecta con nuestro proyecto es lo que la terminó: sombra, frío y sin forma de
recargar. No decir que nuestra demo habría salvado a Athena.

### 1. Hook (≈30 s): dos preguntas y la historia

> "¿Y si el éxito de una misión lunar no dependiera solo de llegar a la Luna,
> sino de elegir exactamente dónde aterrizar? ¿Qué pasa cuando una nave llega...
> pero al lugar equivocado?
>
> El 6 de marzo de 2025, una nave llamada Athena llegó al polo sur de la Luna.
> Años de trabajo de cientos de personas... y aterrizó a
> doscientos cincuenta metros de donde debía, dentro de un cráter. Ahí el Sol casi
> no entra y hace un frío brutal. Sus paneles no pudieron recargar las baterías.
> Trece horas después, la misión se apagó. Estaba planeada para diez días."

### 2. Problema (≈35 s)

> "Y esto no es mala suerte. En el polo sur de la Luna el Sol y la Tierra van
> pegados al horizonte. Una loma de unos pocos grados decide si tu nave tiene
> energía, si puede hablar con la Tierra, las dos cosas... o ninguna. Y justo ahí,
> al polo sur, es a donde van a ir las
> próximas misiones, porque ahí está el hielo."

### 3. Solución (≈60 s)

> "Somos el equipo buhospace, de Hermosillo, y hicimos una herramienta para
> prevenir eso antes de despegar. Tomamos datos reales de la NASA: la posición
> del Sol y de la Tierra, hora por hora, de JPL Horizons, y el relieve real del
> terreno, medido por el láser LOLA. Con eso comparamos tres sitios candidatos y
> vemos, hora por hora, dónde hay luz y dónde hay señal. Pueden ver cómo se
> mueven las sombras sobre el relieve en 3D.
>
> El resultado es claro: en diciembre de 2026, Malapert tiene Sol el 98 % del
> tiempo y la Tierra a la vista todo el mes. En el borde de Shackleton, la Tierra
> se ve menos de la mitad del tiempo. Y cuando la señal se pierde, proponemos un
> punto de apoyo cercano que reenvía los datos, por radio o por láser.
>
> Y algo que nos pasó de verdad: al principio una de nuestras coordenadas caía en
> el fondo del cráter Shackleton, donde nunca llega el Sol. Nuestro propio cálculo
> nos avisó que algo estaba mal, y lo corregimos. Exactamente para eso sirve esta
> herramienta: para encontrar el problema en la pantalla, y no en la Luna."

### 4. Cierre (≈20 s)

> "Athena nos enseñó que llegar a la Luna no basta: importa dónde te quedas
> parado. Queremos que la próxima misión sepa, antes de despegar, cuánta luz y
> cuánta señal va a tener. Nadie llega solo a la Luna: llegamos juntos. Únanse a
> nosotros para que la próxima misión no se apague en la sombra."

---

## Versión anterior (14-nov-2026)

### 1. Hook / Conexion (12-15s)

> "Hola, somos el equipo buhospace, estudiantes de Hermosillo. ¿Y si el exito de una
> mision lunar no dependiera solo de llegar a la Luna, sino de elegir exactamente
> donde aterrizar? Imaginen invertir años de investigacion y tecnologia para llegar
> a nuestro satelite, y descubrir despues que el lugar elegido no tiene suficiente
> luz solar o que se pierde la comunicacion con la Tierra. Creemos que encontramos
> algo que casi nadie mas en este reto esta viendo."

### 2. Problema / Presentacion (30-40s)

> "En el polo sur de la Luna, el Sol y la Tierra casi rozan el horizonte. Una cresta
> de solo unos grados de altura decide si un lander tiene energia, comunicacion con
> la Tierra, las dos cosas, o ninguna. Nuestro proyecto compara 3 sitios reales
> candidatos de aterrizaje: la region de Shackleton, la cresta de Gerlache, y
> Malapert, usando datos reales de la NASA: efemerides de JPL Horizons, y el relieve
> real del terreno de LOLA. No inventamos nada: validamos nuestros calculos a mano
> contra la herramienta oficial de la NASA, y coincidieron hasta la sexta cifra
> decimal."

### 3. Solucion / Valor, con historia de superacion de crisis (40-50s)

> "Y aqui hay algo que de verdad nos paso, no es un cuento inventado para la
> presentacion: al calcular el horizonte de uno de los sitios, el numero no
> cuadraba. Investigamos, y resulta que la coordenada que habiamos usado estaba en
> el fondo del crater Shackleton, no en su borde. Ahi nunca llega el Sol. Lo
> corregimos con literatura cientifica real, y con eso encontramos algo mas: el
> radio que usabamos para calcular el horizonte tambien se quedaba corto. Lo
> subimos, y el calculo cambio varios grados en los sitios mas importantes. Ese
> error real, encontrado y corregido con el mismo rigor que exigiria una mision de
> verdad, es la base de nuestro diferenciador: una capa de enlace local de
> respaldo, por radiofrecuencia o por laser optico, para cuando el enlace directo a
> la Tierra se pierde. Resumimos todo en un solo numero, el indice de conveniencia,
> que le dice a un planificador de mision, de un vistazo, cual de los tres sitios
> es mejor. Hoy ese numero dice que Malapert es el mejor candidato, con casi
> iluminacion y comunicacion constante."

### 4. Impacto / Cierre (15-20s)

> "No buscamos tener un prototipo terminado. Buscamos demostrar que podemos
> trabajar con datos reales de la NASA, encontrar nuestros propios errores, y
> corregirlos con rigor. Una mision lunar no empieza cuando el cohete despega de
> la Tierra: empieza mucho antes, cuando elegimos donde queremos llegar. Eso es lo
> que les ofrecemos: no una idea bonita en el papel, sino un equipo que ya demostro
> que sabe validar lo que construye. ¿Les gustaria conocer mas detalles y explorar
> como podemos colaborar? Somos el equipo de Lunar Landing Site Navigator. Gracias."

---

## Estructura de slides para Canva (misma logica que las presentaciones anteriores en Gamma)

| # | Slide | Contenido | Paso del pitch |
|---|---|---|---|
| 1 | Portada | Nombre del proyecto + equipo buhospace + logo/imagen lunar | Hook / Conexion |
| 2 | El problema | Diagrama simple: Sol y Tierra casi en el horizonte, una cresta que bloquea todo | Problema / Presentacion |
| 3 | Los 3 sitios | Mapa/imagen de Shackleton, de Gerlache, Malapert con sus nombres | Problema / Presentacion |
| 4 | El error que encontramos | Antes/despues: horizonte mal calculado vs corregido, con el numero real | Solucion / Valor (superacion de crisis) |
| 5 | La validacion | Captura o numero: coincidencia exacta a 6 decimales contra JPL Horizons | Solucion / Valor |
| 6 | El diferenciador | Capa de enlace local RF/optico, diagrama de los 3 estados (rapido/robusto/sin enlace) | Solucion / Valor |
| 7 | El indice de conveniencia | El numero S, cual sitio gana y por que | Solucion / Valor |
| 8 | Demo en vivo o captura | Screenshot real de la demo funcionando (docs/capturas/) | Solucion / Valor |
| 9 | Cierre | Llamado a la accion + agradecimiento | Impacto / Cierre |

Recursos ya disponibles para armar esto sin generar nada nuevo:
- Capturas reales: `docs/capturas/` (explorador, comparador con el indice)
- Imagen orbital de los 3 craters: `docs/imagenes/sitios-shackleton-de-gerlache-shoemaker.jpeg`
- Numeros exactos y citas: `docs/fuentes.md`
- Slides reales del taller (referencia de estilo/estructura): `docs/taller-pitch-storytelling/`
