// n8n Code node: returns the HTML UI as binary
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Danfoss ALADIN</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root {
      --bg: #0f172a;
      --fg: #e5e7eb;
      --muted: #94a3b8;
      --accent: #ef4444;
      --accent-2: #22c55e;
      --card: #111827;
      --border: #1f2937;
      --input: #0b1220;
      --focus: #3b82f6;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0; padding: 2rem;
      background: linear-gradient(180deg, var(--bg), #0b1020 60%, #050914);
      color: var(--fg);
      font-family: system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";
    }
    .wrap { max-width: 980px; margin: 0 auto; }
    header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
    .brand { display: flex; align-items: center; gap: .75rem; font-weight: 700; letter-spacing: .5px; }
    .brand .logo { width: 36px; height: 36px; border-radius: 10px; background: var(--accent); display: grid; place-items: center; color: white; font-weight: 900; }
    .subtitle { color: var(--muted); font-size: .95rem; }
    .card { background: rgba(17,24,39,.7); border: 1px solid var(--border); border-radius: 16px; padding: 1.25rem; backdrop-filter: blur(6px); box-shadow: 0 6px 24px rgba(0,0,0,.35); }
    form { display: grid; gap: 1rem; grid-template-columns: 1fr 1fr; }
    .full { grid-column: 1 / -1; }
    label { display: block; font-size: .9rem; color: var(--muted); margin-bottom: .35rem; }
    input[type="text"], input[type="tel"] { width: 100%; background: var(--input); color: var(--fg); border: 1px solid var(--border); border-radius: .75rem; padding: .8rem 1rem; outline: none; transition: border .15s, box-shadow .15s; }
    input[type="file"] { width: 100%; background: var(--input); color: var(--muted); border: 1px dashed var(--border); border-radius: .75rem; padding: .9rem 1rem; cursor: pointer; }
    input:focus { border-color: var(--focus); box-shadow: 0 0 0 3px rgba(59,130,246,.25); }
    .hint { font-size: .8rem; color: var(--muted); margin-top: .25rem; }
    .row { display: grid; gap: 1rem; grid-template-columns: 1fr 1fr; }
    .actions { display: flex; gap: .75rem; align-items: center; flex-wrap: wrap; }
    button { appearance: none; border: none; border-radius: .75rem; padding: .85rem 1.1rem; font-weight: 600; cursor: pointer; transition: transform .04s ease, box-shadow .15s ease, opacity .15s; }
    .btn-primary { background: linear-gradient(180deg, #ef4444, #dc2626); color: white; box-shadow: 0 10px 24px rgba(239,68,68,.35); }
    .btn-primary:active { transform: translateY(1px); }
    .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }
    .status { font-size: .9rem; color: var(--muted); }
    .preview { display: grid; gap: .75rem; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
    .thumb { border: 1px solid var(--border); border-radius: .75rem; padding: .5rem; background: #0a0f1d; }
    .thumb img { width: 100%; height: 140px; object-fit: cover; border-radius: .5rem; }
    .resp { margin-top: 1rem; background: #0a0f1d; border: 1px solid var(--border); border-radius: 12px; padding: 1rem; overflow: auto; max-height: 40vh; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: .9rem; color: #d1d5db; }
    .ok { color: var(--accent-2); }
    .err { color: var(--accent); }
    @media (max-width: 720px) { form, .row { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="brand">
        <div class="logo" aria-hidden="true">A</div>
        <div>
          <div style="font-size:1.15rem;">Danfoss ALADIN</div>
          <div class="subtitle">Submit motor/VFD details & nameplate images</div>
        </div>
      </div>
    </header>

    <section class="card">
      <form id="aladin-form" novalidate>
        <div>
          <label for="customerName">Customer Name</label>
          <input id="customerName" name="customerName" type="text" placeholder="e.g., Acme Industries" required />
        </div>
        <div>
          <label for="customerContact">Customer Contact</label>
          <input id="customerContact" name="customerContact" type="tel" placeholder="e.g., +91-98765-43210" required />
        </div>
        <div>
          <label for="motorType">Motor Type</label>
          <input id="motorType" name="motorType" type="text" placeholder="e.g., 3-Phase Induction" required />
        </div>
        <div>
          <label for="vfdType">VFD Type</label>
          <input id="vfdType" name="vfdType" type="text" placeholder="e.g., Danfoss FC51" required />
        </div>

        <div class="full">
          <label for="vfdNameplate">VFD Nameplate (image)</label>
          <input id="vfdNameplate" name="vfdNameplate" type="file" accept="image/*" />
          <div class="hint">PNG/JPEG recommended • Max ~10 MB each (browser dependent)</div>
        </div>
        <div class="full">
          <label for="motorNameplate">Motor Nameplate (image)</label>
          <input id="motorNameplate" name="motorNameplate" type="file" accept="image/*" />
        </div>

        <div class="full preview" id="preview"></div>

        <div class="full actions">
          <button id="submitBtn" class="btn-primary" type="submit">Submit</button>
          <button id="resetBtn" class="btn-ghost" type="button">Reset</button>
          <span id="status" class="status" aria-live="polite"></span>
        </div>
      </form>
    </section>

    <section class="card" style="margin-top:1rem;">
      <div style="margin-bottom:.5rem; color:var(--muted)">Response</div>
      <pre id="responseBox" class="resp" aria-live="polite">Awaiting submission…</pre>
    </section>
  </div>

  <script>
    // === CONFIG ===
    var WEBHOOK_URL = "http://localhost:5678/webhook/aladin-submit"; // <-- Replace with your POST webhook

    // Optional client-side guards
    var MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB per file

    // === DOM Helpers ===
    function $(sel, root) { return (root || document).querySelector(sel); }
    function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
    var statusEl = $("#status");
    var respEl = $("#responseBox");
    var formEl = $("#aladin-form");
    var previewEl = $("#preview");
    var submitBtn = $("#submitBtn");

    // === UI Utilities ===
    function setStatus(msg, type) {
      if (type === void 0) type = "info";
      statusEl.textContent = msg || "";
      statusEl.classList.toggle("ok", type === "ok");
      statusEl.classList.toggle("err", type === "err");
    }

    function prettyPrint(objOrText) {
      try {
        if (typeof objOrText === "string") {
          var trimmed = objOrText.trim();
          if ((trimmed.indexOf("{") === 0 && trimmed.lastIndexOf("}") === trimmed.length - 1) ||
              (trimmed.indexOf("[") === 0 && trimmed.lastIndexOf("]") === trimmed.length - 1)) {
            return JSON.stringify(JSON.parse(trimmed), null, 2);
          }
          return objOrText;
        }
        return JSON.stringify(objOrText, null, 2);
      } catch (e) {
        return String(objOrText);
      }
    }

    function renderPreview(filesMap) {
      previewEl.innerHTML = "";
      Object.keys(filesMap).forEach(function(label) {
        var file = filesMap[label];
        if (!file) return;
        var box = document.createElement("div");
        box.className = "thumb";
        var title = document.createElement("div");
        title.style.fontSize = ".85rem";
        title.style.color = "var(--muted)";
        title.style.marginBottom = ".35rem";
        title.textContent = label;
        var img = document.createElement("img");
        var url = URL.createObjectURL(file);
        img.src = url;
        img.onload = function() { URL.revokeObjectURL(url); };
        box.appendChild(title);
        box.appendChild(img);
        previewEl.appendChild(box);
      });
    }

    // === Validation ===
    function validateFiles() {
      var vfdInput = document.getElementById("vfdNameplate");
      var motorInput = document.getElementById("motorNameplate");
      var vfdFile = (vfdInput.files && vfdInput.files[0]) ? vfdInput.files[0] : null;
      var motorFile = (motorInput.files && motorInput.files[0]) ? motorInput.files[0] : null;

      var files = [vfdFile, motorFile];
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (!file) continue;
        if (file.size > MAX_FILE_BYTES) {
          throw new Error('File "' + file.name + '" is too large (> 10 MB)');
        }
        if (file.type.indexOf("image/") !== 0) {
          throw new Error('File "' + file.name + '" is not an image');
        }
      }
      return { vfdFile: vfdFile, motorFile: motorFile };
    }

    function validateTextFields() {
      var requiredIds = ["customerName", "customerContact", "motorType", "vfdType"];
      var data = {};
      for (var i = 0; i < requiredIds.length; i++) {
        var id = requiredIds[i];
        var el = document.getElementById(id);
        var val = (el.value || "").trim();
        if (!val) {
          el.focus();
          throw new Error('Please fill "' + id + '"');
        }
        data[id] = val;
      }
      return data;
    }

    // === Networking ===
    async function postForm(formData) {
      var res = await fetch(WEBHOOK_URL, {
        method: "POST",
        body: formData
      });
      var contentType = res.headers.get("content-type") || "";
      var payload;
      if (contentType.indexOf("application/json") > -1) {
        payload = await res.json();
      } else {
        payload = await res.text();
      }
      return { ok: res.ok, status: res.status, payload: payload };
    }

    // === Orchestration ===
    formEl.addEventListener("submit", async function (e) {
      e.preventDefault();
      respEl.textContent = "Awaiting submission…";

      try {
        setStatus("Validating…");
        var textData = validateTextFields();
        var files = validateFiles();
        var vfdFile = files.vfdFile;
        var motorFile = files.motorFile;

        var fd = new FormData();
        fd.append("customerName", textData.customerName);
        fd.append("customerContact", textData.customerContact);
        fd.append("motorType", textData.motorType);
        fd.append("vfdType", textData.vfdType);
        if (vfdFile)   fd.append("vfdNameplate", vfdFile, vfdFile.name);
        if (motorFile) fd.append("motorNameplate", motorFile, motorFile.name);

        fd.append("source", "Danfoss ALADIN Web UI");
        fd.append("timestamp", new Date().toISOString());

        renderPreview({
          "VFD Nameplate": vfdFile || null,
          "Motor Nameplate": motorFile || null
        });

        submitBtn.disabled = true;
        setStatus("Submitting to n8n…");
        var result = await postForm(fd);
        if (result.ok) {
          setStatus("Success (HTTP " + result.status + ")", "ok");
        } else {
          setStatus("Request failed (HTTP " + result.status + ")", "err");
        }
        respEl.textContent = prettyPrint(result.payload);
      } catch (err) {
        setStatus(err && err.message ? err.message : "Validation error", "err");
        respEl.textContent = prettyPrint((err && (err.stack || err.message)) || String(err));
      } finally {
        submitBtn.disabled = false;
      }
    });

    $("#resetBtn").addEventListener("click", function () {
      formEl.reset();
      previewEl.innerHTML = "";
      setStatus("");
      respEl.textContent = "Awaiting submission…";
    });
  </script>
</body>
</html>
`;

return [
  {
    json: {},
    binary: {
      data: {
        data: Buffer.from(html).toString('base64'),
        mimeType: 'text/html',
        fileName: 'aladin.html'
      }
    }
  }
];
