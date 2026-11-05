# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.
## Estado actual
- v2 con mapa de calor de 12 semanas terminado y verificado (2026-11-05). Spec `specs/001-heat-map/spec.md` aprobada; T001–T033 marcadas.
- Funciona: registrar sesiones (fecha, tema, minutos), racha, minutos de la semana, días del mes, lista y mapa de calor. Datos en localStorage (`diario-estudio-sesiones`), con migración desde `diarioDeEstudio.sesiones`.
- `app.js`: lógica pura (fechas, niveles, modelo, textos) y DOM dentro de `iniciar()`. Exportación condicional para `node --test`; no usa módulos ES.
- `app.test.js`: 43 tests de lógica pura y no regresión. `node --test` en verde, también con `TZ=Europe/Madrid`.
- Verificado en Chromium 141 headless/CDP: 104/104 comprobaciones (funcional, teclado, toque, AX, responsive 320/375/768/1440, contraste forzado, movimiento reducido) y consola limpia.
- El MCP de Chrome DevTools no arranca en este entorno (falta `/opt/google/chrome/chrome` y se ejecuta como root); se usa Chromium headless por CDP.
## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- Total semanal de lunes a domingo y solo hasta hoy; días del mes naturales, únicos y solo hasta hoy.
- Mapa: 12 semanas completas de lunes a domingo (84 días; la última termina el domingo actual). Ventana fija para que un día conserve siempre su color.
- Niveles: 1 = >0 y <30; 2 = 30–<60; 3 = 60–<120; 4 = ≥120. Futuros con trama y `level = null`.
- Resumen con denominador fijo: «X de 84 días con sesiones · Y min».
- Sesiones con 0 minutos o inválidas se ignoran en mapa, detalle y resumen, pero no se borran.
- Etiquetas de mes de 3 letras: primera columna y columnas con día 1 (máximo una por columna).
- Hoy: punto interior + `aria-current="date"`. Detalle por hover, foco, toque o clic; se cierra con la misma casilla, fuera del mapa o Escape.
- Teclado: roving tabindex; flechas, Inicio/Fin a la primera/última **semana** de la fila, sin wrap.
- Móvil: celdas de 18 px y 24 px entre centros; en ≤370 px el bloque ocupa el ancho de la hoja.
## Diseño v2
- Hoja de cuaderno sobre escritorio verde; paleta papel `#fcfcf8`, tinta `#1b2a3a`, margen `#d98f8f`, resaltador `#ffd75e`.
- Serif para títulos, sans para texto, mono para cifras. Único gesto fuerte: la racha (respeta `prefers-reduced-motion`).
- Contraste: textos suaves ≥5:1, bordes de campo ≥3:1.
## Aprendizajes y errores a evitar
- Fechas siempre con componentes locales; nunca `toISOString()` ni `new Date("AAAA-MM-DD")`.
- Al ordenar la lista, `sort` es estable en JS moderno: no reordena las sesiones existentes del mismo día; la nueva queda la primera de su día.
- Inicio/Fin del mapa van a la primera/última semana de la fila, no al lunes/domingo.
## Próximos pasos
- Sin pendientes de la spec 001. Los cambios están sin commit.
