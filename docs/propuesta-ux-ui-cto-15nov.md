# Propuesta de rediseño UX/UI y evolución técnica

**Lunar Landing Site Navigator · 15 de noviembre de 2026**  
Preparada para Irvin Valenzuela Cubillas.

**Dirección recomendada:** un atlas lunar de análisis, con identidad sobria, resultados comprensibles y exploración espacial integrada.

Esta es una propuesta para revisar antes de implementar el rediseño. La maqueta adjunta en la conversación demuestra la organización y el lenguaje visual; no sustituye la aplicación ni constituye una publicación en GitHub.

## 1. Decisión de diseño

El proyecto ya tiene algo valioso: tres sitios concretos, series horarias, relieve lunar, comparación y una historia científica que se puede explorar. La mejora principal consiste en organizar todo eso alrededor de las preguntas del visitante:

1. ¿Qué estoy viendo y qué puedo aprender aquí?
2. ¿Cómo se comporta este sitio durante el periodo?
3. ¿Qué cambia al compararlo con los otros dos?
4. ¿Cuándo aparecen las limitaciones y por qué?
5. ¿De dónde salen estas cifras y hasta dónde puedo confiar en ellas?

Recomiendo conservar carbón, marfil y dorado, dar mayor presencia al relieve real y reservar el efecto cristal para controles que flotan sobre el explorador. Las gráficas y los textos necesitan fondos estables, espacio y contraste.

El resultado debe sentirse como una herramienta editorial y científica hecha para este proyecto. La personalidad vendrá de la cartografía lunar, la selección de información, las proporciones y la claridad del contenido.

## 2. Qué revisé y sobre qué versión

Repositorio: [Pagina-NASA](https://github.com/cubillas598-cpu/Pagina-NASA). Sitio: [Lunar Landing Site Navigator](https://cubillas598-cpu.github.io/Pagina-NASA/).

La revisión de interfaz y código corresponde a `f99ae00c7e1f032c7a2fd0a2f5ddc547260e0849`. Al retomar el trabajo, `main` avanzó a `4532344bf579b2dd5650bd9e53e75cd2c8f41c9f`; el diferencial contiene únicamente cambios en `docs/guion-pitch-3min.md`, sin alteraciones en las vistas revisadas.

| Superficie | Revisión realizada | Observación principal |
|---|---|---|
| Portada y sus secciones | Navegación, presentación en escritorio y código responsive | Es una base visual aprovechable; la entrada a distintas herramientas fragmenta la experiencia. |
| Resumen | Navegador, código y anchos de 390 y 768 px | El mapa y los controles anteceden a los resultados principales. |
| Sitios | Navegador, nuevo visor incrustado, mapa alternativo y código | Se está integrando el relieve, pero todavía conviven dos interfaces y distintos comportamientos de carga. |
| Comparador | Navegador y anchos estrechos, incluido 320 px | El texto técnico y la tabla aparecen antes de una lectura rápida de las diferencias. |
| Enlace local | Navegador, controles temporales y código | La línea de tiempo es útil; necesita explicar el enlace completo y su contribución real. |
| Metodología | Navegador y contenido | La información existe, pero está comprimida por un panel lateral que no ayuda a leerla. |
| Ayuda | Apertura del diálogo y contenido | Buen glosario inicial; debe acompañar también a los términos en su contexto. |
| Dos visores 3D independientes y sus comparadores | Código, interfaz de entrada y comportamiento sin WebGL | Persisten motores y modelos distintos. Las nuevas advertencias de simulación ilustrativa son un avance. |
| HTML autónomo | Apertura mediante HTTP y código empaquetado | Reproduce el dashboard. Esta sesión no verifica apertura real con `file://` y red desconectada. |
| Página 404 | Navegador | Es coherente y ofrece recuperación; requiere ajustes menores. |
| Prototipo histórico `esqueleto.html` | Identificación en el repositorio | Debe quedar fuera del recorrido principal y documentarse como histórico. |

El navegador de revisión no dispone de WebGL. Por ello no certifico el aspecto final de las escenas aceleradas, el vuelo de cámara ni su rendimiento en GPU. Revisé sus fuentes y sus alternativas visibles. Los anchos estrechos se comprobaron en un marco con anchura controlada; no equivalen a pruebas físicas de Android o iPhone.

La referencia de Behance respondió con 403 en la consulta. La propuesta utiliza las preferencias ya definidas —cristal, elegancia, neutros y dorado— y las necesidades observadas del proyecto; no se presenta como una reproducción visual comprobada de esa referencia.

## 3. Diagnóstico de producto

Hay demasiada competencia entre el contenido y la decoración funcional. El gran contenedor de cristal, las tarjetas anidadas, el emblema lunar del panel, los controles circulares y el bloque de condiciones comparten una prominencia similar. Eso dificulta reconocer qué mirar primero.

El título “Dashboard de misión” se mantiene al cambiar de sección. La navegación de escritorio depende de iconos y sus ayudas. Las etiquetas móviles recién añadidas mejoran la orientación, aunque todavía son pequeñas.

El panel lateral ocupa alrededor de un tercio del área útil incluso en Comparador y Metodología. Sus controles de hora y reproducción son relevantes para una vista temporal, pero compiten con la tabla completa y la lectura de fuentes.

En la revisión del Resumen con marco de 390 px, el inicio de los indicadores quedó aproximadamente a **1.381 px** desde el comienzo del documento. A 768 px quedó aproximadamente a **1.602 px**. La aplicación puede caber horizontalmente y, aun así, exigir demasiado desplazamiento antes de mostrar su respuesta principal.

Las correcciones recientes sí cuentan: en el Comparador de 320 px comprobé un ancho de contenido de 305 px y un ancho desplazable también de 305 px. El desbordamiento general observado en la auditoría anterior ya no se reprodujo en esa comprobación. Queda una tarea de jerarquía y adaptación del contenido.

## 4. Arquitectura de navegación propuesta

Mantendría una portada breve y una aplicación con cinco destinos. El nombre completo del proyecto se conserva; “Lunar Navigator” puede usarse como forma corta en la cabecera.

| Destino | Pregunta que responde | Contenido dominante |
|---|---|---|
| **Resumen** | ¿Qué caracteriza al sitio y al periodo seleccionados? | Indicadores, conclusión explicada, siguiente acción y comparación breve. |
| **Explorar** | ¿Dónde está el sitio y cómo influye el terreno? | Luna/relieve, selección de sitio y ficha contextual. |
| **Comparar** | ¿Qué diferencias hay entre los tres sitios? | Gráficas alineadas y tabla de detalle. |
| **Ventanas** | ¿Cuándo hay luz, comunicación o interrupciones? | Línea de tiempo, eventos y explicación de causas. |
| **Datos** | ¿De dónde sale cada resultado? | Fuentes, supuestos, cobertura, versión y metodología. |

El estado compartido incluye sitio, periodo, hora del cursor, tipo de enlace y supuestos. Cambiar de vista conserva ese contexto. Los enlaces existentes `#sitios`, `#enlace`, `#metodologia` y `?sitio=` deben seguir funcionando mediante compatibilidad de rutas.

Separaría visualmente dos conceptos: **“Resultados del periodo”** y **“Hora seleccionada”**. La cabecera mostraría el periodo; el reloj y la reproducción aparecerían junto al contenido que depende del cursor.

## 5. Rediseño de cada vista

### Portada: explicar el valor y conducir a una experiencia

Conservaría el relieve lunar como pieza principal. Cambiaría el encabezado para explicar la tarea en español: **“Explora dónde hay luz y conexión en el polo sur lunar”**. El nombre oficial queda en la marca.

Orden recomendado: presentación breve; entrada “Explorar los sitios”; ejemplo de una comparación con su periodo; tres preguntas que resuelve la herramienta; fuentes y límites; equipo y acceso al código. Una sola entrada principal a la aplicación evita que el visitante tenga que decidir entre varias demos con nombres similares.

Los visores 3D se integran en Explorar. La versión autónoma pasa a “Usar sin conexión”, con tamaño, fecha y cobertura del archivo. En móvil, el menú conserva acceso a las secciones mediante un control etiquetado.

### Resumen: entender antes de configurar

El resumen ya existe. Lo rediseñaría para que cumpla mejor su función:

1. Sitio y periodo claramente identificados.
2. Tres indicadores iniciales: iluminación, Tierra visible y mayor intervalo continuo en sombra.
3. Una lectura breve basada en las cifras del periodo, con la razón de su importancia.
4. Acciones “Ver las ventanas” y “Comparar sitios”.
5. Comparación compacta y ubicación lunar secundaria.

Ejemplo reproducido con el modelo actual para Shackleton en diciembre: **66,0 % de luz, 41,4 % de Tierra visible y 127 h de sombra continua máxima**. El texto puede explicar que hay 249 horas con Sol y Tierra visibles a la vez. La persona recibe una interpretación verificable, no una etiqueta genérica de “sitio óptimo”.

La cifra de comunicación total y las horas recuperadas mediante respaldo se incorporan al nivel principal cuando el modelo de relevo esté revisado. El índice S queda como resumen secundario con sus pesos visibles.

### Explorar: una Luna interactiva con una función clara

Unificaría globo global, relieve polar y ficha del sitio en un solo explorador. El usuario puede entender dónde está y acercarse al contexto local sin saltar a otra página.

Al elegir Shackleton, De Gerlache o Malapert, la cámara centra el sitio con una transición breve; el marcador seleccionado, la ficha y la hora permanecen sincronizados. Una acción “Ver los tres” recupera la orientación. El movimiento manual interrumpe la transición automática.

En escritorio: escena principal y ficha lateral de anchura limitada. En móvil: escena de altura contenida, lista de sitios accesible y ficha debajo; los ajustes de relieve se abren bajo demanda. Conservar controles de teclado, zoom y selección equivalentes a los gestos.

Los controles visibles iniciales serían sitio, vista general, 2D/3D y pantalla completa. Exageración vertical, mapa de alturas y otros ajustes quedan en “Capas y relieve”. La escala, orientación, fuente y exageración activa deben estar a la vista.

La cámara se mueve hacia una ubicación de interés; no se presenta como una trayectoria de descenso calculada. Las sombras estilizadas o exageradas se identifican como representación visual. La resolución del relieve no permite deducir por sí sola seguridad de aterrizaje.

### Comparar: diferencias primero, detalle después

La vista debe ocupar el ancho disponible, con el periodo y los supuestos en una franja compacta. El panel lateral de hora desaparece aquí.

Primero mostraría tres gráficas alineadas: porcentaje de luz, porcentaje de Tierra visible y duración máxima en sombra. Después, una conclusión que exponga ventajas y limitaciones. La tabla completa sigue disponible en la misma vista y permite exportar.

En móvil, cada métrica muestra los tres sitios en barras horizontales; así se mantiene la comparación simultánea. La tabla extensa queda como detalle con desplazamiento interno, encabezados claros y primera columna identificable.

Cambiaría los muchos distintivos “Mejor” por indicadores específicos: “Más horas de luz” o “Menor interrupción”. Un sitio no se convierte en la mejor opción de aterrizaje por ganar varias métricas correlacionadas.

### Ventanas: explicar cuándo y por qué

Transformaría Enlace local en una vista temporal más completa, con un único cursor y un único reproductor. Las filas principales serían Sol visible, Tierra visible, respaldo disponible y comunicación total. Las dos últimas dependen de cerrar la revisión del modelo.

Al seleccionar una hora o un evento, la explicación debe describir la cadena causal: terreno, visibilidad, disponibilidad del punto de apoyo y estado del tramo local. Debe distinguirse un enlace local robusto de un respaldo que efectivamente llega a la Tierra.

Sustituiría “Interrupción” por “Ir a la siguiente interrupción”. El distintivo “Fin” en eventos se reemplaza por un texto contextual: “Termina la sombra”, “Se recupera la vista de la Tierra” o la duración de la ventana siguiente.

En pantalla pequeña, el usuario elige día o semana para inspeccionar el detalle; el resumen mensual se mantiene disponible. La interfaz nunca intenta convertir 744 columnas en objetivos táctiles diminutos.

### Datos y metodología: confianza que se pueda comprobar

Quitaría controles de misión de esta vista y usaría una columna cómoda de lectura, índice y bloques de detalle desplegables. Cada fuente indicaría proveedor, versión, fecha de consulta, cobertura, resolución y uso concreto.

Organizaría el contenido en datos de origen, transformaciones, supuestos y limitaciones. “Datos NASA” no debe implicar que NASA validó el modelo, el índice S o la aplicación.

Los comandos y rutas de scripts pasan a una sección para desarrolladores. Para el visitante, la primera explicación debe ser comprensible sin leer código. El glosario contextual define horizonte, azimut, UTC, enlace local y respaldo.

### Visores independientes, descarga, ayuda y errores

Los dos visores y sus comparadores se consolidan gradualmente. Sus cálculos ilustrativos quedan claramente separados durante la transición y se retiran del recorrido principal cuando el comparador común los sustituya.

La ayuda ofrece definiciones al lado de cada término y mantiene un glosario general. Los errores de datos incluyen una acción de recuperación. Si falla WebGL o el módulo 3D, la misma región visual pasa al mapa 2D y conserva selección y controles útiles.

La nueva advertencia de WebGL en las páginas independientes es una mejora. En la revisión del visor incrustado todavía apareció el mensaje de error dentro del marco con 3D seleccionado; el botón 2D permitió continuar. El diseño debe resolver ese estado automáticamente.

La página 404 necesita poco trabajo: conservar identidad y recuperación, ofrecer “Abrir el explorador” y permitir que futuras rutas mantengan contexto cuando sea posible.

## 6. Sistema visual

| Elemento | Propuesta |
|---|---|
| Fondo | Carbón `#101214`. |
| Superficie de contenido | Gris grafito `#191C1F`; elevación secundaria `#22262A`. |
| Texto principal | Marfil `#F2F0E9`. |
| Texto secundario | Gris claro `#B6B8B8`, comprobado contra cada fondo final. |
| Acento | Dorado `#C6A86A`; variante clara `#E2C990`. |
| Datos del Sol / Tierra | Dorado y azul grisáceo `#AEC5D3`, acompañados de etiquetas o trazos distintos. |
| Estados | Verde, ámbar y rojo solo donde codifican una condición; siempre con texto. |
| Tipografía | Una sans legible para interfaz; evaluar una familia menos geométrica que Poppins. Números tabulares en cifras y tablas. |
| Tamaños | Cuerpo 15–16 px; etiquetas habituales 13–14 px; texto auxiliar 12 px. Títulos de página adaptativos. |
| Espaciado | Escala de 4, 8, 12, 16, 24, 32 y 48 px. |
| Esquinas y bordes | Radios moderados; separadores discretos. Cápsulas reservadas a filtros o estados breves. |
| Cristal | Una capa de controles sobre el mapa; fondo suficientemente opaco para conservar legibilidad. |

La identidad necesita consistencia, sin convertir todos los elementos en la misma tarjeta. Las cifras pueden vivir sobre una franja editorial; la tabla requiere anchura; el explorador necesita profundidad; la metodología necesita lectura tranquila.

Evitaría estrellas animadas permanentes, halos extensos, barras sin significado, medidores circulares redundantes, iconos enormes y textos intercambiables con cualquier otro dashboard. El dorado tiene valor cuando señala una acción o selección concreta.

## 7. Gráficas que sí aportan

Ya existen gráficas útiles en el repositorio. La propuesta las reorganiza y completa su explicación.

| Gráfica | Pregunta | Presentación e interacción |
|---|---|---|
| Barras de disponibilidad por sitio | ¿Cuánta luz y Tierra visible hay? | Pequeños gráficos con escala común 0–100 %, horas y valores directos. |
| Barras de duración máxima | ¿Cuál es el mayor tramo adverso continuo? | Escala en horas desde cero; separar sombra e interrupción. |
| Margen sobre el horizonte | ¿Cuándo cruza el Sol o la Tierra el relieve? | Dos líneas, eje en grados, referencia 0°, cursor compartido y etiquetas legibles. |
| Línea de ventanas | ¿Cuándo ocurre cada estado? | Carriles temporales alineados; zoom de periodo y explicación de la hora. |
| Perfil de horizonte | ¿Qué dirección queda obstruida? | Azimut frente a elevación, Sol y Tierra en la hora seleccionada. |
| Cobertura de comunicación | ¿Qué aporta el respaldo? | Directa, solo respaldo y sin comunicación como categorías excluyentes. |

Las categorías de la última gráfica deben sumar el periodo. No se pueden sumar todas las horas de respaldo a las horas directas: pueden coincidir. Con la configuración actual, Malapert muestra Tierra visible durante las 744 h y respaldo disponible durante 418 h; esas 418 h no son 418 horas adicionales de cobertura.

Un calendario de disponibilidad diaria puede añadirse después si las pruebas muestran que ayuda a localizar ventanas. Cada gráfica conserva una alternativa textual o tabla, unidades, periodo y acceso por teclado/tacto. El color nunca es la única señal.

## 8. Responsive por tarea

| Rango orientativo | Comportamiento |
|---|---|
| Escritorio, desde unos 1200 px | Navegación con texto, contenido amplio; panel contextual solo donde aporta valor. Explorar admite escena y ficha lado a lado. |
| Laptop/tablet, aproximadamente 768–1199 px | Navegación compacta; ajustes en panel desplegable; evitar dos columnas si los controles dejan de caber. |
| Móvil, 320–767 px | Resultados y acciones primero, una columna, navegación con texto, configuración bajo demanda y explorador de altura contenida. |

Estos rangos son puntos de partida: los cambios se deciden por el espacio real del contenido. No se reducen letras para conservar una composición de escritorio.

En móvil usaría una barra inferior etiquetada en la implementación final, con espacio reservado para no cubrir contenido ni foco. La maqueta de conversación utiliza navegación superior para que las cinco secciones puedan revisarse dentro del marco.

Objetivos: sin desplazamiento horizontal general a 320 px; controles táctiles principales de al menos 44 × 44 px; entradas de 16 px; nombres completos disponibles; reflujo al ampliar texto; gráficas redibujadas a su ancho real. El objetivo táctil de 44 px es una decisión de diseño del proyecto: WCAG 2.2 AA establece un mínimo de 24 × 24 px con excepciones, no 44 px en todos los casos.

## 9. Movimiento y estados

| Interacción | Comportamiento propuesto |
|---|---|
| Cambiar sitio en el explorador | Transición de cámara de aproximadamente 600–900 ms, interrumpible. |
| Cambiar filtros | Actualizar datos sin desmontar toda la vista; transición breve y consistente. |
| Abrir controles | Despliegue de unos 180–240 ms con foco predecible. |
| Reproducir horas | Inicio voluntario; una pausa visible; detener al ocultarse la pestaña. |
| Movimiento reducido | Cambios instantáneos o mínimos; sin vuelos automáticos. |
| Cargar datos / terreno | Mensaje específico, geometría de página estable y controles dependientes deshabilitados. |
| Error parcial | Mantener resultados disponibles y explicar qué capa falló. |

Las duraciones son una propuesta inicial que debe probarse en dispositivos reales. No pondría animaciones de conteo que sugieran una precisión o un cálculo que no existe. La carga simulada de los comparadores ilustrativos debería desaparecer al unificar el motor.

## 10. Decisiones de CTO

### Evolucionar la base que ya funciona

El proyecto estático con módulos JavaScript, Three.js, esbuild y datos preparados puede sostener esta experiencia. No hay una necesidad demostrada de migrarlo entero a otro framework ni de añadir un servidor para rediseñar las vistas.

Propongo un estado común de aplicación, cálculos puros reutilizables, componentes de vista separados y un contrato único para datos, unidades, fechas, fuentes y supuestos. La caché de series existente es un buen punto de partida.

El explorador debe convertirse en un módulo común cargado bajo demanda. Consolidar las dos generaciones de Three.js y eliminar la dependencia del Tailwind Play CDN en producción reduce diferencias de estilo, carga y mantenimiento. Los enlaces antiguos pueden abrir ese módulo en modo pantalla completa.

### La recomendación depende de la validez del modelo

Los cambios recientes corrigen cobertura a 744 horas, validación de fechas y varios controles de escenario. También añaden CI y mejoran los scripts. Son avances que deben conservarse.

Persisten asuntos que afectan a cómo se presenta una conclusión: `calcularSerie()` sigue reutilizando las direcciones del lander para el punto de apoyo, y la línea de vista local sigue comparándose contra el horizonte lejano. Deben revisarse los marcos locales y el trayecto finito entre antenas antes de elevar el respaldo a recomendación principal.

La experiencia debe distinguir **datos de origen**, **resultados del modelo**, **supuestos** y **validación realizada**. Una badge de “validado” solo puede referirse a una verificación concreta. No incorporaría una puntuación de confianza inventada.

### Rendimiento, publicación y consistencia

Priorizar contenido y datos esenciales. Cargar texturas y motor 3D al entrar al explorador, ajustar resolución al dispositivo y limitar el trabajo de render cuando nada cambia. Mantener la alternativa 2D como parte de la misma experiencia.

Generar web y HTML autónomo desde la misma fuente y el mismo conjunto de datos; incorporar identificador de versión. Cada actualización de imágenes o datos debe producir y verificar todos sus derivados. El CSV debe incluir periodo, UTC, configuración y procedencia para poder interpretar los resultados fuera de la aplicación.

Metas de experiencia: **LCP ≤ 2,5 s, INP ≤ 200 ms y CLS ≤ 0,1** en el percentil 75, separando móvil y escritorio cuando existan mediciones reales. Son metas propuestas, no resultados medidos en esta revisión. Las pruebas de laboratorio ayudan a detectar regresiones y no sustituyen las mediciones de usuarios.

## 11. Implementación con Kaizen

| Incremento | Entregable | Criterio para cerrarlo |
|---|---|---|
| 1. Orden y lenguaje | Navegación etiquetada, estado común, títulos de vista, Resumen y layout responsive | Una persona identifica sitio, periodo y tres resultados sin buscar entre controles; contexto conservado al navegar. |
| 2. Comparación y tiempo | Barras, tabla adaptable, un reproductor y estados con causas | Comparar tres sitios y encontrar una interrupción sin ayuda; cifras y exportación coinciden. |
| 3. Explorador unificado | Globo y relieve integrados, selección sincronizada, cámara y alternativa 2D | Funciona con ratón, teclado y tacto; un fallo de 3D no impide analizar. |
| 4. Confianza y acabado | Correcciones del modelo, fuentes claras, rendimiento, offline y pruebas de dispositivos | Resultados trazables, límites explícitos y mismos datos entre todas las versiones. |

La revisión del modelo de relevo debe empezar desde el primer incremento; es una dependencia para destacar respaldo e índice S, aunque su cierre técnico aparezca en el último bloque.

Después de cada incremento: probar tres tareas con unas cinco personas del público objetivo, observar dónde se detienen, corregir la principal fricción y repetir. No presentar esa muestra pequeña como una validación estadística.

Tareas sugeridas: comparar Shackleton y Malapert; encontrar un periodo sin Tierra visible; explicar la diferencia entre enlace local y respaldo hacia la Tierra. Objetivos iniciales de producto: al menos cuatro de cinco personas completan cada tarea sin intervención y pueden decir qué representa la cifra que usaron.

## 12. Criterios de aceptación

- Revisar 320, 375, 390, 768, 1024, 1280, 1440 y 1920 px, además de Android Chrome e iOS Safari reales.
- Comprobar ampliación de texto, navegación con teclado, foco visible, orden de lectura y anuncios de cambios sin saturación.
- Objetivo WCAG 2.2 AA: contraste, reflujo, nombres accesibles, controles operables y alternativas de gráficas; no declarar conformidad hasta completar la revisión.
- Comprobar carga lenta, datos ausentes, periodo vacío, error de módulo, WebGL no disponible y pérdida de contexto gráfico.
- Verificar persistencia de sitio y periodo al cambiar de vista, usar atrás/adelante y abrir un enlace directo.
- Comparar cifras del Resumen, gráficas, tabla y CSV con la misma configuración.
- Validar el archivo autónomo con red deshabilitada y apertura local real.
- Mantener pruebas de cálculo y añadir pruebas de recorridos y regresiones visuales que cubran estos riesgos concretos.

## 13. Alcance de la maqueta entregada

La propuesta visual permite recorrer las cinco secciones, cambiar entre los tres sitios, comparar barras y seleccionar una hora en las ventanas. Reutiliza cifras calculadas con el modelo del commit revisado y el relieve existente del proyecto.

El periodo de esta maqueta es fijo: diciembre de 2026. El mapa es 2D; el vuelo de cámara, las fechas editables, la exportación y el motor de enlace completo pertenecen a la implementación propuesta. No modifica el repositorio remoto.

Verificación de la maqueta: navegación por las cinco secciones a 320 px sin desbordamiento horizontal general; revisión visual a 390 y 1024 px; cambio de sitio con actualización de cifras; selección de la última hora mediante teclado; imágenes cargadas y JavaScript comprobado sintácticamente. Estas comprobaciones corresponden al concepto de interfaz, no a una certificación de la futura aplicación.

## Referencias de revisión

- Código y rutas: [repositorio en la versión de interfaz revisada](https://github.com/cubillas598-cpu/Pagina-NASA/tree/f99ae00c7e1f032c7a2fd0a2f5ddc547260e0849).
- [WCAG 2.2, referencia rápida](https://www.w3.org/WAI/WCAG22/quickref/).
- [WCAG 2.2: reflujo](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).
- [WCAG 2.2: tamaño mínimo de objetivos](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum).
- [Web Vitals: métricas y umbrales](https://web.dev/articles/vitals).

La composición, navegación, selección de gráficas y prioridades son recomendaciones de diseño y arquitectura derivadas de esta revisión; las referencias anteriores fundamentan los criterios de accesibilidad y medición.
