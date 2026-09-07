/* ============================================================================
 *  DATOS DEL TABLERO  —  edita este archivo para añadir / cambiar reportes
 * ============================================================================
 *
 *  1) PERFIL  -> tus datos y links del Salón de la Fama.
 *  2) REPORTES -> la lista de todas tus vulnerabilidades reportadas.
 *
 *  Para añadir un reporte cómodamente abre  nuevo-reporte.html , rellena el
 *  formulario y pega aquí el bloque que te genera.
 *
 *  REGLA DEL DINERO: solo los reportes con  estado: "Pagada"  suman al total.
 * ========================================================================== */

window.PERFIL = {
  // 👇 Cambia tu handle cuando decidas el nuevo nombre de usuario
  usuario: "Parroquial",
  nombre: "Parroquial",
  titulo: "Bug Bounty Hunter",
  // Links a los listados / salones de la fama donde apareces.
  // Añade / borra los que quieras.
  salonDeLaFama: [
    { programa: "Meta — Whitehat", url: "https://www.facebook.com/whitehat/thanks/" },
    { programa: "HackerOne — Perfil", url: "https://hackerone.com/Parroquial" },
    { programa: "Bugcrowd — Perfil", url: "https://bugcrowd.com/Parroquial" }
  ]
};

/* ----------------------------------------------------------------------------
 *  ESTADOS válidos:  "Reportada" | "Triada" | "Resuelta" | "Duplicada" |
 *                    "Pagada" | "Informativa"
 *  TIPOS válidos:    "Web" | "Móvil" | "API" | "Otro"
 *  Fechas en formato  "YYYY-MM-DD"  (usa "" si aún no aplica).
 *  esPublico: true  -> se muestra targetReal ; false -> se muestra targetPublico
 * -------------------------------------------------------------------------- */

window.REPORTES = [
  /* ======= EJEMPLOS — bórralos y pon tus reportes reales ======= */
  {
    id: "2024-001",
    fechaReporte: "2024-02-10",
    fechaPrimeraRespuesta: "2024-02-12",
    fechaTriage: "2024-02-18",
    fechaPago: "2024-03-05",
    plataforma: "Meta",
    tipo: "Web",
    titulo: "IDOR en endpoint de facturación",
    descripcion: "Empecé mapeando el flujo de facturación como QA. Noté que el id de la factura viajaba en la petición; al cambiarlo accedía a facturas de otros usuarios (BOLA).",
    severidad: "Alta",
    estado: "Pagada",
    pagoUSD: 1500,
    esPublico: true,
    targetReal: "Meta",
    targetPublico: "Programa Social A"
  },
  {
    id: "2024-002",
    fechaReporte: "2024-05-22",
    fechaPrimeraRespuesta: "2024-05-24",
    fechaTriage: "2024-06-01",
    fechaPago: "",
    plataforma: "HackerOne",
    tipo: "Móvil",
    titulo: "Bypass de validación en registro",
    descripcion: "Probé casos límite del formulario de registro (como QA) y encontré un flujo que saltaba un paso de verificación.",
    severidad: "Media",
    estado: "Triada",
    pagoUSD: 0,
    esPublico: false,
    targetReal: "Programa privado X",
    targetPublico: "Programa Fintech B"
  },
  {
    id: "2025-001",
    fechaReporte: "2025-01-15",
    fechaPrimeraRespuesta: "2025-01-16",
    fechaTriage: "",
    fechaPago: "",
    plataforma: "Bugcrowd",
    tipo: "Web",
    titulo: "XSS reflejado en buscador",
    descripcion: "Input del buscador reflejado sin sanitizar en la respuesta.",
    severidad: "Media",
    estado: "Duplicada",
    pagoUSD: 0,
    esPublico: true,
    targetReal: "Programa Retail C",
    targetPublico: "Programa Retail C"
  }
  /* ======= FIN DE EJEMPLOS ======= */
];
