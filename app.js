// Clave con la que guardamos las sesiones en localStorage.
const CLAVE_SESIONES = "diario-estudio-sesiones";
const CLAVE_ANTERIOR = "diarioDeEstudio.sesiones";

const MESES_CORTOS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

const TEXTO_DETALLE_INICIAL = "Pasa el puntero, toca o enfoca un día para ver su detalle.";
const TEXTO_SIN_SESIONES = "Aún no hay sesiones en estas 12 semanas. Registra la primera para empezar a llenar el mapa.";

// ---------- Fechas ----------

// Suma días usando componentes locales: el cambio de hora no duplica ni pierde días.
function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

// Devuelve el lunes de la semana de la fecha indicada.
function inicioDeSemana(fecha) {
  const dia = fecha.getDay(); // 0 = domingo, 1 = lunes...
  const diasDesdeLunes = (dia + 6) % 7;

  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() - diasDesdeLunes);
}

// Devuelve la fecha local del usuario en formato AAAA-MM-DD.
// Usamos sus componentes para no convertirla a UTC y desplazar el día.
function fechaParaInput(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function formatearFecha(fechaTexto) {
  const [anio, mes, dia] = fechaTexto.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);

  return fecha.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatearFechaConDia(fechaTexto) {
  const [anio, mes, dia] = fechaTexto.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);

  return fecha.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatearMinutos(minutos) {
  return minutos.toLocaleString("es-ES");
}

// Comprueba que la clave sea AAAA-MM-DD y que la fecha exista de verdad.
function isRealDateKey(key) {
  if (typeof key !== "string") {
    return false;
  }

  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);

  if (!partes) {
    return false;
  }

  const anio = Number(partes[1]);
  const mes = Number(partes[2]);
  const dia = Number(partes[3]);
  const fecha = new Date(anio, mes - 1, dia);

  return (
    fecha.getFullYear() === anio &&
    fecha.getMonth() === mes - 1 &&
    fecha.getDate() === dia
  );
}

// Convierte los minutos guardados en un número mayor que cero o null.
// Rechaza 0, negativos, NaN, Infinity, booleanos, null y textos vacíos.
function parseMinutes(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  if (typeof value === "string") {
    const texto = value.trim();

    if (texto === "") {
      return null;
    }

    const numero = Number(texto);

    return Number.isFinite(numero) && numero > 0 ? numero : null;
  }

  return null;
}

// Redondea a 2 decimales para absorber el ruido binario (0.1 + 0.2).
function roundMinutes(value) {
  return Math.round(value * 100) / 100;
}

// ---------- Normalización y agrupación ----------

// Acepta el formato actual y el de la primera versión. Devuelve null si no es un objeto.
function normalizeSession(session) {
  if (!session || typeof session !== "object" || Array.isArray(session)) {
    return null;
  }

  return {
    date: session.date ?? session.fecha,
    topic: session.topic ?? session.tema,
    minutes: session.minutes ?? session.minutos,
  };
}

// Agrupa por día las sesiones válidas: suma minutos y cuenta sesiones.
function groupSessionsByDay(sessions) {
  const totales = new Map();

  if (!Array.isArray(sessions)) {
    return totales;
  }

  for (const sesion of sessions) {
    const normalizada = normalizeSession(sesion);

    if (!normalizada || !isRealDateKey(normalizada.date)) {
      continue;
    }

    const minutos = parseMinutes(normalizada.minutes);

    if (minutos === null) {
      continue;
    }

    const actual = totales.get(normalizada.date) ?? { minutes: 0, sessionCount: 0 };
    actual.minutes = roundMinutes(actual.minutes + minutos);
    actual.sessionCount += 1;
    totales.set(normalizada.date, actual);
  }

  return totales;
}

// ---------- Niveles ----------

function getHeatLevel(minutes) {
  if (typeof minutes !== "number" || !Number.isFinite(minutes) || minutes <= 0) {
    return 0;
  }

  if (minutes < 30) {
    return 1;
  }

  if (minutes < 60) {
    return 2;
  }

  if (minutes < 120) {
    return 3;
  }

  return 4;
}

// ---------- Periodo, resumen y meses ----------

// 12 semanas completas: desde el lunes 11 semanas antes hasta el domingo actual.
function buildPeriod(today, weeks = 12) {
  const monday = inicioDeSemana(today);
  const start = addDays(monday, -7 * (weeks - 1));
  const end = addDays(start, 7 * weeks - 1);

  return {
    start,
    end,
    startKey: fechaParaInput(start),
    endKey: fechaParaInput(end),
  };
}

function summarizeHeatmap(days) {
  let daysWithSessions = 0;
  let totalMinutes = 0;

  for (const day of days) {
    if (day.isFuture) {
      continue;
    }

    if (day.minutes > 0) {
      daysWithSessions += 1;
      totalMinutes += day.minutes;
    }
  }

  return {
    daysWithSessions,
    minutes: roundMinutes(totalMinutes),
    totalDays: days.length,
  };
}

function formatSummary(summary) {
  const dias = formatearMinutos(summary.daysWithSessions);
  const total = formatearMinutos(summary.totalDays);
  const minutos = formatearMinutos(summary.minutes);

  return `${dias} de ${total} días con sesiones · ${minutos} min`;
}

function formatMonthShort(date) {
  return MESES_CORTOS[date.getMonth()];
}

// Como máximo una etiqueta por columna: la primera semana y las que contienen el día 1.
function getMonthLabels(period, weeks = 12) {
  const labels = [];

  for (let weekIndex = 0; weekIndex < weeks; weekIndex++) {
    const monday = addDays(period.start, weekIndex * 7);
    let firstOfMonth = null;

    for (let d = 0; d < 7; d++) {
      const date = addDays(monday, d);

      if (date.getDate() === 1) {
        firstOfMonth = date;
      }
    }

    if (weekIndex === 0 && firstOfMonth === null) {
      labels.push({ weekIndex, text: formatMonthShort(monday) });
    } else if (firstOfMonth !== null) {
      labels.push({ weekIndex, text: formatMonthShort(firstOfMonth) });
    }
  }

  return labels;
}

// ---------- Textos de detalle y accesibilidad ----------

function formatDayDetail(day) {
  const fecha = formatearFecha(day.key);

  if (day.isFuture) {
    return `${fecha} · Día futuro`;
  }

  if (!(day.minutes > 0)) {
    return `${fecha} · Sin sesiones`;
  }

  const sesiones = day.sessionCount === 1 ? "1 sesión" : `${day.sessionCount} sesiones`;

  return `${fecha} · ${formatearMinutos(day.minutes)} min · ${sesiones}`;
}

function getAccessibleDayLabel(day) {
  const fecha = formatearFechaConDia(day.key);

  if (day.isFuture) {
    return `${fecha}, día futuro`;
  }

  if (!(day.minutes > 0)) {
    return `${fecha}, sin sesiones, sin nivel`;
  }

  const sesiones = day.sessionCount === 1 ? "1 sesión" : `${day.sessionCount} sesiones`;

  return `${fecha}, ${formatearMinutos(day.minutes)} minutos, ${sesiones}, nivel ${day.level}`;
}

function getInitialFocusKey(days, todayKey) {
  if (days.some((day) => day.key === todayKey)) {
    return todayKey;
  }

  const pasados = days.filter((day) => !day.isFuture);

  if (pasados.length > 0) {
    return pasados[pasados.length - 1].key;
  }

  return days[0]?.key ?? null;
}

// ---------- Modelo del mapa ----------

function buildHeatmap(sessions, today, weeks = 12) {
  const period = buildPeriod(today, weeks);
  const todayKey = fechaParaInput(today);
  const totals = groupSessionsByDay(sessions);
  const days = [];

  for (let i = 0; i < weeks * 7; i++) {
    const date = addDays(period.start, i);
    const key = fechaParaInput(date);
    const stats = totals.get(key) ?? { minutes: 0, sessionCount: 0 };
    const isFuture = key > todayKey;
    const isToday = key === todayKey;
    const level = isFuture ? null : getHeatLevel(stats.minutes);

    days.push({
      key,
      date,
      minutes: stats.minutes,
      sessionCount: stats.sessionCount,
      level,
      isFuture,
      isToday,
    });
  }

  return {
    period,
    days,
    summary: summarizeHeatmap(days),
    monthLabels: getMonthLabels(period, weeks),
  };
}

// ---------- Métricas existentes (puras) ----------

function calcularRacha(sessions, today) {
  const diasConSesion = new Set();

  for (const sesion of sessions) {
    const normalizada = normalizeSession(sesion);

    if (normalizada && typeof normalizada.date === "string") {
      diasConSesion.add(normalizada.date);
    }
  }

  const ayer = addDays(today, -1);
  let dia;

  if (diasConSesion.has(fechaParaInput(today))) {
    dia = today;
  } else if (diasConSesion.has(fechaParaInput(ayer))) {
    // Hoy todavía no hay sesión, pero la racha de ayer sigue viva.
    dia = ayer;
  } else {
    return 0;
  }

  let racha = 0;

  // Vamos retrocediendo día a día mientras encontremos sesiones.
  while (diasConSesion.has(fechaParaInput(dia))) {
    racha++;
    dia = addDays(dia, -1);
  }

  return racha;
}

function calcularMinutosSemana(sessions, today) {
  const claveLunes = fechaParaInput(inicioDeSemana(today));
  const claveHoy = fechaParaInput(today);
  let total = 0;

  for (const sesion of sessions) {
    const normalizada = normalizeSession(sesion);

    if (!normalizada || typeof normalizada.date !== "string") {
      continue;
    }

    if (normalizada.date < claveLunes || normalizada.date > claveHoy) {
      continue;
    }

    const minutos = Number(normalizada.minutes);

    if (Number.isFinite(minutos)) {
      total += minutos;
    }
  }

  return roundMinutes(total);
}

function calcularDiasMes(sessions, today) {
  const claveInicioMes = fechaParaInput(new Date(today.getFullYear(), today.getMonth(), 1));
  const claveHoy = fechaParaInput(today);
  const dias = new Set();

  for (const sesion of sessions) {
    const normalizada = normalizeSession(sesion);

    if (!normalizada || typeof normalizada.date !== "string") {
      continue;
    }

    if (normalizada.date >= claveInicioMes && normalizada.date <= claveHoy) {
      dias.add(normalizada.date);
    }
  }

  return dias.size;
}

// ---------- Almacenamiento ----------

function guardarSesiones(sesiones) {
  localStorage.setItem(CLAVE_SESIONES, JSON.stringify(sesiones));
}

function cargarSesiones() {
  const sesionesGuardadas = leerSesiones(CLAVE_SESIONES);

  if (sesionesGuardadas !== null) {
    return sesionesGuardadas.map(normalizeSession).filter(Boolean);
  }

  // Compatibilidad con las sesiones guardadas por la primera versión.
  const sesionesAnteriores = leerSesiones(CLAVE_ANTERIOR);

  if (sesionesAnteriores === null) {
    return [];
  }

  const sesionesMigradas = sesionesAnteriores.map(normalizeSession).filter(Boolean);

  try {
    localStorage.setItem(CLAVE_SESIONES, JSON.stringify(sesionesMigradas));
    localStorage.removeItem(CLAVE_ANTERIOR);
  } catch (error) {
    // Si no se puede guardar, al menos mostramos las sesiones en esta visita.
  }

  return sesionesMigradas;
}

function leerSesiones(clave) {
  try {
    const datos = localStorage.getItem(clave);

    if (!datos) {
      return null;
    }

    const sesionesGuardadas = JSON.parse(datos);
    return Array.isArray(sesionesGuardadas) ? sesionesGuardadas : null;
  } catch (error) {
    return null;
  }
}

// ---------- Inicialización del DOM ----------

// Solo arranca en el navegador. Así `node --test` puede importar la lógica pura.
if (typeof document !== "undefined") {
  iniciar();
}

function iniciar() {
  const formulario = document.getElementById("formulario");
  const campoFecha = document.getElementById("fecha");
  const campoTema = document.getElementById("tema");
  const campoMinutos = document.getElementById("minutos");
  const mensajeError = document.getElementById("error");
  const rachaNumero = document.getElementById("racha-numero");
  const rachaTexto = document.getElementById("racha-texto");
  const minutosSemana = document.getElementById("minutos-semana");
  const diasMes = document.getElementById("dias-mes");
  const unidadDiasMes = document.getElementById("unidad-dias-mes");
  const listaSesiones = document.getElementById("lista-sesiones");
  const listaVacia = document.getElementById("lista-vacia");

  const mapaSeccion = document.getElementById("mapa-calor");
  const mapaRejilla = document.getElementById("mapa-rejilla");
  const mapaMeses = document.getElementById("mapa-meses");
  const mapaResumen = document.getElementById("mapa-resumen");
  const mapaVacio = document.getElementById("mapa-vacio");
  const mapaDetalle = document.getElementById("mapa-detalle");

  let sesiones = cargarSesiones();
  let modelo = null;
  let claveFoco = null;
  let claveDetalle = null;
  let claveFijada = null;
  const celdasPorClave = new Map();

  campoFecha.value = fechaParaInput(new Date());
  formulario.addEventListener("submit", guardarSesion);

  mapaRejilla.addEventListener("focusin", manejarFoco);
  mapaRejilla.addEventListener("focusout", manejarSalidaFoco);
  mapaRejilla.addEventListener("mouseover", manejarPuntero);
  mapaRejilla.addEventListener("mouseleave", manejarSalidaPuntero);
  mapaRejilla.addEventListener("click", manejarClic);
  mapaRejilla.addEventListener("keydown", manejarTeclado);
  document.addEventListener("click", manejarClicFuera);

  mostrarTodo();

  function guardarSesion(evento) {
    evento.preventDefault();

    const fecha = campoFecha.value;
    const tema = campoTema.value.trim();
    const minutos = Number(campoMinutos.value);

    if (!isRealDateKey(fecha) || !tema || !Number.isFinite(minutos) || minutos <= 0) {
      mostrarError("Completa la fecha y el tema, y escribe unos minutos mayores que 0.");
      return;
    }

    // La añadimos al principio para que, si hay varias del mismo día,
    // la última que registres aparezca primero en la lista.
    sesiones.unshift({ date: fecha, topic: tema, minutes: minutos });
    guardarSesiones(sesiones);
    mostrarTodo();
    limpiarFormulario();
  }

  function mostrarTodo() {
    const hoy = new Date();

    mostrarRacha(hoy);
    mostrarMinutosSemana(hoy);
    mostrarDiasMes(hoy);
    mostrarSesiones();
    mostrarMapa(hoy);
  }

  function mostrarRacha(hoy) {
    const racha = calcularRacha(sesiones, hoy);

    rachaNumero.textContent = racha;

    if (racha === 0) {
      rachaTexto.textContent = "Empieza hoy tu racha";
    } else if (racha === 1) {
      rachaTexto.textContent = "día seguido";
    } else {
      rachaTexto.textContent = "días seguidos";
    }
  }

  function mostrarMinutosSemana(hoy) {
    minutosSemana.textContent = formatearMinutos(calcularMinutosSemana(sesiones, hoy));
  }

  function mostrarDiasMes(hoy) {
    const total = calcularDiasMes(sesiones, hoy);

    diasMes.textContent = total;
    unidadDiasMes.textContent = total === 1 ? "día" : "días";
  }

  function mostrarSesiones() {
    listaSesiones.replaceChildren();

    if (sesiones.length === 0) {
      listaVacia.hidden = false;
      return;
    }

    listaVacia.hidden = true;

    obtenerSesionesOrdenadas().forEach((sesion) => {
      const elemento = document.createElement("li");
      elemento.className = "sesion";

      const info = document.createElement("div");
      info.className = "sesion__info";

      const tema = document.createElement("p");
      tema.className = "sesion__tema";
      tema.textContent = sesion.topic ?? "Sin tema";

      const fecha = document.createElement("p");
      fecha.className = "sesion__fecha";
      fecha.textContent = formatearFecha(sesion.date);

      const minutos = document.createElement("span");
      minutos.className = "sesion__minutos";
      minutos.textContent = `${formatearMinutos(Number(sesion.minutes))} min`;

      info.append(tema, fecha);
      elemento.append(info, minutos);
      listaSesiones.append(elemento);
    });
  }

  function obtenerSesionesOrdenadas() {
    // Las fechas están en formato AAAA-MM-DD, así que se pueden comparar como texto.
    return [...sesiones]
      .filter((sesion) => sesion && typeof sesion.date === "string")
      .sort((a, b) => {
        if (a.date === b.date) {
          return 0;
        }

        return a.date < b.date ? 1 : -1;
      });
  }

  function mostrarError(texto) {
    mensajeError.textContent = texto;
    mensajeError.hidden = false;
  }

  function ocultarError() {
    mensajeError.textContent = "";
    mensajeError.hidden = true;
  }

  function limpiarFormulario() {
    formulario.reset();
    campoFecha.value = fechaParaInput(new Date());
    ocultarError();
  }

  // ---------- Mapa de calor ----------

  function mostrarMapa(hoy) {
    const focoAnterior = claveFoco;

    modelo = buildHeatmap(sesiones, hoy);
    claveFoco = getInitialFocusKey(modelo.days, fechaParaInput(hoy));

    if (focoAnterior && modelo.days.some((day) => day.key === focoAnterior)) {
      claveFoco = focoAnterior;
    }

    if (claveFijada && !modelo.days.some((day) => day.key === claveFijada)) {
      claveFijada = null;
    }

    pintarMapa();
    actualizarDetalle();
  }

  function pintarMapa() {
    celdasPorClave.clear();
    mapaRejilla.replaceChildren();
    mapaMeses.replaceChildren();

    mapaRejilla.setAttribute(
      "aria-label",
      `Mapa de calor del ${formatearFecha(modelo.period.startKey)} al ${formatearFecha(modelo.period.endKey)}`
    );
    mapaResumen.textContent = formatSummary(modelo.summary);
    mapaVacio.hidden = modelo.summary.daysWithSessions > 0;
    mapaVacio.textContent = TEXTO_SIN_SESIONES;

    for (const etiqueta of modelo.monthLabels) {
      const mes = document.createElement("span");
      mes.className = "mapa__mes";
      mes.style.gridColumn = String(etiqueta.weekIndex + 1);
      mes.textContent = etiqueta.text;
      mapaMeses.append(mes);
    }

    // 7 filas (días de la semana) x 12 columnas (semanas).
    for (let fila = 0; fila < 7; fila++) {
      const filaElemento = document.createElement("div");
      filaElemento.className = "mapa__fila";
      filaElemento.setAttribute("role", "row");

      for (let columna = 0; columna < 12; columna++) {
        const day = modelo.days[columna * 7 + fila];
        filaElemento.append(crearCelda(day));
      }

      mapaRejilla.append(filaElemento);
    }
  }

  function crearCelda(day) {
    const celda = document.createElement("button");
    celda.type = "button";
    celda.className = "mapa__celda";
    celda.setAttribute("role", "gridcell");
    celda.dataset.key = day.key;
    celda.setAttribute("aria-label", getAccessibleDayLabel(day));
    celda.tabIndex = day.key === claveFoco ? 0 : -1;

    if (day.isFuture) {
      celda.classList.add("mapa__celda--futuro");
    } else if (day.level === 0) {
      celda.classList.add("mapa__celda--vacia");
    } else {
      celda.classList.add(`mapa__celda--n${day.level}`);
    }

    if (day.isToday) {
      celda.classList.add("mapa__celda--hoy");
      celda.setAttribute("aria-current", "date");
    }

    celdasPorClave.set(day.key, celda);

    return celda;
  }

  function actualizarDetalle() {
    if (!modelo) {
      return;
    }

    const clave = claveFijada ?? claveDetalle;
    const day = clave ? modelo.days.find((dia) => dia.key === clave) : null;

    mapaDetalle.textContent = day ? formatDayDetail(day) : TEXTO_DETALLE_INICIAL;
  }

  function actualizarTabindex(key) {
    if (claveFoco === key) {
      return;
    }

    const anterior = celdasPorClave.get(claveFoco);

    if (anterior) {
      anterior.tabIndex = -1;
    }

    claveFoco = key;

    const nueva = celdasPorClave.get(key);

    if (nueva) {
      nueva.tabIndex = 0;
    }
  }

  function enfocarClave(key) {
    const celda = celdasPorClave.get(key);

    if (!celda) {
      return;
    }

    actualizarTabindex(key);
    celda.focus();
  }

  function celdaDelEvento(evento) {
    return evento.target.closest(".mapa__celda");
  }

  function manejarFoco(evento) {
    const celda = celdaDelEvento(evento);

    if (!celda) {
      return;
    }

    actualizarTabindex(celda.dataset.key);
    claveDetalle = celda.dataset.key;
    actualizarDetalle();
  }

  function manejarSalidaFoco(evento) {
    if (mapaRejilla.contains(evento.relatedTarget)) {
      return;
    }

    if (!claveFijada) {
      claveDetalle = null;
      actualizarDetalle();
    }
  }

  function manejarPuntero(evento) {
    const celda = celdaDelEvento(evento);

    if (!celda || claveFijada) {
      return;
    }

    claveDetalle = celda.dataset.key;
    actualizarDetalle();
  }

  function manejarSalidaPuntero() {
    if (!claveFijada) {
      claveDetalle = null;
      actualizarDetalle();
    }
  }

  function manejarClic(evento) {
    const celda = celdaDelEvento(evento);

    if (!celda) {
      return;
    }

    const key = celda.dataset.key;

    if (claveFijada === key) {
      claveFijada = null;
      claveDetalle = null;
    } else {
      claveFijada = key;
      claveDetalle = key;
    }

    actualizarDetalle();
  }

  function manejarClicFuera(evento) {
    if (!mapaSeccion.contains(evento.target) && claveFijada) {
      claveFijada = null;
      claveDetalle = null;
      actualizarDetalle();
    }
  }

  function manejarTeclado(evento) {
    const celda = celdaDelEvento(evento);

    if (!celda) {
      return;
    }

    if (evento.key === "Escape") {
      evento.preventDefault();
      claveFijada = null;
      claveDetalle = null;
      actualizarDetalle();
      return;
    }

    const teclas = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"];

    if (!teclas.includes(evento.key)) {
      return;
    }

    evento.preventDefault();

    const indice = modelo.days.findIndex((day) => day.key === celda.dataset.key);

    if (indice < 0) {
      return;
    }

    const diaSemana = indice % 7;
    const semana = Math.floor(indice / 7);
    let destino = null;

    if (evento.key === "ArrowUp" && diaSemana > 0) {
      destino = indice - 1;
    } else if (evento.key === "ArrowDown" && diaSemana < 6) {
      destino = indice + 1;
    } else if (evento.key === "ArrowLeft" && semana > 0) {
      destino = indice - 7;
    } else if (evento.key === "ArrowRight" && semana < 11) {
      destino = indice + 7;
    } else if (evento.key === "Home") {
      destino = indice - semana * 7;
    } else if (evento.key === "End") {
      destino = indice + (11 - semana) * 7;
    }

    // En los bordes no hay wrap: el foco se queda donde está.
    if (destino === null) {
      return;
    }

    enfocarClave(modelo.days[destino].key);
  }
}

// ---------- Exportación para tests ----------

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    addDays,
    buildHeatmap,
    buildPeriod,
    calcularDiasMes,
    calcularMinutosSemana,
    calcularRacha,
    fechaParaInput,
    formatDayDetail,
    formatMonthShort,
    formatSummary,
    getAccessibleDayLabel,
    getHeatLevel,
    getInitialFocusKey,
    getMonthLabels,
    groupSessionsByDay,
    inicioDeSemana,
    isRealDateKey,
    normalizeSession,
    parseMinutes,
    roundMinutes,
    summarizeHeatmap,
  };
}
