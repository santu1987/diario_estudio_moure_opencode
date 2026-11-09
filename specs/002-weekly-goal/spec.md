# Spec 002 — Objetivo semanal de estudio

- **Estado:** aprobada
- **Fecha:** 9 de noviembre de 2026
- **Alcance:** fijar un objetivo de minutos por semana y ver el progreso de la semana actual
- **Principio rector:** la spec describe el qué y el porqué. El cómo técnico se decide en el plan.

## 1. Contexto y objetivo

El Diario de Estudio ya muestra la racha, los minutos estudiados «esta semana», los días estudiados del mes, el mapa de calor y la lista de sesiones. La cifra semanal dice cuánto se ha estudiado, pero no dice si eso es mucho o poco respecto a lo que la persona se había propuesto. Sin una referencia, la cifra no motiva ni permite saber si se va por buen camino.

El objetivo es añadir un objetivo semanal de estudio: la persona indica cuántos minutos quiere estudiar cada semana y la aplicación muestra cuánto lleva acumulado en la semana actual respecto a ese objetivo, cuánto le falta y si ya lo ha alcanzado. La funcionalidad debe servir para automotivarse, no para castigar: el tono es neutro y un objetivo no cumplido se presenta como información, no como reproche.

Lo que ya existe y **no** cambia:

- El total de minutos de la semana actual, de lunes a hoy, sin contar fechas futuras. Es la misma cifra que ya aparece como «Esta semana», con la única excepción descrita en RF-9.4: en adelante también ignora los minutos no positivos o no numéricos.
- La racha, los días del mes, el mapa de calor y la lista de sesiones, que conservan su comportamiento actual incluso con sesiones inválidas.

Lo nuevo es únicamente el objetivo (una cantidad entera de minutos por semana que la persona fija) y su comparación con el total semanal ya existente. El objetivo es una referencia, no una sesión: no suma minutos, no cuenta como día estudiado, no caduca al terminar la semana y no altera ninguna métrica existente. La aplicación arranca sin objetivo y no propone ninguno por defecto.

El objetivo se guarda como un dato propio, independiente de las sesiones. El formato de las sesiones no cambia y no se añade información nueva a cada sesión.

## 2. Usuarios

- **Estudiante que quiere constancia:** fija una meta semanal razonable y comprueba a lo largo de la semana si va a cumplirla.
- **Estudiante que empieza:** todavía no tiene objetivo y necesita entender qué es y cómo fijarlo sin sentirse obligado.
- **Estudiante que ya registra sesiones:** quiere ver su progreso sin volver a introducir datos ni sumar minutos a mano.
- **Persona que navega con teclado, lector de pantalla o pantalla táctil:** debe poder fijar, editar, eliminar y consultar el objetivo con la misma información que quien usa ratón.

## 3. Historias de usuario

- **HU-1 (Must):** como estudiante, quiero fijar cuántos minutos quiero estudiar cada semana para tener una meta concreta.
- **HU-2 (Must):** como estudiante, quiero ver cuánto llevo acumulado esta semana respecto a mi objetivo y cuánto me falta para saber si voy por buen camino.
- **HU-3 (Must):** como estudiante, quiero saber si ya he alcanzado mi objetivo para sentirme motivado a mantener el ritmo.
- **HU-4 (Must):** como estudiante, quiero poder cambiar o quitar mi objetivo cuando ya no me encaje, pudiendo deshacer la eliminación si me equivoco, para que siga siendo útil.
- **HU-5 (Must):** como estudiante, quiero que mi objetivo se conserve al cerrar y volver a abrir la página, y que siga vigente la semana siguiente, para no tener que escribirlo cada vez.
- **HU-6 (Must):** como persona que usa teclado o lector de pantalla, quiero consultar, editar y eliminar el objetivo sin depender del ratón ni del color.
- **HU-7 (Should):** como persona que empieza, quiero entender qué es un objetivo semanal y cómo fijarlo sin ver una cifra de progreso vacía o confusa.

## 4. Definiciones

- **Objetivo semanal:** cantidad entera de minutos de estudio que la persona quiere acumular en una semana. Es una referencia, no un límite máximo ni un dato de sesión. No tiene valor por defecto ni tope máximo.
- **Objetivo vigente:** el objetivo fijado sigue siendo el mismo semana tras semana hasta que la persona lo cambie o lo elimine. No caduca al terminar la semana ni hay que volver a fijarlo.
- **Progreso semanal:** minutos acumulados en la semana actual, de lunes a hoy, con la misma definición que la cifra existente «Esta semana». Las fechas futuras y los días fuera de la semana actual no cuentan. Las sesiones con 0 minutos, minutos negativos o minutos no numéricos se ignoran. Puede ser decimal, porque las sesiones admiten minutos decimales.
- **Semana:** de lunes a domingo, en la fecha local del usuario, igual que en el resto de la aplicación.
- **Restante:** diferencia entre el objetivo y el progreso cuando el progreso es menor que el objetivo. Puede ser decimal. Cuando el progreso es igual o mayor, el restante es siempre 0 minutos.
- **Exceso:** minutos en que el progreso supera el objetivo (`progreso` − objetivo) cuando el progreso es estrictamente mayor. Puede ser decimal. Es 0 cuando el objetivo no se supera.
- **Objetivo alcanzado:** el progreso semanal es igual o mayor que el objetivo. **Objetivo superado** es el caso particular en que el progreso es estrictamente mayor; sigue siendo un objetivo alcanzado.
- **Objetivo no alcanzado:** existe un objetivo y el progreso es menor; no es un estado de error ni un mensaje de reproche.
- **Barra de progreso:** representación visual de la proporción entre el progreso y el objetivo, limitada al 100 %: se llena al alcanzar el objetivo y no crece por encima aunque el progreso real sea mayor. Es un complemento de las cifras, nunca su sustituto: el progreso real, el restante y el exceso siempre están en texto.
- **Sin objetivo:** no hay ninguna cantidad fijada. Es el estado inicial de la aplicación y la aplicación no propone ninguna cifra. En este estado no se muestra restante, ni barra, ni mensaje de objetivo alcanzado.

## 5. Requisitos funcionales

### RF-1 — Fijar el objetivo

- **RF-1.1** CUANDO la persona indique una cantidad válida de minutos semanales y confirme, EL SISTEMA debe fijarla como objetivo semanal.
- **RF-1.2** EL SISTEMA debe expresar el objetivo en minutos y referirlo siempre a una semana completa, nunca a un día ni a una sesión.
- **RF-1.3** EL SISTEMA debe permitir fijar el objetivo a cualquier persona, aunque no tenga ninguna sesión registrada.
- **RF-1.4** EL SISTEMA no debe crear, modificar ni eliminar sesiones al fijar el objetivo.
- **RF-1.5** CUANDO el objetivo se guarde correctamente, EL SISTEMA debe dar una confirmación visible de que queda guardado, en español y con un tono neutro. Si el guardado falla, se aplica RF-8.7 y no se afirma que el objetivo quedó guardado.
- **RF-1.6** MIENTRAS la persona no haya fijado un objetivo, EL SISTEMA no debe asumir, proponer ni rellenar ningún objetivo por defecto; la aplicación arranca en el estado sin objetivo.
- **RF-1.7** EL SISTEMA debe guardar el objetivo de forma independiente de las sesiones, sin cambiar el formato de las sesiones ni añadir datos nuevos a cada sesión.

### RF-2 — Ver el objetivo y el progreso

- **RF-2.1** CUANDO exista un objetivo, EL SISTEMA debe mostrar en la página principal, de forma simultánea, el objetivo en minutos, los minutos acumulados de la semana actual, cuánto falta para alcanzarlo y una barra de progreso.
- **RF-2.2** EL SISTEMA debe calcular el progreso con la misma definición de semana y de minutos que la cifra existente «Esta semana», de forma que ambos números coincidan siempre.
- **RF-2.3** CUANDO hoy sea lunes y no exista ninguna sesión válida con fecha de hoy, EL SISTEMA debe mostrar un progreso de 0 minutos, el restante completo y la barra vacía.
- **RF-2.4** CUANDO se registre una sesión válida cuya fecha esté entre el lunes de la semana actual y hoy, EL SISTEMA debe actualizar el progreso de inmediato, sin recargar la página.
- **RF-2.5** CUANDO varias sesiones caigan en el mismo día de la semana actual, EL SISTEMA debe sumar todas al progreso.
- **RF-2.6** EL SISTEMA debe mostrar el objetivo, el progreso, el restante y el exceso con el mismo formato numérico español que el resto de la interfaz.
- **RF-2.7** CUANDO exista un objetivo, EL SISTEMA debe indicar con una etiqueta textual que las cifras están en minutos, sin ambigüedad entre minutos y horas.
- **RF-2.8** EL SISTEMA debe calcular la barra de progreso como la proporción entre el progreso limitado al objetivo y el objetivo: vacía con 0, completa al alcanzarlo y siempre completa por encima, sin que la barra sustituya en ningún caso a las cifras.
- **RF-2.9** CUANDO el progreso, el restante o el exceso no sean un número entero de minutos, EL SISTEMA debe mostrarlos con hasta dos decimales y coma española, sin redondearlos a un entero ni truncarlos; la cifra mostrada corresponde al valor real.

### RF-3 — Sin objetivo

- **RF-3.1** MIENTRAS no exista un objetivo, EL SISTEMA no debe mostrar restante, barra de progreso ni mensaje de objetivo alcanzado.
- **RF-3.2** MIENTRAS no exista un objetivo, EL SISTEMA debe invitar a fijarlo con un texto breve en español, sin bloquear el resto de la página.
- **RF-3.3** CUANDO la persona fije el primer objetivo, EL SISTEMA debe pasar del estado sin objetivo al estado con progreso sin recargar la página.

### RF-4 — Alcanzar o superar el objetivo

- **RF-4.1** CUANDO el progreso sea menor que el objetivo, EL SISTEMA debe mostrar cuántos minutos faltan exactamente para alcanzarlo (`restante` = objetivo − progreso), en español y sin mensajes culpabilizadores. Si el restante no es entero, se muestra con hasta dos decimales (RF-2.9).
- **RF-4.2** CUANDO el progreso sea igual al objetivo, EL SISTEMA debe indicar de forma explícita que el objetivo está alcanzado y mostrar «0 min restantes».
- **RF-4.3** CUANDO el progreso supere el objetivo, EL SISTEMA debe mostrar «0 min restantes» e indicar además cuántos minutos se han superado (`progreso` − objetivo), junto con el estado de objetivo alcanzado. Si el exceso no es entero, se muestra con hasta dos decimales.
- **RF-4.4** CUANDO el progreso sea igual o mayor que el objetivo, EL SISTEMA debe mostrar la barra de progreso completamente llena y mantener visibles en texto las cifras reales, incluido el exceso si lo hay; el llenado de la barra no recorta ni oculta los minutos acumulados.
- **RF-4.5** La indicación de objetivo alcanzado o superado no debe modificar ninguna métrica ni ningún dato guardado.
- **RF-4.6** EL SISTEMA no debe mostrar a la vez «faltan minutos» y «objetivo alcanzado»; ambos estados son excluyentes y se corresponden con progreso menor que el objetivo y con progreso igual o mayor, respectivamente.

### RF-5 — Editar y eliminar el objetivo

- **RF-5.1** CUANDO exista un objetivo, EL SISTEMA debe permitir cambiarlo en cualquier momento.
- **RF-5.2** CUANDO la persona confirme un objetivo nuevo, EL SISTEMA debe sustituir el anterior y comparar el progreso de la semana actual con el nuevo valor.
- **RF-5.3** CUANDO el cambio se produzca a mitad de semana, EL SISTEMA debe aplicar el nuevo valor a la semana en curso en el mismo momento, comparándolo con los minutos ya acumulados, y no debe esperar a la semana siguiente.
- **RF-5.4** CUANDO la persona elimine el objetivo, EL SISTEMA debe quitarlo de inmediato, volver al estado sin objetivo y no sustituirlo por ningún valor por defecto, sin pedir confirmación previa.
- **RF-5.5** CUANDO la persona elimine el objetivo, EL SISTEMA debe mostrar un aviso en español con una acción «Deshacer», accesible por teclado y anunciada a lectores de pantalla.
- **RF-5.6** CUANDO la persona active «Deshacer», EL SISTEMA debe restaurar el objetivo anterior y el progreso de la semana actual en el mismo gesto, sin recargar la página.
- **RF-5.7** El aviso de eliminación debe permanecer visible hasta que se active «Deshacer», se fije un objetivo nuevo o se recargue la página, sin límite de tiempo.
- **RF-5.8** SI la página se recarga con el aviso de eliminación visible, ENTONCES EL SISTEMA debe mantener la eliminación y no restaurar el objetivo.
- **RF-5.9** CUANDO la persona elimine el objetivo, EL SISTEMA debe dejar el foco en el control para fijar un objetivo; CUANDO active «Deshacer», en el control para editar el objetivo restaurado.
- **RF-5.10** EL SISTEMA no debe modificar sesiones ni métricas existentes al editar, eliminar o deshacer la eliminación del objetivo.
- **RF-5.11** CUANDO la persona cancele la edición, EL SISTEMA debe conservar el objetivo anterior intacto.

### RF-6 — Semana actual, cambio de semana y vigencia

- **RF-6.1** EL SISTEMA debe calcular el progreso únicamente con sesiones válidas, es decir, con minutos numéricos mayores que cero, cuya fecha esté entre el lunes de la semana actual y hoy, ambos incluidos.
- **RF-6.2** CUANDO una sesión tenga fecha posterior a hoy, EL SISTEMA no debe contarla en el progreso aunque su fecha caiga dentro de la semana actual; empezará a contar cuando esa fecha sea hoy o haya pasado.
- **RF-6.3** CUANDO una sesión tenga fecha anterior al lunes de la semana actual, EL SISTEMA no debe contarla en el progreso.
- **RF-6.4** CUANDO cambie la semana al pasar de domingo a lunes, EL SISTEMA debe recalcular el progreso solo con las sesiones válidas cuya fecha esté entre el lunes nuevo y hoy; el progreso es 0 minutos únicamente si no existe ninguna sesión válida con fecha de la semana nueva.
- **RF-6.5** EL SISTEMA no debe trasladar minutos de la semana anterior a la semana nueva.
- **RF-6.6** CUANDO empiece una semana nueva, EL SISTEMA debe mantener el mismo objetivo vigente, sin pedir a la persona que lo vuelva a fijar y sin caducarlo al terminar la semana.
- **RF-6.7** CUANDO una sesión tenga fecha de domingo, EL SISTEMA debe contarla en la semana que termina ese domingo solo si esa fecha es hoy o anterior; si el domingo aún no ha llegado, no cuenta todavía aunque la sesión se haya registrado antes. Lo que decide es la fecha de la sesión, no el momento en que se registró.
- **RF-6.8** MIENTRAS la página permanezca abierta al cruzar la medianoche del domingo al lunes, EL SISTEMA debe recalcular el progreso al registrar una sesión o al recargar la página, igual que el resto de métricas de la aplicación.
- **RF-6.9** EL SISTEMA debe usar siempre la fecha local del usuario y no debe desplazar días por el cambio de hora ni por zonas horarias.
- **RF-6.10** EL SISTEMA debe aplicar la misma definición de semana que la cifra existente «Esta semana»: de lunes a domingo.
- **RF-6.11** EL SISTEMA no debe conservar ni mostrar objetivos ni progresos de semanas anteriores: solo trabaja con la semana actual y no hay histórico consultable ni almacenado.

### RF-7 — Formato y validación del objetivo

- **RF-7.1** EL SISTEMA debe aceptar como objetivo cualquier secuencia de dígitos que represente un número entero de minutos mayor que cero.
- **RF-7.2** EL SISTEMA no debe imponer un límite máximo al objetivo.
- **RF-7.3** SI el valor está vacío, no es numérico, es cero o es negativo, ENTONCES EL SISTEMA debe rechazarlo, mostrar un mensaje de error en español y conservar el objetivo anterior. Si no había objetivo anterior, el sistema permanece en el estado sin objetivo sin inventar ningún valor.
- **RF-7.4** SI el valor contiene decimales, signos o separadores —por ejemplo «1,5», «1.5», «1.000», «1 000» o «+30»—, ENTONCES EL SISTEMA debe rechazarlo con un mensaje en español que indique que el objetivo se expresa en minutos enteros, sin decimales ni separadores, y debe conservar el objetivo anterior o, si no lo había, permanecer sin objetivo.
- **RF-7.5** EL SISTEMA no debe redondear ni truncar en silencio ningún valor introducido por la persona: o lo acepta tal cual o lo rechaza con un mensaje visible.
- **RF-7.6** EL SISTEMA debe ignorar los espacios sobrantes alrededor del valor introducido.
- **RF-7.7** EL SISTEMA debe mostrar el objetivo con separador de miles español cuando corresponda, igual que el resto de cifras.
- **RF-7.8** EL SISTEMA debe considerar no numéricos el valor vacío, el formado solo por espacios, el texto que no sea una secuencia de dígitos, los booleanos, `null`, `undefined`, `NaN` e `Infinity`.

### RF-8 — Persistencia y compatibilidad con los datos existentes

- **RF-8.1** CUANDO la persona recargue o vuelva a abrir la página, EL SISTEMA debe conservar el objetivo vigente —salvo que lo haya eliminado— y mostrar el progreso de la semana en curso en ese momento.
- **RF-8.2** EL SISTEMA no debe perder, reordenar ni alterar ninguna sesión al fijar, cambiar, eliminar, deshacer o recargar el objetivo.
- **RF-8.3** EL SISTEMA debe seguir leyendo las sesiones guardadas por versiones anteriores de la aplicación, incluida la migración ya existente, sin exigir ninguna acción a la persona.
- **RF-8.4** SI los datos guardados del objetivo no se pueden interpretar o son inválidos, ENTONCES EL SISTEMA debe tratarlos como «sin objetivo», mantener las sesiones intactas y no mostrar errores en consola.
- **RF-8.5** SI no hay ningún objetivo guardado, ENTONCES EL SISTEMA debe arrancar en el estado sin objetivo, no en un estado de error y sin proponer ningún valor.
- **RF-8.6** EL SISTEMA debe conservar el objetivo como un dato independiente de las sesiones, sin modificar la estructura ni el formato de las sesiones guardadas.
- **RF-8.7** SI el almacenamiento local rechaza la escritura del objetivo, por cuota agotada o por modo privado, ENTONCES EL SISTEMA debe informar en español de que el objetivo no se ha guardado, mantener intactas las sesiones y no afirmar que el objetivo quedó guardado; el objetivo anterior, si lo había, sigue vigente.

### RF-9 — Coherencia con las métricas existentes

- **RF-9.1** La racha, los minutos de la semana, los días del mes, el mapa de calor y la lista de sesiones deben mostrar los mismos valores antes y después de añadir el objetivo cuando las sesiones tienen minutos válidos. La única excepción es RF-9.4, que afecta solo al progreso y a «Esta semana» con sesiones inválidas.
- **RF-9.2** El progreso semanal y la cifra existente «Esta semana» deben coincidir siempre, tanto con objetivo como sin él.
- **RF-9.3** EL SISTEMA no debe contar como sesión ni como día estudiado el hecho de tener un objetivo.
- **RF-9.4** Las sesiones con 0 minutos, minutos negativos o minutos no numéricos no deben aumentar ni reducir el progreso semanal ni la cifra existente «Esta semana»: ambas cifras deben ignorarlas por igual. Esas sesiones no deben borrarse ni modificarse.
- **RF-9.5** EL SISTEMA no debe alterar la cifra existente «Esta semana» con datos válidos; el único cambio de comportamiento admitido en esa cifra es el de RF-9.4 con datos no positivos o no numéricos.
- **RF-9.6** Las sesiones con minutos no positivos o no numéricos deben seguir contando para la racha y los días del mes exactamente como hasta ahora; solo el progreso y «Esta semana» las ignoran.

### RF-10 — Accesibilidad

- **RF-10.1** EL SISTEMA debe ofrecer el objetivo, los minutos acumulados, el restante, la barra de progreso y el estado de objetivo alcanzado a lectores de pantalla mediante etiquetas y textos accesibles.
- **RF-10.2** La información de progreso no debe depender exclusivamente del color ni de una barra visual: debe existir siempre un texto equivalente con las cifras reales.
- **RF-10.3** La barra de progreso debe exponerse como un indicador con nombre accesible, valor mínimo 0, valor máximo igual al objetivo y valor actual igual al progreso limitado al objetivo, de modo que el indicador siempre sea válido aunque el progreso real lo supere. Su texto accesible debe incluir el progreso real y, cuando exista, los minutos de exceso, para que el límite del indicador no oculte información.
- **RF-10.4** EL SISTEMA debe permitir consultar, fijar, editar, eliminar y deshacer la eliminación del objetivo solo con teclado, con un orden de foco lógico.
- **RF-10.5** El foco de teclado debe tener un indicador visible con una relación de contraste de al menos 3:1 respecto a los colores adyacentes, conforme a WCAG 2.2 AA.
- **RF-10.6** Los mensajes de confirmación y de error, el estado de objetivo alcanzado y el aviso de eliminación con su acción «Deshacer» deben ser perceptibles por lectores de pantalla sin exigir interacción adicional.
- **RF-10.7** El objetivo, el restante y el progreso deben seguir siendo legibles y utilizables con zoom de texto al 200 % y con texto ampliado.

### RF-11 — Adaptación a móvil

- **RF-11.1** En una pantalla de 320 píxeles de ancho, el objetivo, el restante y el progreso deben caber sin scroll horizontal y sin solaparse con otros contenidos.
- **RF-11.2** El sistema debe permitir consultar, fijar, editar, eliminar y deshacer la eliminación del objetivo con toques, sin depender de hover.
- **RF-11.3** Los controles táctiles del objetivo, incluida la acción «Deshacer», deben medir al menos 44 × 44 píxeles efectivos o, si es mayor, la altura de los controles ya existentes de la aplicación.
- **RF-11.4** El objetivo no debe provocar desplazamiento horizontal en ninguna anchura entre 320 y 1440 píxeles.

### RF-12 — Actualización y estado de la interfaz

- **RF-12.1** CUANDO se guarde una sesión, EL SISTEMA debe actualizar los minutos acumulados, el restante, la barra de progreso y el estado del objetivo en el mismo gesto, sin recargar y sin bloquear la interacción, incluso después de alcanzar el objetivo: las sesiones posteriores de la misma semana siguen sumando y aumentando el exceso mostrado.
- **RF-12.2** CUANDO el progreso cambie de estado —sin objetivo, con objetivo y no alcanzado, alcanzado o superado—, EL SISTEMA debe reflejarlo de inmediato en los textos y en la representación visual.
- **RF-12.3** EL SISTEMA no debe mostrar dos cifras distintas de minutos de la semana actual en la misma página.
- **RF-12.4** CUANDO la persona cambie el objetivo, EL SISTEMA debe recalcular y mostrar el restante, la barra y el estado con el nuevo valor en el mismo gesto, sin recargar la página.

## 6. Requisitos no funcionales

- **NFR-1 — Simplicidad y uso sin conexión.** La funcionalidad debe mantener la aplicación abrible con doble clic, sin instalar nada, sin build y sin conexión.
- **NFR-2 — Sin dependencias nuevas.** No se deben añadir librerías, frameworks, servicios externos ni peticiones de red.
- **NFR-3 — Datos intactos.** Las sesiones existentes deben conservarse íntegras y en el mismo formato; no se añade información nueva a cada sesión. La única incorporación de datos es el objetivo, guardado en una entrada independiente que no altera la estructura de las sesiones.
- **NFR-4 — Tolerancia a datos dañados.** Si los datos guardados no se pueden leer o contienen elementos inválidos, la página debe seguir funcionando y el objetivo debe mostrarse como ausente, sin errores visibles en consola.
- **NFR-5 — Rendimiento.** El objetivo y el progreso deben renderizarse y actualizarse sin retardo perceptible, incluso con cientos de sesiones.
- **NFR-6 — Accesibilidad.** Debe cumplir WCAG 2.2 nivel AA en lo aplicable: contraste, foco visible, teclado, nombres accesibles y ausencia de dependencia exclusiva del color.
- **NFR-7 — Responsive.** Debe funcionar en móvil, tableta y escritorio, de 320 a 1440 píxeles, respetando el diseño existente y sin scroll horizontal.
- **NFR-8 — Idioma y tono.** La interfaz debe estar en español, con fechas y números en formato español y un tono neutro, sin mensajes culpabilizadores por no alcanzar el objetivo.
- **NFR-9 — Mantenibilidad didáctica.** Los cálculos del progreso, del restante, del exceso y del estado del objetivo deben poder verificarse automáticamente sin abrir el navegador y sin depender de la interfaz.
- **NFR-10 — Movimiento.** No se requieren animaciones. Si se añade alguna, debe respetar la preferencia de movimiento reducido del sistema.
- **NFR-11 — Privacidad.** No se debe enviar ningún dato del usuario a terceros ni registrar analítica.
- **NFR-12 — No regresión.** La funcionalidad no debe modificar el comportamiento visible de la racha, los contadores, el mapa de calor, la lista ni el formulario de sesiones, salvo la alineación de «Esta semana» con las sesiones inválidas descrita en RF-9.4, que no afecta a la racha ni a los días del mes (RF-9.6).

## 7. Casos límite

| Caso | Comportamiento esperado |
| --- | --- |
| Primera visita, sin sesiones y sin objetivo | Estado sin objetivo, invitación breve a fijarlo, métricas existentes a cero y sin errores. No aparece ningún objetivo propuesto. |
| Sin objetivo pero con sesiones | Se muestran todas las métricas existentes; no hay restante ni barra; sigue visible la invitación a fijar objetivo. |
| Objetivo fijado y 0 minutos esta semana | Progreso de 0 minutos, restante igual al objetivo y barra vacía; el objetivo se conserva. |
| Progreso exactamente igual al objetivo | Estado alcanzado, «0 min restantes» y barra completa; no se indica exceso. |
| Progreso un minuto por debajo | No se muestra como alcanzado; restante de 1 minuto. |
| Objetivo de 30 min y 0,5 min acumulados | No alcanzado; restante de 29,5 min mostrado como «29,5 min restantes», sin redondear a 30. |
| Objetivo de 30 min y 29,5 min acumulados | No alcanzado; restante de 0,5 min, sin redondear a 0 ni a 1. |
| Progreso supera el objetivo | Estado alcanzado, «0 min restantes», mención de los minutos por encima, progreso real visible en texto y barra completa. |
| Progreso supera el objetivo con decimales | Objetivo de 30 min y 30,5 min acumulados: exceso de 0,5 min, «0 min restantes» y barra completa. |
| Objetivo superado y después se añaden más minutos | El exceso mostrado crece; el progreso real sigue aumentando. |
| Objetivo de 1 minuto | Es válido y se muestra correctamente en singular o plural. |
| Objetivo con valor 0, negativo, vacío o no numérico | Se rechaza con mensaje en español y se conserva el objetivo anterior. Si no había objetivo anterior, se permanece en el estado sin objetivo sin inventar un valor. |
| Objetivo no numérico (`true`, `null`, `NaN`, `Infinity`, texto) | Se rechaza con mensaje en español; se conserva el objetivo anterior o se permanece sin objetivo. |
| Objetivo con decimales o separadores | «1,5», «1.5», «1.000», «1 000» y «+30» se rechazan con un mensaje que indica minutos enteros sin decimales ni separadores; no se redondea ni se trunca y se conserva el objetivo anterior. |
| Objetivo con espacios alrededor | Se acepta el valor una vez ignorados los espacios sobrantes. |
| Objetivo muy grande | No hay máximo: se acepta y se muestra con separador de miles sin romper el diseño. |
| Objetivo fijado por primera vez | Se muestra el progreso de la semana en curso en el mismo momento, sin recargar. |
| Cambio de objetivo a mitad de semana | El nuevo valor se compara de inmediato con los minutos ya acumulados de la semana en curso. |
| Varios cambios de objetivo el mismo día | Solo cuenta el último valor confirmado; el resto se descarta sin alterar sesiones. |
| Cambio de semana con objetivo vigente | El objetivo se mantiene igual; el progreso se recalcula solo con las sesiones válidas de la semana nueva y es 0 únicamente si no hay ninguna. |
| Semana pasada con objetivo | El objetivo sigue vigente; lo que no se conserva ni se muestra es el progreso de semanas anteriores ni un histórico de objetivos. |
| Sesión con fecha futura | No suma al progreso ni a «Esta semana» mientras su fecha sea posterior a hoy; la sesión se guarda igual y empezará a contar cuando llegue su día. |
| Sesión del domingo anterior | No suma a la semana actual; no se borra. |
| Sesión del lunes actual | Suma al progreso de la semana en curso, se haya registrado hoy o antes: lo que cuenta es que su fecha sea hoy o anterior. |
| Sesión del domingo actual | Si el domingo es hoy o ya pasó, suma a la semana que termina ese domingo; si aún no ha llegado, no suma todavía aunque se haya registrado con antelación. |
| Varias sesiones el mismo día | Se suman todas al progreso. |
| Sesión con 0 minutos, minutos negativos o valor no numérico | No suma ni resta en el progreso ni en «Esta semana»; no se borra ni se modifica y sigue contando para la racha y los días del mes como hasta ahora. |
| Todas las sesiones de la semana son inválidas | Progreso 0, «Esta semana» 0 y restante igual al objetivo; la racha y los días del mes siguen contando esos días como hoy. |
| Cambio de domingo a lunes | El progreso se recalcula con las sesiones válidas de la semana nueva; si no hay ninguna, es 0. Una sesión ya fechada el lunes siguiente cuenta al llegar ese lunes. El objetivo se mantiene. |
| Página abierta al cruzar la medianoche del domingo al lunes | El progreso no se recalcula solo hasta que se registre una sesión o se recargue, igual que el resto de métricas. |
| Cambio de mes o de año dentro de la semana | La semana no se rompe; los días se identifican por fecha local. |
| Cambio de hora (primavera u otoño) | La semana sigue teniendo siete días y el progreso no se duplica ni se pierde. |
| 29 de febrero dentro de la semana | Se trata como un día más del calendario local. |
| Cancelación de la edición | Se conserva el objetivo anterior y el progreso no cambia. |
| Eliminación del objetivo | El objetivo desaparece de inmediato, sin confirmación previa y sin valor por defecto; las sesiones y las métricas no cambian. Aparece un aviso con la acción «Deshacer». |
| Deshacer tras eliminar | Se restauran el objetivo anterior y el progreso de la semana actual en el mismo gesto, sin recargar; el aviso desaparece y el foco queda en el control para editar el objetivo. |
| Eliminar y recargar | La eliminación se mantiene: al recargar no reaparece el objetivo ni el aviso. |
| Fijar un objetivo nuevo tras eliminar | El aviso de eliminación desaparece y el objetivo nuevo pasa a estar vigente. |
| Foco tras eliminar | El foco queda en el control para fijar un objetivo. |
| El almacenamiento rechaza guardar el objetivo | Se informa en español de que no se ha guardado, no se afirma que quedó guardado, se mantiene el objetivo anterior si lo había y las sesiones quedan intactas. |
| Recarga después de fijar el objetivo | El objetivo y el progreso de la semana en curso se conservan. |
| Datos del objetivo corruptos | Se trata como sin objetivo, sin errores en consola y sin perder sesiones. |
| Sesiones guardadas por la primera versión de la aplicación | Se siguen leyendo y contando en el progreso tras la migración existente. |
| Zoom de texto al 200 % | El objetivo, el restante y el progreso siguen siendo legibles y no se solapan. |
| Muchas sesiones (cientos) | El progreso y el estado del objetivo responden sin retardo perceptible. |

## 8. Fuera de alcance

- Notificaciones, recordatorios, avisos push o correos.
- Histórico de objetivos: no se guarda ni se muestra ningún objetivo de semanas anteriores, ni se comparan semanas entre sí. Se descarta explícitamente en esta versión.
- Recuperar un objetivo eliminado después de recargar la página ni mantener el aviso de «Deshacer» entre sesiones.
- Objetivos por defecto, automáticos, sugeridos o adaptativos según el histórico; la aplicación arranca siempre sin objetivo.
- Objetivos por materia, por tema o por día; varios objetivos simultáneos.
- Rachas de objetivos cumplidos, insignias, niveles, recompensas o gamificación.
- Compartir el objetivo, exportarlo o imprimirlo.
- Sincronización, cuentas de usuario, servidor, analítica o cualquier función que requiera conexión.
- Cambiar el formato de las sesiones guardadas, alterar la migración existente o modificar el formulario de sesiones.
- Cambiar el comportamiento de la racha, los contadores, el mapa de calor o la lista de sesiones, más allá de la alineación de «Esta semana» con las sesiones inválidas (RF-9.4).
- Modo oscuro, temas alternativos, animaciones decorativas o traducciones.
- Editar o eliminar sesiones desde el objetivo.
- Objetivos con decimales o expresados en horas.

## 9. Criterios de finalización

La funcionalidad se considera terminada cuando:

1. Todos los requisitos funcionales y no funcionales de esta spec están implementados y verificados.
2. Todas las decisiones de la sección «Decisiones cerradas» están reflejadas en los requisitos, en los casos límite y en el comportamiento implementado.
3. La aplicación sigue funcionando con doble clic, sin red, sin instalar nada y sin dependencias nuevas.
4. La lógica del progreso, del restante, del exceso y del estado del objetivo está cubierta por pruebas automáticas y todas pasan.
5. Las pruebas cubren: sin objetivo ni objetivo por defecto, objetivo fijado, progreso a 0, progreso igual al objetivo, progreso por encima, restante y exceso, restante decimal (0,5 y 29,5), lunes y domingo, sesión de la semana anterior, sesión futura, varias sesiones el mismo día, sesiones inválidas en el progreso y en «Esta semana», racha y días del mes con sesiones inválidas, cambio de mes y año, objetivo inválido, objetivo con decimales y separadores rechazado, objetivo gigante aceptado, cambio de objetivo a mitad de semana, objetivo vigente al cambiar de semana, eliminar y recargar, deshacer, y objetivo corrupto.
6. La verificación manual cubre: arranque sin objetivo, fijar, editar a mitad de semana, eliminar, deshacer, recargar tras eliminar, recargar, alcanzar el objetivo, superarlo, cambio de semana, barra y textos accesibles, foco tras eliminar y deshacer, y consola sin errores.
7. La vista se comprueba a 320, 375, 768 y 1440 píxeles de ancho, sin scroll horizontal y sin solapamientos.
8. La accesibilidad se comprueba con teclado, lector de pantalla (incluida la barra de progreso y el aviso de eliminación), zoom al 200 % y escala de grises.
9. La racha, los minutos de la semana, los días del mes, el mapa de calor y la lista de sesiones conservan exactamente sus valores anteriores con datos válidos; con sesiones inválidas, la racha y los días del mes siguen contándolas como hasta ahora y «Esta semana» coincide con el progreso.
10. Ninguna sesión se ha perdido ni se ha modificado, el formato de las sesiones no ha cambiado y el objetivo se guarda en una entrada independiente.
11. `MEMORY.md` está actualizado con el estado y las decisiones de la funcionalidad.

## 10. Decisiones cerradas

No quedan dudas abiertas: todas las decisiones de esta sección están cerradas y reflejadas en los requisitos. Cada una indica su porqué y los requisitos que la recogen:

1. **Almacenamiento del objetivo:** se guarda en una entrada independiente del almacenamiento local. Se descarta añadirlo dentro de la estructura de sesiones porque obligaría a cambiar el formato y arriesgaría los datos ya guardados (RF-1.7, RF-8.6, NFR-3).
2. **Objetivo por defecto:** no existe. La aplicación arranca sin objetivo y no propone ninguna cifra hasta que la persona fije una; así no se impone una meta que no ha elegido (RF-1.6, RF-8.5, RF-5.4).
3. **Vigencia:** el objetivo se mantiene semana tras semana hasta que la persona lo cambie o lo elimine. No caduca el domingo, para no obligar a reescribirlo cada semana (RF-6.6, definición de objetivo vigente).
4. **Cambio a mitad de semana:** se aplica a la semana en curso y se compara con los minutos ya acumulados en ese momento. Se descarta posponerlo a la semana siguiente porque el objetivo dejaría de reflejar lo que la persona quiere ahora (RF-5.2, RF-5.3, RF-12.4).
5. **Semanas anteriores:** solo existe la semana actual. No hay histórico consultable ni almacenado; se descarta explícitamente para no añadir complejidad ni datos que esta versión no usa (RF-6.11, fuera de alcance).
6. **Decimales del objetivo:** solo se aceptan minutos enteros. Un valor con decimales o separadores se rechaza con un mensaje en español; nunca se redondea ni se trunca en silencio (RF-7.1, RF-7.4, RF-7.5).
7. **Límite máximo:** no hay tope. Se acepta cualquier entero mayor que cero; un máximo artificial impediría fijar metas legítimamente altas (RF-7.1, RF-7.2, caso «Objetivo muy grande»).
8. **Qué se muestra:** objetivo, minutos acumulados, cuánto falta y barra de progreso, siempre con texto equivalente accesible. Al alcanzar el objetivo se muestra «0 min restantes»; al superarlo se añade cuántos minutos se han superado, sin recortar las cifras reales (RF-2.1, RF-4.1–RF-4.4, RF-10.1–RF-10.3).
9. **Sesiones inválidas en «Esta semana»:** la cifra existente se alinea con el mapa y el progreso e ignora los minutos 0, negativos o no numéricos, para que ambas cifras coincidan siempre. Las sesiones no se borran ni se modifican; con datos válidos la cifra no cambia y la racha y los días del mes no se ven afectados (RF-9.2, RF-9.4–RF-9.6).
10. **Eliminación con deshacer:** al eliminar, el objetivo desaparece de inmediato y se ofrece un aviso «Deshacer» sin límite de tiempo, hasta fijar un objetivo nuevo o recargar. Se descarta pedir confirmación previa porque añade fricción a una acción reversible; el aviso y la restauración cubren el error (RF-5.4–RF-5.9).
11. **Formato de entrada del objetivo:** se acepta solo una secuencia de dígitos, con espacios alrededor opcionales, y se muestra en formato español con separador de miles. Se descarta interpretar «1.000» o «1,5» como cifras porque el mismo carácter puede significar cosas distintas y la validación debe ser determinista (RF-7.1, RF-7.4, RF-7.6–RF-7.8).
12. **Cifras decimales del progreso:** las sesiones admiten minutos decimales, así que el progreso, el restante y el exceso pueden no ser enteros. Se muestran con hasta dos decimales y coma española, sin redondearlos a enteros. Se descarta forzar el progreso a entero porque falsearía las cifras reales (RF-2.9, RF-4.1, RF-4.3).
