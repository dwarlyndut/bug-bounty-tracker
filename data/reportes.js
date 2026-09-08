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
  {
    id: "1",
    fechaReporte: "2024-07-30",
    fechaPrimeraRespuesta: "2024-08-08",
    fechaTriage: "",
    fechaPago: "",
    plataforma: "HackerOne",
    tipo: "Web",
    titulo: "IDOR",
    descripcion: "Se encontró un End Point que permite cambiar correos electrónicos, y estos cambios permiten ver foto de perfil, si se tiene o no se tiene activa la app mobile, si se tiene 2FA, esto también aplica para correos corporativos, es decir si tengo un correo corporativo puedo ver este tipo de información.",
    severidad: "Media",
    estado: "Duplicada",
    pagoUSD: 0,
    esPublico: true,
    targetReal: "Notion",
    targetPublico: ""
  }
];
