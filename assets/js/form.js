/* ===========================================================================
   Nuevo reporte
   - "Agregar y guardar en GitHub": commitea el reporte al repo vía API (opción B)
   - Alternativa manual: genera el bloque para copiar-pegar
   =========================================================================== */
(function () {
  "use strict";

  var form   = document.getElementById("form");
  var out    = document.getElementById("output");
  var status = document.getElementById("status");

  var LS = {
    token:  "bbt_gh_token",
    owner:  "bbt_gh_owner",
    repo:   "bbt_gh_repo",
    branch: "bbt_gh_branch",
    path:   "bbt_gh_path"
  };

  /* ---------- helpers de formulario ---------- */
  function val(name) { var el = form.elements[name]; return el ? el.value.trim() : ""; }
  function jsStr(s)  { return JSON.stringify(s == null ? "" : String(s)); }

  // Reglas de "no aplica" según estado
  function triageAplica(estado) { return ["triada", "resuelta", "pagada"].indexOf((estado || "").toLowerCase()) >= 0; }
  function pagoAplica(estado)   { return (estado || "").toLowerCase() === "pagada"; }

  // Siguiente número correlativo a partir del contenido actual del archivo (1, 2, 3...)
  function siguienteId(texto) {
    var matches = texto.match(/id:\s*"(\d+)"/g) || [];
    var nums = matches.map(function (s) { return parseInt(s.replace(/\D/g, ""), 10); });
    var max = nums.length ? Math.max.apply(null, nums) : 0;
    return String(max + 1);
  }

  // id: se autonumera al guardar en GitHub; en modo manual usa uno único no-numérico
  function bloqueJS(id) {
    var estado = val("estado");
    var pago = pagoAplica(estado) ? Number(val("pagoUSD") || 0) : 0;
    // Campos que no aplican se guardan vacíos
    var fTriage = triageAplica(estado) ? val("fechaTriage") : "";
    var fPago   = pagoAplica(estado)   ? val("fechaPago")   : "";
    var esPublico = val("esPublico") === "true";
    if (!id) id = "m" + Date.now().toString(36); // fallback manual (no rompe la secuencia)

    return "" +
"  {\n" +
"    id: " + jsStr(id) + ",\n" +
"    fechaReporte: " + jsStr(val("fechaReporte")) + ",\n" +
"    fechaPrimeraRespuesta: " + jsStr(val("fechaPrimeraRespuesta")) + ",\n" +
"    fechaTriage: " + jsStr(fTriage) + ",\n" +
"    fechaPago: " + jsStr(fPago) + ",\n" +
"    plataforma: " + jsStr(val("plataforma")) + ",\n" +
"    tipo: " + jsStr(val("tipo")) + ",\n" +
"    titulo: " + jsStr(val("titulo")) + ",\n" +
"    descripcion: " + jsStr(val("descripcion")) + ",\n" +
"    severidad: " + jsStr(val("severidad")) + ",\n" +
"    estado: " + jsStr(estado) + ",\n" +
"    pagoUSD: " + pago + ",\n" +
"    esPublico: " + esPublico + ",\n" +
"    targetReal: " + jsStr(val("targetReal")) + ",\n" +
"    targetPublico: " + jsStr(val("targetPublico")) + "\n" +
"  },";
  }

  function setStatus(msg, tipo) {
    status.hidden = false;
    status.className = "save-status " + (tipo || "");
    status.textContent = msg;
  }

  /* ---------- config GitHub ---------- */
  function cfgEl(id) { return document.getElementById(id); }
  function cargarConfig() {
    if (localStorage.getItem(LS.token))  cfgEl("ghToken").value  = localStorage.getItem(LS.token);
    if (localStorage.getItem(LS.owner))  cfgEl("ghOwner").value  = localStorage.getItem(LS.owner);
    if (localStorage.getItem(LS.repo))   cfgEl("ghRepo").value   = localStorage.getItem(LS.repo);
    if (localStorage.getItem(LS.branch)) cfgEl("ghBranch").value = localStorage.getItem(LS.branch);
    if (localStorage.getItem(LS.path))   cfgEl("ghPath").value   = localStorage.getItem(LS.path);
  }
  function guardarConfig() {
    try {
      localStorage.setItem(LS.token,  cfgEl("ghToken").value.trim());
      localStorage.setItem(LS.owner,  cfgEl("ghOwner").value.trim());
      localStorage.setItem(LS.repo,   cfgEl("ghRepo").value.trim());
      localStorage.setItem(LS.branch, cfgEl("ghBranch").value.trim());
      localStorage.setItem(LS.path,   cfgEl("ghPath").value.trim());
      setStatus("✔ Configuración guardada en este navegador.", "ok");
    } catch (e) { setStatus("No se pudo guardar la configuración: " + e.message, "err"); }
  }
  function getCfg() {
    return {
      token:  cfgEl("ghToken").value.trim(),
      owner:  cfgEl("ghOwner").value.trim(),
      repo:   cfgEl("ghRepo").value.trim(),
      branch: cfgEl("ghBranch").value.trim() || "main",
      path:   cfgEl("ghPath").value.trim() || "data/reportes.js"
    };
  }

  /* ---------- base64 <-> texto UTF-8 ---------- */
  function b64ToText(b64) { return decodeURIComponent(escape(atob(b64.replace(/\n/g, "")))); }
  function textToB64(txt) { return btoa(unescape(encodeURIComponent(txt))); }

  /* ---------- API GitHub ---------- */
  function ghUrl(c) {
    return "https://api.github.com/repos/" + c.owner + "/" + c.repo +
           "/contents/" + c.path.split("/").map(encodeURIComponent).join("/");
  }
  function headers(c) {
    return { "Authorization": "Bearer " + c.token, "Accept": "application/vnd.github+json" };
  }

  async function obtenerArchivo(c) {
    var res = await fetch(ghUrl(c) + "?ref=" + encodeURIComponent(c.branch), { headers: headers(c) });
    if (res.status === 404) throw new Error("No encontré " + c.path + " en la rama " + c.branch + ".");
    if (res.status === 401) throw new Error("Token inválido o sin permisos (401).");
    if (!res.ok) throw new Error("GitHub respondió " + res.status + " al leer el archivo.");
    var data = await res.json();
    return { texto: b64ToText(data.content), sha: data.sha };
  }

  function insertarReporte(texto, bloque) {
    var marker = "window.REPORTES = [";
    var idx = texto.indexOf(marker);
    if (idx < 0) throw new Error("No encontré 'window.REPORTES = [' en el archivo.");
    var at = idx + marker.length;
    return texto.slice(0, at) + "\n" + bloque + texto.slice(at);
  }

  async function guardarArchivo(c, nuevoTexto, sha, mensaje) {
    var res = await fetch(ghUrl(c), {
      method: "PUT",
      headers: Object.assign(headers(c), { "Content-Type": "application/json" }),
      body: JSON.stringify({
        message: mensaje,
        content: textToB64(nuevoTexto),
        sha: sha,
        branch: c.branch
      })
    });
    if (!res.ok) {
      var t = await res.text();
      throw new Error("GitHub respondió " + res.status + " al guardar. " + t.slice(0, 160));
    }
    return res.json();
  }

  async function agregarYGuardar() {
    var c = getCfg();
    if (!c.token) {
      setStatus("Falta el token. Ábrelo en \"Configuración de guardado en GitHub\" y pégalo.", "err");
      document.getElementById("ghConfig").open = true;
      return;
    }
    var titulo = val("titulo");
    if (!titulo) { setStatus("Ponle al menos un título al reporte.", "err"); return; }

    var btn = document.getElementById("btnGuardar");
    if (btn) { btn.disabled = true; }
    setStatus("⏳ Guardando en GitHub...", "");

    try {
      var archivo = await obtenerArchivo(c);
      var id = siguienteId(archivo.texto);           // autonumeración 1, 2, 3...
      var nuevo = insertarReporte(archivo.texto, bloqueJS(id));
      var msg = "Agregar reporte #" + id + " — " + titulo;
      await guardarArchivo(c, nuevo, archivo.sha, msg);
      setStatus("✅ Guardado como reporte #" + id + ". El tablero se actualiza en ~1 min (GitHub Pages).", "ok");
      form.reset();
      aplicarReglasUI();
    } catch (e) {
      setStatus("❌ " + e.message, "err");
    } finally {
      if (btn) { btn.disabled = false; }
    }
  }

  async function probarConexion() {
    var c = getCfg();
    if (!c.token) { setStatus("Pega primero el token.", "err"); return; }
    setStatus("⏳ Probando...", "");
    try {
      var archivo = await obtenerArchivo(c);
      var n = (archivo.texto.match(/id:\s*"/g) || []).length;
      setStatus("✔ Conexión OK. Leí " + c.path + " (aprox. " + n + " reportes en el archivo).", "ok");
    } catch (e) { setStatus("❌ " + e.message, "err"); }
  }

  /* ---------- wiring ---------- */
  form.addEventListener("submit", function (e) { e.preventDefault(); agregarYGuardar(); });
  // el botón submit necesita un id para poder deshabilitarlo
  form.querySelector('button[type="submit"]').id = "btnGuardar";

  document.getElementById("btnLimpiar").addEventListener("click", function () { form.reset(); status.hidden = true; aplicarReglasUI(); });
  document.getElementById("btnGuardarConfig").addEventListener("click", guardarConfig);
  document.getElementById("btnProbar").addEventListener("click", probarConexion);
  document.getElementById("btnBorrarToken").addEventListener("click", function () {
    localStorage.removeItem(LS.token); cfgEl("ghToken").value = "";
    setStatus("Token borrado de este navegador.", "ok");
  });

  document.getElementById("btnGenerar").addEventListener("click", function () { out.textContent = bloqueJS(); });
  document.getElementById("btnCopy").addEventListener("click", function () {
    var txt = out.textContent;
    if (!txt || txt.indexOf("pulsa") === 0) { txt = bloqueJS(); out.textContent = txt; }
    navigator.clipboard.writeText(txt).then(function () {
      var b = document.getElementById("btnCopy"); var p = b.textContent;
      b.textContent = "✔ Copiado"; setTimeout(function () { b.textContent = p; }, 1500);
    }).catch(function () {});
  });

  /* ---------- reglas visuales según estado (deshabilita lo que no aplica) ---------- */
  function toggleCampo(name, aplica) {
    var el = form.elements[name];
    if (!el) return;
    var field = el.closest ? el.closest(".field") : null;
    el.disabled = !aplica;
    if (!aplica) el.value = "";
    if (field) {
      field.classList.toggle("na", !aplica);
      var tag = field.querySelector(".na-tag");
      if (!aplica && !tag) {
        tag = document.createElement("span");
        tag.className = "na-tag";
        tag.textContent = "· no aplica para este estado";
        field.appendChild(tag);
      } else if (aplica && tag) {
        tag.remove();
      }
    }
  }
  function aplicarReglasUI() {
    var estado = val("estado");
    toggleCampo("fechaTriage", triageAplica(estado));
    toggleCampo("fechaPago", pagoAplica(estado));
    toggleCampo("pagoUSD", pagoAplica(estado));
  }
  document.getElementById("estadoSel").addEventListener("change", aplicarReglasUI);

  cargarConfig();
  aplicarReglasUI();
})();
