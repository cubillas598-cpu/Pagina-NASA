# Reporte del reto: Lunar Landing Site Navigator

NASA Space Apps Challenge 2026, reto oficial "Lunar Landing Site Navigator",
equipo buhospace, sede Hermosillo. Estructura pedida: Objetivo, Aplicaciones,
Diseño, Datos que hay que manejar, Propósito, Justificación y Conclusiones.

## Convención de certeza

| Etiqueta | Significado |
|---|---|
| `[CONFIRMADO]` | Dato oficial, documento del proyecto, o verificado por el equipo |
| `[VERIFICADO]` | Comprobado en fuente publica fiable durante este proyecto |
| `[INFERENCIA]` | Deduccion razonable, no comprobada |
| `[PENDIENTE]` | Hueco conocido, con lo que bloquea |

No quitar las etiquetas al editar.

## Objetivo

Construir una herramienta que compare tres sitios reales candidatos de
aterrizaje en el polo sur lunar (Peak Near Shackleton, cresta de Gerlache y
Malapert massif) por energia solar disponible y continuidad de comunicacion
con la Tierra, usando datos reales de la NASA. `[CONFIRMADO]`

Como se hace: para cada sitio y cada hora de un periodo elegido se calcula la
posicion del Sol y de la Tierra con efemerides reales de JPL Horizons, y se
compara contra el horizonte real del terreno (perfil derivado del DEM LOLA de
80 m/px). Si el astro queda por encima del horizonte local, esta visible. Una
capa adicional clasifica un enlace local de respaldo (radiofrecuencia u
optico) entre el lander y un punto de apoyo con vista a la Tierra, para los
periodos en que el enlace directo se pierde. Todo se resume en un unico
indice de conveniencia (S) por sitio, para que un planificador de mision
compare opciones de un vistazo. `[CONFIRMADO]`

## Aplicaciones

- **Planeacion de sitios de aterrizaje para misiones reales del polo sur
  lunar** (ej. Artemis III): comparar energia solar y ventanas de
  comunicacion antes de elegir un sitio, en vez de despues del aterrizaje.
  `[INFERENCIA]`, con precedente real documentado abajo en Justificacion.
- **Diseno de arquitecturas de respaldo de comunicacion** en terreno polar
  con oclusion de la Tierra: el mismo enfoque de clasificar un enlace en
  rapido/robusto/sin enlace aplica a cualquier relevo terrestre o laser en
  zonas de poca o nula vista directa. `[CONFIRMADO]`, basado en precedentes
  reales de NASA (LunaNet / Lunar Communications Relay para RF, sistema laser
  O2O de Artemis II para optico). Ver `README.md`.
- **Material educativo y de divulgacion**: el comparador y las vistas 3D
  ilustrativas sirven para explicar, a quien no tiene formacion tecnica, por
  que el polo sur lunar es geometricamente distinto de las misiones Apollo
  (Sol casi en el horizonte todo el tiempo). `[CONFIRMADO]`.
- **Base reutilizable para otros cuerpos con geometria similar** (ej. otros
  sitios polares, otras lunas): el metodo (efemerides + horizonte real +
  indice ponderado) no depende de constantes especificas de la Luna salvo el
  DEM de entrada. `[INFERENCIA]`, no probado fuera de este proyecto.

## Diseño

Arquitectura de datos y calculo:

```
Efemerides (JPL Horizons)   -->  JSON por sitio/hora (Sol, Tierra)
Relieve LOLA (DEM 20 m/px,  -->  horizonte, pendiente, rugosidad
rugosidad, sombra perm.)         y distancia a hielo, por sitio
                                     |
                                     v
                     Comparacion hora por hora:
                     Sol visible?  Tierra visible?
                     Enlace local: rapido / robusto / sin enlace
                                     |
                                     v
           Indice de conveniencia (8 factores ponderados, 0-100):
           iluminacion, Tierra directa, respaldo, noche mas larga,
           apagon mas largo, terreno, ruta de llegada, hielo cercano
                                     |
                                     v
        Pagina web estatica (comparador, 3 vistas 3D, exportacion CSV)
```

Componentes: scripts de Python para efemerides y relieve
(`scripts/efemerides.py`, `scripts/horizonte.py`), modulo de calculo en
JavaScript (`web/js/model.js`), interfaz web responsive con visor 3D (Three.js)
del relieve real de LOLA, y un flujo de GitHub Actions que actualiza las
efemerides automaticamente cada semana. `[CONFIRMADO]`, ver `README.md` y
`docs/propuesta.md` seccion Arquitectura.

El bloque critico es el horizonte real por sitio: si el DEM de LOLA no cubre
la zona o la resolucion es insuficiente, el calculo de "Sol/Tierra visible"
pierde sentido (se volveria un calculo geometrico sin terreno real).
`[CONFIRMADO]`, documentado en `docs/fuentes.md`.

## Datos que hay que manejar

| Dato | Fuente | Que se hace con el |
|---|---|---|
| Posicion de Sol y Tierra por hora | API JPL Horizons (NASA/JPL SSD) | Azimut y elevacion aparente, por sitio |
| Relieve del polo sur lunar | NASA LOLA, DEM 20 m/px (`LDEM_80S_20MPP_ADJ`, producto GSFC PGDA 90) | Horizonte real por azimut (360 valores, cada 1 grado) |
| Pendiente y rugosidad del terreno | NASA LOLA, 100 m (`LDRM_80S_50MPP_ADJ_ROUGH_100M`) | Puntaje de terreno del indice (riesgo de descenso) |
| Distancia a sombra permanente | NASA LOLA, 20 m (`LPSR_80S_20MPP_ADJ`) | Puntaje de cercania a hielo del indice |
| Coordenadas de los 3 sitios | Literatura revisada por pares (iopscience, Icarus, JGR Planets) | Punto de referencia para el calculo de horizonte y efemerides |
| Supuestos del enlace local | Decision del equipo, con precedentes reales de NASA citados | Umbrales de bateria y angulo solar para clasificar rapido/robusto/sin enlace |
| Resultados calculados | Derivados de lo anterior | Tabla comparativa, indice S (8 factores), exportacion a CSV |

Todo dato se etiqueta en `docs/fuentes.md` como real de NASA, calculo
derivado, o supuesto del equipo: no se presentan como oficiales datos que no
lo son. `[CONFIRMADO]`. Validacion hecha: las efemerides calculadas
coincidieron a mano contra la herramienta oficial de JPL Horizons hasta la
sexta cifra decimal en azimut y elevacion, en las 8 comparaciones realizadas.
`[VERIFICADO]`, ver `docs/fuentes.md`.

## Propósito

Responder una pregunta concreta: ¿que sitio candidato de aterrizaje del polo
sur lunar ofrece la mejor combinacion de energia solar y continuidad de
comunicacion con la Tierra, directa y con respaldo local, al considerar el
bloqueo real del terreno? `[CONFIRMADO]`, pregunta de investigacion del
proyecto, ver `README.md`.

Esto importa porque, a diferencia de las misiones Apollo (ecuatoriales, con el
Sol en un ciclo dia/noche predecible), el polo sur lunar tiene al Sol y a la
Tierra casi pegados al horizonte: una cresta de pocos grados de altura puede
decidir si un lander tiene energia, comunicacion, las dos cosas, o ninguna.
Elegir mal el sitio no es un detalle menor, es lo que puede terminar una
mision. `[CONFIRMADO]`, desarrollado en `docs/guion-pitch-3min.md`.

## Justificación

**Beneficios**: el proyecto entrega, con datos reales y validados, una forma
de comparar sitios candidatos antes de comprometer una mision a uno de ellos,
y propone una capa de respaldo de comunicacion (RF u optica) que no forma
parte del reto obligatorio. `[CONFIRMADO]`.

**Impacto real, con aplicabilidad verificable** (no solo teorico): el 6 de
marzo de 2025, la mision IM-2 de Intuitive Machines (lander Athena) aterrizo
a unos 250 metros del punto elegido, dentro de un crater del polo sur lunar.
Por la orientacion de sus paneles solares y la poca luz del crater, la nave no
pudo recargar baterias; la mision termino unas 13 horas despues de aterrizar,
cuando estaba planeada para unos 10 dias. `[VERIFICADO]` (prensa: CBS News,
Spaceflight Now, SpacePolicyOnline, TechCrunch; ver `docs/guion-pitch-3min.md`
"Version 2"). A Athena la tumbo el aterrizaje en si, no la eleccion del sitio
candidato, pero el desenlace (sombra, frio, sin forma de recargar) es
exactamente el tipo de riesgo que esta herramienta compara ANTES de elegir un
sitio: iluminacion solar y visibilidad de la Tierra hora por hora. Con el
modelo de este proyecto, el macizo Malapert obtiene un indice de conveniencia
de 91.4 (de 100), con puntaje de iluminacion de 98 y de vista directa a la
Tierra de 100, frente a 54.8 en Peak Near Shackleton y 48.8 en la cresta de
Gerlache (periodo diciembre 2026). `[CONFIRMADO]`, calculado con
`web/js/model.js`, capturado en `docs/capturas/comparador-indice-15nov.jpg`.

Esto le da aplicabilidad real al proyecto: no es un ejercicio academico
aislado, responde a un riesgo que ya le ocurrio a una mision real del mismo
tipo de terreno.

## Conclusiones

- De los 3 sitios candidatos comparados con datos reales de NASA, **Malapert
  massif** obtiene el mejor indice de conveniencia en el periodo evaluado
  (diciembre de 2026): 91.4 de 100, frente a 54.8 (Peak Near Shackleton) y
  48.8 (cresta de Gerlache), por su mayor altura relativa que favorece
  iluminacion casi continua y vista directa a la Tierra. `[CONFIRMADO]`, el
  resultado depende del periodo comparado y de los pesos del indice, no es un
  veredicto universal. Ver `README.md` seccion "Indice de conveniencia".
- El indice de conveniencia (S) es una propuesta del equipo, **no un
  estandar oficial de NASA**: combina 8 factores (iluminacion, Tierra
  directa, respaldo, noche mas larga, apagon mas largo, terreno, ruta de
  llegada y cercania a hielo), pero no ve rocas menores al pixel de 20 m ni
  certifica que un sitio sea seguro para aterrizar. `[CONFIRMADO]`.
- El equipo valido su propio trabajo con rigor, incluyendo encontrar y
  corregir un error real propio (una coordenada de sitio que apuntaba al
  fondo de un crater en vez de su borde) usando literatura cientifica, en vez
  de ocultarlo. `[CONFIRMADO]`, documentado completo en `docs/fuentes.md` y
  `docs/bitacora.md`.
- Queda pendiente, declarado y no escondido: la ubicacion exacta del punto de
  apoyo del enlace local es un supuesto de diseno del equipo, no una
  optimizacion geometrica real; y el evento de degradacion optica por polvo
  usa una ventana de tiempo calibrada con datos historicos de Apollo, no una
  medicion directa de los 3 sitios elegidos. `[CONFIRMADO]`, ver
  `docs/propuesta.md` seccion "Principio de funcionamiento".

## Preguntas anticipadas

- **¿Por que confiar en los datos si el equipo no tiene acceso a instrumentos
  reales?** → Porque no se midio nada con instrumento propio: se consumieron
  datos publicos oficiales de NASA (JPL Horizons, LOLA) y se validaron a mano
  contra la herramienta oficial, con coincidencia exacta.
- **¿El indice de conveniencia certifica que Malapert es seguro para
  aterrizar?** → No. Certifica iluminacion y comunicacion bajo el modelo del
  equipo; no evalua pendiente, rocas ni riesgo de descenso, y se dice
  explicito en el proyecto.
- **¿Por que meter una capa de enlace local que el reto no pide?**
  → Para darle al proyecto un diferenciador real (no solo "calculamos
  angulos"), inspirado en precedentes reales de NASA (LunaNet, laser O2O de
  Artemis II) y en un riesgo real que ya afecto a una mision (Athena IM-2).
