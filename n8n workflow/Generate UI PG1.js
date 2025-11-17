// n8n Code node: returns the HTML UI as binary
// NOTE: Using string concatenation instead of template literals for n8n vm2 compatibility

var htmlPart1 = '<!DOCTYPE html>\n' +
'<html lang="en">\n' +
'<head>\n' +
'  <meta charset="utf-8" />\n' +
'  <title>Danfoss ALADIN</title>\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1" />\n' +
'  <style>\n' +
'    :root {\n' +
'      --bg: #0f172a;\n' +
'      --fg: #e5e7eb;\n' +
'      --muted: #94a3b8;\n' +
'      --accent: #ef4444;\n' +
'      --accent-2: #22c55e;\n' +
'      --card: #111827;\n' +
'      --border: #1f2937;\n' +
'      --input: #0b1220;\n' +
'      --focus: #3b82f6;\n' +
'    }\n' +
'    * { box-sizing: border-box; }\n' +
'    body {\n' +
'      margin: 0; padding: 2rem;\n' +
'      background: linear-gradient(180deg, var(--bg), #0b1020 60%, #050914);\n' +
'      color: var(--fg);\n' +
'      font-family: system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";\n' +
'    }\n' +
'    .wrap { max-width: 980px; margin: 0 auto; }\n' +
'    header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }\n' +
'    .brand { display: flex; align-items: center; gap: .75rem; font-weight: 700; letter-spacing: .5px; }\n' +
'    .brand .logo { width: 36px; height: 36px; border-radius: 10px; background: var(--accent); display: grid; place-items: center; color: white; font-weight: 900; }\n' +
'    .subtitle { color: var(--muted); font-size: .95rem; }\n' +
'    .card { background: rgba(17,24,39,.7); border: 1px solid var(--border); border-radius: 16px; padding: 1.25rem; backdrop-filter: blur(6px); box-shadow: 0 6px 24px rgba(0,0,0,.35); }\n' +
'    form { display: grid; gap: 1rem; grid-template-columns: 1fr 1fr; }\n' +
'    .full { grid-column: 1 / -1; }\n' +
'    label { display: block; font-size: .9rem; color: var(--muted); margin-bottom: .35rem; }\n' +
'    input[type="text"], input[type="tel"] { width: 100%; background: var(--input); color: var(--fg); border: 1px solid var(--border); border-radius: .75rem; padding: .8rem 1rem; outline: none; transition: border .15s, box-shadow .15s; }\n' +
'    input[type="file"] { width: 100%; background: var(--input); color: var(--muted); border: 1px dashed var(--border); border-radius: .75rem; padding: .9rem 1rem; cursor: pointer; }\n' +
'    input:focus { border-color: var(--focus); box-shadow: 0 0 0 3px rgba(59,130,246,.25); }\n' +
'    .hint { font-size: .8rem; color: var(--muted); margin-top: .25rem; }\n' +
'    .row { display: grid; gap: 1rem; grid-template-columns: 1fr 1fr; }\n' +
'    .actions { display: flex; gap: .75rem; align-items: center; flex-wrap: wrap; }\n' +
'    button { appearance: none; border: none; border-radius: .75rem; padding: .85rem 1.1rem; font-weight: 600; cursor: pointer; transition: transform .04s ease, box-shadow .15s ease, opacity .15s; }\n' +
'    .btn-primary { background: linear-gradient(180deg, #ef4444, #dc2626); color: white; box-shadow: 0 10px 24px rgba(239,68,68,.35); }\n' +
'    .btn-primary:active { transform: translateY(1px); }\n' +
'    .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }\n' +
'    .status { font-size: .9rem; color: var(--muted); }\n' +
'    .preview { display: grid; gap: .75rem; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }\n' +
'    .thumb { border: 1px solid var(--border); border-radius: .75rem; padding: .5rem; background: #0a0f1d; }\n' +
'    .thumb img { width: 100%; height: 140px; object-fit: cover; border-radius: .5rem; }\n' +
'    .resp { margin-top: 1rem; background: #0a0f1d; border: 1px solid var(--border); border-radius: 12px; padding: 1rem; overflow: auto; max-height: 40vh; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: .9rem; color: #d1d5db; }\n' +
'    .ok { color: var(--accent-2); }\n' +
'    .err { color: var(--accent); }\n' +
'    input.error { border-color: var(--accent) !important; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2) !important; }\n' +
'    @media (max-width: 720px) { form, .row { grid-template-columns: 1fr; } }\n' +
'  </style>\n' +
'</head>\n' +
'<body>\n' +
'  <div class="wrap">\n' +
'    <header>\n' +
'      <div class="brand">\n' +
'        <div class="logo" aria-hidden="true">A</div>\n' +
'        <div>\n' +
'          <div style="font-size:1.15rem;">Danfoss ALADIN</div>\n' +
'          <div class="subtitle">Submit motor/VFD details & nameplate images</div>\n' +
'        </div>\n' +
'      </div>\n' +
'    </header>\n' +
'\n' +
'    <section class="card">\n' +
'      <form id="aladin-form" novalidate>\n' +
'        <div>\n' +
'          <label for="customerName">Customer Name *</label>\n' +
'          <input id="customerName" name="customerName" type="text" placeholder="e.g., Acme Industries" required />\n' +
'        </div>\n' +
'        <div>\n' +
'          <label for="locationOfInstallation">Location of Installation *</label>\n' +
'          <input id="locationOfInstallation" name="locationOfInstallation" type="text" placeholder="e.g., Chennai, Tamil Nadu" required />\n' +
'        </div>\n' +
'        <div>\n' +
'          <label for="contactPerson">Contact Person *</label>\n' +
'          <input id="contactPerson" name="contactPerson" type="text" placeholder="e.g., John Doe" required />\n' +
'        </div>\n' +
'        <div>\n' +
'          <label for="mobileNumber">Mobile Number *</label>\n' +
'          <input id="mobileNumber" name="mobileNumber" type="tel" placeholder="e.g., +91-98765-43210" required />\n' +
'        </div>\n' +
'        <div>\n' +
'          <label for="motorType">Motor Type *</label>\n' +
'          <input id="motorType" name="motorType" type="text" placeholder="e.g., 3-Phase Induction" required />\n' +
'        </div>\n' +
'        <div>\n' +
'          <label for="vfdType">VFD Type *</label>\n' +
'          <input id="vfdType" name="vfdType" type="text" placeholder="e.g., Danfoss FC51" required />\n' +
'        </div>\n' +
'        <div class="full">\n' +
'          <label for="applicationType">Application Type *</label>\n' +
'          <input id="applicationType" name="applicationType" type="text" placeholder="e.g., Pump, Fan, Conveyor" required />\n' +
'        </div>\n' +
'\n' +
'        <div class="full">\n' +
'          <label for="vfdNameplate">VFD Nameplate (image) *</label>\n' +
'          <input id="vfdNameplate" name="vfdNameplate" type="file" accept="image/*" required />\n' +
'          <div class="hint">PNG/JPEG recommended • Max ~10 MB each (browser dependent)</div>\n' +
'        </div>\n' +
'        <div class="full">\n' +
'          <label for="motorNameplate">Motor Nameplate (image) *</label>\n' +
'          <input id="motorNameplate" name="motorNameplate" type="file" accept="image/*" required />\n' +
'        </div>\n' +
'\n' +
'        <div class="full preview" id="preview"></div>\n' +
'\n' +
'        <div class="full actions">\n' +
'          <button id="submitBtn" class="btn-primary" type="submit">Submit</button>\n' +
'          <button id="resetBtn" class="btn-ghost" type="button">Reset</button>\n' +
'          <span id="status" class="status" aria-live="polite"></span>\n' +
'        </div>\n' +
'      </form>\n' +
'    </section>\n' +
'\n' +
'    <section class="card" style="margin-top:1rem;">\n' +
'      <div style="margin-bottom:.5rem; color:var(--muted)">Response</div>\n' +
'      <pre id="responseBox" class="resp" aria-live="polite">Awaiting submission…</pre>\n' +
'    </section>\n' +
'  </div>\n' +
'\n' +
'  <script>\n' +
'    var CONFIG = {\n' +
'      WEBHOOK_URL: "http://localhost:5678/webhook-test/test_submit",\n' +
'      MAX_FILE_BYTES: 10 * 1024 * 1024,\n' +
'      ACCEPTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/jpg", "image/webp"],\n' +
'      REQUIRED_TEXT_FIELDS: [\n' +
'        { id: "customerName", label: "Customer Name" },\n' +
'        { id: "locationOfInstallation", label: "Location of Installation" },\n' +
'        { id: "contactPerson", label: "Contact Person" },\n' +
'        { id: "mobileNumber", label: "Mobile Number" },\n' +
'        { id: "motorType", label: "Motor Type" },\n' +
'        { id: "vfdType", label: "VFD Type" },\n' +
'        { id: "applicationType", label: "Application Type" }\n' +
'      ],\n' +
'      REQUIRED_FILE_FIELDS: [\n' +
'        { id: "vfdNameplate", label: "VFD Nameplate" },\n' +
'        { id: "motorNameplate", label: "Motor Nameplate" }\n' +
'      ]\n' +
'    };\n' +
'\n' +
'    var DOM = {\n' +
'      form: document.getElementById("aladin-form"),\n' +
'      statusEl: document.getElementById("status"),\n' +
'      respEl: document.getElementById("responseBox"),\n' +
'      previewEl: document.getElementById("preview"),\n' +
'      submitBtn: document.getElementById("submitBtn"),\n' +
'      resetBtn: document.getElementById("resetBtn")\n' +
'    };\n' +
'\n' +
'    var Utils = {\n' +
'      setStatus: function(msg, type) {\n' +
'        if (!type) type = "info";\n' +
'        DOM.statusEl.textContent = msg || "";\n' +
'        DOM.statusEl.classList.remove("ok", "err");\n' +
'        if (type === "ok") DOM.statusEl.classList.add("ok");\n' +
'        if (type === "err") DOM.statusEl.classList.add("err");\n' +
'      },\n' +
'      prettyPrint: function(data) {\n' +
'        try {\n' +
'          if (typeof data === "string") {\n' +
'            var trimmed = data.trim();\n' +
'            if ((trimmed.charAt(0) === "{" && trimmed.charAt(trimmed.length-1) === "}") ||\n' +
'                (trimmed.charAt(0) === "[" && trimmed.charAt(trimmed.length-1) === "]")) {\n' +
'              return JSON.stringify(JSON.parse(trimmed), null, 2);\n' +
'            }\n' +
'            return data;\n' +
'          }\n' +
'          return JSON.stringify(data, null, 2);\n' +
'        } catch (e) {\n' +
'          return String(data);\n' +
'        }\n' +
'      },\n' +
'      isValidPhoneNumber: function(phone) {\n' +
'        var phoneRegex = /^[\\+]?[\\d\\s\\-\\(\\)]{10,}$/;\n' +
'        return phoneRegex.test(phone);\n' +
'      },\n' +
'      formatFileSize: function(bytes) {\n' +
'        if (bytes === 0) return "0 Bytes";\n' +
'        var k = 1024;\n' +
'        var sizes = ["Bytes", "KB", "MB", "GB"];\n' +
'        var i = Math.floor(Math.log(bytes) / Math.log(k));\n' +
'        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];\n' +
'      }\n' +
'    };\n' +
'\n' +
'    var Validator = {\n' +
'      validateTextFields: function() {\n' +
'        var data = {};\n' +
'        var errors = [];\n' +
'        for (var i = 0; i < CONFIG.REQUIRED_TEXT_FIELDS.length; i++) {\n' +
'          var field = CONFIG.REQUIRED_TEXT_FIELDS[i];\n' +
'          var element = document.getElementById(field.id);\n' +
'          var value = (element.value || "").trim();\n' +
'          if (!value) {\n' +
'            errors.push(field.label + " is required");\n' +
'            element.classList.add("error");\n' +
'          } else {\n' +
'            element.classList.remove("error");\n' +
'            data[field.id] = value;\n' +
'            if (field.id === "mobileNumber" && !Utils.isValidPhoneNumber(value)) {\n' +
'              errors.push(field.label + " format is invalid");\n' +
'              element.classList.add("error");\n' +
'            }\n' +
'          }\n' +
'        }\n' +
'        if (errors.length > 0) throw new Error(errors.join("\\n"));\n' +
'        return data;\n' +
'      },\n' +
'      validateFiles: function() {\n' +
'        var files = {};\n' +
'        var errors = [];\n' +
'        for (var i = 0; i < CONFIG.REQUIRED_FILE_FIELDS.length; i++) {\n' +
'          var field = CONFIG.REQUIRED_FILE_FIELDS[i];\n' +
'          var input = document.getElementById(field.id);\n' +
'          var file = (input.files && input.files[0]) ? input.files[0] : null;\n' +
'          if (!file) {\n' +
'            errors.push(field.label + " image is required");\n' +
'            input.classList.add("error");\n' +
'          } else {\n' +
'            input.classList.remove("error");\n' +
'            if (file.size > CONFIG.MAX_FILE_BYTES) {\n' +
'              errors.push(field.label + " is too large (" + Utils.formatFileSize(file.size) + "). Max: 10 MB");\n' +
'              input.classList.add("error");\n' +
'            }\n' +
'            if (CONFIG.ACCEPTED_IMAGE_TYPES.indexOf(file.type) === -1) {\n' +
'              errors.push(field.label + " must be an image (JPEG, PNG, WebP)");\n' +
'              input.classList.add("error");\n' +
'            } else {\n' +
'              files[field.id] = file;\n' +
'            }\n' +
'          }\n' +
'        }\n' +
'        if (errors.length > 0) throw new Error(errors.join("\\n"));\n' +
'        return files;\n' +
'      }\n' +
'    };\n' +
'\n' +
'    var UI = {\n' +
'      renderPreview: function(filesMap) {\n' +
'        DOM.previewEl.innerHTML = "";\n' +
'        for (var fieldId in filesMap) {\n' +
'          if (!filesMap.hasOwnProperty(fieldId)) continue;\n' +
'          var file = filesMap[fieldId];\n' +
'          if (!file) continue;\n' +
'          var box = document.createElement("div");\n' +
'          box.className = "thumb";\n' +
'          var title = document.createElement("div");\n' +
'          title.style.cssText = "font-size: .85rem; color: var(--muted); margin-bottom: .35rem;";\n' +
'          var foundLabel = fieldId;\n' +
'          for (var j = 0; j < CONFIG.REQUIRED_FILE_FIELDS.length; j++) {\n' +
'            if (CONFIG.REQUIRED_FILE_FIELDS[j].id === fieldId) {\n' +
'              foundLabel = CONFIG.REQUIRED_FILE_FIELDS[j].label;\n' +
'              break;\n' +
'            }\n' +
'          }\n' +
'          title.textContent = foundLabel;\n' +
'          var sizeInfo = document.createElement("div");\n' +
'          sizeInfo.style.cssText = "font-size: .75rem; color: var(--muted); margin-bottom: .5rem;";\n' +
'          sizeInfo.textContent = file.name + " (" + Utils.formatFileSize(file.size) + ")";\n' +
'          var img = document.createElement("img");\n' +
'          var url = URL.createObjectURL(file);\n' +
'          img.src = url;\n' +
'          img.onload = function() { URL.revokeObjectURL(url); };\n' +
'          box.appendChild(title);\n' +
'          box.appendChild(sizeInfo);\n' +
'          box.appendChild(img);\n' +
'          DOM.previewEl.appendChild(box);\n' +
'        }\n' +
'      },\n' +
'      clearPreview: function() {\n' +
'        DOM.previewEl.innerHTML = "";\n' +
'      },\n' +
'      updateResponse: function(content) {\n' +
'        DOM.respEl.textContent = content;\n' +
'      },\n' +
'      clearErrorHighlights: function() {\n' +
'        var inputs = DOM.form.querySelectorAll("input");\n' +
'        for (var i = 0; i < inputs.length; i++) {\n' +
'          inputs[i].classList.remove("error");\n' +
'        }\n' +
'      }\n' +
'    };\n' +
'\n' +
'    var Network = {\n' +
'      submitToWebhook: async function(formData) {\n' +
'        var response = await fetch(CONFIG.WEBHOOK_URL, { method: "POST", body: formData });\n' +
'        var contentType = response.headers.get("content-type") || "";\n' +
'        var payload;\n' +
'        var isHtml = false;\n' +
'        \n' +
'        if (contentType.indexOf("text/html") > -1) {\n' +
'          payload = await response.text();\n' +
'          isHtml = true;\n' +
'        } else if (contentType.indexOf("application/json") > -1) {\n' +
'          payload = await response.json();\n' +
'        } else {\n' +
'          payload = await response.text();\n' +
'        }\n' +
'        return { ok: response.ok, status: response.status, statusText: response.statusText, payload: payload, isHtml: isHtml };\n' +
'      }\n' +
'    };\n' +
'\n' +
'    var FormHandler = {\n' +
'      buildFormData: function(textData, files) {\n' +
'        var formData = new FormData();\n' +
'        for (var key in textData) {\n' +
'          if (textData.hasOwnProperty(key)) formData.append(key, textData[key]);\n' +
'        }\n' +
'        for (var key in files) {\n' +
'          if (files.hasOwnProperty(key)) {\n' +
'            var file = files[key];\n' +
'            formData.append(key, file, file.name);\n' +
'          }\n' +
'        }\n' +
'        formData.append("source", "Danfoss ALADIN Web UI");\n' +
'        formData.append("timestamp", new Date().toISOString());\n' +
'        formData.append("submittedAt", new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));\n' +
'        return formData;\n' +
'      },\n' +
'      handleSubmit: async function(event) {\n' +
'        event.preventDefault();\n' +
'        UI.updateResponse("Processing submission...");\n' +
'        UI.clearErrorHighlights();\n' +
'        try {\n' +
'          Utils.setStatus("Validating form data...");\n' +
'          var textData = Validator.validateTextFields();\n' +
'          var files = Validator.validateFiles();\n' +
'          Utils.setStatus("Preparing data for submission...");\n' +
'          var formData = FormHandler.buildFormData(textData, files);\n' +
'          UI.renderPreview(files);\n' +
'          DOM.submitBtn.disabled = true;\n' +
'          Utils.setStatus("Analyzing motor nameplate and generating configuration page...");\n' +
'          var result = await Network.submitToWebhook(formData);\n' +
'          if (result.ok) {\n' +
'            if (result.isHtml) {\n' +
'              Utils.setStatus("✓ Analysis complete! Loading motor configuration...", "ok");\n' +
'              UI.updateResponse("Redirecting to motor configuration page...");\n' +
'              setTimeout(function() {\n' +
'                document.open();\n' +
'                document.write(result.payload);\n' +
'                document.close();\n' +
'              }, 800);\n' +
'            } else {\n' +
'              Utils.setStatus("✓ Submission successful (HTTP " + result.status + ")", "ok");\n' +
'              UI.updateResponse(Utils.prettyPrint(result.payload));\n' +
'            }\n' +
'          } else {\n' +
'            Utils.setStatus("✗ Submission failed (HTTP " + result.status + ": " + result.statusText + ")", "err");\n' +
'            UI.updateResponse(Utils.prettyPrint(result.payload));\n' +
'          }\n' +
'        } catch (error) {\n' +
'          Utils.setStatus("✗ " + (error.message || "Submission failed"), "err");\n' +
'          UI.updateResponse(error.stack || error.message || String(error));\n' +
'          console.error("Form submission error:", error);\n' +
'        } finally {\n' +
'          DOM.submitBtn.disabled = false;\n' +
'        }\n' +
'      },\n' +
'      handleReset: function() {\n' +
'        DOM.form.reset();\n' +
'        UI.clearPreview();\n' +
'        UI.clearErrorHighlights();\n' +
'        Utils.setStatus("");\n' +
'        UI.updateResponse("Awaiting submission…");\n' +
'      }\n' +
'    };\n' +
'\n' +
'    function init() {\n' +
'      DOM.form.addEventListener("submit", FormHandler.handleSubmit);\n' +
'      DOM.resetBtn.addEventListener("click", FormHandler.handleReset);\n' +
'      var inputs = DOM.form.querySelectorAll("input");\n' +
'      for (var i = 0; i < inputs.length; i++) {\n' +
'        inputs[i].addEventListener("input", function() { this.classList.remove("error"); });\n' +
'      }\n' +
'      for (var i = 0; i < CONFIG.REQUIRED_FILE_FIELDS.length; i++) {\n' +
'        var field = CONFIG.REQUIRED_FILE_FIELDS[i];\n' +
'        var input = document.getElementById(field.id);\n' +
'        input.addEventListener("change", function() {\n' +
'          var files = {};\n' +
'          for (var j = 0; j < CONFIG.REQUIRED_FILE_FIELDS.length; j++) {\n' +
'            var f = CONFIG.REQUIRED_FILE_FIELDS[j];\n' +
'            var inp = document.getElementById(f.id);\n' +
'            if (inp.files && inp.files[0]) files[f.id] = inp.files[0];\n' +
'          }\n' +
'          if (Object.keys(files).length > 0) UI.renderPreview(files);\n' +
'        });\n' +
'      }\n' +
'      console.log("Danfoss ALADIN form initialized successfully");\n' +
'    }\n' +
'    init();\n' +
'  </' + 'script>\n' +
'</body>\n' +
'</html>';

var html = htmlPart1;

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
