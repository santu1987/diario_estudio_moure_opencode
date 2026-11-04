# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.
## Estado actual
- v1 funcionando: registrar sesiones (fecha, tema, minutos), racha actual, total de minutos de la semana, días estudiados del mes y lista de sesiones.
- Datos en localStorage.
- Rediseño visual v2 aplicado sin tocar `app.js` ni el formato de datos.
- Probado el 2026-11-04 en Chromium 141 (375 px): alta de 3 sesiones, persistencia, racha y totales correctos; consola limpia y sin scroll horizontal.
## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- Total semanal de lunes a domingo y solo hasta hoy: coincide con la semana natural y no suma fechas futuras, igual que la racha.
- El total se calcula al vuelo desde `sesiones`: no hay datos nuevos que guardar ni migrar.
- Días del mes: mes natural local, solo hasta hoy y días únicos (varias sesiones del mismo día cuentan una vez).
## Diseño v2
- Dirección: una hoja de cuaderno (cuadrícula tenue + margen rojo) sobre un escritorio verde apagado. Todo vive en la misma página, sin tarjetas flotantes.
- Paleta: papel `#fcfcf8`, tinta `#1b2a3a`, línea `#d8e1e8`, margen `#d98f8f`, resaltador `#ffd75e`. Se abandona el crema + naranja terracota anterior.
- Tipografía: serif de libro para títulos (Iowan/Palatino/Georgia), sans del sistema para texto y mono para cifras.
- Un solo gesto fuerte: la racha, con subrayado de marcador que se traza al cargar y respeta `prefers-reduced-motion`. El resto son hairlines y espacio.
- Contraste revisado: textos suaves ≥5:1, bordes de campo ≥3:1, foco visible en campos y botón.
## Aprendizajes y errores a evitar
- No existe «mejor racha» en la interfaz ni en `app.js`; con 3 días consecutivos solo se muestra la racha actual (3). Si se pide, hay que añadirla.
## Próximos pasos
- Valorar una meta semanal o mensual, o comparar con el periodo anterior.
