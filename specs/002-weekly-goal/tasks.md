# Tareas 002 — Objetivo semanal de estudio

- **Base:** `specs/002-weekly-goal/spec.md` (aprobada), `specs/002-weekly-goal/plan.md` y `docs/constitution.md`.
- **Orden:** las tareas están en orden de dependencia. No empezar una fase sin cerrar la anterior.
- **Tamaño:** cada tarea está pensada para 20–30 minutos.
- **Puerta:** en las tareas de lógica, el test se escribe primero y se comprueba en rojo; después el código. `node --test` en verde antes de avanzar. Un test en rojo bloquea la tarea siguiente.
- **Convención:** `RF` indica los requisitos que implementa cada tarea. No se toca el formato de las sesiones, la migración ni el formulario de sesiones.

## Fase 1 — Lógica pura y tests

- [ ] **T1. Alinear «Esta semana» con las sesiones inválidas (tests primero).** RF-9.4, RF-9.5, RF-9.6, RF-2.9
  - **Hecho cuando:** los tests nuevos demuestran primero en rojo que `calcularMinutosSemana` ignora minutos 0, negativos, `NaN`, booleanos y texto, conserva decimales exactos (`0,5 + 29,5 = 30`; `0,1 + 0,2 = 0,3`), sigue excluyendo futuros y semana anterior y no muta la lista; tras sustituir `Number`/`isFinite` por `parseMinutes`, `node --test` está en verde y los 43 tests anteriores pasan.

- [ ] **T2. Validar y normalizar el objetivo (tests primero).** RF-7.1–RF-7.8, RF-1.6, RF-8.4, RF-8.5
  - **Hecho cuando:** `normalizeGoal`, `validateGoalInput` y `formatGoalError` están implementadas y exportadas y los tests cubren: válido (`" 120 "`, `"1"`, `"999999"`), vacío, solo espacios, texto, `0`, negativo, `1,5`, `1.5`, `1.000`, `1 000`, `+30`, booleanos, `null`, `undefined`, `NaN`, `Infinity`, objetos y arrays; `"9007199254740992"`, `"99999999999999999999"`, `"9".repeat(400)` y una cadena que `Number()` convierte en `Infinity` devuelven el código `too-large` con el mensaje «El objetivo es demasiado grande para guardarlo con exactitud en este navegador. Escribe una cifra menor.» y `normalizeGoal` también las rechaza; `"9007199254740991"` (máximo seguro) se acepta y `JSON.stringify` produce el texto `9007199254740991` sin comillas, que `JSON.parse` devuelve como número; ningún valor `too-large` llega a `guardarObjetivo`; `normalizeGoal` rechaza cualquier dato corrupto sin lanzar; el resto de mensajes en español coincide con la tabla del plan. T2 termina en la validación y el formato: no calcula progreso ni estado (eso es T3).

- [ ] **T3. Calcular progreso, restante, exceso y estado (tests primero).** RF-2.2–RF-2.5, RF-2.9, RF-4.1–RF-4.6, RF-6.1–RF-6.7, RF-12.4
  - **Hecho cuando:** `buildWeeklyProgress`, `getGoalStatus`, `getGoalRemaining` y `getGoalExcess` están implementadas y exportadas; los tests cubren sin objetivo, progreso 0, progreso igual, por encima, restante 0,5 y 29,5, exceso 0,5, lunes, domingo futuro, semana anterior, varias sesiones el mismo día, sesiones inválidas, decimales sin redondear a entero (`0,75`), cambio de domingo a lunes con objetivo vigente, cambio de mes y año, cambio de objetivo a mitad de semana, objetivo inválido como sin objetivo y no mutación de las sesiones.

- [ ] **T4. Formatear textos y valores de la barra (tests primero).** RF-2.6–RF-2.9, RF-4.1–RF-4.4, RF-7.7, RF-10.2, RF-10.3
  - **Hecho cuando:** `formatGoalLabel`, `formatGoalRemaining`, `formatGoalStatusText` y `getGoalBarValues` están implementadas y exportadas; los tests confirman «120 min por semana», «1.000 min por semana», «Te falta 1 min», «Te faltan 29,5 min», «0 min restantes», «Objetivo alcanzado», «Objetivo alcanzado · 0,5 min por encima», `min = 0`, `max = objetivo`, `now = min(progreso, objetivo)`, texto accesible con progreso real y exceso, y `null` sin objetivo.

## Fase 2 — Persistencia y estructura

- [ ] **T5. Leer y escribir el objetivo con tolerancia y fallo controlado.** RF-1.5, RF-1.7, RF-8.1–RF-8.7, NFR-3, NFR-4
  - **Hecho cuando:** existen `CLAVE_OBJETIVO = "diario-estudio-objetivo"`, `leerObjetivo`, `guardarObjetivo` y `borrarObjetivo`; `guardarObjetivo` escribe un número JSON (`JSON.stringify(120)` → `120`, no `"120"`) y solo recibe valores ya validados como enteros seguros; la lectura con `try/catch` + `JSON.parse` + `normalizeGoal` trata como «sin objetivo» los valores `"abc"`, `{}`, `1.5`, `true`, `null`, `9007199254740992` y cadenas de dígitos que den `Infinity`, sin errores en consola; la escritura devuelve `false` si `localStorage` lanza y no altera las sesiones; la migración existente sigue intacta.

- [ ] **T6. Añadir el HTML del bloque del objetivo dentro de «Esta semana».** RF-2.1, RF-3.1, RF-3.2, RF-5.1, RF-5.5, RF-10.1, RF-10.6
  - **Hecho cuando:** `index.html` contiene el bloque descrito en el plan (título, resumen con `role="progressbar"`, restante, estado, acciones, invitación, formulario `novalidate` con `type="text"` e `inputmode="numeric"`, confirmación con `role="status"` y aviso con «Deshacer») dentro del `.dato` de «Esta semana»; el formulario de sesiones, la lista, el mapa y sus `id` no cambian; la página sigue abriéndose con doble clic.

- [ ] **T7. Estilar el bloque, la barra y el aviso de 320 a 1440 px.** RF-2.8, RF-10.5, RF-10.7, RF-11.1–RF-11.4, NFR-6
  - **Hecho cuando:** la barra muestra pista y relleno con contraste ≥ 3:1 y nunca supera el 100 %; el foco de los botones nuevos es visible con contraste ≥ 3:1; los botones miden al menos 44 × 44 px efectivos; en 320, 375, 768 y 1440 px no hay scroll horizontal ni solapamientos y el campo y las acciones se apilan en móvil; en `forced-colors` la barra sigue visible y en escala de grises no se pierde información.

## Fase 3 — Render e interacción

- [ ] **T8. Pintar los estados del objetivo y unificar el cálculo de «Esta semana» (tests primero).** RF-1.5, RF-2.1–RF-2.8, RF-3.1–RF-3.3, RF-8.7, RF-9.1–RF-9.5, RF-12.1–RF-12.4
  - **Hecho cuando:** los tests de no regresión demuestran que la cifra de la tarjeta y `buildWeeklyProgress(...).progress` coinciden y que racha y días del mes no cambian con sesiones inválidas; `mostrarSemana` construye el modelo una sola vez y pinta `#minutos-semana` con `model.progress`; se muestran los estados sin objetivo, no alcanzado, alcanzado y superado con los textos exactos y la barra con sus atributos ARIA; guardar una sesión actualiza todo sin recargar; la confirmación de guardado y el error de almacenamiento funcionan; no hay dos cifras distintas de la semana en la página.

- [ ] **T9. Implementar fijar, editar y cancelar el objetivo.** RF-1.1–RF-1.5, RF-5.1–RF-5.3, RF-5.11, RF-7.1–RF-7.6, RF-12.4
  - **Hecho cuando:** «Fijar objetivo» abre el formulario vacío y «Cambiar objetivo» lo abre con el valor actual; guardar un valor válido fija o sustituye el objetivo, se confirma en español y se aplica a la semana en curso sin recargar; un valor inválido muestra el mensaje correcto, conserva el objetivo anterior y mantiene el foco en el campo; «Cancelar» cierra el formulario sin cambiar nada y devuelve el foco al botón correspondiente; tras guardar, el foco queda en «Cambiar objetivo».

- [ ] **T10. Implementar eliminar y deshacer con aviso y foco.** RF-5.4–RF-5.10, RF-5.7, RF-5.8, RF-10.4, RF-10.6
  - **Hecho cuando:** «Eliminar objetivo» quita el objetivo de inmediato sin confirmación previa, sin valor por defecto y sin tocar sesiones ni métricas; aparece «Objetivo eliminado.» con «Deshacer» y permanece sin límite de tiempo; el foco queda en «Fijar objetivo»; «Deshacer» restaura objetivo y progreso en el mismo gesto, oculta el aviso y deja el foco en «Cambiar objetivo»; recargar tras eliminar mantiene la eliminación; fijar un objetivo nuevo oculta el aviso; eliminar con `localStorage.removeItem` simulado como fallo muestra el mensaje y conserva el objetivo.

## Fase 4 — Accesibilidad y verificación

- [ ] **T11. Completar accesibilidad: barra, regiones vivas y teclado.** RF-10.1–RF-10.7, NFR-6, NFR-10
  - **Hecho cuando:** la barra expone nombre accesible, `aria-valuemin="0"`, `aria-valuemax` = objetivo, `aria-valuenow` = `min(progreso, objetivo)` con punto decimal y `aria-valuetext` con progreso real, restante o estado y exceso; objetivo, restante y estado son texto real; confirmación y aviso se anuncian en regiones `role="status"` y los errores en `role="alert"`; se recorre todo el flujo solo con teclado, con orden lógico y foco visible; zoom 200 % y escala de grises no ocultan información.

- [ ] **T12. Verificación final en Chromium, responsive, tests y `MEMORY.md`.** RF-1 a RF-12 · NFR-1 a NFR-12
  - **Hecho cuando:** se comprueban en Chromium arranque sin objetivo, fijar, editar a mitad de semana, cancelar, eliminar, deshacer, recargar tras eliminar, alcanzar, superar, barra y textos accesibles, foco tras eliminar y deshacer, y consola limpia; a 320, 375, 768 y 1440 px no hay scroll horizontal ni solapamientos y todo funciona con toque; `node --test` y `TZ=Europe/Madrid node --test` están en verde; racha, días del mes, mapa y lista conservan sus valores y ninguna sesión se ha modificado; `MEMORY.md` resume el estado, las decisiones (clave independiente, cálculo único, deshacer en memoria) y los errores a evitar, sin datos sensibles y sin superar ~50 líneas.

## Cierre global

La funcionalidad está terminada cuando todos los checkboxes están marcados, `node --test` está en verde (también con `TZ=Europe/Madrid`), las comprobaciones manuales de T12 quedan registradas y la spec, el plan y las tareas siguen siendo coherentes. Si alguna decisión de la sección 9.2 del plan no se aprueba, se actualiza primero la spec y después estas tareas.
