# Plan 001 — Mapa de calor de las últimas 12 semanas

- **Estado:** implementado y verificado el 5 de noviembre de 2026. Spec aprobada y tareas T001–T033 cerradas.
- **Base:** `docs/constitution.md` y `specs/001-heat-map/spec.md`.
- **Regla:** este plan describe el cómo. El qué y el porqué siguen en la spec.
- **Restricción:** no se añaden dependencias, build, red ni módulos ES. La aplicación sigue abriéndose con doble clic.

## 0. Decisiones cerradas que resolvieron las dudas abiertas

Estas decisiones se trasladaron a la spec antes de implementar, para cumplir el principio 2 de la constitución («la spec manda»). La columna «Acción en spec» queda como registro de lo aplicado.

| Tema | Decisión del plan | Motivo | RF afectados | Acción en spec |
| --- | --- | --- | --- | --- |
| Ventana temporal | 12 semanas completas, de lunes a domingo; la última es la semana actual y termina el domingo, aunque haya días futuros. | Mantiene 84 casillas estables y coincide con la semana natural del proyecto. | RF-2, RF-5 | Aclarar que «últimas 12 semanas» incluye el resto de la semana actual y corregir RF-2.4: con hoy 5/11/2026 el periodo acaba el 8/11/2026, no el 22/11/2026 (eso serían 14 semanas). |
| Denominador del resumen | Siempre 84 días. | Es el tamaño real de la ventana y evita que el denominador cambie cada día. | RF-8 | Cerrar la duda 2 con el denominador fijo y aclarar que RF-8.1 «periodo transcurrido» se refiere a la ventana completa, no solo a los días vividos. |
| Sesiones con 0 minutos o minutos inválidos | Se ignoran para el mapa, el detalle y el resumen; no se borran ni se modifican. | La intensidad se basa en minutos; una sesión sin minutos no puede tener nivel. Los datos siguen intactos. | RF-3.3, RF-6, RF-8 | Cerrar la duda 4: no cuentan como día estudiado en el mapa. |
| Etiquetas de mes | Sí. Abreviaturas `ene`…`dic`, como máximo una por columna: la primera semana y toda semana que contenga el día 1. Si la primera semana contiene el día 1, se etiqueta con el mes nuevo. | Permite orientarse sin abrir el detalle y sin añadir navegación. | RF-10 | Cerrar la duda 1 con una etiqueta por columna. |
| Tamaño táctil en 320 px | Se mantienen las 12 semanas y se usan celdas compactas con separación de 24 px entre centros; en ≤370 px el bloque usa el ancho completo de la hoja. | Permite cumplir el espacio de 24 px de WCAG 2.2 sin scroll horizontal ni reducir semanas. | RF-12, NFR-6 | Cerrar la duda 3: se descarta «menos semanas con navegación». |
| Día de hoy | Se marca con un punto interior y `aria-current="date"`, además de su nivel. | Orienta dentro de la última semana sin depender solo del color. | RF-2, RF-10, RF-11 | Cerrar la duda 5. |
| Etiquetas de la leyenda | «Sin sesión», «Menos de 30 min», «De 30 a menos de 60 min», «De 60 a menos de 120 min», «120 min o más»; se añade una nota para «Día futuro». | RF-4 admite decimales desde 0 y RF-7.3 habla de «1 a 29», lo que se contradice con 0,5, 29,9, 59,9 o 119,9. | RF-4, RF-7 | Corregir RF-7.3, cerrar los intervalos con «menos de» y añadir la nota de futuro. |
| Cierre del detalle táctil | Tocar otra casilla o fuera del mapa lo cambia/cierra; tocar la misma casilla lo cierra. | RF-6.3 y RF-12.3 describen cierres distintos; se adopta un único modelo. | RF-6, RF-12 | Unificar RF-6.3 y RF-12.3. |
| Teclado | Un solo punto de tabulación; flechas para moverse; `Inicio`/`Fin` a la primera/última semana de la fila; sin wrap. | Cumple RF-11.2 sin 84 paradas de tabulación. | RF-11 | Aclarar que «enfocable» significa enfocable por programa/flechas, no por Tab. |
| Información accesible | El nombre accesible de cada casilla incluye fecha, minutos, sesiones y nivel; el panel de detalle es complementario y no es la única fuente. | Evita depender del color o del panel emergente. | RF-6, RF-11 | Aclarar RF-11.4. |
| Orden de la lista | La lista se ordena por fecha descendente; entre sesiones del mismo día, la nueva queda primero y las existentes conservan su orden relativo. | RF-9.5 no puede impedir que la lista se actualice al guardar, y el usuario espera ver arriba lo último que registró. | RF-9, RF-13 | Aclarar RF-9.5. |
| Teclado y detalle | El detalle se muestra al enfocar; se oculta al salir del mapa. Escape lo oculta sin mover el foco. | Evita un panel pegado y da salida a teclado. | RF-6, RF-11 | Concretar el ciclo de vida del detalle. |

## 1. Archivos y responsabilidades

| Archivo | Acción | Responsabilidad | RF |
| --- | --- | --- | --- |
| `index.html` | Modificar | Añadir la sección del mapa entre el resumen de métricas y el formulario: título, resumen textual, contenedor de meses, días y cuadrícula, panel de detalle, leyenda y mensaje de estado vacío. No tocar el formulario ni la lista. | RF-1, RF-5, RF-6, RF-7, RF-8, RF-10, RF-11, RF-12 |
| `styles.css` | Modificar | Estilos del mapa: cuadrícula, escala de tinta, trama de días futuros, punto de hoy, foco, panel de detalle, leyenda, etiquetas de mes y adaptación a 320–1440 px. Reutilizar los tokens existentes. | RF-4, RF-5, RF-6, RF-7, RF-10, RF-11, RF-12 |
| `app.js` | Modificar | Sacar el acceso al DOM de la carga inicial para poder importar el archivo en Node; añadir funciones puras del mapa; añadir el renderizado y los eventos; hacer que las métricas existentes reciban `hoy`; exportar condicionalmente para tests. | RF-2 a RF-13, NFR-9 |
| `app.test.js` | Crear | Tests de las funciones puras con `node --test`. No se carga desde `index.html`; no forma parte del runtime. | NFR-9, criterios de finalización 4 |
| `specs/001-heat-map/plan.md` | Crear | Este documento. | — |
| `MEMORY.md` | Modificar al terminar | Estado, decisiones y aprendizajes. | Criterio de finalización 10 |

No se crean archivos de lógica separados. La restricción de tres archivos de runtime se mantiene; el archivo de tests es la excepción que exige el principio 4 de la constitución y no se sirve al navegador.

## 2. Funciones puras y contratos

Todas las funciones de cálculo reciben `today` como `Date` en hora local cuando dependen de la fecha. Ninguna toca DOM, `localStorage`, red ni relojes internos. No mutan las sesiones de entrada. Las claves de fecha se generan con `fechaParaInput` (componentes locales), nunca con `toISOString()` ni `new Date("AAAA-MM-DD")`.

| Función | Entrada → salida | Responsabilidad | RF |
| --- | --- | --- | --- |
| `addDays(date, days)` | `Date`, número → `Date` | Sumar días con el constructor local `(año, mes, día + n)`. | RF-2, RF-5 |
| `buildPeriod(today, weeks = 12)` | `Date`, número → `{ start, end, startKey, endKey }` | Lunes de la semana actual menos 11 semanas; 84 días hasta el domingo actual. | RF-2 |
| `isRealDateKey(key)` | texto → booleano | Validar `AAAA-MM-DD` y que la fecha exista en el calendario local (rechaza `2026-02-30`). | RF-3, NFR-4 |
| `normalizeSession(session)` | objeto → `{ date, topic, minutes }` o `null` | Reescribir `normalizarSesion`: devolver `null` si no es un objeto; acepta `date/topic/minutes` y `fecha/tema/minutos`. | RF-3, NFR-3, NFR-4 |
| `parseMinutes(value)` | cualquiera → número o `null` | Aceptar números y cadenas numéricas; exigir finito y mayor que 0. Rechazar `NaN`, `Infinity`, `null`, booleanos y vacíos. | RF-3.3 |
| `roundMinutes(value)` | número → número | Redondear a 2 decimales para absorber ruido binario en sumas y mantener coherencia entre nivel y texto. | RF-4, RF-6, RF-8 |
| `groupSessionsByDay(sessions)` | lista → `Map<clave, { minutes, sessionCount }>` | Normalizar, validar y agrupar por día; suma minutos y cuenta sesiones válidas. | RF-3, RF-8.5 |
| `getHeatLevel(minutes)` | número → `0…4` | 0 si no hay minutos; 1 si >0 y <30; 2 si ≥30 y <60; 3 si ≥60 y <120; 4 si ≥120. | RF-4 |
| `buildHeatmap(sessions, today, weeks = 12)` | lista, `Date`, número → modelo | Orquestador puro: periodo, 84 días, niveles, futuro, hoy, resumen y etiquetas de mes. | RF-2, RF-3, RF-4, RF-5, RF-8, RF-10, RF-13 |
| `summarizeHeatmap(days)` | lista de días → `{ daysWithSessions, minutes, totalDays }` | Contar días únicos no futuros con minutos >0 y sumar minutos; `totalDays` = número de días del mapa (84 con 12 semanas). | RF-8 |
| `getMonthLabels(period)` | periodo → `[{ weekIndex, text }]` | Asignar como máximo una etiqueta por columna: primera semana y semanas con día 1; si coinciden, manda el mes del día 1. | RF-10 |
| `formatMonthShort(date)` | `Date` → texto | Devolver `ene`, `feb`, `mar`, `abr`, `may`, `jun`, `jul`, `ago`, `sep`, `oct`, `nov` o `dic` desde una lista fija, sin depender del locale. | RF-10 |
| `formatDayDetail(day)` | día → texto | Fecha completa + minutos + sesiones; «Sin sesiones»; «Día futuro». Singular/plural. | RF-6, RF-5.4 |
| `getAccessibleDayLabel(day)` | día → texto | Nombre accesible con día de la semana, fecha, minutos, sesiones y nivel; estados sin sesión/futuro. | RF-11.1 |
| `formatSummary(summary)` | resumen → texto | «X de N días con sesiones · Y min», con N = `summary.totalDays` (84) y formato español. | RF-8 |
| `getInitialFocusKey(days, todayKey)` | días, clave → clave | Devolver la casilla de hoy para el punto de tabulación inicial. | RF-11.2 |

Funciones existentes que se conservan y se ajustan:

| Función | Cambio | Motivo | RF |
| --- | --- | --- | --- |
| `calcularRacha(sessions, today)` | Recibir `sessions` y `today`; el DOM pasa `sesiones` y `new Date()`. | Hacerla pura y testeable; no lee estado global ni el reloj. | RF-13, NFR-9 |
| `calcularMinutosSemana(sessions, today)` | Recibir `sessions` y `today`. | Misma razón; conserva el comportamiento actual. | RF-13, NFR-9 |
| `calcularDiasMes(sessions, today)` | Recibir `sessions` y `today`. | Misma razón; conserva el comportamiento actual. | RF-13, NFR-9 |
| `normalizarSesion` → `normalizeSession` | Renombrar, hacer null-safe y actualizar `cargarSesiones` y `groupSessionsByDay`. | Un solo normalizador para carga y mapa; evita duplicar la compatibilidad con `{fecha,tema,minutos}`. | RF-3, NFR-3, NFR-4 |
| `inicioDeSemana`, `fechaParaInput`, `formatearFecha`, `formatearMinutos` | Sin cambio de comportamiento. | Reutilización exigida por AGENTS y la spec. | RF-2, RF-3, RF-6, RF-13 |

### Modelo que devuelve `buildHeatmap`

- `period`: `start`, `end`, `startKey`, `endKey`.
- `days`: 84 elementos, en orden de lunes a domingo dentro de cada semana, de la semana más antigua a la actual.
- Cada día: `key`, `date`, `minutes`, `sessionCount`, `level` (0–4 o `null` si es futuro), `isFuture`, `isToday`.
- `summary`: `daysWithSessions`, `minutes`, `totalDays` (84 con 12 semanas).
- `monthLabels`: `weekIndex` y texto corto del mes.
- `sessionCount` cuenta solo sesiones válidas con minutos >0. Los días futuros no aportan al resumen.

## 3. Algoritmo del mapa

```text
FUNCIÓN buildHeatmap(sessions, today, weeks = 12)
  period ← buildPeriod(today, weeks)
  todayKey ← fechaParaInput(today)
  totals ← groupSessionsByDay(sessions)
  days ← lista vacía
  monthLabels ← getMonthLabels(period)

  PARA i DESDE 0 HASTA 83
    date ← addDays(period.start, i)
    key ← fechaParaInput(date)
    stats ← totals.get(key) O { minutes: 0, sessionCount: 0 }
    isFuture ← key > todayKey
    isToday ← key = todayKey
    SI isFuture
      level ← null
    SINO
      level ← getHeatLevel(stats.minutes)
    FIN SI
    days.añadir({ key, date, minutes: stats.minutes,
                  sessionCount: stats.sessionCount,
                  level, isFuture, isToday })
  FIN PARA

  summary ← summarizeHeatmap(days)
  DEVOLVER { period, days, summary, monthLabels }
FIN FUNCIÓN
```

```text
FUNCIÓN buildPeriod(today, weeks)
  monday ← inicioDeSemana(today)
  start ← addDays(monday, -7 * (weeks - 1))
  end ← addDays(start, 7 * weeks - 1)
  DEVOLVER { start, end,
             startKey: fechaParaInput(start),
             endKey: fechaParaInput(end) }
FIN FUNCIÓN
```

```text
FUNCIÓN groupSessionsByDay(sessions)
  totals ← Map vacío
  PARA CADA session EN sessions
    normalizada ← normalizeSession(session)
    SI normalizada = null ENTONCES CONTINUAR
    SI NO isRealDateKey(normalizada.date) ENTONCES CONTINUAR
    minutes ← parseMinutes(normalizada.minutes)
    SI minutes = null ENTONCES CONTINUAR
    actual ← totals.get(normalizada.date) O { minutes: 0, sessionCount: 0 }
    actual.minutes ← roundMinutes(actual.minutes + minutes)
    actual.sessionCount ← actual.sessionCount + 1
    totals.set(normalizada.date, actual)
  FIN PARA
  DEVOLVER totals
FIN FUNCIÓN
```

```text
FUNCIÓN summarizeHeatmap(days)
  daysWithSessions ← 0
  totalMinutes ← 0
  PARA CADA day EN days
    SI day.isFuture ENTONCES CONTINUAR
    SI day.minutes > 0 ENTONCES
      daysWithSessions ← daysWithSessions + 1
      totalMinutes ← totalMinutes + day.minutes
    FIN SI
  FIN PARA
  DEVOLVER { daysWithSessions,
             minutes: roundMinutes(totalMinutes),
             totalDays: days.length }
FIN FUNCIÓN
```

```text
FUNCIÓN getHeatLevel(minutes)
  SI minutes ≤ 0 ENTONCES DEVOLVER 0
  SI minutes < 30 ENTONCES DEVOLVER 1
  SI minutes < 60 ENTONCES DEVOLVER 2
  SI minutes < 120 ENTONCES DEVOLVER 3
  DEVOLVER 4
FIN FUNCIÓN
```

```text
FUNCIÓN getMonthLabels(period)
  labels ← lista vacía
  PARA weekIndex DESDE 0 HASTA 11
    monday ← addDays(period.start, weekIndex * 7)
    firstOfMonth ← null
    PARA d DESDE 0 HASTA 6
      date ← addDays(monday, d)
      SI date.getDate() = 1 ENTONCES firstOfMonth ← date
    FIN PARA

    SI weekIndex = 0 Y firstOfMonth = null ENTONCES
      labels.añadir({ weekIndex, text: formatMonthShort(monday) })
    SINO SI firstOfMonth ≠ null ENTONCES
      labels.añadir({ weekIndex, text: formatMonthShort(firstOfMonth) })
    FIN SI
  FIN PARA
  DEVOLVER labels
FIN FUNCIÓN
```

Reglas del algoritmo:

- La comparación de fechas usa claves `AAAA-MM-DD`, que ordenan lexicográficamente por ser zero-padded. No se comparan `Date` entre sí para decidir futuro.
- `addDays` usa componentes locales; el cambio de hora no duplica ni elimina claves.
- El resumen cuenta días, no sesiones. Varias sesiones del mismo día suman minutos y cuentan una sola vez.
- Las sesiones futuras se agrupan, pero no colorean ni suman; las casillas futuras siempre tienen `level = null`.
- Las sesiones con 0 minutos, negativas, no finitas o con fecha inválida se ignoran sin modificar la lista original.
- `today` se captura en cada render. No hay temporizador: si la página cruza medianoche sin recargar ni guardar, el mapa no cambia; al guardar o recargar se recalcula con la fecha actual. (Decisión que concreta el caso límite de la spec.)
- El orden de las 84 casillas es: semana 0 lunes a domingo, semana 1 lunes a domingo, …, semana 11 lunes a domingo.

## 4. Interfaz y pintado

### 4.1. Ubicación

- La sección se inserta después del bloque de resumen (racha, semana y mes) y antes del formulario de nueva sesión. Así el usuario ve su constancia antes de registrar y no se altera el flujo de alta. (RF-1)
- La sección tiene título propio «Últimas 12 semanas» y un resumen textual. No sustituye ni oculta racha, contadores, formulario o lista. (RF-1.4, RF-13.1)
- Se mantiene una sola página y el diseño de hoja; no se añaden tarjetas flotantes. (NFR-1, NFR-7)

### 4.2. Estructura de la sección

- Cabecera: título, resumen del periodo y mensaje de estado vacío cuando no hay días válidos. (RF-1, RF-8)
- Contenedor del mapa con tres piezas alineadas: fila de etiquetas de mes, columna de iniciales de días y cuadrícula de 7 filas por 12 columnas. (RF-10)
- Cuadrícula semántica: contenedor con rol de rejilla, etiqueta accesible con el periodo, 7 filas y 84 celdas; cada celda representa un día y contiene su nombre accesible. (RF-11.1)
- Panel de detalle fijo debajo de la cuadrícula, con altura reservada para no mover el resto de la página. No es un tooltip flotante. (RF-6.6)
- Leyenda debajo del panel: cinco estados y una nota separada para «Día futuro». (RF-7)
- El mensaje de vacío se muestra entre el resumen y la cuadrícula, sin ocultar la cuadrícula ni la leyenda. (RF-1.3)

### 4.3. Cuadrícula, meses y días

- 12 columnas de semanas y 7 filas de días; lunes arriba y domingo abajo. (RF-2.1, RF-10.1)
- Las etiquetas de día son `L`, `M`, `X`, `J`, `V`, `S`, `D`, en una columna estrecha a la izquierda. (RF-10.1)
- Las etiquetas de mes se colocan sobre las columnas con esta regla única: (RF-10.3)
  1. Cada columna recibe como máximo una etiqueta.
  2. Recibe etiqueta la primera columna del periodo y toda columna que contenga el día 1 de un mes.
  3. Si la primera columna contiene el día 1, se etiqueta con el mes de ese día 1, no con el mes de su lunes.
  4. Cada etiqueta se limita al ancho de su columna y se centra. Si el texto ampliado no cabe, se recorta visualmente antes que invadir la columna contigua; la fecha completa de la celda y el detalle conservan la información.
- Con esta regla nunca hay dos etiquetas en la misma columna: el día 1 solo puede caer en una semana y esa semana recibe una única etiqueta. (RF-10.3)
- Las etiquetas de mes son visuales; la fecha completa de cada celda y la etiqueta accesible del mapa contienen la información equivalente. (RF-10.3, RF-11.1)
- La fila de meses y la cuadrícula comparten la misma plantilla de columnas y separación para que no se desalineen. (RF-10.2)

### 4.4. Escala visual

- Estado sin sesión: fondo de papel y borde fino visible; no usa ningún nivel. (RF-4.8)
- Niveles 1 a 4: escala monótona de tinta, de muy claro a muy oscuro, sobre el papel. El nivel 4 es el más intenso. (RF-4.7, RF-4.8)
- La escala debe seguir siendo distinguible en grises: la diferencia es de luminosidad, no solo de tono. (RF-4.7, NFR-6)
- Día futuro: trama diagonal tenue sobre papel, distinta del estado vacío y de cualquier nivel. No recibe color de nivel. (RF-5.1, RF-5.2)
- Hoy: punto interior de 3 px en una esquina, además de su nivel y de `aria-current="date"`. No sustituye al foco. (RF-2.2, RF-10)
- Foco: contorno sólido de 2 px con separación de 1 px; visible sobre cualquier nivel y sobre la trama. (RF-11.3)
- Sin animaciones ni transiciones en el mapa. (NFR-10)

### 4.5. Detalle y interacción

- El panel muestra: fecha completa, minutos totales y número de sesiones. Ejemplo: «5 de noviembre de 2026 · 90 min · 2 sesiones». (RF-6.1, RF-6.5)
- Sin sesiones válidas: «5 de noviembre de 2026 · Sin sesiones». (RF-6.2)
- Día futuro: «5 de noviembre de 2026 · Día futuro»; no muestra minutos ni sesiones. (RF-5.4)
- Ratón: al entrar en una celda se muestra el detalle; al salir del mapa se oculta si no está fijado. (RF-6.1)
- Toque: al tocar se fija el detalle; tocar otra celda lo cambia; tocar fuera del mapa o la misma celda lo cierra. (RF-6.3, RF-12.3)
- Teclado: al enfocar una celda se muestra el detalle; al salir del mapa se oculta; Escape lo oculta sin mover el foco. (RF-6.4)
- El panel no tapa la celda, no se corta en los bordes y no provoca desplazamiento porque vive debajo de la cuadrícula con altura reservada. (RF-6.6)
- El detalle es informativo: no registra, edita ni elimina sesiones. (RF-6, fuera de alcance)

### 4.6. Teclado

- Al cargar, solo la celda de hoy tiene `tabindex="0"`; el resto tiene `-1`. Si hoy no estuviera en la ventana, se usa la última celda pasada. (RF-11.2)
- Flechas arriba/abajo: día anterior/siguiente dentro de la misma semana (misma columna). Flechas izquierda/derecha: mismo día de la semana (misma fila), semana anterior/siguiente. (RF-11.2)
- `Inicio` y `Fin`: primera y última semana de la fila actual. (RF-11.2)
- En los bordes no hay wrap: el foco se queda en la casilla límite. (RF-11.2)
- Al mover el foco con flechas, con clic o con toque se actualiza el `tabindex` (la celda enfocada pasa a `0` y el resto a `-1`) y el detalle se actualiza por el evento de foco. Un único punto de tabulación en todo momento. (RF-6.4, RF-11.2)
- No se usan las flechas para desplazar la página; el manejador solo actúa dentro de la rejilla. (RF-11.2)

### 4.7. Semántica accesible

- La rejilla tiene nombre accesible con el periodo completo, por ejemplo «Mapa de calor del 17 de agosto al 8 de noviembre de 2026». (RF-11.1)
- Cada celda tiene un nombre accesible con día de la semana, fecha, minutos, número de sesiones y nivel. Sin sesión: «… sin sesiones». Futuro: «… día futuro». (RF-11.1, RF-11.4)
- Las iniciales de días y las etiquetas de mes son visuales y no duplican la información en el lector de pantalla; la fecha y el día ya están en cada celda. (RF-10, RF-11.1)
- El resumen textual tiene `aria-live="polite"` para anunciar cambios tras guardar. El panel de detalle no es una región viva para no repetir lo que ya anuncia el nombre de la celda. (RF-11.5)
- La leyenda tiene etiquetas textuales y nombres accesibles con los rangos; no depende solo del color. (RF-7.4, NFR-6)
- El foco visible se comprueba con teclado y con contraste; el punto de hoy no es la única señal de la fecha actual. (RF-11.3)

### 4.8. Responsive

- Escritorio: celdas de 24 px con 6 px de separación; el mapa ocupa unos 372 px y queda dentro de la hoja. (RF-12)
- Móvil: celdas de 18–20 px con separación variable, manteniendo 24 px entre centros de celdas contiguas. Así se cumple la excepción de espaciado de WCAG 2.2 para objetivos menores de 24 px. (RF-12.2, NFR-6)
- La anchura total del mapa móvil es 300 px, constante, porque la suma de celda, hueco y etiqueta de día se compensa. (RF-12.1)
- En ≤370 px el bloque del mapa usa el ancho completo de la hoja mediante márgenes negativos; el fondo de papel cubre la línea de margen solo en esa franja. El resto de la página no cambia. (RF-12.1)
- En 375 px el mapa ya cabe dentro del contenido normal sin márgenes negativos. (RF-12.1)
- Sin scroll horizontal en ninguna anchura entre 320 y 1440 px. (RF-12.4, NFR-7)
- El panel de detalle y la leyenda pueden envolver texto; no se recorta ni se solapa. (RF-6.6, RF-12)
- Zoom al 200 % y reflujo a 320 CSS px: el mapa mantiene la cuadrícula, el detalle y la leyenda; se comprueba también al 400 %. (RF-11.6, NFR-6)

### 4.9. Actualización y estados

- Al cargar, se construye el modelo con `new Date()` y se pinta todo. (RF-1.1, RF-9.4)
- Al guardar una sesión, se vuelve a ejecutar `mostrarTodo`; el mapa y el resumen se recalculan con la fecha actual y los datos recién guardados. (RF-9.1)
- Sesión fuera del periodo o futura: el modelo no cambia visualmente; la lista sigue mostrando la sesión como hoy. (RF-9.2, RF-9.3)
- Sin días válidos en el periodo: se muestran las 84 casillas, la leyenda y el mensaje «Aún no hay sesiones en estas 12 semanas. Registra la primera para empezar a llenar el mapa.». Resumen a cero. (RF-1.3, RF-8.4)
- Datos ilegibles o inválidos: el mapa se construye con las sesiones válidas que se puedan normalizar; no se borra nada ni se muestra un error en consola. (NFR-4)
- La página abierta al cruzar medianoche no se actualiza sola; al recargar o guardar se recalcula el periodo y el estado de hoy. (Caso límite de la spec)

### 4.10. No regresión

- La racha, los minutos de la semana, los días del mes y la lista se siguen pintando con las mismas funciones, ahora con `sesiones` y `today` explícitos. (RF-13.1)
- El formulario, la validación manual, los mensajes en español y el orden de la lista no cambian. (RF-9.5, fuera de alcance)
- El formato de datos y la migración de la primera versión no se tocan. (NFR-3)

## 5. Decisiones técnicas y alternativas descartadas

| Decisión | Justificación | Alternativa descartada | RF |
| --- | --- | --- | --- |
| Lógica pura dentro de `app.js` | Mantiene tres archivos de runtime y permite tests sin navegador con exportación condicional. | `logic.js` separado: añade un cuarto archivo de runtime y más superficie global; los módulos ES no funcionan con doble clic. | NFR-1, NFR-9 |
| Importación condicional para tests | `node --test` puede requerir `app.js` sin ejecutar DOM si la inicialización está guardada por `typeof document`. | Cargar `app.js` con una emulación de DOM: más frágil y más código de infraestructura. | NFR-9 |
| Rejilla ARIA con celdas enfocables | Permite un único punto de tabulación, flechas y nombres accesibles por día. | 84 botones en el orden de tabulación: viola RF-11.2. Tabla HTML con 84 controles: más compleja para la misma semántica. | RF-11 |
| Panel de detalle fijo bajo el mapa | No tapa celdas, no se corta en móvil, no provoca scroll y reserva altura. | Tooltip flotante: se recorta en bordes y es difícil de cerrar en táctil. | RF-6.6, RF-12 |
| Escala de tinta + trama para futuro | Distingue niveles en grises y separa futuro/vacío sin depender del color. | Solo color: falla en daltonismo y en escala de grises. | RF-4.7, RF-5.2, NFR-6 |
| 12 semanas fijas hasta el domingo actual | Ventana estable de 84 días, alineada con la semana del proyecto. | Terminar hoy: el número de columnas y el periodo cambiarían cada día. | RF-2 |
| Umbrales fijos | Un día conserva su nivel aunque se añadan sesiones en otras fechas. | Escala relativa al máximo: los colores históricos cambian al registrar. | RF-4.6 |
| Resumen con denominador 84 | Coincide con la ventana completa y con RF-8.2–8.4. | Días transcurridos: el denominador cambiaría a diario y contradice la spec. | RF-8 |
| Ignorar sesiones de 0 minutos o inválidas | La intensidad se basa en minutos; no se puede colorear sin nivel. Se conservan los datos. | Contarlas como día estudiado: el mapa diría «sin sesión» y el resumen diría «1 día», incoherente. | RF-3.3, RF-8 |
| Etiquetas de mes | Orienta sin abrir el detalle y sin navegación. | Sin etiquetas: el usuario debe consultar cada celda para situarse. | RF-10 |
| Punto de hoy | Orienta dentro de la semana actual sin depender del color. | Sin marca: hoy se confunde con cualquier día del mismo nivel. | RF-2, RF-10 |
| Celdas compactas con 24 px entre centros | Mantiene 12 semanas y cumple la excepción de espaciado de WCAG 2.2. | Scroll horizontal: prohibido por RF-12. Menos semanas: rompe RF-2.1. | RF-12, NFR-6 |
| Fecha local y claves `AAAA-MM-DD` | Evita desplazamientos UTC y coincide con la constitución y AGENTS. | `toISOString()` o `new Date("AAAA-MM-DD")`: desplazan el día. | RF-2.5 |
| Refactorizar métricas existentes para recibir `sessions` y `today` | Las hace puras y testeables sin cambiar resultados. | Dejar `new Date()` o `sesiones` dentro: incumple el principio 3 y no se pueden testear con fechas y datos fijos. | NFR-9, RF-13 |
| Redondear minutos a 2 decimales en sumas | Evita ruido binario y mantiene coherencia entre nivel, resumen y detalle. | Comparar floats crudos: `0.1 + 0.2` y umbrales pueden discrepar del texto. | RF-4, RF-8 |
| Sin `storage` listener entre pestañas | La spec no pide sincronización; actualizar al cargar/guardar es suficiente. | Escuchar cambios entre pestañas: funcionalidad nueva no pedida y más superficie. | RF-9 |
| Sin animaciones | NFR-10 no las requiere y reducen ruido. | Aparición escalonada: no aporta información y añade movimiento. | NFR-10 |

## 6. Estrategia de tests con `node --test`

### 6.1. Preparación

- Se usa el runner nativo de Node (`node --test`) y `node:assert/strict`. No se instala nada ni se crea `package.json`.
- `app.js` se modifica para que la inicialización del DOM solo ocurra si existe `document`. Las funciones puras se exportan de forma condicional para Node; en el navegador no se ejecuta esa rama. Esto permite `require("./app.js")` sin DOM ni `localStorage`.
- El archivo `app.test.js` no se carga desde `index.html`. La aplicación sigue teniendo tres archivos de runtime.
- Los tests usan fechas locales construidas con `new Date(año, mes, día, 12, 0, 0)`, nunca cadenas ISO. Así se evita el desplazamiento UTC.
- Los tests no tocan DOM, `localStorage`, red ni el reloj real. `today` siempre se pasa como argumento.
- Los tests de fechas se ejecutan en la zona horaria de la máquina. Para una comprobación explícita de cambio de hora se puede ejecutar `TZ=Europe/Madrid node --test`, sin cambiar el comando habitual.

### 6.2. Grupos de casos

| Grupo | Casos mínimos | RF |
| --- | --- | --- |
| Periodo y calendario | `today` = jueves 5/11/2026 → inicio lunes 17/8/2026, fin domingo 8/11/2026, 84 claves únicas; hoy siempre dentro; semana de lunes a domingo; cambio de año (5/1/2026 → 20/10/2025 a 11/1/2026); 29/2/2024 presente; 84 claves únicas al cruzar cambio de hora; fechas límite incluidas. | RF-2, RF-5, RF-13.2 |
| Niveles | 0, 0,5, 1, 29, 29,9, 30, 59,9, 60, 119,9, 120 y 1.000 minutos → 0, 1, 1, 1, 1, 2, 2, 3, 3, 4, 4; negativos, `NaN` e `Infinity` no generan nivel. | RF-4 |
| Agrupación | Varias sesiones el mismo día suman minutos y cuentan una sola casilla; 20 + 20 = 40 → nivel 2 y 2 sesiones; duplicados exactos se suman y cuentan por separado; sesión única; día sin sesiones. | RF-3, RF-8.5 |
| Resumen | 18 días y 640 min → «18 de 84 días con sesiones · 640 min»; cero → «0 de 84…»; denominador siempre 84; varias sesiones el mismo día cuentan un día; futuras fuera del numerador y de los minutos; sesiones anteriores al inicio y posteriores al fin fuera; sesión futura en el domingo final fuera; decimales con formato español. | RF-8, RF-5.5, RF-13.4 |
| Etiquetas de mes | Periodo agosto–noviembre → ago, sep, oct, nov; primera semana parcial; cambio de año; como máximo una etiqueta por columna; si la primera semana contiene el día 1, se etiqueta el mes nuevo; con texto normal las etiquetas contiguas no se solapan. | RF-10 |
| Detalle y nombre accesible | Día con 1 sesión → «1 sesión»; con 2 → «2 sesiones»; sin sesiones → «Sin sesiones»; futuro → «Día futuro»; fecha completa en español; minutos con formato; nombre accesible incluye día de la semana, fecha, minutos, sesiones y nivel. | RF-6, RF-11.1 |
| Validación y herencia | Sesiones con `{fecha,tema,minutos}` y con minutos como cadena numérica se aceptan; fecha ausente, vacía, con hora, inválida o imposible, 0 minutos, negativos, `NaN` e `Infinity` se ignoran sin mutar la entrada. | RF-3.3, NFR-3, NFR-4 |
| Contrato del modelo | 84 días; 12 semanas; 7 filas; orden lunes–domingo; exactamente un día `isToday`; celdas futuras con `level = null`; no mutación de la lista de sesiones; resumen coherente con los días. | RF-2, RF-5, RF-8 |
| No regresión de métricas | Racha con hoy, ayer, racha viva sin hoy y racha rota; minutos semanales con lunes, hoy, domingo, semana anterior, cambio de mes/año, varias sesiones y total 0; días del mes sin sesiones, una, varias el mismo día, día 1, fecha futura, mes anterior y cambio de año. | RF-13 |

### 6.3. Verificación manual en navegador

No se puede sustituir por tests de Node porque cubre CSS, ARIA y eventos:

- Estado vacío: 84 casillas, leyenda y mensaje; resumen a cero. (RF-1.3, RF-8.4)
- Alta de sesión dentro del periodo: mapa y resumen cambian sin recargar; recarga y persisten. (RF-9.1, RF-9.4)
- Alta de sesión fuera del periodo y con fecha futura: el mapa no cambia; la lista sí la muestra. (RF-9.2, RF-9.3)
- Varias sesiones el mismo día: una casilla y un día. (RF-3)
- Umbrales 29,9 / 30 / 59,9 / 60 / 119,9 / 120. (RF-4)
- Días futuros con trama, sin nivel; detalle «Día futuro». (RF-5)
- Detalle con ratón, foco, toque, misma celda, fuera del mapa y Escape. (RF-6)
- Teclado: un Tab entra al mapa, flechas, Inicio/Fin, bordes sin wrap, foco visible. (RF-11.2, RF-11.3)
- Lector de pantalla: nombre de la rejilla, nombres de celdas, resumen y leyenda. (RF-11)
- Día de hoy: punto y `aria-current`. (RF-2, RF-10)
- 320, 375, 768 y 1440 px: sin scroll horizontal, sin solapamientos, detalle legible. (RF-12)
- Zoom 200 % y 400 %, escala de grises, contraste forzado. (RF-11.6, NFR-6)
- Consola limpia tras cargar, guardar y recorrer el mapa. (NFR-4)
- Racha, semana, mes y lista con los mismos valores que antes del cambio. (RF-13.1)

### 6.4. Puertas de calidad

- `node --test` en verde antes de dar una tarea por terminada. Un test en rojo bloquea el avance. (Principio 4)
- Cada RF nuevo debe tener al menos un test puro o una comprobación manual registrada.
- Los tests de no regresión de racha, semana y mes deben pasar antes y después del refactor.
- No se acepta una implementación que necesite `npm install`, build, red o módulos ES. (NFR-1, NFR-2)

## 7. Trazabilidad de requisitos funcionales

| RF | Dónde se cubre | Verificación |
| --- | --- | --- |
| RF-1 Presencia | Sección en `index.html` (4.1, 4.2); render siempre; mensaje de vacío (4.9). | Manual: carga con y sin datos; no se ocultan racha, contadores ni lista. |
| RF-2 Periodo | `buildPeriod`, `buildHeatmap` (2, 3); 12×7 en la interfaz (4.3). | Tests de periodo, cambio de año y 84 claves; manual 12 columnas. |
| RF-3 Agrupación | `normalizeSession`, `groupSessionsByDay`, `buildHeatmap` (2, 3). | Tests de suma, varias sesiones, duplicados y día único. |
| RF-4 Niveles | `getHeatLevel` (2, 3); escala de tinta (4.4). | Tests de umbrales y decimales; manual en grises y contraste. |
| RF-5 Futuros | `isFuture`, `level = null` (3); trama (4.4); resumen (3). | Tests de futuro dentro/fuera del periodo; manual de trama y detalle. |
| RF-6 Detalle | Panel fijo (4.2, 4.5); `formatDayDetail` (2); eventos (4.5). | Tests de texto; manual ratón, foco, toque, cierre y bordes. |
| RF-7 Leyenda | Leyenda (4.2, 4.4); etiquetas corregidas (0). | Manual: cinco estados, nota de futuro, lectura sin color. |
| RF-8 Resumen | `summarizeHeatmap`, `formatSummary` (2, 3); pintado (4.2). | Tests de 84, cero, futuros, fuera de periodo, decimales. |
| RF-9 Actualización | `mostrarTodo` recalcula con `new Date()` (4.9). | Manual: guardar dentro/fuera/futuro, recargar, lista intacta. |
| RF-10 Orientación | Días y meses (4.3); `getMonthLabels` (2). | Tests de etiquetas y meses; manual de alineación. |
| RF-11 Accesibilidad | Rejilla ARIA, nombres, teclado (4.6, 4.7). | Tests de nombres; manual con teclado, lector, zoom y grises. |
| RF-12 Móvil | Variables y breakpoint (4.8). | Manual 320/375/768/1440; sin scroll; toque. |
| RF-13 Coherencia | Refactor de métricas con `today` (2); sección 4.10. | Tests de no regresión; comparación manual de valores. |

## 8. Cobertura de requisitos no funcionales

| NFR | Cómo se cumple |
| --- | --- |
| NFR-1 Simplicidad | Sin build ni servidor; tres archivos de runtime; CSS y JS clásicos. |
| NFR-2 Sin dependencias | Solo APIs nativas del navegador y Node para tests; sin red. |
| NFR-3 Datos intactos | Solo lectura; no se añaden claves ni se cambia el formato; tests verifican no mutación. |
| NFR-4 Datos dañados | `isRealDateKey` y `parseMinutes` filtran; el mapa sigue pintando lo válido sin errores. |
| NFR-5 Rendimiento | 84 celdas y una sola pasada por sesiones; sin recálculo por celda; render inmediato. |
| NFR-6 Accesibilidad | Rejilla ARIA, nombres completos, foco, teclado, contraste y escala en grises. |
| NFR-7 Responsive | Cuadrícula fluida de 320 a 1440 px; sin scroll horizontal. |
| NFR-8 Idioma y tono | Textos en español; mensajes neutros; cifras con formato español. |
| NFR-9 Mantenibilidad | Funciones puras con `today`; tests sin navegador; sin DOM en la lógica. |
| NFR-10 Movimiento | Sin animaciones en el mapa. |
| NFR-11 Privacidad | Sin red, analítica ni envío de datos. |

## 9. Orden de implementación y riesgos

### 9.1. Orden

1. Actualizar la spec con las decisiones de la sección 0 y corregir las contradicciones señaladas. Sin esto no se empieza a implementar. (Principio 2)
2. Refactorizar `app.js`: inicialización del DOM guardada por `typeof document`, referencias DOM y `sesiones` dentro de `iniciar()`, exportación condicional y métricas existentes con `sessions` y `today`. Añadir tests de no regresión y dejar `node --test` en verde.
3. Añadir las funciones puras del mapa y sus tests. No tocar la interfaz todavía.
4. Añadir la sección en `index.html` y los estilos en `styles.css`.
5. Conectar el renderizado, el panel de detalle, el teclado y el toque.
6. Verificación manual completa en escritorio y móvil, accesibilidad y consola.
7. Actualizar `MEMORY.md`.

### 9.2. Riesgos y decisiones a revisar

- **Spec cerrada:** las dudas 1–5 y la contradicción RF-4/RF-7.3 quedaron resueltas en la spec antes de implementar.
- **Restricción de archivos:** `AGENTS.md` dice «ni tests», pero la constitución exige `node --test`. El plan interpreta que el test es una excepción no runtime; conviene aclararlo en `AGENTS.md`.
- **Refactor de `app.js`:** mover el DOM y `localStorage` a la inicialización puede introducir regresiones. Los tests de racha, semana y mes son la red de seguridad.
- **Mapa a ancho completo en ≤370 px:** puede cruzar la línea de margen de la hoja. Es una decisión visual a revisar en 320 px.
- **Celdas de 18 px:** cumplen la excepción de espaciado de WCAG 2.2, pero son pequeñas. Se compensan con 6 px de hueco, panel de detalle y teclado.
- **Lector de pantalla:** el patrón de rejilla con 84 celdas debe probarse en al menos un lector; si resulta demasiado verboso, se ajustará el nombre accesible sin cambiar la lógica.
- **Cambio de hora:** los tests se ejecutan en la zona local; conviene una pasada con `TZ=Europe/Madrid` además de la ejecución habitual.

### 9.3. Criterios de finalización del plan

- Todos los RF y NFR tienen implementación y verificación asociadas.
- `node --test` en verde, incluidos los tests de no regresión.
- Verificación manual en Chromium a 320, 375, 768 y 1440 px, con consola limpia y sin scroll horizontal.
- Teclado, lector de pantalla, zoom 200/400 %, escala de grises y contraste comprobados.
- Racha, semana, mes y lista conservan sus valores; el formato de datos no cambia.
- Spec actualizada con las decisiones de la sección 0 y `MEMORY.md` al día.
