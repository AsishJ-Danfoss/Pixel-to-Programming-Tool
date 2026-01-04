// Motor Configuration UI - n8n Code Node
// Matches Customer Input UI styling with enhanced form fields

var htmlPart1 = '<!DOCTYPE html>\n' +
'<html lang="en">\n' +
'<head>\n' +
'  <meta charset="utf-8" />\n' +
'  <title>Motor Configuration - Danfoss ALADIN</title>\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1" />\n' +
'  <script>\n' +
'    (function() {\n' +
'      var isAuthenticated = sessionStorage.getItem("aladin_authenticated");\n' +
'      if (!isAuthenticated || isAuthenticated !== "true") {\n' +
'        window.location.href = "https://aladin-webapp.net/webhook/login";\n' +
'        return;\n' +
'      }\n' +
'      var loginTime = sessionStorage.getItem("aladin_login_time");\n' +
'      if (loginTime) {\n' +
'        var elapsed = (new Date() - new Date(loginTime)) / 1000 / 60;\n' +
'        if (elapsed > 60) {\n' +
'          sessionStorage.clear();\n' +
'          window.location.href = "https://aladin-webapp.net/webhook/login";\n' +
'        }\n' +
'      }\n' +
'      console.log("Auth check passed - User:", sessionStorage.getItem("aladin_username"));\n' +
'    })();\n' +
'  </script>\n';

var htmlPart2 = '  <style>\n' +
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
'      font-family: system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif;\n' +
'      min-height: 100vh;\n' +
'    }\n' +
'    .wrap { max-width: 780px; margin: 0 auto; }\n' +
'    header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }\n' +
'    .brand { display: flex; align-items: center; gap: .75rem; font-weight: 700; letter-spacing: .5px; }\n' +
'    .brand .logo { width: 36px; height: 36px; border-radius: 10px; background: var(--accent); display: grid; place-items: center; color: white; font-weight: 900; }\n' +
'    .subtitle { color: var(--muted); font-size: .95rem; margin-top: .25rem; }\n';

var htmlPart3 = '    .progress-bar { display: flex; justify-content: space-between; margin-bottom: 2rem; position: relative; }\n' +
'    .progress-bar::before { content: ""; position: absolute; top: 50%; left: 0; right: 0; height: 2px; background: var(--border); transform: translateY(-50%); z-index: 0; }\n' +
'    .progress-step { flex: 1; text-align: center; position: relative; z-index: 1; }\n' +
'    .progress-step-circle { width: 32px; height: 32px; border-radius: 50%; background: var(--border); margin: 0 auto 0.5rem; display: grid; place-items: center; font-size: .85rem; font-weight: 600; transition: all .2s; }\n' +
'    .progress-step.active .progress-step-circle { background: var(--accent); color: white; }\n' +
'    .progress-step.completed .progress-step-circle { background: var(--accent-2); color: white; }\n' +
'    .progress-step span { font-size: .85rem; color: var(--muted); display: block; }\n' +
'    .progress-step.active span { color: var(--fg); font-weight: 600; }\n';

var htmlPart4 = '    .card { background: rgba(17,24,39,.7); border: 1px solid var(--border); border-radius: 16px; padding: 2rem; backdrop-filter: blur(6px); box-shadow: 0 6px 24px rgba(0,0,0,.35); }\n' +
'    .card h2 { margin: 0 0 .5rem 0; font-size: 1.5rem; color: var(--fg); }\n' +
'    .card p { margin: 0 0 2rem 0; color: var(--muted); font-size: .95rem; }\n' +
'    .mode-toggle { display: flex; gap: .75rem; margin-bottom: 2rem; background: var(--input); padding: .5rem; border-radius: .75rem; }\n' +
'    .mode-btn { flex: 1; padding: .75rem 1rem; border: none; border-radius: .5rem; background: transparent; color: var(--muted); font-weight: 600; cursor: pointer; transition: all .2s; font-size: .9rem; }\n' +
'    .mode-btn.active { background: var(--accent); color: white; box-shadow: 0 4px 12px rgba(239,68,68,.3); }\n' +
'    .mode-btn:hover:not(.active) { background: rgba(255,255,255,.05); }\n' +
'    .mode-content { display: none; }\n' +
'    .mode-content.active { display: block; }\n';

var htmlPart5 = '    .upload-area { border: 2px dashed var(--border); background: var(--input); padding: 3rem 2rem; text-align: center; cursor: pointer; border-radius: .75rem; transition: all .2s; margin-bottom: 1.5rem; }\n' +
'    .upload-area:hover { border-color: var(--accent); background: rgba(239,68,68,.05); }\n' +
'    .upload-icon { font-size: 3rem; margin-bottom: 1rem; color: var(--muted); }\n' +
'    .upload-text { color: var(--fg); font-weight: 600; margin-bottom: .5rem; }\n' +
'    .upload-hint { color: var(--muted); font-size: .85rem; }\n' +
'    form { display: grid; gap: 1.25rem; }\n' +
'    .form-group { display: flex; flex-direction: column; }\n' +
'    .form-row { display: grid; gap: 1.25rem; grid-template-columns: 1fr 1fr; }\n' +
'    label { display: block; font-size: .9rem; color: var(--muted); margin-bottom: .5rem; font-weight: 500; }\n' +
'    label .required { color: var(--accent); }\n' +
'    label .optional { color: var(--muted); font-weight: 400; font-size: .85rem; }\n';

var htmlPart6 = '    input[type="text"], input[type="number"], select { width: 100%; background: var(--input); color: var(--fg); border: 1px solid var(--border); border-radius: .75rem; padding: .85rem 1rem; outline: none; transition: border .15s, box-shadow .15s; font-size: .95rem; }\n' +
'    input:focus, select:focus { border-color: var(--focus); box-shadow: 0 0 0 3px rgba(59,130,246,.25); }\n' +
'    input.error, select.error { border-color: var(--accent) !important; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2) !important; }\n' +
'    select { cursor: pointer; }\n' +
'    .hint { font-size: .8rem; color: var(--muted); margin-top: .35rem; }\n' +
'    .actions { display: flex; gap: .75rem; justify-content: flex-end; margin-top: 1rem; }\n' +
'    button { appearance: none; border: none; border-radius: .75rem; padding: .9rem 1.5rem; font-weight: 600; cursor: pointer; transition: transform .04s ease, box-shadow .15s ease, opacity .15s; font-size: .95rem; }\n' +
'    .btn-primary { background: linear-gradient(180deg, #ef4444, #dc2626); color: white; box-shadow: 0 10px 24px rgba(239,68,68,.35); min-width: 140px; }\n' +
'    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(239,68,68,.45); }\n' +
'    .btn-primary:active { transform: translateY(0); }\n' +
'    .btn-primary:disabled { background: #6b7280; cursor: not-allowed; transform: none; opacity: .6; }\n';

var htmlPart7 = '    .btn-primary.success { background: linear-gradient(180deg, #22c55e, #16a34a) !important; }\n' +
'    .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }\n' +
'    .btn-ghost:hover { background: rgba(255,255,255,.05); }\n' +
'    .error-message { background: rgba(239, 68, 68, 0.1); color: var(--accent); padding: 1rem; border-radius: .75rem; margin-bottom: 1rem; font-size: .9rem; border-left: 4px solid var(--accent); display: none; }\n' +
'    .error-message.show { display: block; }\n' +
'    @media (max-width: 720px) { .form-row { grid-template-columns: 1fr; } }\n' +
'  </style>\n' +
'</head>\n' +
'<body>\n' +
'  <div class="wrap">\n' +
'    <header>\n' +
'      <div class="brand">\n' +
'        <div class="logo" aria-hidden="true">A</div>\n' +
'        <div>\n' +
'          <div style="font-size:1.15rem;">Danfoss ALADIN</div>\n' +
'          <div class="subtitle">Motor Configuration</div>\n' +
'        </div>\n' +
'      </div>\n' +
'    </header>\n';

var htmlPart8 = '    <div class="progress-bar">\n' +
'      <div class="progress-step completed">\n' +
'        <div class="progress-step-circle">1</div>\n' +
'        <span>Customer Info</span>\n' +
'      </div>\n' +
'      <div class="progress-step active">\n' +
'        <div class="progress-step-circle">2</div>\n' +
'        <span>Motor Details</span>\n' +
'      </div>\n' +
'      <div class="progress-step">\n' +
'        <div class="progress-step-circle">3</div>\n' +
'        <span>Configuration</span>\n' +
'      </div>\n' +
'    </div>\n';

var htmlPart9 = '    <section class="card">\n' +
'      <h2>Motor Configuration</h2>\n' +
'      <p>Configure motor details via image upload or manual entry</p>\n' +
'      <div class="mode-toggle">\n' +
'        <button class="mode-btn active" onclick="switchMode(&#39;auto&#39;, this)">Auto Config Mode</button>\n' +
'        <button class="mode-btn" onclick="switchMode(&#39;manual&#39;, this)">Manual Config Mode</button>\n' +
'      </div>\n' +
'      <div id="errorMessage" class="error-message"></div>\n';

var htmlPart10 = '      <div id="autoMode" class="mode-content active">\n' +
'        <div class="upload-area" onclick="document.getElementById(&#39;imageInput&#39;).click()">\n' +
'          <div class="upload-icon">&#128247;</div>\n' +
'          <div class="upload-text">Click to upload Motor Nameplate Image</div>\n' +
'          <div class="upload-hint">Supported formats: JPG, PNG (Max 5MB)</div>\n' +
'          <input type="file" id="imageInput" accept="image/*" style="display:none">\n' +
'        </div>\n' +
'        <div class="actions">\n' +
'          <button class="btn-primary" onclick="submitAuto()">Process Image</button>\n' +
'        </div>\n' +
'      </div>\n';

var htmlPart11 = '      <div id="manualMode" class="mode-content">\n' +
'        <form id="motor-form" novalidate>\n' +
'          <div class="form-row">\n' +
'            <div class="form-group">\n' +
'              <label for="motorModel">Motor Model <span class="required">*</span></label>\n' +
'              <input id="motorModel" name="motorModel" type="text" placeholder="e.g., IEC 132M" required />\n' +
'            </div>\n' +
'            <div class="form-group">\n' +
'              <label for="motorSerial">Motor Serial No <span class="optional">(Optional)</span></label>\n' +
'              <input id="motorSerial" name="motorSerial" type="text" placeholder="e.g., SN123456789" />\n' +
'            </div>\n' +
'          </div>\n';

var htmlPart12 = '          <div class="form-row">\n' +
'            <div class="form-group">\n' +
'              <label for="voltage">Voltage (V) <span class="required">*</span></label>\n' +
'              <input id="voltage" name="voltage" type="number" step="0.1" placeholder="e.g., 400" required />\n' +
'              <div class="hint">Rated voltage in volts</div>\n' +
'            </div>\n' +
'            <div class="form-group">\n' +
'              <label for="current">Current (A) <span class="required">*</span></label>\n' +
'              <input id="current" name="current" type="number" step="0.01" placeholder="e.g., 15.2" required />\n' +
'              <div class="hint">Rated current in amperes</div>\n' +
'            </div>\n' +
'          </div>\n';

var htmlPart13 = '          <div class="form-row">\n' +
'            <div class="form-group">\n' +
'              <label for="power">Power (kW) <span class="required">*</span></label>\n' +
'              <input id="power" name="power" type="number" step="0.01" placeholder="e.g., 7.5" required />\n' +
'              <div class="hint">Rated power in kilowatts</div>\n' +
'            </div>\n' +
'            <div class="form-group">\n' +
'              <label for="frequency">Frequency (Hz) <span class="required">*</span></label>\n' +
'              <input id="frequency" name="frequency" type="number" step="0.1" placeholder="e.g., 50" required />\n' +
'              <div class="hint">Operating frequency</div>\n' +
'            </div>\n' +
'          </div>\n';

var htmlPart14 = '          <div class="form-row">\n' +
'            <div class="form-group">\n' +
'              <label for="speed">Speed (RPM) <span class="required">*</span></label>\n' +
'              <input id="speed" name="speed" type="number" placeholder="e.g., 1450" required />\n' +
'              <div class="hint">Rated speed in revolutions per minute</div>\n' +
'            </div>\n' +
'            <div class="form-group">\n' +
'              <label for="connection">Connection Type <span class="required">*</span></label>\n' +
'              <select id="connection" name="connection" required>\n' +
'                <option value="">Select connection type</option>\n' +
'                <option value="STAR">STAR (Y)</option>\n' +
'                <option value="DELTA">DELTA (&#916;)</option>\n' +
'                <option value="STAR-DELTA">STAR-DELTA</option>\n' +
'              </select>\n' +
'            </div>\n' +
'          </div>\n';

var htmlPart15 = '          <div class="actions">\n' +
'            <button id="resetBtn" class="btn-ghost" type="button">Reset</button>\n' +
'            <button id="submitBtn" class="btn-primary" type="submit">Next &#8594;</button>\n' +
'          </div>\n' +
'        </form>\n' +
'      </div>\n' +
'    </section>\n' +
'  </div>\n';

var scriptPart1 = '  <script>\n' +
'    var CONFIG = {\n' +
'      NEXT_PAGE_URL: "http://localhost:5678/webhook-test/review",\n' +
'      DRAFT_SAVE_API_URL: "http://localhost:5678/webhook-test/save-draft",\n' +
'      REQUIRED_FIELDS: [\n' +
'        { id: "motorModel", label: "Motor Model" },\n' +
'        { id: "voltage", label: "Voltage" },\n' +
'        { id: "current", label: "Current" },\n' +
'        { id: "power", label: "Power" },\n' +
'        { id: "frequency", label: "Frequency" },\n' +
'        { id: "speed", label: "Speed" },\n' +
'        { id: "connection", label: "Connection Type" }\n' +
'      ]\n' +
'    };\n';

var scriptPart2 = '    var DOM = {\n' +
'      form: document.getElementById("motor-form"),\n' +
'      submitBtn: document.getElementById("submitBtn"),\n' +
'      resetBtn: document.getElementById("resetBtn"),\n' +
'      errorMessage: document.getElementById("errorMessage")\n' +
'    };\n' +
'    var currentMode = "auto";\n' +
'    var Utils = {\n' +
'      showError: function(message) {\n' +
'        DOM.errorMessage.textContent = message;\n' +
'        DOM.errorMessage.classList.add("show");\n' +
'        setTimeout(function() {\n' +
'          DOM.errorMessage.classList.remove("show");\n' +
'        }, 5000);\n' +
'      },\n' +
'      clearErrors: function() {\n' +
'        DOM.errorMessage.classList.remove("show");\n' +
'        var inputs = document.querySelectorAll("input, select");\n' +
'        for (var i = 0; i < inputs.length; i++) {\n' +
'          inputs[i].classList.remove("error");\n' +
'        }\n' +
'      }\n' +
'    };\n';

var scriptPart3 = '    function switchMode(mode, btn) {\n' +
'      currentMode = mode;\n' +
'      document.getElementById("autoMode").classList.remove("active");\n' +
'      document.getElementById("manualMode").classList.remove("active");\n' +
'      document.querySelectorAll(".mode-btn").forEach(function(b) { b.classList.remove("active"); });\n' +
'      btn.classList.add("active");\n' +
'      document.getElementById(mode + "Mode").classList.add("active");\n' +
'      Utils.clearErrors();\n' +
'    }\n';

var scriptPart4 = '    function submitAuto() {\n' +
'      var fileInput = document.getElementById("imageInput");\n' +
'      if (!fileInput.files || fileInput.files.length === 0) {\n' +
'        Utils.showError("Please upload a motor nameplate image");\n' +
'        return;\n' +
'      }\n' +
'      var data = { mode: "auto", source: "image", fileName: fileInput.files[0].name };\n' +
'      sessionStorage.setItem("aladin_motor_config", JSON.stringify(data));\n' +
'      window.location.href = CONFIG.NEXT_PAGE_URL;\n' +
'    }\n';

var scriptPart5 = '    var Validator = {\n' +
'      validateForm: function() {\n' +
'        var data = {};\n' +
'        var errors = [];\n' +
'        for (var i = 0; i < CONFIG.REQUIRED_FIELDS.length; i++) {\n' +
'          var field = CONFIG.REQUIRED_FIELDS[i];\n' +
'          var element = document.getElementById(field.id);\n' +
'          var value = (element.value || "").trim();\n' +
'          if (!value) {\n' +
'            errors.push(field.label + " is required");\n' +
'            element.classList.add("error");\n' +
'          } else {\n' +
'            element.classList.remove("error");\n' +
'            data[field.id] = value;\n' +
'          }\n' +
'        }\n' +
'        var motorSerial = document.getElementById("motorSerial").value.trim();\n' +
'        if (motorSerial) data.motorSerial = motorSerial;\n' +
'        if (errors.length > 0) {\n' +
'          throw new Error(errors.join(", "));\n' +
'        }\n' +
'        return data;\n' +
'      }\n' +
'    };\n';

var scriptPart6 = '    var FormHandler = {\n' +
'      createOutputObject: function(data) {\n' +
'        return {\n' +
'          mode: "manual",\n' +
'          motorModel: data.motorModel,\n' +
'          motorSerial: data.motorSerial || null,\n' +
'          voltage: parseFloat(data.voltage),\n' +
'          current: parseFloat(data.current),\n' +
'          power: parseFloat(data.power),\n' +
'          frequency: parseFloat(data.frequency),\n' +
'          speed: parseInt(data.speed),\n' +
'          connection: data.connection,\n' +
'          createdAt: new Date().toISOString()\n' +
'        };\n' +
'      },\n' +
'      saveToSessionStorage: function(outputData) {\n' +
'        sessionStorage.setItem("aladin_motor_config", JSON.stringify(outputData));\n' +
'        console.log("Motor config saved:", outputData);\n' +
'      },\n';

var scriptPart7 = '      saveToDraftAPI: async function(outputData) {\n' +
'        var draftId = sessionStorage.getItem("aladin_draft_id") || null;\n' +
'        var payload = {\n' +
'          draft_id: draftId,\n' +
'          page_number: 2,\n' +
'          page_data: outputData,\n' +
'          metadata: {\n' +
'            username: sessionStorage.getItem("aladin_username"),\n' +
'            timestamp: new Date().toISOString()\n' +
'          }\n' +
'        };\n' +
'        try {\n' +
'          var response = await fetch(CONFIG.DRAFT_SAVE_API_URL, {\n' +
'            method: "POST",\n' +
'            headers: { "Content-Type": "application/json" },\n' +
'            body: JSON.stringify(payload)\n' +
'          });\n' +
'          var result = await response.json();\n' +
'          if (response.ok && result.success) {\n' +
'            sessionStorage.setItem("aladin_draft_id", result.data.draft_id);\n' +
'            return { success: true, data: result.data };\n' +
'          } else {\n' +
'            return { success: false, error: result.error || result.message || "Failed to save draft" };\n' +
'          }\n' +
'        } catch (error) {\n' +
'          return { success: false, error: "Network error: " + error.message };\n' +
'        }\n' +
'      },\n';

var scriptPart8 = '      handleSubmit: function(event) {\n' +
'        event.preventDefault();\n' +
'        Utils.clearErrors();\n' +
'        try {\n' +
'          var formData = Validator.validateForm();\n' +
'          var outputData = FormHandler.createOutputObject(formData);\n' +
'          DOM.submitBtn.disabled = true;\n' +
'          DOM.submitBtn.textContent = "Saving...";\n' +
'          FormHandler.saveToDraftAPI(outputData).then(function(result) {\n' +
'            if (result.success) {\n' +
'              FormHandler.saveToSessionStorage(outputData);\n' +
'              DOM.submitBtn.innerHTML = "&#10003; Saved! Redirecting...";\n' +
'              DOM.submitBtn.classList.add("success");\n' +
'              console.log("Draft saved successfully:", result.data);\n' +
'              setTimeout(function() {\n' +
'                window.location.href = CONFIG.NEXT_PAGE_URL;\n' +
'              }, 800);\n' +
'            } else {\n' +
'              throw new Error(result.error);\n' +
'            }\n' +
'          }).catch(function(error) {\n' +
'            DOM.submitBtn.disabled = false;\n' +
'            DOM.submitBtn.innerHTML = "Next &#8594;";\n' +
'            DOM.submitBtn.classList.remove("success");\n' +
'            Utils.showError(error.message || "Failed to save. Please try again.");\n' +
'            console.error("Draft save error:", error);\n' +
'          });\n' +
'        } catch (error) {\n' +
'          Utils.showError(error.message || "Please fill in all required fields");\n' +
'          console.error("Form validation error:", error);\n' +
'        }\n' +
'      },\n';

var scriptPart9 = '      handleReset: function() {\n' +
'        DOM.form.reset();\n' +
'        Utils.clearErrors();\n' +
'      }\n' +
'    };\n' +
'    function loadSavedData() {\n' +
'      try {\n' +
'        var savedData = sessionStorage.getItem("aladin_motor_config");\n' +
'        if (savedData) {\n' +
'          var data = JSON.parse(savedData);\n' +
'          if (data.mode === "manual") {\n' +
'            for (var key in data) {\n' +
'              if (data.hasOwnProperty(key) && key !== "createdAt" && key !== "mode") {\n' +
'                var element = document.getElementById(key);\n' +
'                if (element) element.value = data[key];\n' +
'              }\n' +
'            }\n' +
'            console.log("Loaded saved motor config data");\n' +
'          }\n' +
'        }\n' +
'      } catch (error) {\n' +
'        console.error("Error loading saved data:", error);\n' +
'      }\n' +
'    }\n';

var scriptPart10 = '    function init() {\n' +
'      if (DOM.form) {\n' +
'        DOM.form.addEventListener("submit", FormHandler.handleSubmit);\n' +
'        DOM.resetBtn.addEventListener("click", FormHandler.handleReset);\n' +
'        var inputs = DOM.form.querySelectorAll("input, select");\n' +
'        for (var i = 0; i < inputs.length; i++) {\n' +
'          inputs[i].addEventListener("input", function() {\n' +
'            this.classList.remove("error");\n' +
'          });\n' +
'        }\n' +
'        loadSavedData();\n' +
'      }\n' +
'      console.log("Motor configuration UI initialized");\n' +
'    }\n' +
'    init();\n' +
'  </script>\n' +
'</body>\n' +
'</html>';

var html = htmlPart1 + htmlPart2 + htmlPart3 + htmlPart4 + htmlPart5 + htmlPart6 + htmlPart7 + htmlPart8 + htmlPart9 + htmlPart10 + htmlPart11 + htmlPart12 + htmlPart13 + htmlPart14 + htmlPart15 + scriptPart1 + scriptPart2 + scriptPart3 + scriptPart4 + scriptPart5 + scriptPart6 + scriptPart7 + scriptPart8 + scriptPart9 + scriptPart10;

return [
  {
    json: {},
    binary: {
      data: {
        data: Buffer.from(html).toString('base64'),
        mimeType: 'text/html',
        fileName: 'motor-config.html'
      }
    }
  }
];
