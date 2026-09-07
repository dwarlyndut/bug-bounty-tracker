# Tablero de Reportes Bug Bounty — Diseño

**Fecha:** 2026-09-06
**Autor:** Parroquial (reporter)

## Objetivo
Sitio estático para GitHub Pages que lleve el registro de todas las vulnerabilidades
reportadas en bug bounty desde 2024, con totales de dinero, filtros y una vista visual
tipo dashboard con estética "dark hacker/terminal".

Fuera de alcance (proyectos separados a futuro):
- Página de metodología QA → Bug Bounty.
- Sitio de presentación/portfolio (experiencia, eventos, bonos).

## Arquitectura
- 100% estático: HTML + CSS + JS vanilla + Chart.js (CDN).
- Sin servidor ni build. Los datos viven en `data/reportes.js` como objetos globales
  (`window.PERFIL`, `window.REPORTES`). Se usa `.js` (no `.json`) para que funcione con
  doble-clic en local (file://) y en GitHub Pages sin CORS.
- Añadir un reporte: `nuevo-reporte.html` → formulario → genera bloque JS → pegar en
  `data/reportes.js` → commit + push. Los totales/gráficas se recalculan solos.

## Modelo de datos (cada reporte)
- `id` (string única)
- `fechaReporte`, `fechaPrimeraRespuesta`, `fechaTriage`, `fechaPago` (YYYY-MM-DD o "")
- `plataforma` (HackerOne | Bugcrowd | Meta | Directo | ...)
- `tipo` (Web | Móvil | API | Otro)
- `titulo` (nombre de la vulnerabilidad)
- `descripcion`
- `severidad` (Crítica | Alta | Media | Baja | Info | "")
- `estado` (Reportada | Triada | Resuelta | Duplicada | Pagada | Informativa)
- `pagoUSD` (número; solo cuenta si estado === "Pagada")
- `esPublico` (bool): decide si se muestra `targetReal` o `targetPublico`
- `targetReal`, `targetPublico`

## Regla del dinero (crítica)
- Solo los reportes en estado **`Pagada`** suman al dinero (KPIs, totales, gráficas).
- La columna de pago **nunca** se deja vacía. Etiqueta genérica según estado:
  - `Pagada` → monto real `$X USD`
  - `Duplicada` → `Duplicada`
  - `Triada` / `Reportada` / `Resuelta` → `Pendiente`
  - `Informativa` → `Sin recompensa`
- Los montos pagados se ubican en el tiempo por `fechaPago` (fallback: `fechaReporte`).

## Vistas
- KPIs: total pagado (solo Pagada), nº reportes, triados, pagados, duplicados,
  pago promedio (solo pagados), tiempo medio a 1ª respuesta.
- Gráficas: pagos por mes, pagos por año, distribución por estado, por tipo/plataforma.
- Filtros: año, plataforma, tipo, estado + buscador de texto.
- Lista expandible: target (respeta público/privado), plataforma, tipo, estado, pago;
  al expandir muestra descripción + línea de tiempo (reporte → 1ª respuesta → triage → pago).
- Salón de la Fama: tarjetas con links. Usuario en config editable (`Parroquial`).

## Estética
Dark hacker/terminal: fondo oscuro, acentos verde/cian neón, mono en datos.

## Archivos
`index.html`, `nuevo-reporte.html`, `assets/css/styles.css`, `assets/js/dashboard.js`,
`assets/js/form.js`, `data/reportes.js`, `.nojekyll`, `README.md`.
