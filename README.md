# Tablero Bug Bounty

Registro en un solo lugar de todas las vulnerabilidades reportadas en bug bounty
desde 2024: target, tipo (web/móvil/api), estado (triada/duplicada/pagada…), pagos
(totales, por año y por mes), descripción y las fechas clave (reporte → 1ª respuesta →
triage → pago). Sitio estático, listo para **GitHub Pages**, con estética dark hacker.

> **Regla del dinero:** solo los reportes en estado **`Pagada`** suman al total.
> El resto muestra una etiqueta genérica (`Pendiente`, `Duplicada`, `Sin recompensa`)
> pero **nunca** un pago vacío.

---

## Ver el tablero en local
Abre `index.html` con doble clic. No necesitas servidor (los datos están en un `.js`).

## Añadir un reporte
1. Abre `nuevo-reporte.html`.
2. Rellena el formulario y pulsa **Generar bloque** → **Copiar**.
3. Pega el bloque dentro de `window.REPORTES = [ ... ]` en [`data/reportes.js`](data/reportes.js).
4. Guarda, haz commit y push. El tablero recalcula KPIs y gráficas solo.

> Puedes editar `data/reportes.js` a mano si prefieres; sigue la plantilla de los ejemplos.
> **Borra los 3 reportes de EJEMPLO** cuando metas los tuyos.

## Tu perfil / Salón de la Fama
En la parte de arriba de `data/reportes.js`, en `window.PERFIL`:
- `usuario` / `nombre`: tu handle (ahora `Parroquial` — cámbialo cuando decidas el nuevo).
- `salonDeLaFama`: lista de `{ programa, url }` con los listados donde apareces (Meta, etc.).

## Campos de cada reporte
| Campo | Valores |
|---|---|
| `estado` | `Reportada` · `Triada` · `Resuelta` · `Duplicada` · `Pagada` · `Informativa` |
| `tipo` | `Web` · `Móvil` · `API` · `Otro` |
| `esPublico` | `true` = muestra `targetReal` · `false` = muestra `targetPublico` (oculta el real) |
| fechas | `YYYY-MM-DD` (o `""` si aún no aplica) |
| `pagoUSD` | número; solo cuenta si `estado: "Pagada"` |

---

## Publicar en GitHub Pages
1. Crea un repo en GitHub (ej. `bug-bounty-tracker`) y sube estos archivos:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/bug-bounty-tracker.git
   git branch -M main
   git push -u origin main
   ```
2. En GitHub: **Settings → Pages → Build and deployment → Source: `Deploy from a branch`**,
   rama `main`, carpeta `/ (root)`. Guarda.
3. En 1–2 min estará en `https://TU_USUARIO.github.io/bug-bounty-tracker/`.

El archivo `.nojekyll` ya está incluido para que GitHub Pages sirva todo tal cual.

---

## Estructura
```
index.html            Tablero (KPIs, gráficas, filtros, lista, salón de la fama)
nuevo-reporte.html    Formulario que genera el bloque de datos
data/reportes.js      TUS DATOS (perfil + reportes)  ← lo que editas
assets/css/styles.css Estilos (dark hacker)
assets/js/dashboard.js Lógica del tablero
assets/js/form.js      Lógica del formulario
docs/                 Documento de diseño del proyecto
```
