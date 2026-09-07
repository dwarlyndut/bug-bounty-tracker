/* ===========================================================================
   Tablero Bug Bounty — lógica del dashboard
   =========================================================================== */

(function () {
  "use strict";

  var PERFIL   = window.PERFIL   || {};
  var REPORTES = window.REPORTES || [];

  /* ---- Paleta para gráficas ---- */
  var C = {
    neon:  "#39ff8b", cyan: "#26e6e6", violet: "#a071ff",
    amber: "#ffcf4d", red:  "#ff5f6d", blue: "#4d9bff",
    grid:  "rgba(255,255,255,0.06)", txt: "#7d8f9c"
  };
  var SERIE = [C.cyan, C.violet, C.amber, C.neon, C.blue, C.red];

  /* ---- Helpers ---- */
  function esPagada(r) { return (r.estado || "").toLowerCase() === "pagada"; }

  function usd(n) {
    return "$" + Number(n || 0).toLocaleString("en-US") + " USD";
  }

  function slug(s) {
    return (s || "").toString().toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  // Fecha usada para ubicar el dinero en el tiempo: pago, o reporte como respaldo.
  function fechaDinero(r) { return r.fechaPago || r.fechaReporte || ""; }

  function anioDe(fecha)  { return fecha ? fecha.slice(0, 4) : ""; }
  function mesDe(fecha)   { return fecha ? fecha.slice(0, 7) : ""; } // YYYY-MM

  function diasEntre(a, b) {
    if (!a || !b) return null;
    var d1 = new Date(a), d2 = new Date(b);
    if (isNaN(d1) || isNaN(d2)) return null;
    return Math.round((d2 - d1) / 86400000);
  }

  // Etiqueta de pago que NUNCA queda vacía.
  function etiquetaPago(r) {
    if (esPagada(r)) return { txt: usd(r.pagoUSD), cls: "paid" };
    var e = (r.estado || "").toLowerCase();
    if (e === "duplicada")   return { txt: "Duplicada",     cls: "pending" };
    if (e === "informativa") return { txt: "Sin recompensa", cls: "pending" };
    return { txt: "Pendiente", cls: "pending" }; // Reportada / Triada / Resuelta
  }

  /* =========================================================================
     PERFIL / cabecera / salón de la fama
     ========================================================================= */
  function pintarPerfil() {
    if (PERFIL.nombre) document.getElementById("brand-name").textContent = PERFIL.nombre + " · Bug Bounty";
    if (PERFIL.usuario) document.getElementById("brand-user").textContent = PERFIL.usuario.toLowerCase();
    document.getElementById("footReporter").textContent =
      "Reporter: " + (PERFIL.nombre || PERFIL.usuario || "—");
    document.title = "Tablero Bug Bounty · " + (PERFIL.usuario || "");

    var hof = document.getElementById("hof");
    var links = PERFIL.salonDeLaFama || [];
    if (!links.length) { hof.innerHTML = '<div class="empty">Añade tus links en data/reportes.js</div>'; return; }
    hof.innerHTML = links.map(function (l) {
      return '<a class="hof" href="' + l.url + '" target="_blank" rel="noopener">' +
             '<span class="star">★</span>' +
             '<span class="txt"><div class="p">' + escapeHtml(l.programa) + '</div>' +
             '<div class="u">ver listado ↗</div></span></a>';
    }).join("");
  }

  /* =========================================================================
     KPIs
     ========================================================================= */
  function pintarKpis() {
    var pagados = REPORTES.filter(esPagada);
    var totalPagado = pagados.reduce(function (s, r) { return s + Number(r.pagoUSD || 0); }, 0);
    var promedio = pagados.length ? Math.round(totalPagado / pagados.length) : 0;

    var triados = REPORTES.filter(function (r) {
      return ["triada", "resuelta", "pagada"].indexOf(slug(r.estado)) >= 0;
    }).length;
    var duplicados = REPORTES.filter(function (r) { return slug(r.estado) === "duplicada"; }).length;

    var tiempos = REPORTES.map(function (r) { return diasEntre(r.fechaReporte, r.fechaPrimeraRespuesta); })
                          .filter(function (d) { return d !== null && d >= 0; });
    var medioResp = tiempos.length
      ? Math.round(tiempos.reduce(function (s, d) { return s + d; }, 0) / tiempos.length)
      : null;

    var kpis = [
      { label: "Total pagado", value: usd(totalPagado), foot: "solo estado Pagada", cls: "money", accent: "" },
      { label: "Reportes", value: REPORTES.length, foot: "desde 2024", accent: "accent-cyan" },
      { label: "Pagados", value: pagados.length, foot: "recompensados", accent: "" },
      { label: "Triados", value: triados, foot: "aceptados/válidos", accent: "accent-cyan" },
      { label: "Duplicados", value: duplicados, foot: "ya reportados", accent: "accent-amber" },
      { label: "Pago promedio", value: usd(promedio), foot: "por reporte pagado", accent: "accent-violet" },
      { label: "1ª respuesta", value: medioResp === null ? "—" : (medioResp + " días"), foot: "tiempo medio", accent: "accent-violet" }
    ];

    document.getElementById("kpis").innerHTML = kpis.map(function (k) {
      return '<div class="kpi ' + (k.accent || "") + '">' +
             '<div class="label">' + k.label + '</div>' +
             '<div class="value ' + (k.cls || "") + '">' + k.value + '</div>' +
             '<div class="foot">' + k.foot + '</div></div>';
    }).join("");
  }

  /* =========================================================================
     Gráficas
     ========================================================================= */
  function baseOpts(extra) {
    var o = {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: C.txt, font: { family: "JetBrains Mono", size: 11 } } },
        tooltip: { callbacks: {} }
      },
      scales: {
        x: { ticks: { color: C.txt, font: { family: "JetBrains Mono", size: 10 } }, grid: { color: C.grid } },
        y: { ticks: { color: C.txt, font: { family: "JetBrains Mono", size: 10 } }, grid: { color: C.grid }, beginAtZero: true }
      }
    };
    return Object.assign(o, extra || {});
  }

  function pintarGraficas() {
    if (typeof Chart === "undefined") return;
    Chart.defaults.color = C.txt;
    var pagados = REPORTES.filter(esPagada);

    /* --- Pagos por mes --- */
    var porMes = {};
    pagados.forEach(function (r) {
      var m = mesDe(fechaDinero(r)); if (!m) return;
      porMes[m] = (porMes[m] || 0) + Number(r.pagoUSD || 0);
    });
    var meses = Object.keys(porMes).sort();
    new Chart(document.getElementById("chartMes"), {
      type: "bar",
      data: { labels: meses, datasets: [{ label: "USD", data: meses.map(function (m) { return porMes[m]; }),
        backgroundColor: C.neon, borderRadius: 4, maxBarThickness: 34 }] },
      options: baseOpts({ plugins: { legend: { display: false },
        tooltip: { callbacks: { label: function (c) { return usd(c.parsed.y); } } } } })
    });

    /* --- Pagos por año --- */
    var porAnio = {};
    pagados.forEach(function (r) {
      var a = anioDe(fechaDinero(r)); if (!a) return;
      porAnio[a] = (porAnio[a] || 0) + Number(r.pagoUSD || 0);
    });
    var anios = Object.keys(porAnio).sort();
    new Chart(document.getElementById("chartAnio"), {
      type: "bar",
      data: { labels: anios, datasets: [{ label: "USD", data: anios.map(function (a) { return porAnio[a]; }),
        backgroundColor: C.cyan, borderRadius: 4, maxBarThickness: 60 }] },
      options: baseOpts({ plugins: { legend: { display: false },
        tooltip: { callbacks: { label: function (c) { return usd(c.parsed.y); } } } } })
    });

    /* --- Por estado (doughnut) --- */
    var porEstado = {};
    REPORTES.forEach(function (r) { var e = r.estado || "—"; porEstado[e] = (porEstado[e] || 0) + 1; });
    var estLabels = Object.keys(porEstado);
    new Chart(document.getElementById("chartEstado"), {
      type: "doughnut",
      data: { labels: estLabels, datasets: [{ data: estLabels.map(function (e) { return porEstado[e]; }),
        backgroundColor: SERIE, borderColor: "#111a22", borderWidth: 2 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: "58%",
        plugins: { legend: { position: "right", labels: { color: C.txt, font: { family: "JetBrains Mono", size: 11 }, padding: 10 } } } }
    });

    /* --- Por tipo / plataforma (barras horizontales apiladas) --- */
    var plataformas = uniq(REPORTES.map(function (r) { return r.plataforma || "—"; }));
    var tipos = uniq(REPORTES.map(function (r) { return r.tipo || "—"; }));
    var datasets = tipos.map(function (t, i) {
      return {
        label: t,
        data: plataformas.map(function (p) {
          return REPORTES.filter(function (r) { return (r.plataforma || "—") === p && (r.tipo || "—") === t; }).length;
        }),
        backgroundColor: SERIE[i % SERIE.length], borderRadius: 3
      };
    });
    new Chart(document.getElementById("chartTipo"), {
      type: "bar",
      data: { labels: plataformas, datasets: datasets },
      options: baseOpts({ indexAxis: "y",
        scales: {
          x: { stacked: true, ticks: { color: C.txt, precision: 0, font: { family: "JetBrains Mono", size: 10 } }, grid: { color: C.grid }, beginAtZero: true },
          y: { stacked: true, ticks: { color: C.txt, font: { family: "JetBrains Mono", size: 10 } }, grid: { color: C.grid } }
        } })
    });
  }

  function uniq(arr) { return arr.filter(function (v, i) { return arr.indexOf(v) === i; }); }

  /* =========================================================================
     Filtros + lista
     ========================================================================= */
  var filtros = { anio: "", plataforma: "", tipo: "", estado: "", q: "" };

  function poblarFiltros() {
    llenarSelect("fAnio", uniq(REPORTES.map(function (r) { return anioDe(fechaDinero(r)) || anioDe(r.fechaReporte); }))
      .filter(Boolean).sort().reverse());
    llenarSelect("fPlataforma", uniq(REPORTES.map(function (r) { return r.plataforma; })).filter(Boolean).sort());
    llenarSelect("fTipo", uniq(REPORTES.map(function (r) { return r.tipo; })).filter(Boolean).sort());
    llenarSelect("fEstado", uniq(REPORTES.map(function (r) { return r.estado; })).filter(Boolean).sort());
  }
  function llenarSelect(id, valores) {
    var sel = document.getElementById(id);
    valores.forEach(function (v) {
      var o = document.createElement("option"); o.value = v; o.textContent = v; sel.appendChild(o);
    });
  }

  function aplicaFiltros(r) {
    if (filtros.anio && (anioDe(fechaDinero(r)) !== filtros.anio && anioDe(r.fechaReporte) !== filtros.anio)) return false;
    if (filtros.plataforma && r.plataforma !== filtros.plataforma) return false;
    if (filtros.tipo && r.tipo !== filtros.tipo) return false;
    if (filtros.estado && r.estado !== filtros.estado) return false;
    if (filtros.q) {
      var hay = [r.titulo, r.descripcion, nombreTarget(r), r.plataforma, r.tipo, r.estado].join(" ").toLowerCase();
      if (hay.indexOf(filtros.q.toLowerCase()) < 0) return false;
    }
    return true;
  }

  function nombreTarget(r) {
    return r.esPublico ? (r.targetReal || r.targetPublico || "—") : (r.targetPublico || "Programa privado");
  }

  function pintarLista() {
    var cont = document.getElementById("lista");
    var items = REPORTES.filter(aplicaFiltros).sort(function (a, b) {
      return (b.fechaReporte || "").localeCompare(a.fechaReporte || "");
    });
    document.getElementById("fCount").textContent = items.length + " / " + REPORTES.length + " reportes";

    if (!items.length) { cont.innerHTML = '<div class="empty">No hay reportes que coincidan con el filtro.</div>'; return; }

    cont.innerHTML = items.map(function (r) {
      var pago = etiquetaPago(r);
      var priv = !r.esPublico ? ' <span class="badge" title="Nombre real oculto">🔒 privado</span>' : "";
      return '' +
      '<div class="report" data-id="' + r.id + '">' +
        '<div class="head">' +
          '<div class="target">' +
            '<span class="name">' + escapeHtml(nombreTarget(r)) + priv + '</span>' +
            '<span class="vuln">' + escapeHtml(r.titulo || "") + '</span>' +
          '</div>' +
          '<div class="meta-mono hide-sm">' + escapeHtml(r.plataforma || "—") + '</div>' +
          '<div>' + pillTipo(r.tipo) + '</div>' +
          '<div>' + pillEstado(r.estado) + '</div>' +
          '<div class="pay ' + pago.cls + '">' + pago.txt + '</div>' +
          '<div class="chev">▶</div>' +
        '</div>' +
        '<div class="body">' +
          '<p class="desc">' + escapeHtml(r.descripcion || "Sin descripción.") +
            (r.severidad ? ' <span class="sev">[severidad: ' + escapeHtml(r.severidad) + ']</span>' : '') + '</p>' +
          timeline(r) +
        '</div>' +
      '</div>';
    }).join("");

    // toggle expand
    Array.prototype.forEach.call(cont.querySelectorAll(".report .head"), function (h) {
      h.addEventListener("click", function () { h.parentNode.classList.toggle("open"); });
    });
  }

  function pillTipo(t) {
    var s = slug(t);
    var cls = s === "web" ? "pill-web" : (s === "movil" ? "pill-movil" : (s === "api" ? "pill-api" : "pill-otro"));
    return '<span class="badge ' + cls + '">' + escapeHtml(t || "—") + '</span>';
  }
  function pillEstado(e) {
    return '<span class="badge st-' + slug(e) + '">' + escapeHtml(e || "—") + '</span>';
  }

  // ¿El paso aplica para este estado?
  function pasoAplica(paso, estado) {
    var e = slug(estado);
    if (paso === "reporte" || paso === "respuesta") return true;
    if (paso === "triage") return ["triada", "resuelta", "pagada"].indexOf(e) >= 0;
    if (paso === "pago")   return e === "pagada";
    return true;
  }

  function timeline(r) {
    var pasos = [
      { key: "reporte",   label: "Reporte",  fecha: r.fechaReporte },
      { key: "respuesta", label: "1ª resp.", fecha: r.fechaPrimeraRespuesta },
      { key: "triage",    label: "Triage",   fecha: r.fechaTriage },
      { key: "pago",      label: "Pago",     fecha: r.fechaPago }
    ];
    return '<div class="timeline">' + pasos.map(function (p) {
      var aplica = pasoAplica(p.key, r.estado);
      var done = aplica && !!p.fecha;
      var cls = done ? "done" : (aplica ? "" : "na");
      var texto = done ? p.fecha : (aplica ? "—" : "No aplica");
      var dateCls = done ? "" : (aplica ? "empty" : "na");
      return '<div class="tl-step ' + cls + '">' +
        '<div class="line"></div><div class="dot"></div>' +
        '<div class="tl-label">' + p.label + '</div>' +
        '<div class="tl-date ' + dateCls + '">' + texto + '</div></div>';
    }).join("") + '</div>';
  }

  function wireFiltros() {
    document.getElementById("fAnio").addEventListener("change", function (e) { filtros.anio = e.target.value; pintarLista(); });
    document.getElementById("fPlataforma").addEventListener("change", function (e) { filtros.plataforma = e.target.value; pintarLista(); });
    document.getElementById("fTipo").addEventListener("change", function (e) { filtros.tipo = e.target.value; pintarLista(); });
    document.getElementById("fEstado").addEventListener("change", function (e) { filtros.estado = e.target.value; pintarLista(); });
    document.getElementById("fBuscar").addEventListener("input", function (e) { filtros.q = e.target.value; pintarLista(); });
  }

  function escapeHtml(s) {
    return (s == null ? "" : String(s))
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* ---- init ---- */
  document.addEventListener("DOMContentLoaded", function () {
    if (!REPORTES.length) {
      document.getElementById("lista").innerHTML =
        '<div class="empty">No hay reportes todavía. Usa <a href="nuevo-reporte.html">Nuevo reporte</a> para añadir el primero.</div>';
    }
    pintarPerfil();
    pintarKpis();
    pintarGraficas();
    poblarFiltros();
    wireFiltros();
    pintarLista();
  });
})();
