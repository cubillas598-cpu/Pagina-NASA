# Reporte del reto: Lunar Landing Site Navigator

NASA Space Apps Challenge 2026, reto oficial "Lunar Landing Site Navigator",
equipo buhospace, sede Hermosillo. Estructura pedida: Objetivo, Aplicaciones,
Diseño, Datos que hay que manejar, Propósito, Justificación y Conclusiones.

## Objetivo

Construir una herramienta que compare tres sitios reales candidatos de
aterrizaje en el polo sur lunar (Peak Near Shackleton, cresta de Gerlache y
Malapert massif) por energia solar disponible y continuidad de comunicacion
con la Tierra, usando datos reales de la NASA.

Como se hace: para cada sitio y cada hora de un periodo elegido se calcula la
posicion del Sol y de la Tierra con efemerides reales de JPL Horizons, y se
compara contra el horizonte real del terreno, derivado del DEM de LOLA. Si el
astro queda por encima del horizonte local, esta visible. Una capa adicional
clasifica un enlace local de respaldo, por radiofrecuencia u optico, entre el
lander y un punto de apoyo con vista a la Tierra, para los periodos en que el
enlace directo se pierde. Todo se resume en un unico indice de conveniencia
por sitio, para que un planificador de mision compare opciones de un vistazo.

## Aplicaciones

Planeacion de sitios de aterrizaje para misiones reales del polo sur lunar,
como Artemis III: comparar energia solar y ventanas de comunicacion antes de
elegir un sitio, en vez de despues del aterrizaje. Hay un precedente real de
este riesgo, desarrollado en la seccion de Justificacion.

Diseno de arquitecturas de respaldo de comunicacion en terreno polar con
oclusion de la Tierra: el mismo enfoque de clasificar un enlace en
rapido, robusto o sin enlace aplica a cualquier relevo terrestre o laser en
zonas de poca o nula vista directa. Se basa en precedentes reales de NASA: el
concepto de relevo LunaNet y Lunar Communications Relay para radiofrecuencia,
y el sistema laser O2O de Artemis II para el enlace optico.

Material educativo y de divulgacion: el comparador y las vistas 3D
ilustrativas sirven para explicar, a quien no tiene formacion tecnica, por
que el polo sur lunar es geometricamente distinto de las misiones Apollo, con
el Sol casi en el horizonte todo el tiempo.

El metodo tambien podria extenderse a otros cuerpos con geometria similar,
como otros sitios polares u otras lunas, ya que la combinacion de efemerides,
horizonte real e indice ponderado no depende de constantes especificas de la
Luna salvo el modelo de elevacion de entrada. Esta extension no se probo
dentro de este proyecto.

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

Componentes: scripts de Python para efemerides y relieve, un modulo de
calculo en JavaScript, una interfaz web responsive con visor 3D en Three.js
del relieve real de LOLA, y un flujo de GitHub Actions que actualiza las
efemerides automaticamente cada semana.

El bloque critico del diseno es el horizonte real por sitio: si el DEM de
LOLA no cubre la zona o la resolucion es insuficiente, el calculo de si el
Sol o la Tierra estan visibles pierde sentido, porque se volveria un calculo
geometrico sin terreno real de respaldo.

## Datos que hay que manejar

El proyecto maneja la posicion del Sol y de la Tierra por hora, obtenida de
la API oficial JPL Horizons de NASA/JPL, para calcular azimut y elevacion
aparente en cada sitio. Tambien maneja el relieve del polo sur lunar, del DEM
de LOLA de 20 metros por pixel, para obtener el horizonte real por azimut.

Se suman ademas datos de pendiente y rugosidad del terreno, y de distancia a
zonas de sombra permanente, ambos productos de LOLA, usados para evaluar
riesgo de descenso y cercania a posibles reservas de hielo dentro del indice
de conveniencia.

Las coordenadas de los 3 sitios vienen de literatura cientifica revisada por
pares. Los supuestos del enlace local (umbrales de bateria y de angulo solar
para clasificar un enlace como rapido, robusto o sin enlace) son una decision
del equipo, apoyada en precedentes reales de NASA. Finalmente, todos estos
datos se combinan en resultados calculados: la tabla comparativa, el indice
de conveniencia de 8 factores, y una exportacion a CSV.

Cada dato se etiqueta de forma honesta como real de NASA, calculo derivado, o
supuesto del equipo, para no presentar como oficial lo que no lo es. Las
efemerides calculadas se validaron a mano contra la herramienta oficial de
JPL Horizons, con coincidencia exacta hasta la sexta cifra decimal en azimut
y elevacion, en las 8 comparaciones realizadas.

## Propósito

Responder una pregunta concreta: que sitio candidato de aterrizaje del polo
sur lunar ofrece la mejor combinacion de energia solar y continuidad de
comunicacion con la Tierra, directa y con respaldo local, al considerar el
bloqueo real del terreno.

Esto importa porque, a diferencia de las misiones Apollo, que fueron
ecuatoriales y con el Sol en un ciclo dia/noche predecible, el polo sur lunar
tiene al Sol y a la Tierra casi pegados al horizonte. Una cresta de pocos
grados de altura puede decidir si un lander tiene energia, comunicacion, las
dos cosas, o ninguna. Elegir mal el sitio no es un detalle menor: es lo que
puede terminar una mision.

## Justificación

Beneficios: el proyecto entrega, con datos reales y validados, una forma de
comparar sitios candidatos antes de comprometer una mision a uno de ellos, y
propone una capa de respaldo de comunicacion que no forma parte del reto
obligatorio.

Impacto real, con aplicabilidad verificable y no solo teorica: el 6 de marzo
de 2025, la mision IM-2 de Intuitive Machines, con el lander Athena, aterrizo
a unos 250 metros del punto elegido, dentro de un crater del polo sur lunar.
Por la orientacion de sus paneles solares y la poca luz del crater, la nave
no pudo recargar baterias, y la mision termino unas 13 horas despues de
aterrizar, cuando estaba planeada para unos 10 dias. A Athena la tumbo el
aterrizaje en si, no la eleccion del sitio candidato, pero el desenlace,
sombra, frio y sin forma de recargar, es exactamente el tipo de riesgo que
esta herramienta compara antes de elegir un sitio: iluminacion solar y
visibilidad de la Tierra hora por hora. Con el modelo de este proyecto, el
macizo Malapert obtiene un indice de conveniencia de 91.4 de 100, con puntaje
de iluminacion de 98 y de vista directa a la Tierra de 100, frente a 54.8 en
Peak Near Shackleton y 48.8 en la cresta de Gerlache, para el periodo de
diciembre de 2026.

Esto le da aplicabilidad real al proyecto: no es un ejercicio academico
aislado, responde a un riesgo que ya le ocurrio a una mision real del mismo
tipo de terreno.

## Conclusiones

De los 3 sitios candidatos comparados con datos reales de NASA, el macizo
Malapert obtiene el mejor indice de conveniencia en el periodo evaluado de
diciembre de 2026, con 91.4 de 100, frente a 54.8 en Peak Near Shackleton y
48.8 en la cresta de Gerlache, por su mayor altura relativa, que favorece
iluminacion casi continua y vista directa a la Tierra. Este resultado
depende del periodo comparado y de los pesos del indice, no es un veredicto
universal.

El indice de conveniencia es una propuesta del equipo, no un estandar
oficial de NASA. Combina 8 factores: iluminacion, Tierra directa, respaldo,
noche mas larga, apagon mas largo, terreno, ruta de llegada, y cercania a
hielo. Aun asi no ve rocas menores al tamano de su pixel de 20 metros, y no
certifica que un sitio sea seguro para aterrizar.

El equipo valido su propio trabajo con rigor, incluyendo encontrar y
corregir un error real propio: una coordenada de sitio que apuntaba al fondo
de un crater en vez de su borde, corregida con literatura cientifica en vez
de ocultarla.

Queda pendiente, declarado y no escondido, que la ubicacion exacta del punto
de apoyo del enlace local es un supuesto de diseno del equipo y no una
optimizacion geometrica real, y que el evento de degradacion optica por
polvo usa una ventana de tiempo calibrada con datos historicos de Apollo, no
una medicion directa de los 3 sitios elegidos.

## Preguntas anticipadas

Por que confiar en los datos si el equipo no tiene acceso a instrumentos
reales. No se midio nada con instrumento propio: se consumieron datos
publicos oficiales de NASA, y se validaron a mano contra la herramienta
oficial de JPL Horizons, con coincidencia exacta.

El indice de conveniencia certifica que Malapert es seguro para aterrizar.
No lo certifica. Mide iluminacion y comunicacion bajo el modelo del equipo;
no evalua pendiente, rocas ni riesgo de descenso, y eso se dice de forma
explicita en el proyecto.

Por que meter una capa de enlace local que el reto no pide. Para darle al
proyecto un diferenciador real, no solo el calculo de angulos obligatorio,
inspirado en precedentes reales de NASA como LunaNet y el laser O2O de
Artemis II, y en un riesgo real que ya afecto a una mision: Athena IM-2.
