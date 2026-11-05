// Tests de la lógica pura del Diario de Estudio.
// Se ejecutan con `node --test`. No tocan DOM, localStorage ni el reloj real.
const test = require("node:test");
const assert = require("node:assert/strict");

const {
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
  isRealDateKey,
  normalizeSession,
  parseMinutes,
  roundMinutes,
  summarizeHeatmap,
} = require("./app.js");

// Construimos fechas con componentes locales (nunca con cadenas ISO).
function fecha(anio, mes, dia) {
  return new Date(anio, mes - 1, dia, 12, 0, 0);
}

function dia(key, opciones = {}) {
  return {
    key,
    minutes: 0,
    sessionCount: 0,
    level: 0,
    isFuture: false,
    isToday: false,
    ...opciones,
  };
}

// ---------- Fechas y periodo ----------

test("addDays suma y resta días con componentes locales", () => {
  assert.equal(fechaParaInput(addDays(fecha(2026, 11, 5), 1)), "2026-11-06");
  assert.equal(fechaParaInput(addDays(fecha(2026, 11, 5), -5)), "2026-10-31");
  assert.equal(fechaParaInput(addDays(fecha(2026, 12, 31), 1)), "2027-01-01");
  assert.equal(fechaParaInput(addDays(fecha(2024, 2, 28), 1)), "2024-02-29");
});

test("buildPeriod genera 12 semanas completas de lunes a domingo", () => {
  const periodo = buildPeriod(fecha(2026, 11, 5));

  assert.equal(periodo.startKey, "2026-08-17");
  assert.equal(periodo.endKey, "2026-11-08");
  assert.equal(periodo.start.getDay(), 1);
  assert.equal(periodo.end.getDay(), 0);
});

test("buildPeriod cruza el cambio de año sin perder días", () => {
  const periodo = buildPeriod(fecha(2026, 1, 5));

  assert.equal(periodo.startKey, "2025-10-20");
  assert.equal(periodo.endKey, "2026-01-11");
});

test("buildPeriod incluye el 29 de febrero", () => {
  const modelo = buildHeatmap([], fecha(2024, 3, 1));
  const claves = modelo.days.map((d) => d.key);

  assert.ok(claves.includes("2024-02-29"));
  assert.equal(claves.length, 84);
});

test("buildPeriod mantiene 84 claves únicas al cruzar el cambio de hora", () => {
  const modelo = buildHeatmap([], fecha(2026, 4, 5));
  const claves = modelo.days.map((d) => d.key);

  assert.equal(new Set(claves).size, 84);
  assert.equal(claves[0], modelo.period.startKey);
  assert.equal(claves[83], modelo.period.endKey);
});

// ---------- Validación ----------

test("isRealDateKey acepta fechas reales y rechaza imposibles o mal formadas", () => {
  assert.equal(isRealDateKey("2026-11-05"), true);
  assert.equal(isRealDateKey("2024-02-29"), true);
  assert.equal(isRealDateKey("2026-02-30"), false);
  assert.equal(isRealDateKey("2026-13-01"), false);
  assert.equal(isRealDateKey("2026-00-10"), false);
  assert.equal(isRealDateKey("2026-1-1"), false);
  assert.equal(isRealDateKey("2026-11-05T00:00"), false);
  assert.equal(isRealDateKey(""), false);
  assert.equal(isRealDateKey(null), false);
  assert.equal(isRealDateKey(20261105), false);
});

test("parseMinutes acepta números y cadenas mayores que cero", () => {
  assert.equal(parseMinutes(30), 30);
  assert.equal(parseMinutes("30"), 30);
  assert.equal(parseMinutes(" 0.5 "), 0.5);
});

test("parseMinutes rechaza cero, negativos y valores no numéricos", () => {
  assert.equal(parseMinutes(0), null);
  assert.equal(parseMinutes(-1), null);
  assert.equal(parseMinutes("abc"), null);
  assert.equal(parseMinutes(NaN), null);
  assert.equal(parseMinutes(Infinity), null);
  assert.equal(parseMinutes(null), null);
  assert.equal(parseMinutes(undefined), null);
  assert.equal(parseMinutes(true), null);
  assert.equal(parseMinutes(""), null);
  assert.equal(parseMinutes("   "), null);
});

test("roundMinutes absorbe el ruido binario", () => {
  assert.equal(roundMinutes(0.1 + 0.2), 0.3);
  assert.equal(roundMinutes(29.999), 30);
});

// ---------- Normalización y agrupación ----------

test("normalizeSession acepta el formato actual y el de la primera versión", () => {
  assert.deepEqual(normalizeSession({ date: "2026-11-05", topic: "Álgebra", minutes: 30 }), {
    date: "2026-11-05",
    topic: "Álgebra",
    minutes: 30,
  });

  assert.deepEqual(normalizeSession({ fecha: "2026-11-05", tema: "Álgebra", minutos: 30 }), {
    date: "2026-11-05",
    topic: "Álgebra",
    minutes: 30,
  });
});

test("normalizeSession es null-safe", () => {
  assert.equal(normalizeSession(null), null);
  assert.equal(normalizeSession(undefined), null);
  assert.equal(normalizeSession("texto"), null);
  assert.equal(normalizeSession(42), null);
});

test("groupSessionsByDay suma minutos, cuenta sesiones e ignora las inválidas", () => {
  const sesiones = [
    { date: "2026-11-05", topic: "A", minutes: 20 },
    { date: "2026-11-05", topic: "B", minutes: 20 },
    { date: "2026-11-04", topic: "C", minutes: "35" },
    { date: "2026-11-03", topic: "D", minutes: 0 },
    { date: "2026-11-02", topic: "E", minutes: -5 },
    { date: "2026-02-30", topic: "F", minutes: 10 },
    { date: "", topic: "G", minutes: 10 },
    { date: "2026-11-01", topic: "H", minutes: "diez" },
    null,
  ];

  const totales = groupSessionsByDay(sesiones);

  assert.deepEqual(totales.get("2026-11-05"), { minutes: 40, sessionCount: 2 });
  assert.deepEqual(totales.get("2026-11-04"), { minutes: 35, sessionCount: 1 });
  assert.equal(totales.has("2026-11-03"), false);
  assert.equal(totales.has("2026-11-02"), false);
  assert.equal(totales.has("2026-11-01"), false);
  assert.equal(totales.size, 2);
});

test("groupSessionsByDay no muta la lista de entrada", () => {
  const sesiones = [{ date: "2026-11-05", topic: "A", minutes: 20 }];
  const copia = JSON.parse(JSON.stringify(sesiones));

  groupSessionsByDay(sesiones);

  assert.deepEqual(sesiones, copia);
});

// ---------- Niveles ----------

test("getHeatLevel aplica los umbrales exactos", () => {
  const casos = [
    [0, 0],
    [0.5, 1],
    [1, 1],
    [29, 1],
    [29.9, 1],
    [30, 2],
    [59.9, 2],
    [60, 3],
    [119.9, 3],
    [120, 4],
    [1000, 4],
  ];

  for (const [minutos, esperado] of casos) {
    assert.equal(getHeatLevel(minutos), esperado, `${minutos} min debería ser nivel ${esperado}`);
  }
});

test("getHeatLevel no genera nivel con valores no válidos", () => {
  assert.equal(getHeatLevel(-1), 0);
  assert.equal(getHeatLevel(NaN), 0);
  assert.equal(getHeatLevel(Infinity), 0);
});

// ---------- Resumen ----------

test("summarizeHeatmap cuenta días únicos y excluye futuros", () => {
  const dias = Array.from({ length: 84 }, (_, i) => {
    if (i === 0) return dia("2026-08-17", { minutes: 45 });
    if (i > 0 && i < 18) return dia("2026-08-18", { minutes: 35 });
    if (i === 20) return dia("2026-09-07", { minutes: 100, isFuture: true });
    return dia("2026-09-08");
  });

  const resumen = summarizeHeatmap(dias);

  assert.deepEqual(resumen, { daysWithSessions: 18, minutes: 640, totalDays: 84 });
  assert.equal(formatSummary(resumen), "18 de 84 días con sesiones · 640 min");
});

test("summarizeHeatmap devuelve cero sin sesiones", () => {
  const resumen = summarizeHeatmap(Array.from({ length: 84 }, () => dia("2026-09-08")));

  assert.deepEqual(resumen, { daysWithSessions: 0, minutes: 0, totalDays: 84 });
  assert.equal(formatSummary(resumen), "0 de 84 días con sesiones · 0 min");
});

test("summarizeHeatmap ignora un día con sesiones pero sin minutos válidos", () => {
  const resumen = summarizeHeatmap([dia("2026-09-08", { minutes: 0, sessionCount: 0 })]);

  assert.equal(resumen.daysWithSessions, 0);
  assert.equal(resumen.minutes, 0);
});

// ---------- Etiquetas de mes ----------

test("formatMonthShort devuelve tres letras fijas", () => {
  const esperados = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

  esperados.forEach((texto, mes) => {
    assert.equal(formatMonthShort(fecha(2026, mes + 1, 1)), texto);
  });
});

test("getMonthLabels etiqueta la primera semana y las semanas con día 1", () => {
  const periodo = buildPeriod(fecha(2026, 11, 5));

  assert.deepEqual(getMonthLabels(periodo), [
    { weekIndex: 0, text: "ago" },
    { weekIndex: 2, text: "sep" },
    { weekIndex: 6, text: "oct" },
    { weekIndex: 10, text: "nov" },
  ]);
});

test("getMonthLabels usa el mes del día 1 si cae en la primera semana", () => {
  const periodo = buildPeriod(fecha(2026, 7, 15));

  assert.deepEqual(getMonthLabels(periodo)[0], { weekIndex: 0, text: "may" });
});

test("getMonthLabels cruza el cambio de año con una etiqueta por columna", () => {
  const etiquetas = getMonthLabels(buildPeriod(fecha(2026, 1, 5)));
  const indices = etiquetas.map((etiqueta) => etiqueta.weekIndex);
  const textos = etiquetas.map((etiqueta) => etiqueta.text);

  assert.deepEqual(textos, ["oct", "nov", "dic", "ene"]);
  assert.equal(new Set(indices).size, indices.length);
});

// ---------- Detalle y accesibilidad ----------

test("formatDayDetail muestra fecha, minutos y sesiones en singular y plural", () => {
  assert.equal(
    formatDayDetail(dia("2026-11-05", { minutes: 90, sessionCount: 1, level: 3 })),
    "5 de noviembre de 2026 · 90 min · 1 sesión"
  );
  assert.equal(
    formatDayDetail(dia("2026-11-05", { minutes: 640, sessionCount: 2, level: 4 })),
    "5 de noviembre de 2026 · 640 min · 2 sesiones"
  );
});

test("formatDayDetail distingue día sin sesiones y día futuro", () => {
  assert.equal(formatDayDetail(dia("2026-11-05")), "5 de noviembre de 2026 · Sin sesiones");
  assert.equal(
    formatDayDetail(dia("2026-11-06", { isFuture: true, level: null })),
    "6 de noviembre de 2026 · Día futuro"
  );
});

test("formatDayDetail usa el formato español para minutos decimales", () => {
  assert.equal(
    formatDayDetail(dia("2026-11-05", { minutes: 29.5, sessionCount: 1, level: 1 })),
    "5 de noviembre de 2026 · 29,5 min · 1 sesión"
  );
});

test("getAccessibleDayLabel incluye día, fecha, minutos, sesiones y nivel", () => {
  assert.equal(
    getAccessibleDayLabel(dia("2026-11-05", { minutes: 90, sessionCount: 1, level: 3, isToday: true })),
    "jueves, 5 de noviembre de 2026, 90 minutos, 1 sesión, nivel 3"
  );
  assert.equal(
    getAccessibleDayLabel(dia("2026-11-05", { minutes: 640, sessionCount: 2, level: 4 })),
    "jueves, 5 de noviembre de 2026, 640 minutos, 2 sesiones, nivel 4"
  );
});

test("getAccessibleDayLabel describe el estado sin sesiones y el día futuro", () => {
  assert.equal(
    getAccessibleDayLabel(dia("2026-11-05")),
    "jueves, 5 de noviembre de 2026, sin sesiones, sin nivel"
  );
  assert.equal(
    getAccessibleDayLabel(dia("2026-11-06", { isFuture: true, level: null })),
    "viernes, 6 de noviembre de 2026, día futuro"
  );
});

test("getInitialFocusKey devuelve hoy y, si no está, la última casilla pasada", () => {
  const modelo = buildHeatmap([], fecha(2026, 11, 5));

  assert.equal(getInitialFocusKey(modelo.days, "2026-11-05"), "2026-11-05");
  assert.equal(getInitialFocusKey(modelo.days, "2026-12-31"), "2026-11-05");
});

// ---------- Contrato de buildHeatmap ----------

test("buildHeatmap devuelve 84 días en orden lunes a domingo", () => {
  const modelo = buildHeatmap([], fecha(2026, 11, 5));

  assert.equal(modelo.days.length, 84);
  assert.equal(modelo.days[0].key, "2026-08-17");
  assert.equal(modelo.days[6].key, "2026-08-23");
  assert.equal(modelo.days[7].key, "2026-08-24");
  assert.equal(modelo.days[83].key, "2026-11-08");
  assert.deepEqual(modelo.period, buildPeriod(fecha(2026, 11, 5)));
});

test("buildHeatmap marca exactamente un día como hoy", () => {
  const modelo = buildHeatmap([], fecha(2026, 11, 5));
  const hoy = modelo.days.filter((d) => d.isToday);

  assert.equal(hoy.length, 1);
  assert.equal(hoy[0].key, "2026-11-05");
});

test("buildHeatmap agrupa sesiones, ignora inválidas y no muta la entrada", () => {
  const sesiones = [
    { date: "2026-11-05", topic: "A", minutes: 20 },
    { date: "2026-11-05", topic: "B", minutes: 20 },
    { date: "2026-11-04", topic: "C", minutes: 30 },
    { date: "2026-11-06", topic: "D", minutes: 100 },
    { date: "2026-08-16", topic: "E", minutes: 50 },
    { date: "2026-11-09", topic: "F", minutes: 50 },
    { date: "2026-11-03", topic: "G", minutes: 0 },
    { date: "2026-02-30", topic: "H", minutes: 10 },
  ];
  const copia = JSON.parse(JSON.stringify(sesiones));

  const modelo = buildHeatmap(sesiones, fecha(2026, 11, 5));
  const porClave = new Map(modelo.days.map((d) => [d.key, d]));

  assert.deepEqual(porClave.get("2026-11-05"), {
    key: "2026-11-05",
    date: porClave.get("2026-11-05").date,
    minutes: 40,
    sessionCount: 2,
    level: 2,
    isFuture: false,
    isToday: true,
  });
  assert.equal(porClave.get("2026-11-04").level, 2);
  assert.equal(porClave.get("2026-11-06").level, null);
  assert.equal(porClave.get("2026-11-06").isFuture, true);
  assert.equal(porClave.get("2026-11-03").sessionCount, 0);
  assert.deepEqual(sesiones, copia);
});

test("buildHeatmap excluye futuros y sesiones fuera del periodo del resumen", () => {
  const modelo = buildHeatmap(
    [
      { date: "2026-11-05", topic: "A", minutes: 20 },
      { date: "2026-11-06", topic: "B", minutes: 100 },
      { date: "2026-08-16", topic: "C", minutes: 50 },
      { date: "2026-11-09", topic: "D", minutes: 50 },
    ],
    fecha(2026, 11, 5)
  );

  assert.deepEqual(modelo.summary, { daysWithSessions: 1, minutes: 20, totalDays: 84 });
});

test("buildHeatmap asigna nivel 0 a días pasados sin sesiones y null a futuros", () => {
  const modelo = buildHeatmap([], fecha(2026, 11, 5));
  const hoy = modelo.days.find((d) => d.isToday);

  assert.equal(hoy.level, 0);
  assert.equal(hoy.isFuture, false);
  assert.equal(modelo.days[83].level, null);
  assert.equal(modelo.days[83].isFuture, true);
});

// ---------- No regresión de métricas existentes ----------

test("calcularRacha cuenta días consecutivos que terminan hoy", () => {
  const sesiones = [
    { date: "2026-11-05", minutes: 10 },
    { date: "2026-11-04", minutes: 20 },
    { date: "2026-11-03", minutes: 30 },
  ];

  assert.equal(calcularRacha(sesiones, fecha(2026, 11, 5)), 3);
});

test("calcularRacha mantiene viva la racha si hoy no hay sesión", () => {
  const sesiones = [
    { date: "2026-11-04", minutes: 20 },
    { date: "2026-11-03", minutes: 30 },
  ];

  assert.equal(calcularRacha(sesiones, fecha(2026, 11, 5)), 2);
});

test("calcularRacha se rompe si no hay sesión hoy ni ayer", () => {
  const sesiones = [{ date: "2026-11-03", minutes: 30 }];

  assert.equal(calcularRacha(sesiones, fecha(2026, 11, 5)), 0);
});

test("calcularRacha cuenta una vez varias sesiones del mismo día", () => {
  const sesiones = [
    { date: "2026-11-05", minutes: 10 },
    { date: "2026-11-05", minutes: 20 },
    { date: "2026-11-04", minutes: 20 },
  ];

  assert.equal(calcularRacha(sesiones, fecha(2026, 11, 5)), 2);
});

test("calcularRacha tolera sesiones inválidas sin romperse", () => {
  assert.equal(calcularRacha([null, { minutes: 10 }], fecha(2026, 11, 5)), 0);
});

test("calcularMinutosSemana suma de lunes a hoy y excluye futuros y semana anterior", () => {
  const sesiones = [
    { date: "2026-11-02", minutes: 30 },
    { date: "2026-11-05", minutes: 20 },
    { date: "2026-11-08", minutes: 50 },
    { date: "2026-11-01", minutes: 40 },
  ];

  assert.equal(calcularMinutosSemana(sesiones, fecha(2026, 11, 5)), 50);
});

test("calcularMinutosSemana suma cero sin sesiones", () => {
  assert.equal(calcularMinutosSemana([], fecha(2026, 11, 5)), 0);
});

test("calcularMinutosSemana cruza el cambio de mes y de año", () => {
  const sesiones = [
    { date: "2025-12-29", minutes: 10 },
    { date: "2026-01-01", minutes: 20 },
    { date: "2026-01-02", minutes: 30 },
    { date: "2025-12-28", minutes: 40 },
  ];

  assert.equal(calcularMinutosSemana(sesiones, fecha(2026, 1, 2)), 60);
});

test("calcularDiasMes cuenta días únicos hasta hoy", () => {
  const sesiones = [
    { date: "2026-11-01", minutes: 10 },
    { date: "2026-11-05", minutes: 10 },
    { date: "2026-11-05", minutes: 20 },
    { date: "2026-10-31", minutes: 30 },
    { date: "2026-11-08", minutes: 40 },
  ];

  assert.equal(calcularDiasMes(sesiones, fecha(2026, 11, 5)), 2);
});

test("calcularDiasMes devuelve cero sin sesiones y cruza el cambio de año", () => {
  assert.equal(calcularDiasMes([], fecha(2026, 11, 5)), 0);
  assert.equal(
    calcularDiasMes(
      [
        { date: "2025-12-31", minutes: 10 },
        { date: "2026-01-01", minutes: 20 },
        { date: "2026-01-02", minutes: 30 },
      ],
      fecha(2026, 1, 2)
    ),
    2
  );
});
