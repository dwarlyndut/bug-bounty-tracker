/* ===========================================================================
   Nuevo reporte — genera el bloque JS para pegar en data/reportes.js
   =========================================================================== */
(function () {
  "use strict";

  // Sugerir un id AÑO-NNN con el año actual
  var y = new Date().getFullYear();
  document.getElementById("autoId").placeholder = y + "-001";

  var form = document.getElementById("form");
  var out = document.getElementById("output");

  function val(name) {
    var el = form.elements[name];
    return el ? el.value.trim() : "";
  }

  function jsStr(s) {
    return JSON.stringify(s == null ? "" : String(s));
  }

  function generar() {
    var estado = val("estado");
    var pago = Number(val("pagoUSD") || 0);
    // Coherencia: si no está pagada, el pago no cuenta (se guarda 0).
    if (estado.toLowerCase() !== "pagada") pago = 0;

    var esPublico = val("esPublico") === "true";
    var id = val("id") || (y + "-001");

    var obj =
"  {\n" +
"    id: " + jsStr(id) + ",\n" +
"    fechaReporte: " + jsStr(val("fechaReporte")) + ",\n" +
"    fechaPrimeraRespuesta: " + jsStr(val("fechaPrimeraRespuesta")) + ",\n" +
"    fechaTriage: " + jsStr(val("fechaTriage")) + ",\n" +
"    fechaPago: " + jsStr(val("fechaPago")) + ",\n" +
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

    out.textContent = obj;
    return obj;
  }

  form.addEventListener("submit", function (e) { e.preventDefault(); generar(); });

  document.getElementById("btnCopy").addEventListener("click", function () {
    var txt = out.textContent;
    if (!txt || txt.indexOf("completa el formulario") === 0) txt = generar();
    navigator.clipboard.writeText(txt).then(function () {
      var b = document.getElementById("btnCopy");
      var prev = b.textContent; b.textContent = "✔ Copiado";
      setTimeout(function () { b.textContent = prev; }, 1500);
    }).catch(function () {
      // fallback: seleccionar el texto
      var range = document.createRange(); range.selectNodeContents(out);
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    });
  });
})();
