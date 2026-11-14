# Guion de pitch, 3 minutos — presenta Irvin

Basado en el taller "Pitch y Storytelling para prototipos" (14-nov-2026, previo al
concurso). Estructura: Conexion -> Presentacion -> Valor -> Cierre, con historia tipo
"Impacto y Validacion" (mostrar un problema real, como se resolvio con rigor, resultado
medible) — es la que mas encaja con lo que el equipo de verdad hizo.

No se espera prototipo terminado. Lo que se evalua es la idea y como se cuenta.

---

## 1. Conexion (10s)

> "Hola, somos el equipo buhospace. Somos estudiantes de Hermosillo y creemos que
> encontramos algo que casi nadie mas en este reto esta viendo."

## 2. Presentacion — el problema, dato que engancha (30-40s)

> "En el polo sur de la Luna, el Sol y la Tierra casi rozan el horizonte. Una cresta
> de solo unos grados de altura decide si un lander tiene energia, comunicacion con
> la Tierra, las dos cosas, o ninguna. Nuestro proyecto compara 3 sitios reales
> candidatos de aterrizaje —region de Shackleton, cresta de Gerlache, y Malapert—
> usando datos reales de la NASA: efemerides de JPL Horizons, y el relieve real del
> terreno de LOLA. No inventamos nada: validamos nuestros calculos a mano contra la
> herramienta oficial de la NASA, y coincidieron hasta la sexta cifra decimal."

## 3. Historia de impacto y validacion — el problema real que encontraron (30-40s)

> "Y aqui hay algo que de verdad nos paso: al calcular el horizonte de uno de los
> sitios, el numero no cuadraba. Investigamos, y resulta que la coordenada que
> habiamos usado estaba en el FONDO del crater Shackleton, no en su borde. Ahi nunca
> llega el Sol. Lo corregimos con literatura cientifica real, y con eso encontramos
> algo mas: el radio que usabamos para calcular el horizonte tambien se quedaba corto.
> Lo subimos, y el calculo cambio varios grados en los sitios mas importantes. Esto
> no es un dato que inventamos: es un error real que encontramos y corregimos con
> rigor, igual que lo haria cualquier equipo de mision real."

## 4. Valor — el diferenciador (30-40s)

> "Pero no nos quedamos solo con comparar Sol y Tierra, que es lo obligatorio del
> reto. Le agregamos una capa que nadie mas tiene: un enlace local de respaldo, por
> radiofrecuencia o por laser optico, para cuando el enlace directo a la Tierra se
> pierde. Y resumimos todo en un solo numero, el indice de conveniencia, que le dice
> a un planificador de mision, de un vistazo, cual de los tres sitios es mejor. Hoy
> ese numero dice que Malapert es el mejor candidato de los tres, con casi iluminacion
> y comunicacion constante."

## 5. Cierre — llamado a la accion (15-20s)

> "No buscamos tener un prototipo terminado. Buscamos demostrar que podemos trabajar
> con datos reales de la NASA, encontrar nuestros propios errores, y corregirlos con
> el mismo rigor que exigiria una mision real. Eso es lo que les ofrecemos: no una
> idea bonita en el papel, sino un equipo que ya demostro que sabe validar lo que
> construye. Gracias."

---

## Estructura de slides para Canva (misma logica que las presentaciones anteriores en Gamma)

| # | Slide | Contenido | Beat del pitch |
|---|---|---|---|
| 1 | Portada | Nombre del proyecto + equipo buhospace + logo/imagen lunar | Conexion |
| 2 | El problema | Diagrama simple: Sol y Tierra casi en el horizonte, una cresta que bloquea todo | Presentacion |
| 3 | Los 3 sitios | Mapa/imagen de Shackleton, de Gerlache, Malapert con sus nombres | Presentacion |
| 4 | El error que encontramos | Antes/despues: horizonte mal calculado vs corregido, con el numero real (~20 grados equivocado -> corregido) | Historia de impacto y validacion |
| 5 | La validacion | Captura o numero: coincidencia exacta a 6 decimales contra JPL Horizons | Historia de impacto y validacion |
| 6 | El diferenciador | Capa de enlace local RF/optico, diagrama de los 3 estados (rapido/robusto/sin enlace) | Valor |
| 7 | El indice de conveniencia | El numero S, cual sitio gana y por que | Valor |
| 8 | Demo en vivo o captura | Screenshot real de la demo funcionando (docs/capturas/) | Valor |
| 9 | Cierre | Llamado a la accion + agradecimiento | Cierre |

Recursos ya disponibles para armar esto sin generar nada nuevo:
- Capturas reales: `docs/capturas/` (explorador, comparador con el indice)
- Imagen orbital de los 3 craters: `docs/imagenes/sitios-shackleton-de-gerlache-shoemaker.jpeg`
- Numeros exactos y citas: `docs/fuentes.md`
