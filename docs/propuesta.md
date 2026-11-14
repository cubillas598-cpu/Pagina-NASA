# Propuesta: Lunar Landing Site Navigator con enlace local adaptativo

> Idea de Irvin: reusar el proyecto EVA (AI-SED) para este reto. La propuesta de abajo recoge esa idea con una variante segura: se reusa el patrón de EVA, no su codigo ni su modelo entrenado.

## Ficha rapida

| Eje | Valor |
| --- | --- |
| Alineacion reto | Alta: ataca el reto oficial completo, la capa extra no lo desvia |
| Calidad ingenieria | Media-alta: efemerides reales (JPL Horizons), relieve real (LOLA) |
| Necesidad parte nueva | Media: el reto ya pide comparar sitios; el enlace local es diferenciador, no requisito |
| Riesgo de plazo | Medio: cronograma de 33 horas, con orden de recorte definido |
| Dificultad insumo | Baja: los tres datos (efemerides, relieve, horizonte) ya estan verificados y disponibles |
| Veredicto | **Viable en el plazo si el enlace local se recorta primero cuando falte tiempo.** |

## En una frase

Una herramienta web que compara sitios de aterrizaje del polo sur lunar por energia solar y ventana de comunicacion directa a Tierra, con una capa extra que clasifica un enlace local (radiofrecuencia u optico) en rapido, robusto o sin enlace.

## Por que esta propuesta

El reto oficial "Lunar Landing Site Navigator" pide comparar sitios y fechas viendo donde estan el Sol y la Tierra sobre el horizonte. Eso ya lo van a construir varios equipos este año con la misma base de datos (JPL Horizons, LOLA): no hay nada que diferencie un proyecto de otro si solo se hace lo obligatorio.

La idea de Irvin de traer el proyecto EVA aporta justo eso: un patron de ingenieria ya probado por el equipo (clasificador de enlace en tres estados, pensado para condiciones que degradan una senal) aplicado a un problema real de comunicacion lunar. No se trae el codigo ni el modelo entrenado de EVA porque no aplican a estos datos: EVA clasifica BER real medido con fotodiodo contra una camara de humo, y aqui no hay sensor fisico, solo un angulo calculado. Lo que si se trae es la forma de pensar el problema, reescrita con reglas nuevas para este dominio.

El resultado es un proyecto que cumple el reto obligatorio completo y que tiene una historia propia que contar frente al jurado: no es solo "calculamos angulos", es "ademas evaluamos si el enlace de respaldo aguanta".

## Principio de funcionamiento

Para cada sitio y cada hora del rango de fechas se calcula la posicion del Sol y de la Tierra con efemerides reales (JPL Horizons), y se compara contra el perfil de horizonte real del sitio (LOLA skyline, ya viene precalculado por NASA). Si el Sol esta sobre el horizonte hay energia; si la Tierra esta sobre el horizonte hay ventana de comunicacion directa.

La capa extra toma esa misma hora y clasifica un enlace local entre el lander y un punto de apoyo con vista a la Tierra, en tres estados: rapido, robusto o sin enlace. El tipo de enlace es seleccionable:

- **Radiofrecuencia**: el punto de apoyo es un relevo en terreno alto. Precedente real: el concepto de relevo LunaNet / Lunar Communications Relay de NASA, pensado exactamente para craters del polo sur sin vista directa a la Tierra.
- **Optico**: el enlace se degrada si el angulo del Sol cae cerca de la linea de vista, o si hay un evento de polvo levantado por el penacho de un aterrizaje cercano. Precedente real: el "horizon glow" de polvo lunar estudiado desde Apollo, y el sistema laser O2O de Artemis II.

Limite del principio, dicho con claridad: el evento de polvo de la capa optica es una regla calibrada con datos historicos reales, no una medicion directa de ninguno de los tres sitios elegidos. Se apoya en dos datos documentados de las misiones Apollo: polvo visible en camara durante 10 a 12 segundos en el descenso final (bajo unos 60-70 pies de altura), y un hueco real de telemetria en el ascenso del Apolo 11 causado por su propio penacho de escape (documentado por Brian O'Brien). La duracion del evento sintetico en el clasificador usa esa ventana de 10-12 segundos como referencia, no un numero inventado. El punto de relevo de la capa de radiofrecuencia se elige por criterio del equipo, no por una optimizacion geometrica real.

## Arquitectura

```
Efemerides (JPL Horizons)  -->  JSON por sitio/hora
Relieve LOLA skyline       -->  horizonte por azimut
                                     |
                                     v
                         Clasificador de energia/comunicacion
                         (obligatorio: Sol visible, Tierra visible)
                                     |
                                     v
                         Clasificador de enlace local (extra)
                         RF: vista a relevo
                         Optico: angulo Sol + evento de polvo
                                     |
                                     v
                    JSON precalculado --> pagina estatica (GitHub Pages)
                    linea de tiempo: energia, Tierra, enlace local
```

El bloque critico es el clasificador obligatorio de energia y comunicacion: si ese no funciona, no hay proyecto que entregar. El clasificador de enlace local depende de el, nunca al reves.

## Que le exige la parte nueva al resto del diseno

| Requisito | Consecuencia en el diseno |
| --- | --- |
| El enlace local necesita el horizonte ya calculado | No puede empezar antes de que el bloque obligatorio de horizonte este listo |
| Debe poder apagarse sin romper nada | La linea de tiempo tiene que aceptar dos o tres franjas, nunca asumir que la tercera existe |
| Dos tipos de enlace, un solo clasificador | La logica de clasificacion es generica (tres estados), y cada tipo solo aporta su propia senal de entrada |

## Estrategia de la parte nueva

Entrada: angulo Sol-linea de vista (optico) o visibilidad del relevo (RF), mas un evento de degradacion por hora. Salida: uno de tres estados, por hora, por sitio.

Comparacion contra el metodo convencional: sin esta capa, el proyecto solo dice si hay vista directa a la Tierra o no, en blanco y negro. Con la capa, se ve que incluso cuando la vista directa falla puede existir un respaldo local parcial, y en que condiciones ese respaldo tambien se degrada.

Metricas que se van a reportar: horas en cada uno de los tres estados, por sitio y por tipo de enlace. La que mas importa es el tiempo en estado "sin enlace", porque es el que define el riesgo real de una mision.

Encuadre honesto: esta capa no sustituye un analisis de enlace de verdad (no hay presupuesto de enlace, no hay modelo de propagacion). Es una capa de decision rapida para comparar sitios, no una ingenieria de comunicaciones completa.

## Riesgos

| Riesgo | Impacto | Mitigacion y cuando |
| --- | --- | --- |
| LOLA skyline no cubre uno de los tres sitios elegidos | Medio | Horizonte plano para ese sitio, decirlo en el README, antes de las 15:00 del sabado |
| Las efemerides no coinciden con la herramienta de JPL | **Alto** | Pedir ayuda en el canal del reto antes de las 14:00 del sabado |
| El enlace local no se termina a tiempo | Medio | Dejar un solo tipo de enlace (no los dos), o dejarlo como concepto con una imagen en el README |
| El jurado no puede abrir el demo en vivo | Medio | Video grabado y capturas en la pagina del proyecto, listo antes de la entrega |
| Se llega tarde al domingo 18:00 | **Alto** | Enviar la version minima del sabado, que ya cumple lo obligatorio |

## Plan por bloques

| Bloque | Entregable |
| --- | --- |
| Sabado 11:00-12:00 | Repo publico con licencia, equipo registrado, 3 sitios elegidos |
| Sabado 12:00-16:00 | Efemerides y horizonte por sitio, pagina con datos de prueba |
| Sabado 16:00-20:00 | Version minima obligatoria publicada en GitHub Pages |
| Sabado 20:00-24:00 | Enlace local (uno o dos tipos) integrado a la linea de tiempo |
| Domingo 09:00-13:00 | Comparador de 3 sitios, revision de numeros, prueba en celular |
| Domingo 13:00-18:00 | README con fuentes citadas, demo grabado, pagina del proyecto llena |
| Domingo 18:00-20:00 | Envio a juicio, colchon para ajustes menores |

## Banco de preguntas anticipadas

**Pregunta:** por que un clasificador de enlace y no solo mostrar si hay vista directa a la Tierra.
**Respuesta:** porque un sitio puede fallar la vista directa y aun tener un respaldo local parcial; el reto pide comparar sitios, y esta capa da una comparacion mas fina que un simple si o no.

**Pregunta:** el modelo viene de otro proyecto del equipo, eso cuenta como trabajo original.
**Respuesta:** el codigo y los datos son nuevos, escritos para este reto; lo unico que se reutiliza es la forma de pensar el problema (clasificador de tres estados), que es exactamente lo que la guia de entrega permite al pedir citar fuentes e inspiraciones, no prohibirlas.

**Pregunta:** el evento de polvo esta basado en datos reales de algun aterrizaje.
**Respuesta:** no mide ninguno de los tres sitios en especifico, pero la duracion y la logica del evento si vienen de datos reales de Apollo: 10-12 segundos de polvo visible en descenso, y un hueco de telemetria real en el ascenso del Apolo 11 por su propio penacho. No es un numero inventado, es una referencia historica documentada aplicada a un sitio nuevo.

**Pregunta:** por que dos tipos de enlace y no solo uno.
**Respuesta:** porque cada tipo tiene su propio precedente real de NASA (RF con LunaNet, optico con Artemis II), y el costo de tener los dos es bajo; si falta tiempo, se recorta a uno solo primero, antes de tocar cualquier otra parte del proyecto.

## Recomendacion final

Seguir con esta propuesta tal como esta. El riesgo mas alto no es la capa nueva, es que las efemerides no cuadren contra JPL: verificar eso a mano apenas este el primer sitio calculado, antes de construir nada mas encima.
