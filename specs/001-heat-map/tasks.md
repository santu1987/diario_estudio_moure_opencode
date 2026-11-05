# Tareas 001 — Mapa de calor de las últimas 12 semanas

- **Base:** `specs/001-heat-map/spec.md`, `specs/001-heat-map/plan.md` y `docs/constitution.md`.
- **Orden:** las tareas están en orden de dependencia. No empezar una fase sin cerrar la anterior.
- **Tamaño:** cada tarea está pensada para 20–30 minutos.
- **Puerta:** `node --test` en verde antes de avanzar. Un test en rojo bloquea la tarea siguiente.
- **Convención:** `RF` indica los requisitos que prepara o implementa cada tarea. Las tareas de spec preparan requisitos; no implementan código.

## Fase 0 — Cerrar la spec antes de implementar

- [x] **T001 · Actualizar la spec: periodo y resumen** (20–30 min)
  - **RF:** RF-2, RF-5, RF-8
  - **Hecho cuando:** `spec.md` fija 12 semanas completas hasta el domingo actual, corrige RF-2.4 a «17/8/2026 a 8/11/2026» y aclara que RF-8.1 se refiere a la ventana completa con denominador 84.

- [x] **T002 · Actualizar la spec: niveles, leyenda y sesiones ignoradas** (20–30 min)
  - **RF:** RF-3, RF-4, RF-6, RF-7
  - **Hecho cuando:** RF-7.3 usa intervalos cerrados con «menos de» y cubre decimales; RF-3.3, RF-6 y RF-8 dicen que las sesiones de 0 minutos o inválidas se ignoran sin borrarse; la leyenda incluye la nota «Día futuro».

- [x] **T003 · Actualizar la spec: interacción, orientación y accesibilidad** (20–30 min)
  - **RF:** RF-6, RF-9, RF-10, RF-11, RF-12
  - **Hecho cuando:** RF-6.3 y RF-12.3 comparten el mismo cierre táctil; RF-10.3 fija una etiqueta de mes por columna; RF-11.2 define un solo punto de tabulación, flechas, Inicio/Fin y ausencia de wrap; RF-11.4 declara el nombre accesible como fuente equivalente al detalle; RF-9.5 aclara que la sesión nueva se inserta arriba sin reordenar las existentes.

- [x] **T004 · Cerrar dudas abiertas y aprobar la spec** (15–20 min)
  - **RF:** RF-1 a RF-13
  - **Hecho cuando:** la sección 9 de `spec.md` no contiene ningún `[NECESITA ACLARACIÓN]`, el estado es «aprobada» y ninguna decisión de la sección 0 del plan queda fuera de la spec.

## Fase 1 — Preparar la base y los tests de no regresión

- [x] **T005 · Preparar `app.js` para ejecutarse en Node sin DOM** (25–30 min)
  - **RF:** RF-13, NFR-9
  - **Hecho cuando:** `node -e 'require("./app.js")'` no lanza error, abrir `index.html` con doble clic sigue funcionando y no quedan accesos a `document` ni `localStorage` en el nivel superior del archivo.

- [x] **T006 · Inyectar `sessions` y `today` en las métricas existentes** (20–30 min)
  - **RF:** RF-13.1, RF-13.2, RF-13.3, RF-13.4
  - **Hecho cuando:** `calcularRacha`, `calcularMinutosSemana` y `calcularDiasMes` reciben `sessions` y `today`, el DOM les pasa `sesiones` y `new Date()` y los valores visibles coinciden con los de la versión anterior.

- [x] **T007 · Crear `app.test.js` con la red de no regresión** (25–30 min)
  - **RF:** RF-13.1, RF-13.2, RF-13.3, RF-13.4
  - **Hecho cuando:** `node --test` pasa con arrays de sesiones y fechas fijas en casos de racha con hoy, ayer, racha viva sin hoy y racha rota; minutos de la semana con lunes, hoy, domingo, semana anterior y total 0; días del mes con una sesión, varias el mismo día, día 1, fecha futura y cambio de mes/año.

## Fase 2 — Lógica pura del mapa

- [x] **T008 · Implementar `addDays` y `buildPeriod` con tests** (20–30 min)
  - **RF:** RF-2, RF-5, RF-13.2
  - **Hecho cuando:** los tests confirman que el 5/11/2026 genera del 17/8/2026 al 8/11/2026, 84 claves únicas, semana de lunes a domingo, cambio de año, 29 de febrero y cruce de cambio de hora sin duplicar días.

- [x] **T009 · Implementar validadores de fecha y minutos con tests** (20–30 min)
  - **RF:** RF-3.3, RF-4, RF-8, NFR-4
  - **Hecho cuando:** `isRealDateKey` rechaza `2026-02-30`, fechas vacías y formatos con hora; `parseMinutes` acepta `"30"` y rechaza 0, negativos, `NaN`, `Infinity`, booleanos y vacíos; `roundMinutes` estabiliza `0.1 + 0.2`.

- [x] **T010 · Implementar normalización y agrupación diaria con tests** (25–30 min)
  - **RF:** RF-3, NFR-3, NFR-4
  - **Hecho cuando:** `normalizeSession` es null-safe y compatible con `{fecha,tema,minutos}`; `groupSessionsByDay` suma minutos, cuenta sesiones válidas, ignora 0/inválidas y no muta la lista de entrada.

- [x] **T011 · Implementar `getHeatLevel` con tests de umbrales** (15–20 min)
  - **RF:** RF-4
  - **Hecho cuando:** 0, 0,5, 1, 29, 29,9, 30, 59,9, 60, 119,9, 120 y 1.000 minutos devuelven 0, 1, 1, 1, 1, 2, 2, 3, 3, 4 y 4; negativos, `NaN` e `Infinity` no generan nivel.

- [x] **T012 · Implementar `summarizeHeatmap` y `formatSummary` con tests** (20–30 min)
  - **RF:** RF-8, RF-5.5
  - **Hecho cuando:** el resumen cuenta días no futuros con minutos >0, usa `days.length` como denominador, produce «18 de 84 días con sesiones · 640 min» y «0 de 84 días con sesiones · 0 min», y excluye futuras y fechas fuera del periodo.

- [x] **T013 · Implementar etiquetas de mes con tests** (20–30 min)
  - **RF:** RF-10
  - **Hecho cuando:** `formatMonthShort` devuelve tres letras fijas y `getMonthLabels` asigna como máximo una etiqueta por columna, etiqueta la primera semana y las semanas con día 1, y si la primera semana contiene el día 1 usa el mes nuevo. Pasan los casos agosto–noviembre y cambio de año.

- [x] **T014 · Implementar `buildHeatmap` con test de contrato** (25–30 min)
  - **RF:** RF-2, RF-3, RF-4, RF-5, RF-8, RF-13
  - **Hecho cuando:** el modelo tiene 84 días en orden lunes–domingo, exactamente un `isToday`, futuros con `level = null`, resumen coherente con los días, etiquetas de mes y no muta las sesiones de entrada.

- [x] **T015 · Implementar `formatDayDetail` con tests** (20–30 min)
  - **RF:** RF-5.4, RF-6.1, RF-6.2, RF-6.5
  - **Hecho cuando:** produce fecha completa, minutos y número de sesiones; usa «1 sesión» y «2 sesiones»; muestra «Sin sesiones» y «Día futuro»; y los tests cubren día con sesiones, sin sesiones y futuro.

- [x] **T016 · Implementar nombre accesible y foco inicial con tests** (20–30 min)
  - **RF:** RF-11.1, RF-11.2
  - **Hecho cuando:** `getAccessibleDayLabel` incluye día de la semana, fecha, minutos, sesiones o estado, y nivel; `getInitialFocusKey` devuelve la clave de hoy; los tests cubren sesión única, varias sesiones, sin sesiones y futuro.

## Fase 3 — Estructura y estilos

- [x] **T017 · Añadir el esqueleto HTML de la sección** (20–30 min)
  - **RF:** RF-1, RF-6, RF-7, RF-8, RF-10, RF-11, RF-12
  - **Hecho cuando:** `index.html` tiene la sección entre `.resumen` y el formulario, con título, resumen textual, contenedor de meses, columna de días, rejilla, panel de detalle, leyenda y mensaje de vacío; el formulario y la lista conservan sus elementos e IDs.

- [x] **T018 · Estilar la rejilla, las etiquetas y el panel** (25–30 min)
  - **RF:** RF-1, RF-6.6, RF-10, RF-12
  - **Hecho cuando:** se ven 7 filas por 12 columnas, las iniciales y los meses quedan alineados, el panel de detalle reserva altura y no hay solapamientos a 768 ni a 1440 px.

- [x] **T019 · Estilar los cuatro niveles y el estado sin sesión** (20–30 min)
  - **RF:** RF-4.7, RF-4.8
  - **Hecho cuando:** los cuatro niveles son monótonos y distinguibles en escala de grises, el nivel 4 es el más intenso y el estado sin sesión no se confunde con ningún nivel.

- [x] **T020 · Estilar día futuro, hoy y foco** (20–30 min)
  - **RF:** RF-5.1, RF-5.2, RF-10, RF-11.3
  - **Hecho cuando:** el día futuro tiene trama distinta del vacío y de los niveles; hoy muestra un punto además de `aria-current="date"`; el foco de 2 px se ve sobre cualquier nivel y sobre la trama; no hay animaciones.

- [x] **T021 · Estilar leyenda y mensaje de estado vacío** (15–20 min)
  - **RF:** RF-1.3, RF-7
  - **Hecho cuando:** la leyenda muestra los cinco estados y la nota «Día futuro» con etiquetas textuales; el mensaje de vacío se ve sin ocultar la rejilla ni la leyenda.

- [x] **T022 · Adaptar el mapa de 320 a 1440 px** (25–30 min)
  - **RF:** RF-12, NFR-7
  - **Hecho cuando:** a 320, 375, 768 y 1440 px no hay scroll horizontal ni solapamientos; las casillas siguen cuadradas y mantienen 24 px entre centros; en ≤370 px el bloque usa el ancho completo de la hoja.

## Fase 4 — Pintado e interacción

- [x] **T023 · Pintar las 84 casillas y las etiquetas** (25–30 min)
  - **RF:** RF-2, RF-3, RF-4, RF-5, RF-10, RF-11.1
  - **Hecho cuando:** la rejilla se genera desde `buildHeatmap` con 84 celdas, clases de nivel/futuro/hoy, etiquetas de mes y días, usando `createElement` y `textContent`, sin interpolar datos en `innerHTML`.

- [x] **T024 · Pintar resumen y estado vacío** (15–20 min)
  - **RF:** RF-1.3, RF-8
  - **Hecho cuando:** el resumen muestra el texto exacto de `formatSummary`; el mensaje de vacío aparece solo cuando no hay días válidos y la rejilla y la leyenda siguen visibles.

- [x] **T025 · Conectar carga y guardado** (20–30 min)
  - **RF:** RF-1.1, RF-9, RF-13.1
  - **Hecho cuando:** al cargar se pinta el mapa; guardar una sesión dentro del periodo actualiza mapa y resumen sin recargar; una sesión fuera del periodo o futura no cambia el mapa; recargar conserva los datos y la lista mantiene su orden.

- [x] **T026 · Implementar el detalle con ratón, foco y toque** (25–30 min)
  - **RF:** RF-6, RF-12.3
  - **Hecho cuando:** hover, foco y toque muestran el detalle; tocar otra casilla lo cambia; tocar la misma casilla, tocar fuera o pulsar Escape lo cierra; el panel no tapa la casilla ni se corta en 320 px.

- [x] **T027 · Implementar la navegación por teclado** (20–30 min)
  - **RF:** RF-11.2, RF-11.3
  - **Hecho cuando:** un solo Tab entra en el mapa por la casilla de hoy; las flechas mueven por semana/día, Inicio/Fin van a la primera/última semana de la fila, no hay wrap, el `tabindex` se actualiza y el foco siempre es visible sin desplazar la página.

- [x] **T028 · Completar ARIA y nombres accesibles** (20–30 min)
  - **RF:** RF-7.4, RF-11.1, RF-11.4, RF-11.5
  - **Hecho cuando:** la rejilla tiene nombre con el periodo, cada celda tiene su nombre completo, hoy lleva `aria-current`, el resumen usa `aria-live="polite"` y la leyenda tiene nombres textuales; el árbol de accesibilidad muestra todo sin depender del color.

## Fase 5 — Verificación y cierre

- [x] **T029 · Verificación funcional manual en Chromium** (25–30 min)
  - **RF:** RF-1, RF-3, RF-4, RF-5, RF-8, RF-9, RF-13
  - **Hecho cuando:** se comprueban estado vacío, alta, recarga, sesión fuera del periodo, sesión futura, varias sesiones el mismo día, umbrales 29,9/30/59,9/60/119,9/120, racha/semana/mes/lista sin cambios y consola limpia.

- [x] **T030 · Verificación responsive y táctil manual** (20–30 min)
  - **RF:** RF-12, NFR-7
  - **Hecho cuando:** a 320, 375, 768 y 1440 px no hay scroll horizontal ni solapamientos; en móvil el detalle se abre, cambia y cierra con toques y sigue siendo legible.

- [x] **T031 · Verificación de accesibilidad manual** (25–30 min)
  - **RF:** RF-11, NFR-6, NFR-10
  - **Hecho cuando:** se recorre todo el mapa con teclado, se revisa con lector de pantalla, zoom 200 % y 400 %, escala de grises, contraste forzado y movimiento reducido, sin pérdida de información.

- [x] **T032 · Puerta final de tests y trazabilidad** (20–30 min)
  - **RF:** RF-1 a RF-13 · **NFR:** NFR-1 a NFR-11
  - **Hecho cuando:** `node --test` pasa también con `TZ=Europe/Madrid node --test`, cada RF y NFR tiene al menos un test o una comprobación manual registrada, y no hay dependencias, build, red ni errores en consola.

- [x] **T033 · Actualizar `MEMORY.md`** (10–15 min)
  - **RF:** RF-1 a RF-13 (criterio de finalización 10)
  - **Hecho cuando:** `MEMORY.md` resume el estado implementado, las decisiones importantes y los errores a evitar, sin datos sensibles y sin superar ~50 líneas.

## Cierre global

La funcionalidad está terminada cuando todos los checkboxes están marcados, `node --test` está en verde y las comprobaciones manuales de T029, T030 y T031 quedan registradas.
