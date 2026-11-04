// Clave con la que guardamos las sesiones en localStorage.
const CLAVE_SESIONES = "diario-estudio-sesiones";
const CLAVE_ANTERIOR = "diarioDeEstudio.sesiones";

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

let sesiones = cargarSesiones();

iniciar();

function iniciar() {
  campoFecha.value = fechaParaInput(new Date());
  formulario.addEventListener("submit", guardarSesion);
  mostrarTodo();
}

function guardarSesion(evento) {
  evento.preventDefault();

  const fecha = campoFecha.value;
  const tema = campoTema.value.trim();
  const minutos = Number(campoMinutos.value);

  if (!fecha || !tema || !Number.isFinite(minutos) || minutos <= 0) {
    mostrarError("Completa la fecha y el tema, y escribe unos minutos mayores que 0.");
    return;
  }

  // La añadimos al principio para que, si hay varias del mismo día,
  // la última que registres aparezca primero en la lista.
  sesiones.unshift({ date: fecha, topic: tema, minutes: minutos });
  guardarSesiones();
  mostrarTodo();
  limpiarFormulario();
}

function mostrarTodo() {
  mostrarRacha();
  mostrarMinutosSemana();
  mostrarDiasMes();
  mostrarSesiones();
}

function mostrarRacha() {
  const racha = calcularRacha();

  rachaNumero.textContent = racha;

  if (racha === 0) {
    rachaTexto.textContent = "Empieza hoy tu racha";
  } else if (racha === 1) {
    rachaTexto.textContent = "día seguido";
  } else {
    rachaTexto.textContent = "días seguidos";
  }
}

function calcularRacha() {
  const diasConSesion = new Set(sesiones.map((sesion) => sesion.date));
  const hoy = new Date();
  const ayer = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1);

  let dia;

  if (diasConSesion.has(fechaParaInput(hoy))) {
    dia = hoy;
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
    dia.setDate(dia.getDate() - 1);
  }

  return racha;
}

function mostrarMinutosSemana() {
  minutosSemana.textContent = formatearMinutos(calcularMinutosSemana());
}

function calcularMinutosSemana() {
  const hoy = new Date();
  const claveLunes = fechaParaInput(inicioDeSemana(hoy));
  const claveHoy = fechaParaInput(hoy);

  return sesiones
    .filter((sesion) => sesion.date >= claveLunes && sesion.date <= claveHoy)
    .reduce((total, sesion) => {
      const minutos = Number(sesion.minutes);

      return Number.isFinite(minutos) ? total + minutos : total;
    }, 0);
}

function mostrarDiasMes() {
  const total = calcularDiasMes();

  diasMes.textContent = total;
  unidadDiasMes.textContent = total === 1 ? "día" : "días";
}

function calcularDiasMes() {
  const hoy = new Date();
  const claveInicioMes = fechaParaInput(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  const claveHoy = fechaParaInput(hoy);

  // El Set hace que varias sesiones del mismo día cuenten como un solo día.
  return new Set(
    sesiones
      .filter((sesion) => sesion.date >= claveInicioMes && sesion.date <= claveHoy)
      .map((sesion) => sesion.date)
  ).size;
}

// Devuelve el lunes de la semana de la fecha indicada.
function inicioDeSemana(fecha) {
  const dia = fecha.getDay(); // 0 = domingo, 1 = lunes...
  const diasDesdeLunes = (dia + 6) % 7;

  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() - diasDesdeLunes);
}

function mostrarSesiones() {
  listaSesiones.innerHTML = "";

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
    tema.textContent = sesion.topic;

    const fecha = document.createElement("p");
    fecha.className = "sesion__fecha";
    fecha.textContent = formatearFecha(sesion.date);

    const minutos = document.createElement("span");
    minutos.className = "sesion__minutos";
    minutos.textContent = `${formatearMinutos(sesion.minutes)} min`;

    info.append(tema, fecha);
    elemento.append(info, minutos);
    listaSesiones.append(elemento);
  });
}

function obtenerSesionesOrdenadas() {
  // Las fechas están en formato AAAA-MM-DD, así que se pueden comparar como texto.
  return [...sesiones].sort((a, b) => {
    if (a.date === b.date) {
      return 0;
    }

    return a.date < b.date ? 1 : -1;
  });
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

function formatearMinutos(minutos) {
  return minutos.toLocaleString("es-ES");
}

// Devuelve la fecha local del usuario en formato AAAA-MM-DD.
// Usamos sus componentes para no convertirla a UTC y desplazar el día.
function fechaParaInput(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function guardarSesiones() {
  localStorage.setItem(CLAVE_SESIONES, JSON.stringify(sesiones));
}

function cargarSesiones() {
  const sesionesGuardadas = leerSesiones(CLAVE_SESIONES);

  if (sesionesGuardadas !== null) {
    return sesionesGuardadas.map(normalizarSesion);
  }

  // Compatibilidad con las sesiones guardadas por la primera versión.
  const sesionesAnteriores = leerSesiones(CLAVE_ANTERIOR);

  if (sesionesAnteriores === null) {
    return [];
  }

  const sesionesMigradas = sesionesAnteriores.map(normalizarSesion);

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

function normalizarSesion(sesion) {
  return {
    date: sesion.date ?? sesion.fecha,
    topic: sesion.topic ?? sesion.tema,
    minutes: sesion.minutes ?? sesion.minutos,
  };
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
