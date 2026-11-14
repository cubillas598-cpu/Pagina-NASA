# Guion de pitch para estudiar - Irvin

Documento de estudio, 3 minutos de presentacion en vivo mañana. Version completa
y fuentes en `docs/guion-pitch-3min.md` de este repo.

## La idea en una frase

Elegir DONDE aterrizar en la Luna importa tanto como llegar - y nuestro equipo
encontro y corrigio un error real propio mientras lo demostraba.

## Los 4 pasos (memoriza el orden, no cada palabra)

| # | Paso | En una frase | Tiempo |
|---|---|---|---|
| 1 | Hook | La pregunta: ¿y si el exito depende de DONDE, no de SI? | 12-15 s |
| 2 | Problema | Polo sur: Sol y Tierra casi en el horizonte, 3 sitios reales comparados | 30-40 s |
| 3 | Solucion + crisis | El bug de Shackleton, como se corrigio, el diferenciador RF/optico, el indice S | 40-50 s |
| 4 | Cierre | No buscamos prototipo perfecto, buscamos rigor. Llamado a la accion | 15-20 s |

La parte 3 es la mas larga y la mas importante: es la historia real, no se
apresura.

---

## Guion completo, para leer en voz alta

### 1. Hook (12-15 s)

"Hola, somos el equipo buhospace, estudiantes de Hermosillo. ¿Y si el exito de
una mision lunar no dependiera solo de llegar a la Luna, sino de elegir
exactamente donde aterrizar? Imaginen invertir años de investigacion y
tecnologia para llegar a nuestro satelite, y descubrir despues que el lugar
elegido no tiene suficiente luz solar o que se pierde la comunicacion con la
Tierra. Creemos que encontramos algo que casi nadie mas en este reto esta
viendo."

### 2. Problema (30-40 s)

"En el polo sur de la Luna, el Sol y la Tierra casi rozan el horizonte. Una
cresta de solo unos grados de altura decide si un lander tiene energia,
comunicacion con la Tierra, las dos cosas, o ninguna. Nuestro proyecto compara
3 sitios reales candidatos de aterrizaje: la region de Shackleton, la cresta
de Gerlache, y Malapert, usando datos reales de la NASA: efemerides de JPL
Horizons, y el relieve real del terreno de LOLA. No inventamos nada:
validamos nuestros calculos a mano contra la herramienta oficial de la NASA,
y coincidieron hasta la sexta cifra decimal."

### 3. Solucion, con la historia del error (40-50 s)

"Y aqui hay algo que de verdad nos paso, no es un cuento inventado para la
presentacion: al calcular el horizonte de uno de los sitios, el numero no
cuadraba. Investigamos, y resulta que la coordenada que habiamos usado estaba
en el fondo del crater Shackleton, no en su borde. Ahi nunca llega el Sol. Lo
corregimos con literatura cientifica real, y con eso encontramos algo mas: el
radio que usabamos para calcular el horizonte tambien se quedaba corto. Lo
subimos, y el calculo cambio varios grados en los sitios mas importantes. Ese
error real, encontrado y corregido con el mismo rigor que exigiria una mision
de verdad, es la base de nuestro diferenciador: una capa de enlace local de
respaldo, por radiofrecuencia o por laser optico, para cuando el enlace
directo a la Tierra se pierde. Resumimos todo en un solo numero, el indice de
conveniencia, que le dice a un planificador de mision, de un vistazo, cual de
los tres sitios es mejor. Hoy ese numero dice que Malapert es el mejor
candidato, con casi iluminacion y comunicacion constante."

### 4. Cierre (15-20 s)

"No buscamos tener un prototipo terminado. Buscamos demostrar que podemos
trabajar con datos reales de la NASA, encontrar nuestros propios errores, y
corregirlos con rigor. Una mision lunar no empieza cuando el cohete despega de
la Tierra: empieza mucho antes, cuando elegimos donde queremos llegar. Eso es
lo que les ofrecemos: no una idea bonita en el papel, sino un equipo que ya
demostro que sabe validar lo que construye. ¿Les gustaria conocer mas
detalles y explorar como podemos colaborar? Somos el equipo de Lunar Landing
Site Navigator. Gracias."

---

## Preguntas que te puede hacer el jurado (y la respuesta corta)

- **"¿Por que confiar en sus datos?"** -> Validamos a mano contra la
  herramienta oficial de JPL Horizons, coincidencia exacta a 6 decimales.
- **"¿Que tan real es el enlace RF/optico?"** -> Es un modelo propuesto por el
  equipo con categorias (rapido/robusto/sin enlace), con precedentes reales de
  NASA (LunaNet, Artemis II), no un dato medido.
- **"¿Malapert siempre gana?"** -> No, el indice S depende del periodo que se
  compare; hoy con los pesos actuales Malapert va primero.

## Apoyo visual

- Capturas reales de la demo: `docs/capturas/`
- Imagen de los 3 crateres: `docs/imagenes/sitios-shackleton-de-gerlache-shoemaker.jpeg`
- Deck en Canva (en progreso): ver mensaje de WhatsApp del equipo
