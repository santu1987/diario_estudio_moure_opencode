# Plan 002 — Objetivo semanal de estudio

- **Estado:** propuesto, pendiente de aprobación del usuario. La spec 002 está aprobada.
- **Base:** `docs/constitution.md` y `specs/002-weekly-goal/spec.md`.
- **Regla:** este plan describe el cómo. El qué y el porqué siguen en la spec.
- **Restricción:** no se añaden dependencias, build, red ni módulos ES. Siguen existiendo tres archivos de runtime (`index.html`, `styles.css`, `app.js`); `app.test.js` es el archivo de tests que exige la constitución y no se carga en el navegador.
- **Datos:** el formato de las sesiones (`diario-estudio-sesiones`, `[{ date, topic, minutes }]`) y la migración desde `diarioDeEstudio.sesiones` no se tocan. El objetivo se guarda aparte.

## 0. Resumen de decisiones

| Tema | Decisión | Alternativa descartada | RF |
| --- | --- | --- | --- |
| Almacenamiento | Clave propia `diario-estudio-objetivo` con un **número JSON** (`120`, no la cadena `"120"`). | Objeto `{ minutes }`, guardarlo dentro de las sesiones o texto plano: más estructura, riesgo de tocar datos existentes o de aceptar valores ambiguos. | RF-1.7, RF-8.6 |
| Lectura | `normalizeGoal`: solo entero seguro mayor que 0; cualquier otro valor guardado = sin objetivo, sin errores. Tolerar cadenas de dígitos al leer no cambia el formato escrito, que es siempre un número JSON. | Confiar en `JSON.parse` y en el tipo: `true`, `"120"` o `1.5` se colarían. | RF-8.4, RF-8.5 |
| Cálculo | Una sola función pura, `buildWeeklyProgress`, apoya el progreso en `calcularMinutosSemana`; la tarjeta «Esta semana» pinta `model.progress`. | Sumar minutos en el render y otra vez en el objetivo: dos cifras que pueden divergir. | RF-2.2, RF-9.2, RF-12.3 |
| Sesiones inválidas | `calcularMinutosSemana` pasa a usar `parseMinutes` (ignora 0, negativos, `NaN`, booleanos y texto). | Filtrar solo en el objetivo: «Esta semana» seguiría restando minutos negativos. | RF-9.4, RF-9.5 |
| Decimales | `roundMinutes` para absorber ruido; textos con `formatearMinutos` (hasta 2 decimales, coma española). | Redondear a entero: falsea las cifras reales. `toFixed(2)`: fuerza «29,50». | RF-2.9, RF-4.1, RF-4.3 |
| Entrada | `<input type="text" inputmode="numeric">` validado con `/^\d+$/` sobre el valor recortado. | `type="number"`: admite decimales, notación científica y normaliza el valor en silencio (RF-7.5). | RF-7.1, RF-7.4, RF-7.5, RF-7.6 |
| Barra | `role="progressbar"` con mínimo 0, máximo = objetivo y actual = `min(progreso, objetivo)`. | Usar el progreso real como `valuenow`: es inválido cuando supera el máximo y algunos lectores lo ignoran. | RF-2.8, RF-10.3 |
| Eliminación | Inmediata, con aviso «Deshacer» en memoria y sin límite de tiempo. | `confirm()`: añade fricción, bloquea y no es estilizable ni accesible de forma consistente. Temporizador: la spec no lo permite. | RF-5.4–RF-5.9 |
| Fallo de escritura | La escritura devuelve `true`/`false`; si falla, no se actualiza la memoria ni se afirma que se guardó. | Actualizar la memoria primero y avisar: el objetivo desaparecería al recargar. Silenciar el error: mentiría. | RF-1.5, RF-8.7 |
| Ubicación | Bloque dentro de la tarjeta «Esta semana», usando la cifra única que ya existe. | Tarjeta nueva: duplicaría la cifra semanal (RF-12.3) y rompería el diseño de hoja. | RF-2.1, RF-3.2, RF-12.3 |

## 1. Archivos y responsabilidades

| Archivo | Acción | Responsabilidad | RF |
| --- | --- | --- | --- |
| `index.html` | Modificar | Añadir dentro de la tarjeta «Esta semana» el bloque del objetivo: título, estado sin objetivo, resumen con barra, formulario y aviso de deshacer. No tocar el formulario de sesiones ni la lista. | RF-2, RF-3, RF-5, RF-10 |
| `styles.css` | Modificar | Estilos del bloque: meta, barra, relleno, acciones, aviso, foco visible, tamaños táctiles y adaptación de 320 a 1440 px. Reutilizar los tokens y el diseño de hoja. | RF-2.8, RF-10.5, RF-10.7, RF-11 |
| `app.js` | Modificar | Añadir constantes y funciones puras del objetivo, la lectura/escritura tolerante en localStorage, el render dentro de `mostrarSemana` y los eventos de fijar, editar, cancelar, eliminar y deshacer. Exportar las funciones nuevas para tests. | RF-1 a RF-12, NFR-9 |
| `app.test.js` | Modificar | Tests nuevos de validación, progreso, estado, textos, barra y no regresión. No se carga desde `index.html`. | NFR-9, criterio de finalización 4 |
| `specs/002-weekly-goal/plan.md` | Crear | Este documento. | — |
| `specs/002-weekly-goal/tasks.md` | Crear | Tareas de implementación. | — |
| `MEMORY.md` | Modificar al terminar | Estado, decisiones y aprendizajes. | Criterio de finalización 11 |

No se crean archivos de lógica ni de estilos nuevos. La restricción de tres archivos de runtime se mantiene.

## 2. Funciones puras y contratos

Todas las funciones de cálculo reciben `today` como `Date` local cuando dependen de la fecha. Ninguna toca DOM, `localStorage`, red ni relojes internos, y ninguna muta las sesiones de entrada. Las claves de fecha se generan con `fechaParaInput`; nunca se usa `toISOString()` ni `new Date("AAAA-MM-DD")`.

### 2.1. Funciones nuevas

| Función | Entrada → salida | Responsabilidad | RF |
| --- | --- | --- | --- |
| `normalizeGoal(value)` | cualquiera → entero seguro > 0 o `null` | Lectura tolerante: acepta un número entero seguro mayor que 0 o una cadena de solo dígitos con espacios exteriores cuyo valor sea un entero seguro mayor que 0. Rechaza 0, negativos, decimales, signos, separadores, booleanos, `null`, `undefined`, `NaN`, `Infinity`, valores fuera del rango exacto, objetos y arrays. | RF-7.6–RF-7.8, RF-8.4 |
| `validateGoalInput(raw)` | texto → `{ ok: true, goal }` o `{ ok: false, code }` | Validación estricta del campo. Códigos: `empty`, `not-number`, `not-positive`, `not-integer`, `too-large`. Solo acepta dígitos tras recortar espacios y exige `Number.isSafeInteger`. | RF-7.1–RF-7.6 |
| `formatGoalError(code)` | texto → texto | Mensaje en español para cada código; `not-integer` explica minutos enteros sin decimales, signos ni separadores; `too-large` explica que la cifra no se puede guardar con exactitud. | RF-7.3, RF-7.4 |
| `getGoalStatus(goal, progress)` | número, número → `"sin-objetivo"` \| `"no-alcanzado"` \| `"alcanzado"` \| `"superado"` | Estado excluyente según el progreso y el objetivo. | RF-4.2, RF-4.3, RF-4.6 |
| `getGoalRemaining(goal, progress)` | número, número → número | `objetivo − progreso` redondeado a 2 decimales cuando el progreso es menor; 0 en el resto. | RF-4.1–RF-4.3 |
| `getGoalExcess(goal, progress)` | número, número → número | `progreso − objetivo` redondeado a 2 decimales cuando el progreso es mayor; 0 en el resto. | RF-4.3 |
| `buildWeeklyProgress(sessions, goal, today)` | lista, cualquiera, `Date` → modelo | Orquestador puro: normaliza el objetivo, calcula el progreso con `calcularMinutosSemana`, el restante, el exceso, el estado y el porcentaje limitado. | RF-2.2–RF-2.9, RF-4.1–RF-4.6, RF-6.1–RF-6.7, RF-12.4 |
| `formatGoalLabel(goal)` | número → texto | «120 min por semana», «1 min por semana», «1.000 min por semana». | RF-1.2, RF-2.7, RF-7.7 |
| `formatGoalRemaining(model)` | modelo → texto | «Te faltan 75 min», «Te falta 1 min», «Te faltan 29,5 min» o «0 min restantes». Vacío sin objetivo. | RF-4.1–RF-4.3, RF-2.9 |
| `formatGoalStatusText(model)` | modelo → texto | Vacío si no hay objetivo o no se ha alcanzado; «Objetivo alcanzado»; «Objetivo alcanzado · 5 min por encima» / «… 0,5 min por encima». | RF-4.2–RF-4.4, RF-4.6 |
| `getGoalBarValues(model)` | modelo → `{ min, max, now, text }` o `null` | Valores accesibles y texto de la barra. `now = min(progreso, objetivo)`; el texto incluye siempre el progreso real y, si existe, el exceso. | RF-2.8, RF-10.3 |

### 2.2. Modelo que devuelve `buildWeeklyProgress`

- `hasGoal`: booleano.
- `goal`: entero seguro > 0 o `null`.
- `progress`: minutos de la semana actual, de lunes a hoy, redondeados a 2 decimales.
- `remaining`: 0 o `goal − progress` redondeado.
- `excess`: 0 o `progress − goal` redondeado.
- `status`: `sin-objetivo`, `no-alcanzado`, `alcanzado` o `superado`.
- `percent`: proporción `min(progress / goal, 1) × 100`, redondeada a 2 decimales; 0 sin objetivo.
- Sin objetivo, `remaining` y `excess` son 0 y `status` es `sin-objetivo`; el modelo sigue incluyendo `progress` para que la tarjeta lo pinte.
- `buildWeeklyProgress` no añade sesiones, no cuenta el objetivo como día y no modifica ninguna métrica.

### 2.3. Funciones existentes que se ajustan

| Función | Cambio | Motivo | RF |
| --- | --- | --- | --- |
| `calcularMinutosSemana(sessions, today)` | Sustituir `Number(...)` + `Number.isFinite` por `parseMinutes(...)`. | Ignorar 0, negativos, `NaN`, booleanos y texto, igual que el mapa. Con datos válidos el resultado no cambia. | RF-9.4–RF-9.6 |
| `mostrarMinutosSemana` (DOM) | Se sustituye por `mostrarSemana`, que construye el modelo una vez y pinta `model.progress` y el objetivo. | Una sola cifra y un solo cálculo. | RF-2.2, RF-12.3 |
| `formatearMinutos`, `roundMinutes`, `parseMinutes`, `isRealDateKey`, `fechaParaInput`, `inicioDeSemana`, `addDays` | Sin cambios. | Reutilización exigida por AGENTS y la spec. | RF-2.5, RF-2.9, RF-6.9 |

`normalizeGoal` acepta cualquier secuencia de dígitos mientras su valor sea un **entero seguro** (`Number.isSafeInteger`). El límite `Number.MAX_SAFE_INTEGER` (9.007.199.254.740.991) no es un máximo de producto: RF-7.2 prohíbe un tope de objetivo. Es el límite a partir del cual JavaScript no puede representar ni serializar el número con exactitud; aceptarlo guardaría un valor con los últimos dígitos alterados o `Infinity`, y `JSON.stringify(Infinity)` produce `null`, de modo que el objetivo desaparecería al recargar. Por eso se rechaza con `too-large` y nunca llega a `guardarObjetivo`. El porqué completo está en la sección 9.2.

`guardarObjetivo` escribe siempre un **número JSON**: `JSON.stringify(120)` produce `120`, no `"120"`. La tolerancia de `normalizeGoal` con cadenas de dígitos es solo de lectura, para datos antiguos o manipulados; no cambia el formato que escribe la aplicación.

### 2.4. Persistencia (no pura, sin DOM)

| Función | Responsabilidad | RF |
| --- | --- | --- |
| `leerObjetivo()` | `getItem(CLAVE_OBJETIVO)` dentro de `try/catch`; `JSON.parse`; `normalizeGoal`. Cualquier fallo o valor inválido devuelve `null`. | RF-8.1–RF-8.5 |
| `guardarObjetivo(goal)` | `localStorage.setItem(CLAVE_OBJETIVO, JSON.stringify(goal))`; escribe un número JSON y solo se llama con enteros seguros ya validados; devuelve `true` o `false` si lanza. No toca las sesiones. | RF-1.5, RF-1.7, RF-8.6, RF-8.7 |
| `borrarObjetivo()` | `localStorage.removeItem(CLAVE_OBJETIVO)`; devuelve `true` o `false` si lanza. | RF-5.4, RF-5.10 |

`CLAVE_OBJETIVO = "diario-estudio-objetivo"`. Las funciones se cargan junto a las de sesiones, pero no se exportan para tests: la tolerancia se prueba en `normalizeGoal` y el resto se verifica a mano en el navegador.

## 3. Algoritmo en pseudocódigo

### 3.1. Normalización y validación

```text
FUNCIÓN normalizeGoal(value)
  SI typeof value = "number" ENTONCES
    SI Number.isSafeInteger(value) Y value > 0 ENTONCES DEVOLVER value
    DEVOLVER null
  FIN SI
  SI typeof value = "string" ENTONCES
    texto ← value.trim()
    SI texto = "" O NO /^\d+$/.test(texto) ENTONCES DEVOLVER null
    numero ← Number(texto)
    SI Number.isSafeInteger(numero) Y numero > 0 ENTONCES DEVOLVER numero
  FIN SI
  DEVOLVER null
FIN FUNCIÓN
```

```text
FUNCIÓN validateGoalInput(raw)
  SI typeof raw ≠ "string" ENTONCES DEVOLVER { ok: false, code: "not-number" }
  texto ← raw.trim()
  SI texto = "" ENTONCES DEVOLVER { ok: false, code: "empty" }
  SI /^\d+$/.test(texto) ENTONCES
    numero ← Number(texto)
    SI NO Number.isSafeInteger(numero) ENTONCES
      DEVOLVER { ok: false, code: "too-large" }    // incluye Infinity y MAX_SAFE_INTEGER + 1
    FIN SI
    SI numero > 0 ENTONCES DEVOLVER { ok: true, goal: numero }
    DEVOLVER { ok: false, code: "not-positive" }
  FIN SI
  SI /^-?\d+$/.test(texto) ENTONCES DEVOLVER { ok: false, code: "not-positive" }
  SI /[0-9]/.test(texto) Y /[.,+\-\s]/.test(texto) ENTONCES
    DEVOLVER { ok: false, code: "not-integer" }
  FIN SI
  DEVOLVER { ok: false, code: "not-number" }
FIN FUNCIÓN
```

Reglas de validación:

- Solo dígitos, con espacios exteriores opcionales (RF-7.1, RF-7.6). `" 120 "` es válido; `"1 000"` no.
- `"1,5"`, `"1.5"`, `"1.000"`, `"1 000"` y `"+30"` devuelven `not-integer` (RF-7.4).
- `"0"` y `"-30"` devuelven `not-positive` (RF-7.3).
- Cualquier valor mayor que `Number.MAX_SAFE_INTEGER` devuelve `too-large`, incluidos `"9007199254740992"`, `"99999999999999999999"`, `"9".repeat(400)` y las cadenas que `Number()` convierte en `Infinity`. El valor máximo aceptado es `"9007199254740991"`, que `JSON.stringify` sigue escribiendo como número (`9007199254740991`). `normalizeGoal` rechaza igualmente los mismos valores al leer.
- `"abc"`, `"12abc"`, `"1e3"`, `true`, `null` y `NaN` se rechazan (RF-7.3, RF-7.8).
- No se redondea ni se trunca nunca el valor introducido (RF-7.5).

### 3.2. Progreso, restante, exceso y estado

```text
FUNCIÓN buildWeeklyProgress(sessions, goal, today)
  objetivo ← normalizeGoal(goal)
  progreso ← calcularMinutosSemana(sessions, today)   // única fuente semanal

  SI objetivo = null ENTONCES
    DEVOLVER { hasGoal: false, goal: null, progress: progreso,
               remaining: 0, excess: 0, status: "sin-objetivo", percent: 0 }
  FIN SI

  restante ← getGoalRemaining(objetivo, progreso)
  exceso ← getGoalExcess(objetivo, progreso)
  estado ← getGoalStatus(objetivo, progreso)
  porcentaje ← roundMinutes(Math.min(progreso / objetivo, 1) * 100)

  DEVOLVER { hasGoal: true, goal: objetivo, progress: progreso,
             remaining: restante, excess: exceso, status: estado,
             percent: porcentaje }
FIN FUNCIÓN
```

```text
FUNCIÓN getGoalStatus(goal, progress)
  SI normalizeGoal(goal) = null ENTONCES DEVOLVER "sin-objetivo"
  SI progress < goal ENTONCES DEVOLVER "no-alcanzado"
  SI progress = goal ENTONCES DEVOLVER "alcanzado"
  DEVOLVER "superado"
FIN FUNCIÓN

FUNCIÓN getGoalRemaining(goal, progress)
  SI progress < goal ENTONCES DEVOLVER roundMinutes(goal - progress)
  DEVOLVER 0
FIN FUNCIÓN

FUNCIÓN getGoalExcess(goal, progress)
  SI progress > goal ENTONCES DEVOLVER roundMinutes(progress - goal)
  DEVOLVER 0
FIN FUNCIÓN
```

`calcularMinutosSemana` mantiene la definición existente: lunes a hoy, fecha local, sin futuros ni semana anterior; solo cambia el filtro de minutos a `parseMinutes`.

### 3.3. Textos y barra

```text
FUNCIÓN getGoalBarValues(model)
  SI model.hasGoal = false ENTONCES DEVOLVER null
  ahora ← Math.min(model.progress, model.goal)
  texto ← `${formatearMinutos(model.progress)} min de ${formatearMinutos(model.goal)} min`
  SI model.status = "no-alcanzado" ENTONCES
    texto ← texto + `; te faltan ${formatearMinutos(model.remaining)} min`
  SINO SI model.status = "alcanzado" ENTONCES
    texto ← texto + "; objetivo alcanzado"
  SINO
    texto ← texto + "; objetivo alcanzado; " +
            `${formatearMinutos(model.excess)} min por encima`
  FIN SI
  DEVOLVER { min: 0, max: model.goal, now: ahora, text: texto }
FIN FUNCIÓN
```

- `now` se serializa en el atributo `aria-valuenow` con punto decimal (`String(now)`), no con coma.
- `percent` se usa solo para el ancho del relleno (`style.width = percent + "%"`), nunca para `aria-valuenow`.
- Los textos usan `formatearMinutos`, que ya aplica coma decimal y separador de miles.

### 3.4. Flujo de interfaz

```text
INICIO
  sesiones ← cargarSesiones()
  objetivoActual ← leerObjetivo()        // null si no hay o es inválido
  objetivoPrevio ← null                  // solo memoria, para deshacer
  vista ← "resumen" O "invitacion" O "formulario"

FUNCIÓN mostrarSemana(hoy)
  modelo ← buildWeeklyProgress(sesiones, objetivoActual, hoy)
  minutosSemana.textContent ← formatearMinutos(modelo.progress)
  pintarObjetivo(modelo)
FIN FUNCIÓN

FUNCIÓN pintarObjetivo(modelo)
  SI vista = "formulario" ENTONCES
    ocultar resumen, invitación y aviso
    mostrar formulario
    DEVOLVER
  FIN SI
  SI modelo.hasGoal ENTONCES
    mostrar resumen; ocultar invitación y formulario
    meta.textContent ← formatGoalLabel(modelo.goal)
    barra.min ← 0; barra.max ← modelo.goal; barra.now ← min(progreso, objetivo)
    barra.texto ← getGoalBarValues(modelo).text
    relleno.ancho ← modelo.percent + "%"
    restante.textContent ← formatGoalRemaining(modelo)
    estado.textContent ← formatGoalStatusText(modelo); ocultar si vacío
  SINO
    mostrar invitación; ocultar resumen y formulario
    SI avisoPendiente ENTONCES mostrar aviso de deshacer
  FIN SI
FIN FUNCIÓN

FUNCIÓN abrirFormulario(modo)          // "fijar" o "editar"
  vista ← "formulario"
  campo.value ← modo = "editar" ? objetivoActual : ""
  limpiarError(); enfocar campo; pintarObjetivo(últimoModelo)
FIN FUNCIÓN

FUNCIÓN guardarObjetivoDesdeFormulario(hoy)
  resultado ← validateGoalInput(campo.value)
  SI resultado.ok = false ENTONCES
    mostrarError(formatGoalError(resultado.code)); enfocar campo; DEVOLVER
  FIN SI
  SI guardarObjetivo(resultado.goal) = false ENTONCES
    mostrarError(TEXTO_ERROR_GUARDADO); enfocar campo; DEVOLVER   // RF-8.7
  FIN SI
  objetivoActual ← resultado.goal
  objetivoPrevio ← null
  vista ← "resumen"; limpiarError()
  confirmacion.textContent ← "Objetivo guardado: " + formatGoalLabel(objetivoActual) + "."
  mostrarSemana(hoy); enfocar botón "Cambiar objetivo"
FIN FUNCIÓN

FUNCIÓN cancelarEdicion()
  vista ← objetivoActual = null ? "invitacion" : "resumen"
  limpiarError(); mostrarSemana(new Date())
  enfocar botón "Fijar objetivo" o "Cambiar objetivo"
FIN FUNCIÓN

FUNCIÓN eliminarObjetivo(hoy)
  SI borrarObjetivo() = false ENTONCES
    mostrarError(TEXTO_ERROR_ELIMINAR); DEVOLVER   // el objetivo sigue vigente
  FIN SI
  objetivoPrevio ← objetivoActual
  objetivoActual ← null
  vista ← "invitacion"; avisoPendiente ← true
  confirmacion oculta
  mostrarSemana(hoy); enfocar botón "Fijar objetivo"      // RF-5.9
FIN FUNCIÓN

FUNCIÓN deshacerEliminacion(hoy)
  SI objetivoPrevio = null ENTONCES DEVOLVER
  SI guardarObjetivo(objetivoPrevio) = false ENTONCES
    mostrarError(TEXTO_ERROR_GUARDADO); DEVOLVER
  FIN SI
  objetivoActual ← objetivoPrevio
  objetivoPrevio ← null; avisoPendiente ← false
  vista ← "resumen"; confirmacion oculta
  mostrarSemana(hoy); enfocar botón "Cambiar objetivo"    // RF-5.9
FIN FUNCIÓN
```

Reglas del flujo:

- Al guardar una sesión, `guardarSesion` sigue igual y vuelve a llamar a `mostrarTodo`, que ahora llama a `mostrarSemana(hoy)`: el objetivo se recalcula en el mismo gesto (RF-2.4, RF-12.1).
- La confirmación de guardado y el aviso de eliminación son independientes; el aviso de deshacer solo existe tras eliminar y desaparece al deshacer, al fijar un objetivo nuevo o al recargar (RF-5.7, RF-5.8).
- Al recargar, `objetivoPrevio` vuelve a `null`: la eliminación se mantiene (RF-5.8).
- Si la escritura falla, la memoria y la vista no cambian y no se muestra la confirmación de guardado (RF-8.7).
- La página no usa temporizadores ni `storage` entre pestañas.

## 4. Interfaz

### 4.1. Ubicación

- El bloque vive **dentro de la tarjeta «Esta semana»** (`.dato` de la sección `.resumen`), debajo de «minutos estudiados», separado por una línea fina. (RF-2.1, RF-3.2)
- No se añade una tarjeta ni una sección nueva, no hay elementos flotantes y se mantiene el diseño de hoja. (RF-12.3, NFR-1, NFR-7)
- La cifra grande de minutos de la tarjeta sigue siendo la **única cifra visible** de la semana actual; el bloque del objetivo no repite el progreso en texto: muestra el objetivo, la barra, el restante y el estado. (RF-2.1, RF-12.3)
- El bloque no aparece en el formulario de sesiones ni en la lista, que no cambian. (RF-9.1, RF-9.5)

### 4.2. Estructura HTML propuesta

```html
<section class="dato" aria-labelledby="semana-etiqueta">
  <p class="dato__etiqueta" id="semana-etiqueta">Esta semana</p>
  <p class="dato__valor"><span id="minutos-semana">0</span> min</p>
  <p class="dato__texto">minutos estudiados</p>

  <section class="objetivo" id="objetivo" aria-labelledby="objetivo-titulo">
    <h3 class="objetivo__titulo" id="objetivo-titulo">Objetivo semanal</h3>

    <div class="objetivo__resumen" id="objetivo-resumen" hidden>
      <p class="objetivo__meta" id="objetivo-meta">120 min por semana</p>

      <div
        class="objetivo__barra"
        id="objetivo-barra"
        role="progressbar"
        aria-label="Progreso del objetivo semanal"
        aria-valuemin="0"
        aria-valuemax="120"
        aria-valuenow="45"
        aria-valuetext="45 min de 120 min; te faltan 75 min"
      >
        <span class="objetivo__relleno" id="objetivo-relleno"></span>
      </div>

      <p class="objetivo__restante" id="objetivo-restante">Te faltan 75 min</p>
      <p class="objetivo__estado" id="objetivo-estado" hidden></p>

      <div class="objetivo__acciones">
        <button type="button" class="boton boton--secundario" id="objetivo-editar">
          Cambiar objetivo
        </button>
        <button type="button" class="boton boton--texto" id="objetivo-eliminar">
          Eliminar objetivo
        </button>
      </div>
    </div>

    <div class="objetivo__vacio" id="objetivo-vacio">
      <p>Fija cuántos minutos quieres estudiar cada semana para ver tu progreso.</p>
      <button type="button" class="boton boton--secundario" id="objetivo-fijar">
        Fijar objetivo
      </button>
    </div>

    <form class="objetivo__form" id="objetivo-form" novalidate hidden>
      <div class="campo">
        <label for="objetivo-minutos">Objetivo semanal (minutos)</label>
        <input
          type="text"
          id="objetivo-minutos"
          name="objetivo-minutos"
          inputmode="numeric"
          autocomplete="off"
          placeholder="Ej. 120"
          aria-describedby="objetivo-error"
        >
      </div>
      <p class="error" id="objetivo-error" role="alert" hidden></p>
      <div class="objetivo__acciones">
        <button type="submit" class="boton">Guardar objetivo</button>
        <button type="button" class="boton boton--texto" id="objetivo-cancelar">
          Cancelar
        </button>
      </div>
    </form>

    <p class="objetivo__confirmacion" id="objetivo-confirmacion" role="status" hidden></p>

    <div class="objetivo__aviso" id="objetivo-aviso" hidden>
      <p class="objetivo__aviso-texto" id="objetivo-aviso-texto" role="status">
        Objetivo eliminado.
      </p>
      <button type="button" class="boton boton--texto" id="objetivo-deshacer">
        Deshacer
      </button>
    </div>
  </section>
</section>
```

- Todos los nodos dinámicos se pintan con `textContent` y `createElement`, nunca con `innerHTML`.
- Los `id` nuevos no colisionan con los existentes; el formulario de sesiones y la lista conservan sus identificadores.
- `hidden` controla los estados; el CSS no usa `display: none` para contenido que deba seguir en el orden de foco.

### 4.3. Textos exactos en español

| Elemento | Texto |
| --- | --- |
| Título del bloque | «Objetivo semanal» |
| Invitación sin objetivo | «Fija cuántos minutos quieres estudiar cada semana para ver tu progreso.» |
| Botón para fijar | «Fijar objetivo» |
| Etiqueta del campo | «Objetivo semanal (minutos)» |
| Marcador del campo | «Ej. 120» |
| Botón guardar | «Guardar objetivo» |
| Botón cancelar | «Cancelar» |
| Confirmación de guardado | «Objetivo guardado: 120 min por semana.» |
| Meta | «120 min por semana» / «1 min por semana» / «1.000 min por semana» |
| Restante | «Te faltan 75 min» / «Te falta 1 min» / «Te faltan 29,5 min» / «0 min restantes» |
| Estado alcanzado | «Objetivo alcanzado» |
| Estado superado | «Objetivo alcanzado · 5 min por encima» / «Objetivo alcanzado · 0,5 min por encima» |
| Botón editar | «Cambiar objetivo» |
| Botón eliminar | «Eliminar objetivo» |
| Aviso de eliminación | «Objetivo eliminado.» |
| Botón deshacer | «Deshacer» |
| Error general (vacío, texto, 0, negativo) | «Escribe los minutos que quieres estudiar cada semana: un número entero mayor que 0.» |
| Error de formato (decimales, signos, separadores) | «El objetivo se expresa en minutos enteros: sin decimales, signos ni separadores. Ejemplo: 120.» |
| Error de cifra no exacta (`too-large`) | «El objetivo es demasiado grande para guardarlo con exactitud en este navegador. Escribe una cifra menor.» |
| Error de almacenamiento | «No se ha podido guardar el objetivo. Comprueba el almacenamiento del navegador e inténtalo de nuevo.» |
| Error al eliminar | «No se ha podido guardar la eliminación del objetivo. Inténtalo de nuevo.» |
| Nombre accesible de la barra | «Progreso del objetivo semanal» |
| Texto accesible de la barra | «45 min de 120 min; te faltan 75 min» / «120 min de 120 min; objetivo alcanzado» / «135 min de 120 min; objetivo alcanzado; 15 min por encima» |

El tono es neutro: no se usa «fallaste», «solo llevas» ni signos de exclamación por incumplimiento (NFR-8).

### 4.4. Estados y visibilidad

| Estado | Resumen | Invitación | Formulario | Confirmación | Aviso | Barra |
| --- | --- | --- | --- | --- | --- | --- |
| Sin objetivo | Oculto | Visible | Oculto | Oculto | Oculto | No existe |
| Sin objetivo tras eliminar | Oculto | Visible | Oculto | Oculto | Visible | No existe |
| Con objetivo, no alcanzado | Visible | Oculto | Oculto | Visible tras guardar | Oculto | Parcial, restante en texto |
| Con objetivo, alcanzado | Visible | Oculto | Oculto | Visible tras guardar | Oculto | Completa, «0 min restantes» |
| Con objetivo, superado | Visible | Oculto | Oculto | Visible tras guardar | Oculto | Completa, exceso en texto |
| Editando o fijando | Oculto | Oculto | Visible | Oculto | Oculto | No se pinta mientras el formulario está abierto |
| Error de validación | Según estado | Según estado | Visible | Oculto | Según estado | Según estado |

- La confirmación de guardado permanece hasta la siguiente acción sobre el objetivo o la recarga; no hay temporizador.
- El aviso de eliminación no se oculta por tiempo; solo al deshacer, al fijar un objetivo nuevo o al recargar (RF-5.7, RF-5.8).
- Si no hay objetivo, no se muestra restante, ni barra, ni estado, ni «0 min restantes» (RF-3.1).
- Los estados de alcanzado y de restante son excluyentes (RF-4.6).

### 4.5. Barra y estados visuales

- La barra es una pista de papel con borde de 1 px (`var(--borde-campo)`, contraste ≥ 3:1) y 10 px de alto; el relleno usa `var(--tinta)` y avanza de 0 a 100 %. (RF-2.8)
- El relleno nunca supera el 100 % aunque el progreso real sea mayor; el exceso se comunica en texto. (RF-2.8, RF-4.4)
- Al alcanzar el objetivo, el relleno ocupa todo el ancho y el texto de estado lo confirma; no hay celebración, animación ni cambio de color como única señal. (RF-4.2, RF-4.4, NFR-10)
- En `forced-colors`, la pista y el relleno usan `CanvasText` y `Highlight` con `forced-color-adjust: none`, de modo que la barra sigue siendo visible.
- En escala de grises, el borde y el relleno mantienen contraste; la información nunca depende solo del color (RF-10.2).

### 4.6. Accesibilidad

- La barra usa `role="progressbar"` con nombre accesible «Progreso del objetivo semanal», `aria-valuemin="0"`, `aria-valuemax` = objetivo y `aria-valuenow` = `min(progreso, objetivo)`. (RF-10.3)
- `aria-valuetext` incluye el progreso real, el restante o el estado y, si existe, el exceso; así el límite del indicador no oculta información. (RF-10.3)
- Objetivo, restante y estado son texto real, no solo color ni barra. (RF-2.7, RF-10.2)
- La confirmación de guardado y el aviso de eliminación viven en regiones `role="status"` (anuncio educado); los errores usan `role="alert"`. (RF-1.5, RF-5.5, RF-10.6)
- Flujo de teclado: un solo Tab recorre «Fijar/Cambiar objetivo», «Eliminar objetivo» y los botones del formulario; Enter envía el formulario; el foco visible usa el contorno de 3 px ya existente para botones. (RF-10.4, RF-10.5)
- Foco tras cada acción: eliminar → «Fijar objetivo»; deshacer → «Cambiar objetivo»; guardar → «Cambiar objetivo»; cancelar → «Cambiar objetivo» o «Fijar objetivo» según haya objetivo. (RF-5.9)
- El campo es `type="text"` con `inputmode="numeric"`: no muestra flechas de número ni acepta notación científica, y el mensaje de error es siempre el nuestro en español. (RF-7.4, RF-7.5, NFR-8)
- Zoom al 200 %: meta, barra, restante y acciones envuelven texto sin solaparse; la barra conserva altura y el relleno se adapta al ancho disponible. (RF-10.7)

### 4.7. Responsive y táctil

- En escritorio, el bloque ocupa la mitad izquierda de `.resumen`; la barra se estira al ancho de esa columna y las acciones se alinean en fila con separación de 0,75 rem.
- En ≤ 560 px, `.resumen` pasa a una columna (ya existe) y el bloque ocupa todo el ancho; meta, restante y estado pueden ocupar varias líneas.
- A 320 px, el campo y los botones se apilan; «Guardar objetivo» y «Cancelar» ocupan el ancho, y los botones de acción se envuelven sin desbordar. (RF-11.1, RF-11.4)
- Los botones nuevos tienen `min-height: 44px` y `min-width: 44px` efectivos; los botones de texto mantienen el área táctil con relleno vertical. (RF-11.3)
- Todas las acciones funcionan con toque, sin `hover` obligatorio; el foco visible no depende del puntero. (RF-11.2)
- Los números grandes usan `overflow-wrap: anywhere` en meta y restante para no provocar scroll horizontal. (RF-11.4)

## 5. Decisiones técnicas y alternativas descartadas

| Decisión | Justificación | Alternativa descartada | RF |
| --- | --- | --- | --- |
| Clave `diario-estudio-objetivo` con un número JSON | El objetivo es un dato único, independiente de las sesiones y sin estructura propia. Se escribe `JSON.stringify(120)`, que produce el número `120` (no la cadena `"120"`), y no se toca `diario-estudio-sesiones`. | Objeto `{ minutes: 120 }`: añade una capa que nadie más usa. Dentro de las sesiones: rompe el formato y arriesga los datos existentes. Texto plano: admite valores ambiguos y mezcla tipos. Guardar una cadena: obliga a interpretarla y confunde el tipo del dato. | RF-1.7, RF-8.6, NFR-3 |
| Lectura tolerante con `normalizeGoal` | Cualquier dato corrupto, antiguo o manipulado se trata como «sin objetivo» sin errores ni pérdida de sesiones; también se aceptan cadenas de dígitos heredadas, pero solo si su valor es un entero seguro. | Confiar en `JSON.parse` y en el tipo: `true`, `"120"` (cadena guardada) o `1.5` se colarían como objetivo. | RF-8.4, RF-8.5, NFR-4 |
| Un solo cálculo: `buildWeeklyProgress` sobre `calcularMinutosSemana` | La tarjeta y el objetivo leen el mismo número; es imposible que muestren cifras distintas. | Sumar en `mostrarMinutosSemana` y volver a sumar en el objetivo: dos rutas que pueden divergir con datos raros. | RF-2.2, RF-9.2, RF-12.3 |
| `calcularMinutosSemana` usa `parseMinutes` | Alinea «Esta semana» con el mapa y con el progreso e ignora 0, negativos y no numéricos, como exige RF-9.4. Con datos válidos el resultado es idéntico. | Filtrar solo en el objetivo: la tarjeta seguiría sumando negativos y restaría minutos. Validar con `Number()`: `true` sumaría 1 minuto. | RF-9.4–RF-9.6 |
| `roundMinutes` y hasta 2 decimales con coma | Las sesiones admiten decimales; `roundMinutes` evita `0,30000000000000004` y `formatearMinutos` muestra «29,5» sin ceros de relleno. | Redondear a entero: falsea restante y exceso. `toFixed(2)`: fuerza «29,50» y cambia el formato del resto de la interfaz. | RF-2.6, RF-2.9, RF-4.1, RF-4.3 |
| Validación con regex y `Number.isSafeInteger` | Es determinista: solo dígitos y un valor representable con exactitud. Distingue formato (decimales, signos, separadores), valor (vacío, 0, negativo) y cifra no exacta (`too-large`) para dar el mensaje correcto. | `parseFloat`/`Number` sin comprobar el rango: acepta `1e3`, `0x10`, `Infinity` y convierte `"1,5"` en 1 sin avisar; una cadena larga se guardaría como `null`. `type="number"`: normaliza en silencio y permite notación científica. | RF-7.1, RF-7.4–RF-7.8 |
| Entrada `type="text"` + `inputmode="numeric"` | Mantiene el control total del valor, el mensaje en español y el rechazo de decimales; en móvil abre teclado numérico. | `type="number"` con `step="1"`: el navegador puede redondear o vaciar el valor y muestra validación nativa. | RF-7.4, RF-7.5, RF-11.2 |
| Barra con `valuenow = min(progreso, objetivo)` | El indicador siempre es válido (0 ≤ actual ≤ máximo) y la información real viaja en `aria-valuetext`. | `valuenow` = progreso real: inválido por encima del máximo; algunos lectores lo recortan o lo ignoran. Barra solo CSS con `aria-hidden`: pierde semántica. `<meter>`: semántica de medida, no de progreso hacia una meta. | RF-2.8, RF-10.3 |
| Porcentaje para CSS separado de los valores ARIA | El ancho puede ser fraccionario sin afectar a la semántica; el indicador conserva máximo y actual exactos. | Reutilizar `percent` para `valuenow`: mezcla escala 0–100 con escala 0–objetivo. | RF-2.8, RF-10.3 |
| Eliminar sin confirmación y con «Deshacer» en memoria | Una acción reversible no necesita fricción; el aviso cubre el error y no hay que bloquear la página. | `confirm()`: bloquea, no se estiliza y su accesibilidad depende del navegador. Guardar el aviso en localStorage: la spec descarta recuperarlo tras recargar. Temporizador: RF-5.7 prohíbe el límite de tiempo. | RF-5.4–RF-5.9 |
| Escritura que devuelve `true`/`false` y no actualiza la memoria si falla | Cumple RF-8.7: no se afirma que se guardó y el objetivo anterior sigue vigente. | Actualizar primero y avisar después: al recargar el objetivo desaparecería. `try/catch` silencioso: la persona creería que se guardó. | RF-1.5, RF-8.7 |
| Bloque dentro de «Esta semana» con una sola cifra | La tarjeta ya es el lugar natural del dato semanal; añadir otra tarjeta duplicaría la cifra y rompería el diseño de hoja. | Tarjeta propia encima del resumen: dos cifras semanales en la misma página (RF-12.3). Solo barra sin cifras: incumple RF-2.1, RF-4 y RF-10.2. | RF-2.1, RF-3.2, RF-12.3 |
| Funciones nuevas en inglés, textos en español | La constitución pide código en inglés; las funciones existentes en español se conservan para no romper la compatibilidad ni los tests. | Renombrar todo `app.js`: refactor amplio sin relación con esta funcionalidad. Nombres nuevos en español: mezcla innecesaria. | Constitución 6 |
| Foco explícito tras guardar, cancelar, eliminar y deshacer | Al ocultarse el control usado, el foco no debe perderse; el destino queda donde la persona puede continuar. | Dejar que el navegador decida: el foco cae en `body` y el teclado pierde el contexto. | RF-5.9, RF-10.4 |
| Sin animaciones ni transiciones nuevas | NFR-10 no las pide y reducen ruido; el relleno cambia de ancho de forma inmediata. | Animación del relleno: no aporta información y exige respetar movimiento reducido. | NFR-10 |
| Sin sincronización entre pestañas | La spec no la pide y añade superficie; al guardar una sesión o recargar se recalcula. | `storage` listener: comportamiento nuevo no especificado. | Fuera de alcance |

## 6. Estrategia de tests con `node --test`

### 6.1. Preparación

- Runner nativo `node --test` y `node:assert/strict`; sin `package.json` ni instalación.
- `app.js` mantiene la exportación condicional; se añaden al `module.exports` las funciones nuevas: `normalizeGoal`, `validateGoalInput`, `formatGoalError`, `getGoalStatus`, `getGoalRemaining`, `getGoalExcess`, `buildWeeklyProgress`, `formatGoalLabel`, `formatGoalRemaining`, `formatGoalStatusText` y `getGoalBarValues`.
- `app.test.js` no se carga desde `index.html`; sigue siendo el único archivo que exige la constitución.
- Fechas construidas con `fecha(2026, 11, 5)` (mediodía local), nunca con cadenas ISO. `today` siempre explícito.
- Los tests no tocan DOM, `localStorage`, red ni reloj real. No se prueban las funciones de persistencia directamente: su tolerancia se cubre con `normalizeGoal` y su integración a mano.
- Los tests existentes (43) deben seguir pasando sin cambios salvo los derivados de RF-9.4.

### 6.2. Casos nuevos previstos (37)

| Grupo | Nº | Casos | RF |
| --- | --- | --- | --- |
| Semana y sesiones inválidas | 2 | (a) `calcularMinutosSemana` ignora 0, negativos, `NaN`, `"diez"` y booleanos, y no muta la lista; (b) conserva decimales exactos (`0,5 + 29,5 = 30`; `0,1 + 0,2 = 0,3`) y sigue excluyendo futuros y semana anterior. | RF-9.4–RF-9.6, RF-2.9 |
| Validación del objetivo | 9 | (a) `normalizeGoal` acepta enteros y cadenas de dígitos con espacios; (b) rechaza 0, negativos, decimales, `"1,5"`, `"1.000"`, `"1 000"`, `"+30"`, texto, booleanos, `null`, `undefined`, `NaN`, `Infinity`, objetos y arrays; (c) `validateGoalInput(" 120 ")` y `"999999"` válidos; (d) vacío y solo espacios; (e) texto no numérico y booleanos; (f) 0 y negativos; (g) decimales, separadores y signos con código de formato; (h) `formatGoalError` devuelve mensajes en español distintos, menciona «minutos enteros» en formato, «mayor que 0» en el resto y el mensaje de `too-large`; (i) cifras no exactas: `"9007199254740992"`, `"99999999999999999999"`, `"9".repeat(400)` y una cadena que `Number()` convierte en `Infinity` devuelven `too-large` y `normalizeGoal` las rechaza; `"9007199254740991"` (máximo seguro) se acepta y `JSON.stringify` de ese valor produce el texto `9007199254740991` sin comillas, de modo que `JSON.parse` lo devuelve como número. | RF-7.1–RF-7.8, RF-8.4 |
| Progreso y estado | 17 | Sin objetivo; progreso 0; progreso igual; progreso por encima; restante 0,5; restante 29,5; exceso 0,5; lunes cuenta y domingo futuro no; semana anterior no cuenta; varias sesiones el mismo día; sesiones inválidas ignoradas; decimales no redondeados a entero (`0,75`); cambio de domingo a lunes con objetivo vigente; cambio de mes y de año dentro de la semana; cambio de objetivo a mitad de semana recalcula restante, estado y porcentaje; objetivo inválido equivale a sin objetivo; no mutación de las sesiones. | RF-2.2–RF-2.5, RF-2.9, RF-4.1–RF-4.6, RF-6.1–RF-6.7, RF-12.4 |
| Textos y barra | 7 | `formatGoalLabel` con 120, 1.000 y 1.000.000; restante singular «Te falta 1 min», plural «Te faltan 75 min» y decimal «Te faltan 29,5 min»; restante «0 min restantes» al alcanzar y superar; estado vacío/no alcanzado, «Objetivo alcanzado» y «Objetivo alcanzado · 0,5 min por encima»; barra con `min = 0`, `max = objetivo`, `now = progreso` y texto con restante; barra con exceso (`now = objetivo`, texto con progreso real y exceso); barra sin objetivo devuelve `null`. | RF-2.6–RF-2.8, RF-4.1–RF-4.4, RF-7.7, RF-10.2, RF-10.3 |
| Cálculo único y no regresión | 2 | «Esta semana» y `buildWeeklyProgress(...).progress` coinciden en varios conjuntos (vacío, válido, decimal, con inválidas); la racha y los días del mes siguen contando sesiones con 0/negativos/no numéricos y el mapa no cambia (RF-9.6). | RF-9.1–RF-9.6, RF-12.3 |

Casos que ya existen y se conservan como no regresión: racha (hoy, ayer, viva sin hoy, rota, varias el mismo día), días del mes (una, varias el mismo día, día 1, futura, mes anterior, cambio de año), minutos semanales (lunes, hoy, domingo futuro, semana anterior, cambio de mes y año, 0), mapa (84 días, niveles, agrupación, resumen, etiquetas, detalle, accesible, contrato).

### 6.3. Verificación manual en navegador

- Arranque sin objetivo: invitación visible, sin restante ni barra, métricas existentes a cero. (RF-3.1, RF-3.2, RF-8.5)
- Fijar el primer objetivo sin sesiones: aparece el resumen en el mismo gesto y se confirma. (RF-1.1, RF-1.5, RF-3.3)
- Guardar una sesión con objetivo: minutos, barra, restante y estado se actualizan sin recargar. (RF-2.4, RF-12.1)
- Casos numéricos: 0, 30/30, 30,5/30, 0,5/30, 29,5/30 y objetivo de 1 min. (RF-2.9, RF-4.1–RF-4.4)
- Editar a mitad de semana: el nuevo objetivo compara con los minutos ya acumulados. (RF-5.2, RF-5.3)
- Cancelar la edición: el objetivo anterior no cambia. (RF-5.11)
- Eliminar: desaparece sin confirmación previa, aparece el aviso, el foco queda en «Fijar objetivo». (RF-5.4, RF-5.5, RF-5.9)
- Deshacer: vuelve el objetivo y el progreso, el aviso desaparece y el foco queda en «Cambiar objetivo». (RF-5.6, RF-5.9)
- Recargar tras eliminar: no reaparecen el objetivo ni el aviso. (RF-5.8)
- Recargar tras fijar: el objetivo y el progreso se conservan. (RF-8.1)
- Errores de validación: vacío, texto, 0, negativo, `1,5`, `1.000`, `1 000`, `+30`, `true`, `NaN`, `Infinity`, `9007199254740992` y una cadena de 400 dígitos; los dos últimos muestran el mensaje de `too-large` y nunca se guardan; siempre se conserva el objetivo anterior. (RF-7.3–RF-7.5)
- Límite exacto: `9007199254740991` se acepta, se muestra con separador de miles y al recargar sigue vigente; `localStorage` contiene un número JSON (sin comillas), no una cadena. (RF-7.2, RF-8.1)
- Fallo de escritura simulado (`localStorage.setItem` que lanza): mensaje en español, objetivo anterior vigente, sesiones intactas. (RF-8.7)
- Objetivo corrupto en localStorage (`"abc"`, `{}`, `1.5`, `true`): arranca sin objetivo y sin errores en consola. (RF-8.4)
- Cambio de domingo a lunes: progreso solo con la semana nueva, objetivo vigente. (RF-6.4–RF-6.6)
- Sesión futura dentro de la semana: no suma hasta su día. (RF-6.2, RF-6.7)
- Barra accesible: valores mínimo, máximo y actual, y texto con progreso real y exceso. (RF-10.3)
- Teclado completo: fijar, editar, cancelar, eliminar, deshacer, con foco visible y orden lógico. (RF-10.4, RF-10.5)
- Lector de pantalla: anuncio de confirmación, error y aviso de eliminación. (RF-10.6)
- 320, 375, 768 y 1440 px: sin scroll horizontal, sin solapamientos, botones ≥ 44 px y uso con toque. (RF-11.1–RF-11.4)
- Zoom 200 %, escala de grises y contraste forzado. (RF-10.7, NFR-6)
- Consola limpia tras cargar, fijar, editar, eliminar, deshacer, guardar sesión y recargar. (NFR-4)
- Racha, días del mes, mapa y lista con los mismos valores que antes del cambio. (RF-9.1, RF-9.6)

### 6.4. Puertas de calidad

- `node --test` en verde antes de cerrar cualquier tarea; un test en rojo bloquea la siguiente. (Constitución 4)
- `TZ=Europe/Madrid node --test` también en verde (fechas locales y cambio de hora).
- Cada RF nuevo tiene al menos un test puro o una comprobación manual registrada.
- No se acepta una solución con `npm install`, build, red, módulos ES o un cuarto archivo de runtime.

## 7. Trazabilidad de requisitos funcionales

| RF | Dónde se cubre | Verificación |
| --- | --- | --- |
| RF-1 Fijar | `validateGoalInput`, flujo `guardarObjetivoDesdeFormulario`, formulario y confirmación (3.4, 4.2–4.4); `normalizeGoal` (2.1). | Tests de validación; manual fijar sin sesiones, confirmación y recarga. |
| RF-2 Ver objetivo y progreso | `buildWeeklyProgress`, `getGoalBarValues`, `mostrarSemana` (2, 3); bloque de la tarjeta (4.2–4.5). | Tests de progreso, textos y barra; manual de cifras y actualización al guardar. |
| RF-3 Sin objetivo | `hasGoal = false`, estado `sin-objetivo`, invitación (3.4, 4.4); sin barra ni restante. | Test sin objetivo; manual de arranque y primer guardado. |
| RF-4 Alcanzar o superar | `getGoalStatus`, `getGoalRemaining`, `getGoalExcess`, `formatGoalRemaining`, `formatGoalStatusText` (2, 3). | Tests de igual, por encima, restante y exceso decimales; manual 30/30 y 30,5/30. |
| RF-5 Editar y eliminar | Flujos de editar, cancelar, eliminar y deshacer (3.4); aviso y foco (4.2, 4.6). | Manual de edición a mitad de semana, cancelación, eliminación, deshacer, recarga y foco. |
| RF-6 Semana y vigencia | `calcularMinutosSemana` + `buildWeeklyProgress` (3.2); semana de lunes a domingo. | Tests de lunes, domingo futuro, semana anterior, cambio de semana, cambio de mes/año y cambio de hora (`TZ`). |
| RF-7 Formato y validación | `normalizeGoal`, `validateGoalInput`, `formatGoalError`, `formatGoalLabel` (2, 3.1). | Tests de válido, vacío, texto, 0, negativo, decimales, separadores, espacios, booleanos, `NaN`, `Infinity`, `too-large` y máximo seguro serializado como número; manual de mensajes. |
| RF-8 Persistencia | `leerObjetivo`, `guardarObjetivo`, `borrarObjetivo`, `normalizeGoal` (2.4); manejo de fallo (3.4). | Tests de lectura corrupta vía `normalizeGoal`; manual de recarga, migración intacta y fallo de escritura simulado. |
| RF-9 Coherencia | `calcularMinutosSemana` con `parseMinutes`, cálculo único (2.3, 3.2); tarjeta (4.1). | Tests de sesiones inválidas y de coincidencia tarjeta/progreso; no regresión de racha, mes, mapa y lista. |
| RF-10 Accesibilidad | `getGoalBarValues`, regiones vivas, foco y teclado (4.6). | Tests de valores y texto de barra; manual con teclado, lector, zoom y contraste. |
| RF-11 Móvil | CSS del bloque, botones de 44 px y reflujo (4.7). | Manual 320/375/768/1440, toque y sin scroll horizontal. |
| RF-12 Actualización e interfaz | `mostrarSemana` dentro de `mostrarTodo`; una sola cifra (3.4, 4.1, 4.4). | Tests de recálculo y no regresión; manual al guardar sesión, cambiar objetivo, eliminar y deshacer. |

## 8. Cobertura de requisitos no funcionales

| NFR | Cómo se cumple |
| --- | --- |
| NFR-1 Simplicidad | Tres archivos de runtime, sin build ni servidor; se abre con doble clic. |
| NFR-2 Sin dependencias | Solo APIs nativas; tests con Node; sin red. |
| NFR-3 Datos intactos | El objetivo va en su propia clave; las sesiones no se reescriben al fijar, editar, eliminar o deshacer. Tests de no mutación. |
| NFR-4 Datos dañados | `normalizeGoal` + `try/catch` en lectura; valor inválido = sin objetivo, sin errores en consola. |
| NFR-5 Rendimiento | Una pasada por sesiones por render; DOM pequeño (unos 10 nodos nuevos); sin temporizadores. |
| NFR-6 Accesibilidad | `progressbar` válido, texto equivalente, regiones vivas, foco visible y contraste ≥ 3:1. |
| NFR-7 Responsive | Reflujo dentro de `.resumen`; probado de 320 a 1440 px sin scroll horizontal. |
| NFR-8 Idioma y tono | Textos en español, coma decimal y tono neutro; mensajes sin reproche. |
| NFR-9 Mantenibilidad | Toda la lógica del objetivo es pura y recibe `today`; se prueba sin navegador. |
| NFR-10 Movimiento | Sin animaciones nuevas; el relleno cambia de ancho de inmediato. |
| NFR-11 Privacidad | Sin red, analítica ni envío de datos. |
| NFR-12 No regresión | `calcularMinutosSemana` solo cambia el filtro de minutos; tests de racha, mes, mapa, lista y formulario. |

## 9. Orden de implementación, riesgos y cierre

### 9.1. Orden

1. Tests de RF-9.4 en rojo y ajuste de `calcularMinutosSemana`.
2. Validación y normalización del objetivo con tests.
3. Cálculo del progreso y del estado con tests.
4. Textos y barra con tests.
5. Persistencia tolerante y manejo del fallo de escritura.
6. HTML del bloque dentro de «Esta semana».
7. CSS del bloque, la barra, el aviso y el responsive.
8. Render de estados y refactor de «Esta semana» al cálculo único, con tests de no regresión.
9. Interacción de fijar, editar y cancelar.
10. Eliminar y deshacer con aviso y foco.
11. Accesibilidad: barra, regiones vivas y teclado.
12. Verificación funcional en Chromium, responsive/táctil, `node --test` y `MEMORY.md`.

### 9.2. Riesgos y decisiones a revisar

- **Cifra repetida:** RF-12.3 prohíbe dos cifras distintas, no dos veces la misma. El plan evita repetir el progreso en texto visible: la cifra grande de la tarjeta es la única; la barra lo repite solo en `aria-valuetext` para lectores de pantalla. Si se prefiere «45 min de 120 min» visible, hay que añadir un RF.
- **Cambio de `calcularMinutosSemana`:** los minutos negativos y los booleanos dejan de sumar (antes `true` sumaba 1 y `-5` restaba). Es la única modificación admitida por RF-9.4/RF-9.5, pero conviene revisarla con datos antiguos.
- **Fallo al eliminar:** la spec solo describe el fallo al guardar (RF-8.7). El plan reutiliza el mismo criterio: mensaje, objetivo anterior vigente y sesiones intactas. Si se prefiere otro comportamiento, hay que añadir un RF.
- **Límite de representación exacta (`too-large`):** JavaScript solo representa con exactitud enteros hasta `Number.MAX_SAFE_INTEGER` (9.007.199.254.740.991). Por encima, el valor pierde dígitos o se convierte en `Infinity`, y `JSON.stringify(Infinity)` produce `null`, con lo que el objetivo desaparecería al recargar. Rechazarlo **no es un máximo de producto**: RF-7.2 prohíbe un tope de objetivo y la aplicación no impone ninguno; es el límite físico de la representación numérica del navegador. La spec todavía no menciona este caso, así que conviene añadirle una nota en una futura revisión (sin cambiar el plan ni las tareas): «por encima del límite de representación exacta de JavaScript se rechaza con un mensaje; no es un máximo de producto». El caso «objetivo muy grande» de la spec se sigue cumpliendo con cualquier entero seguro (se prueba `1.000.000`), y el mensaje de `too-large` no propone ninguna cifra máxima.
- **Persistencia sin tests automáticos:** `localStorage` no se toca en `node --test`. La tolerancia se cubre con `normalizeGoal` y la integración se verifica a mano; no hay forma de probar la cuota agotada sin navegador.
- **Ubicación en la tarjeta:** la columna «Esta semana» crece en altura y en móvil desplaza «Este mes» hacia abajo. Es una decisión visual a revisar en 320 px.
- **Número de tareas:** la skill SDD sugiere 10 tareas como máximo; el encargo pide 8–12 y la spec cubre 12 grupos de RF. Se entregan 12. Si se prefiere 10, se pueden fusionar «textos y barra» con «cálculo» y «accesibilidad» con «eliminar/deshacer».
- **Consistencia futura:** el objetivo no caduca y no se sincroniza entre pestañas; si se abre la página en dos pestañas, la última escritura gana. La spec no pide más.

### 9.3. Criterios de finalización del plan

- `node --test` en verde, también con `TZ=Europe/Madrid`.
- Los 37 tests nuevos cubren los grupos de la sección 6.2 y los 43 existentes siguen pasando.
- Verificación manual de la sección 6.3 registrada, con consola limpia.
- 320, 375, 768 y 1440 px sin scroll horizontal ni solapamientos; toque, teclado, lector, zoom 200 % y escala de grises comprobados.
- Racha, días del mes, mapa y lista conservan sus valores; ninguna sesión cambia y el formato de datos no se toca.
- Spec, plan, tareas y `MEMORY.md` coherentes entre sí.
