# Spec 001 — Mapa de calor de las últimas 12 semanas

- **Estado:** aprobada
- **Fecha:** 5 de noviembre de 2026
- **Alcance:** primera versión del mapa de calor
- **Principio rector:** la spec describe el qué y el porqué. El cómo técnico se decide en el plan.

## 1. Contexto y objetivo

El Diario de Estudio ya muestra la racha actual, los minutos de la semana, los días estudiados del mes y la lista de sesiones. Son cifras correctas, pero no permiten ver de un vistazo el ritmo de estudio a lo largo del tiempo: si la constancia es regular, si hay semanas fuertes y flojas o si se ha abandonado el hábito durante un periodo.

El objetivo es añadir un mapa de calor inspirado en GitHub que represente las últimas 12 semanas completas, de lunes a domingo y terminando en la semana actual, aunque algunos de sus días todavía no hayan llegado. Cada día es una casilla; cuanto más se ha estudiado ese día, más intensa es la casilla. El mapa debe permitir responder en pocos segundos a tres preguntas: qué días he estudiado, cuánto estudié cada día y cómo se distribuye mi constancia en las últimas semanas.

Es una funcionalidad de solo lectura: no cambia la forma de registrar sesiones, no crea datos nuevos y no altera la racha ni los contadores existentes.

## 2. Usuarios

- **Estudiante habitual:** ya registra sesiones y quiere ver su constancia y su evolución reciente sin leer una lista.
- **Estudiante que vuelve tras un parón:** necesita ver de forma honesta y no culpabilizadora qué días ha estudiado y cuáles no.
- **Persona que empieza:** abre la aplicación sin sesiones y debe entender para qué sirve el mapa y cómo se llenará.
- **Persona que navega con teclado, lector de pantalla o pantalla táctil:** debe obtener la misma información que quien usa ratón.

## 3. Historias de usuario

- **US-1 (Must):** como estudiante, quiero ver de un vistazo los días que he estudiado en las últimas 12 semanas para valorar mi constancia.
- **US-2 (Must):** como estudiante, quiero que la intensidad del color refleje los minutos estudiados para distinguir días exigentes de días ligeros.
- **US-3 (Must):** como estudiante, quiero consultar la fecha, los minutos y el número de sesiones de un día concreto sin salir de la página.
- **US-4 (Must):** como persona que usa teclado o lector de pantalla, quiero acceder a la misma información que el resto para no quedar excluida.
- **US-5 (Must):** como persona que empieza, quiero entender la escala y ver un mapa vacío con una invitación clara a registrar la primera sesión.
- **US-6 (Should):** como estudiante, quiero un resumen breve del periodo para contextualizar el mapa sin sumar cifras a mano.

## 4. Requisitos funcionales

### RF-1 — Presencia del mapa

El mapa forma parte de la página principal y se muestra siempre, con o sin datos, sin sustituir ni ocultar la racha, los contadores ni la lista de sesiones.

- **RF-1.1** Cuando la página termina de cargar, el sistema debe mostrar el mapa de calor sin requerir ninguna acción previa.
- **RF-1.2** El sistema debe mostrar el mapa aunque no exista ninguna sesión registrada.
- **RF-1.3** Si no hay ninguna sesión dentro del periodo, el sistema debe mostrar el mensaje «Aún no hay sesiones en estas 12 semanas. Registra la primera para empezar a llenar el mapa.», manteniendo visibles las casillas y la leyenda.
- **RF-1.4** El sistema no debe modificar el orden, el contenido ni el funcionamiento de la racha, los contadores y la lista de sesiones.

### RF-2 — Periodo de 12 semanas

El periodo es fijo: 12 semanas completas alineadas de lunes a domingo. La última semana es la semana actual, de modo que el mapa siempre incluye hoy aunque algunos de sus días aún no hayan llegado.

- **RF-2.1** El sistema debe mostrar 12 columnas de semanas y 7 filas de días, es decir, 84 casillas.
- **RF-2.2** La última columna debe corresponder a la semana actual, de lunes a domingo.
- **RF-2.3** La primera columna debe empezar el lunes de la semana situada 11 semanas antes de la semana actual.
- **RF-2.4** Dado que hoy es jueves 5 de noviembre de 2026, el sistema debe mostrar un periodo que empieza el lunes 17 de agosto de 2026 y termina el domingo 8 de noviembre de 2026, aunque del 6 al 8 de noviembre sean días futuros.
- **RF-2.5** El sistema debe calcular el periodo con la fecha local del usuario, identificando cada día por su fecha de calendario local.
- **RF-2.6** El mapa no debe ofrecer controles para cambiar de periodo, avanzar o retroceder semanas en esta versión.

### RF-3 — Agrupación por día

Cada casilla representa un día completo, no una sesión individual. Varias sesiones del mismo día se suman y cuentan como un único día.

- **RF-3.1** Cuando un día tenga varias sesiones, el sistema debe mostrarlo como una sola casilla cuya intensidad corresponda a la suma de minutos de ese día.
- **RF-3.2** Cuando un día no tenga ninguna sesión, el sistema debe mostrarlo como una casilla sin nivel de intensidad.
- **RF-3.3** El sistema debe considerar únicamente sesiones con minutos numéricos mayores que cero para colorear el mapa, para el detalle y para el resumen. Las sesiones con 0 minutos, minutos negativos o minutos no numéricos se ignoran sin borrarlas ni modificar los datos guardados.
- **RF-3.4** Varias sesiones del mismo día no deben aumentar el número de días con sesiones del resumen.

### RF-4 — Niveles de intensidad

La intensidad depende solo de los minutos totales de cada día, con umbrales fijos e iguales para todo el periodo. Un día conserva su nivel aunque se añadan sesiones en otras fechas.

| Estado | Minutos del día | Significado |
| --- | --- | --- |
| Sin sesión | 0 o sin sesiones válidas | No se estudió |
| Nivel 1 | Más de 0 y menos de 30 | Estudio ligero |
| Nivel 2 | 30 o más y menos de 60 | Estudio moderado |
| Nivel 3 | 60 o más y menos de 120 | Estudio alto |
| Nivel 4 | 120 o más | Estudio muy alto |

- **RF-4.1** Cuando el total de un día sea mayor que 0 y menor que 30 minutos, el sistema debe mostrar el nivel 1.
- **RF-4.2** Cuando el total de un día sea 30 minutos o más y menos de 60, el sistema debe mostrar el nivel 2.
- **RF-4.3** Cuando el total de un día sea 60 minutos o más y menos de 120, el sistema debe mostrar el nivel 3.
- **RF-4.4** Cuando el total de un día sea 120 minutos o más, el sistema debe mostrar el nivel 4.
- **RF-4.5** El sistema debe asignar el nivel usando el total diario, nunca los minutos de una sesión aislada.
- **RF-4.6** El sistema no debe calcular los niveles en relación con el día de mayor carga ni con la media del periodo.
- **RF-4.7** La intensidad visual debe crecer de forma monótona del nivel 1 al 4 y los cuatro niveles deben seguir siendo distinguibles entre sí en escala de grises, sin depender únicamente del tono.
- **RF-4.8** Ningún nivel de intensidad debe confundirse visualmente con el estado sin sesión.

### RF-5 — Días futuros

La ventana de 12 semanas incluye días posteriores a hoy. No representan estudio y no deben inflar el mapa ni el resumen.

- **RF-5.1** Mientras un día del periodo sea posterior a hoy, el sistema debe mostrarlo como una casilla neutra, sin ninguno de los cuatro niveles de intensidad.
- **RF-5.2** El sistema debe distinguir visualmente una casilla futura de un día pasado sin sesiones.
- **RF-5.3** Si existen sesiones con fecha posterior a hoy, el sistema debe ignorarlas para colorear el mapa y para calcular el resumen, sin borrarlas ni modificar los datos guardados.
- **RF-5.4** Cuando el usuario consulte el detalle de un día futuro, el sistema debe indicar que aún no ha llegado, en lugar de afirmar que no hubo sesiones.
- **RF-5.5** Los días futuros no deben contar como días con sesiones en el resumen.

### RF-6 — Detalle de un día

Cada casilla ofrece información textual del día sin abandonar la página. El detalle es informativo: no registra, edita ni elimina nada.

- **RF-6.1** Cuando el puntero se sitúe sobre una casilla de un día no futuro con sesiones, el sistema debe mostrar la fecha completa, el total de minutos y el número de sesiones de ese día.
- **RF-6.2** Cuando la casilla corresponda a un día no futuro sin sesiones, el sistema debe mostrar la fecha completa y la indicación «Sin sesiones».
- **RF-6.3** Cuando el usuario toque una casilla en una pantalla táctil, el sistema debe mostrar el detalle y mantenerlo visible hasta que toque otra casilla, toque la misma casilla, toque fuera del mapa o pulse Escape.
- **RF-6.4** Cuando una casilla reciba el foco mediante teclado, el sistema debe mostrar el mismo detalle que con el puntero.
- **RF-6.5** El detalle debe respetar el singular y el plural: «1 sesión» y «2 sesiones».
- **RF-6.6** El detalle no debe tapar la casilla consultada, cortarse en el borde del mapa ni provocar desplazamientos inesperados de la página.
- **RF-6.7** El detalle debe presentar las fechas y las cifras en español y con el mismo formato que el resto de la interfaz.
- **RF-6.8** Las sesiones con 0 minutos o minutos inválidos no deben aparecer en el detalle ni contar como sesiones; un día que solo tenga esas sesiones se muestra como «Sin sesiones».

### RF-7 — Leyenda

La leyenda explica la escala y permanece visible junto al mapa, incluso cuando no hay datos.

- **RF-7.1** El sistema debe mostrar una leyenda con los cinco estados: sin sesión y los niveles 1 a 4.
- **RF-7.2** La leyenda debe indicar el sentido de la escala, de menos a más intensidad.
- **RF-7.3** Cada nivel de la leyenda debe tener una etiqueta textual con su rango de minutos, usando intervalos cerrados por abajo y abiertos por arriba para admitir decimales: «Menos de 30 min», «De 30 a menos de 60 min», «De 60 a menos de 120 min» y «120 min o más».
- **RF-7.4** La leyenda debe ser comprensible sin depender exclusivamente del color.
- **RF-7.5** La leyenda debe incluir una nota separada «Día futuro» junto a una muestra de la trama de los días futuros.

### RF-8 — Resumen del periodo

Junto al mapa se muestra un resumen breve del periodo para dar contexto sin duplicar los contadores existentes.

- **RF-8.1** El sistema debe mostrar el número de días únicos con sesiones y el total de minutos de la ventana completa de 84 días, no solo de los días ya transcurridos.
- **RF-8.2** El resumen debe seguir el formato «X de 84 días con sesiones · Y min», con el mismo formato numérico que el resto de la interfaz.
- **RF-8.3** Dado un periodo con 18 días con sesiones y 640 minutos, el sistema debe mostrar «18 de 84 días con sesiones · 640 min».
- **RF-8.4** Cuando no haya sesiones, el sistema debe mostrar «0 de 84 días con sesiones · 0 min».
- **RF-8.5** Varias sesiones del mismo día deben contar como un solo día.
- **RF-8.6** El resumen no debe incluir días futuros ni sesiones con fecha futura en el numerador ni en los minutos.
- **RF-8.7** El resumen no debe incluir sesiones anteriores al inicio del periodo ni posteriores a su último día.
- **RF-8.8** Las sesiones con 0 minutos o minutos inválidos no deben sumar en el numerador, en los minutos ni en el día correspondiente, sin borrarse del almacenamiento.

### RF-9 — Actualización al registrar sesiones

El mapa y el resumen reflejan los datos guardados en cuanto se registra una sesión, sin recargar la página.

- **RF-9.1** Cuando el usuario guarde una sesión con fecha dentro del periodo y no futura, el sistema debe actualizar el mapa y el resumen de inmediato.
- **RF-9.2** Cuando el usuario guarde una sesión con fecha fuera del periodo, el mapa y el resumen no deben cambiar.
- **RF-9.3** Cuando el usuario guarde una sesión con fecha futura, el mapa y el resumen no deben cambiar.
- **RF-9.4** Al recargar la página, el mapa y el resumen deben reflejar las sesiones guardadas.
- **RF-9.5** La actualización no debe alterar la sesión guardada ni el formato de los datos existentes. La lista conserva el orden por fecha descendente que ya tenía; entre sesiones del mismo día, la última registrada aparece primero, y las sesiones existentes no se reordenan entre sí.

### RF-10 — Orientación temporal

El mapa debe permitir situar los días en el calendario sin abrir el detalle de cada casilla.

- **RF-10.1** El sistema debe mostrar las iniciales de los días de la semana en español, en orden de lunes a domingo: L, M, X, J, V, S, D.
- **RF-10.2** Las iniciales deben alinearse con sus filas y no deben confundirse con casillas del mapa.
- **RF-10.3** El sistema debe mostrar etiquetas de mes de tres letras sobre las columnas, con estas reglas: como máximo una etiqueta por columna; recibe etiqueta la primera columna y toda columna que contenga el día 1 de un mes; si la primera columna contiene el día 1, se etiqueta con el mes de ese día 1.
- **RF-10.4** El sistema debe marcar el día de hoy con un punto interior y con `aria-current="date"`, además de su nivel de intensidad, para orientar dentro de la última semana.

### RF-11 — Accesibilidad

Toda la información del mapa debe estar disponible sin ratón y sin depender del color.

- **RF-11.1** Cada casilla debe ser un elemento enfocable con un nombre accesible que incluya la fecha, los minutos totales y el número de sesiones, o bien el estado «Sin sesiones» o «Día futuro».
- **RF-11.2** El mapa debe poder recorrerse con teclado con un único punto de tabulación: un Tab entra por la casilla de hoy; las flechas mueven entre días y semanas; Inicio y Fin llevan a la primera y la última semana de la fila actual; en los bordes no hay wrap y no se obliga a tabular por las 84 casillas.
- **RF-11.3** El foco de teclado debe ser claramente visible sobre la casilla activa.
- **RF-11.4** La información de cada día no debe depender exclusivamente del color ni del detalle emergente: el nombre accesible de la casilla incluye la fecha, los minutos, el número de sesiones y el nivel, y el panel de detalle es complementario.
- **RF-11.5** La leyenda y el resumen deben ser legibles por lectores de pantalla.
- **RF-11.6** El mapa y su detalle deben seguir siendo utilizables con zoom de texto al 200 % y con texto ampliado sin pérdida de información.

### RF-12 — Adaptación a móvil

El mapa debe integrarse en el diseño responsive existente sin romper la lectura en pantallas estrechas.

- **RF-12.1** En una pantalla de 320 píxeles de ancho, el mapa debe caber sin scroll horizontal y sin solaparse con otros contenidos.
- **RF-12.2** Las casillas deben mantener forma cuadrada, medir entre 18 y 20 píxeles en móvil y dejar 24 píxeles entre centros de casillas contiguas para evitar toques accidentales. En pantallas de 370 píxeles o menos, el bloque del mapa usa el ancho completo de la hoja.
- **RF-12.3** El detalle debe poder abrirse y cerrarse con toques, sin depender de hover, con el mismo cierre que RF-6.3.
- **RF-12.4** El mapa no debe provocar desplazamiento horizontal en ninguna anchura entre 320 y 1440 píxeles.

### RF-13 — Coherencia con las métricas existentes

El mapa es una vista nueva de los mismos datos; no redefine las métricas que ya existen.

- **RF-13.1** La racha actual, los minutos de la semana, los días del mes y la lista de sesiones deben mostrar los mismos valores antes y después de añadir el mapa.
- **RF-13.2** El mapa debe usar la misma definición de semana que el resto de la aplicación: de lunes a domingo, en fecha local.
- **RF-13.3** Un día con sesiones debe seguir contando una sola vez aunque tenga varias sesiones.
- **RF-13.4** Las fechas futuras no deben sumar en el mapa, igual que no suman en la racha ni en los contadores.

## 5. Requisitos no funcionales

- **NFR-1 — Simplicidad y uso sin conexión.** La funcionalidad debe mantener la aplicación abrible con doble clic, sin instalar nada, sin build y sin conexión a internet.
- **NFR-2 — Sin dependencias nuevas.** No se deben añadir librerías, frameworks, servicios externos ni peticiones de red.
- **NFR-3 — Datos intactos.** El mapa es de solo lectura: no debe crear datos nuevos, cambiar el formato guardado ni exigir una migración. Las sesiones existentes deben conservarse íntegras.
- **NFR-4 — Tolerancia a datos dañados.** Si los datos guardados no se pueden leer o contienen elementos inválidos, la página debe seguir funcionando y el mapa debe mostrarse vacío o ignorar solo los elementos inválidos, sin errores visibles en consola.
- **NFR-5 — Rendimiento.** El mapa debe renderizarse y actualizarse sin retardo perceptible, incluso con cientos de sesiones; guardar una sesión debe actualizar la vista en el mismo gesto, sin bloquear la interacción.
- **NFR-6 — Accesibilidad.** La funcionalidad debe cumplir WCAG 2.2 nivel AA en lo aplicable a un gráfico de este tipo: contraste, foco visible, teclado, nombres accesibles y ausencia de dependencia exclusiva del color.
- **NFR-7 — Responsive.** Debe funcionar en móvil, tableta y escritorio, de 320 a 1440 píxeles, respetando el diseño existente y sin scroll horizontal.
- **NFR-8 — Idioma y tono.** La interfaz debe estar en español, con fechas y números en formato español y un tono neutro, sin mensajes culpabilizadores por los días sin estudio.
- **NFR-9 — Mantenibilidad didáctica.** Los cálculos del mapa (periodo, niveles, totales y resumen) deben poder verificarse automáticamente sin abrir el navegador y sin depender de la interfaz.
- **NFR-10 — Movimiento.** No se requieren animaciones. Si se añade alguna, debe respetar la preferencia de movimiento reducido del sistema.
- **NFR-11 — Privacidad.** No se debe enviar ningún dato del usuario a terceros ni registrar analítica.

## 6. Casos límite

| Caso | Comportamiento esperado |
| --- | --- |
| Ninguna sesión registrada | 84 casillas sin nivel, leyenda visible y mensaje que invita a registrar la primera sesión. Resumen «0 de 84 días con sesiones · 0 min». |
| Solo hay sesiones anteriores al periodo | El mapa aparece vacío y el resumen a cero; las sesiones antiguas no se borran ni se muestran en el mapa. |
| Solo hay sesiones posteriores al periodo | El mapa aparece vacío y el resumen a cero; las sesiones futuras se ignoran. |
| Varias sesiones el mismo día | Una sola casilla con la suma de minutos y un solo día en el resumen. |
| Sesión exactamente el lunes inicial | Se muestra en la primera casilla del periodo. |
| Sesión exactamente el domingo final | Se muestra en la última casilla del periodo. |
| Sesión el día anterior al inicio | Queda fuera del mapa y del resumen. |
| Sesión el día siguiente al final | Queda fuera del mapa y del resumen; si es futura, además se ignora. |
| Umbrales exactos | 29,9 min → nivel 1; 30 → nivel 2; 59,9 → nivel 2; 60 → nivel 3; 119,9 → nivel 3; 120 → nivel 4. |
| Minutos decimales | Se suman y se comparan con los umbrales sin redondear el nivel. |
| Sesión con 0 minutos, minutos negativos o valor no numérico | Se ignora para el mapa y el resumen; no se modifica ni se elimina del almacenamiento. |
| Día con sesiones pero suma 0 | Se trata como día sin sesiones válidas: sin nivel, «Sin sesiones» en el detalle y no cuenta en el resumen. |
| Cambio de mes dentro del periodo | Cada día se sitúa por su fecha local; no se mezclan meses ni se desplaza ningún día. |
| Cambio de año dentro del periodo | El periodo cruza diciembre y enero sin romper el orden ni las claves de fecha. |
| Cambio de hora (primavera u otoño) | El día se identifica por su fecha local; el cambio de hora no duplica ni elimina casillas. |
| 29 de febrero | Se trata como un día más del calendario local. |
| Hoy sin sesión pero ayer con sesión | El mapa muestra ayer coloreado y hoy sin nivel; no se altera la racha existente. |
| Página abierta al cruzar medianoche | El periodo no se recalcula automáticamente hasta que se recargue la página o se guarde una sesión. |
| Todos los días transcurridos con sesión | Todas las casillas pasadas tienen al menos nivel 1. |
| Muchas sesiones (cientos) | El mapa y el resumen siguen respondiendo sin retardo perceptible. |
| Datos guardados corruptos o incompletos | La página sigue funcionando; el mapa muestra lo que se pueda leer y no aparece ningún error en consola. |
| Texto ampliado o zoom al 200 % | El mapa y el detalle siguen siendo legibles y no pierden información. |

## 7. Fuera de alcance

- Navegar a periodos anteriores, ver un año completo, hacer zoom sobre el mapa o desplazarse horizontalmente para ver más semanas.
- Comparar con las 12 semanas anteriores, mostrar tendencias, predicciones u objetivos.
- Filtrar por tema o mostrar el desglose de temas y sesiones dentro del detalle del día.
- Registrar, editar o eliminar sesiones desde el mapa.
- Rachas históricas, récords, insignias, metas, recordatorios o notificaciones.
- Personalizar los umbrales, los colores o cambiar a una escala relativa.
- Exportar el mapa como imagen, compartirlo o imprimirlo.
- Sincronización, cuentas de usuario, servidor, analítica o cualquier función que requiera conexión.
- Cambiar el formato de los datos guardados, añadir nuevas claves de almacenamiento o una migración nueva.
- Modificar el comportamiento de la racha, los contadores, la lista de sesiones o el formulario.
- Modo oscuro, temas alternativos o animaciones decorativas.
- Traducciones a otros idiomas.
- Vista de detalle con todas las sesiones de un día o acceso directo a cada tema.

## 8. Criterios de finalización

La funcionalidad se considera terminada cuando:

1. Todos los requisitos funcionales y no funcionales de esta spec están implementados y verificados.
2. Las dudas abiertas bloqueantes están resueltas y reflejadas en la spec antes de implementar.
3. El mapa funciona con doble clic, sin red, sin instalar nada y sin dependencias nuevas.
4. La lógica del periodo, los niveles, la agrupación diaria y el resumen está cubierta por pruebas automáticas, incluidos los umbrales y los cambios de mes y año, y todas pasan.
5. La verificación manual en Chromium cubre: estado vacío, alta de sesión, recarga, varias sesiones el mismo día, umbrales 29/30/59/60/119/120, días futuros, sesiones futuras, cambio de mes y año, detalle con ratón, toque y teclado, y consola sin errores.
6. La vista se comprueba a 320, 375, 768 y 1440 píxeles de ancho, sin scroll horizontal y sin solapamientos.
7. La accesibilidad se comprueba con teclado, lector de pantalla, zoom al 200 % y escala de grises.
8. La racha, los minutos de la semana, los días del mes y la lista de sesiones conservan exactamente sus valores anteriores.
9. El formato de los datos guardados no ha cambiado y ninguna sesión se ha perdido.
10. `MEMORY.md` está actualizado con el estado y las decisiones de la funcionalidad.

## 9. Decisiones cerradas

Las antiguas dudas abiertas quedaron resueltas así:

1. **Etiquetas de mes:** se muestran abreviaturas de tres letras con la regla de RF-10.3. Como máximo hay una por columna, así que nunca se solapan.
2. **Denominador del resumen:** se mantiene fijo en 84 días para que no cambie a diario y coincida con la ventana completa (RF-8.1–RF-8.4).
3. **Tamaño en móvil:** se conservan las 12 semanas con casillas de 18 a 20 píxeles y 24 píxeles entre centros, más el detalle textual y el teclado como alternativas. Se descarta mostrar menos semanas con navegación.
4. **Sesiones de 0 minutos o inválidas:** se ignoran en el mapa, el detalle y el resumen, pero no se borran ni se modifican (RF-3.3, RF-6.8, RF-8.8).
5. **Día de hoy:** se marca con un punto interior y `aria-current="date"`, además de su nivel (RF-10.4).
