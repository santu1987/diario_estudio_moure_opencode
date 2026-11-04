# AGENTS.md — Diario de Estudio

Web estática para registrar sesiones de estudio y calcular la racha. Proyecto didáctico: el código debe seguir siendo fácil de leer para alguien que empieza a programar.

## Estructura y restricciones
- Solo `index.html`, `styles.css` y `app.js`. Sin frameworks, librerías, npm, bundler, build ni tests.
- Debe funcionar abriendo `index.html` con doble clic (`file://`): sin módulos ES, `fetch` local ni nada que requiera servidor.
- Textos de interfaz en español. Diseño responsive; comprueba el móvil en cualquier cambio visual.
- Pregunta antes de crear archivos, añadir funcionalidades o cambiar el formato de los datos guardados.
- ✅ Siempre: actualizar `MEMORY.md` al terminar cada tarea.

## Datos
- localStorage, clave exacta `diario-estudio-sesiones`: `[{ date: "AAAA-MM-DD", topic, minutes }]`.
- No elimines la migración de la primera versión (`diarioDeEstudio.sesiones` con `{fecha,tema,minutos}`); puede haber sesiones ya guardadas en ese formato.
- La validación del formulario es manual (`novalidate`) para mantener los mensajes en español.

## Fechas y racha
- Usa siempre la fecha local del usuario. Nunca `toISOString()` ni `new Date("AAAA-MM-DD")`: se interpretan en UTC y desplazan el día.
- Reutiliza `fechaParaInput()` para generar claves `AAAA-MM-DD` y `formatearFecha()` para mostrarlas.
- Un día cuenta con al menos una sesión. La racha son días consecutivos que terminan hoy; si hoy no hay sesión pero ayer sí, sigue viva y se cuenta desde ayer.
- Varias sesiones del mismo día cuentan como un día. Las fechas futuras no suman.
- La semana empieza en lunes y termina en domingo, en fecha local. Para comparar fechas usa claves `AAAA-MM-DD` generadas con `fechaParaInput()`; nunca `toISOString()` ni `new Date("AAAA-MM-DD")`.
- El total semanal suma las sesiones desde el lunes hasta hoy. Las fechas futuras no cuentan.
- El mes es natural, del día 1 al último del mes, en fecha local. El contador de días usa un `Set` de claves `AAAA-MM-DD` para que varias sesiones del mismo día cuenten una vez.
- El contador mensual solo suma hasta hoy; las fechas futuras no cuentan.

## Verificación
- No hay tests automáticos. Después de cada cambio, verifica con el MCP de Chrome DevTools: abre `index.html`, prueba la funcionalidad, revisa la consola y comprueba la vista móvil. 
- Casos mínimos: guardar, recargar (persistencia), racha con hoy/ayer, racha viva sin sesión hoy y racha rota.
- Total semanal: sesiones del lunes, de hoy y del domingo; una sesión de la semana anterior; cambio de mes/año; varias sesiones el mismo día; total a 0.
- Días del mes: sin sesiones, una sesión, varias el mismo día, día 1, fecha futura, mes anterior, cambio de mes/año y singular/plural.
- Para empezar de cero: DevTools → Application → Local Storage → borrar `diario-estudio-sesiones`.

## Memoria
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales).

Al terminar, resume qué cambiaste y cualquier decisión que el usuario deba revisar.
