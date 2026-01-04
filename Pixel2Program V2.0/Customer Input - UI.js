// n8n Code node: returns the HTML UI as binary
// NOTE: Using string concatenation instead of template literals for n8n vm2 compatibility

var htmlPart1 = '<!DOCTYPE html>\n' +
'<html lang="en">\n' +
'<head>\n' +
'  <meta charset="utf-8" />\n' +
'  <title>Danfoss ALADIN - Customer Information</title>\n' +
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
'  </script>\n' +
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
'      min-height: 100vh;\n' +
'    }\n' +
'    .wrap { max-width: 780px; margin: 0 auto; }\n' +
'    header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }\n' +
'    .brand { display: flex; align-items: center; gap: .75rem; font-weight: 700; letter-spacing: .5px; }\n' +
'    .brand .logo { width: 36px; height: 36px; border-radius: 10px; background: var(--accent); display: grid; place-items: center; color: white; font-weight: 900; }\n' +
'    .subtitle { color: var(--muted); font-size: .95rem; margin-top: .25rem; }\n' +
'    .progress-bar { display: flex; justify-content: space-between; margin-bottom: 2rem; position: relative; }\n' +
'    .progress-bar::before { content: ""; position: absolute; top: 50%; left: 0; right: 0; height: 2px; background: var(--border); transform: translateY(-50%); z-index: 0; }\n' +
'    .progress-step { flex: 1; text-align: center; position: relative; z-index: 1; }\n' +
'    .progress-step-circle { width: 32px; height: 32px; border-radius: 50%; background: var(--border); margin: 0 auto 0.5rem; display: grid; place-items: center; font-size: .85rem; font-weight: 600; transition: all .2s; }\n' +
'    .progress-step.active .progress-step-circle { background: var(--accent); color: white; }\n' +
'    .progress-step.completed .progress-step-circle { background: var(--accent-2); color: white; }\n' +
'    .progress-step span { font-size: .85rem; color: var(--muted); display: block; }\n' +
'    .progress-step.active span { color: var(--fg); font-weight: 600; }\n' +
'    .card { background: rgba(17,24,39,.7); border: 1px solid var(--border); border-radius: 16px; padding: 2rem; backdrop-filter: blur(6px); box-shadow: 0 6px 24px rgba(0,0,0,.35); }\n' +
'    .card h2 { margin: 0 0 .5rem 0; font-size: 1.5rem; color: var(--fg); }\n' +
'    .card p { margin: 0 0 2rem 0; color: var(--muted); font-size: .95rem; }\n' +
'    form { display: grid; gap: 1.25rem; }\n' +
'    .form-group { display: flex; flex-direction: column; }\n' +
'    .form-row { display: grid; gap: 1.25rem; grid-template-columns: 1fr 1fr; }\n' +
'    label { display: block; font-size: .9rem; color: var(--muted); margin-bottom: .5rem; font-weight: 500; }\n' +
'    label .required { color: var(--accent); }\n' +
'    input[type="text"], input[type="tel"] { width: 100%; background: var(--input); color: var(--fg); border: 1px solid var(--border); border-radius: .75rem; padding: .85rem 1rem; outline: none; transition: border .15s, box-shadow .15s; font-size: .95rem; }\n' +
'    input:focus { border-color: var(--focus); box-shadow: 0 0 0 3px rgba(59,130,246,.25); }\n' +
'    input.error { border-color: var(--accent) !important; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2) !important; }\n' +
'    .hint { font-size: .8rem; color: var(--muted); margin-top: .35rem; }\n' +
'    .actions { display: flex; gap: .75rem; justify-content: flex-end; margin-top: 1rem; }\n' +
'    button { appearance: none; border: none; border-radius: .75rem; padding: .9rem 1.5rem; font-weight: 600; cursor: pointer; transition: transform .04s ease, box-shadow .15s ease, opacity .15s; font-size: .95rem; }\n' +
'    .btn-primary { background: linear-gradient(180deg, #ef4444, #dc2626); color: white; box-shadow: 0 10px 24px rgba(239,68,68,.35); min-width: 140px; }\n' +
'    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(239,68,68,.45); }\n' +
'    .btn-primary:active { transform: translateY(0); }\n' +
'    .btn-primary:disabled { background: #6b7280; cursor: not-allowed; transform: none; opacity: .6; }\n' +
'    .btn-primary.success { background: linear-gradient(180deg, #22c55e, #16a34a) !important; }\n' +
'    .btn-primary.error { background: linear-gradient(180deg, #ef4444, #dc2626) !important; }\n' +
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
'          <div class="subtitle">Customer Information Collection</div>\n' +
'        </div>\n' +
'      </div>\n' +
'    </header>\n' +
'\n' +
'    <div class="progress-bar">\n' +
'      <div class="progress-step active">\n' +
'        <div class="progress-step-circle">1</div>\n' +
'        <span>Customer Info</span>\n' +
'      </div>\n' +
'      <div class="progress-step">\n' +
'        <div class="progress-step-circle">2</div>\n' +
'        <span>Motor Details</span>\n' +
'      </div>\n' +
'      <div class="progress-step">\n' +
'        <div class="progress-step-circle">3</div>\n' +
'        <span>Configuration</span>\n' +
'      </div>\n' +
'    </div>\n' +
'\n' +
'    <section class="card">\n' +
'      <h2>Customer Information</h2>\n' +
'      <p>Please provide the following details to continue</p>\n' +
'\n' +
'      <div id="errorMessage" class="error-message"></div>\n' +
'\n' +
'      <form id="customer-form" novalidate>\n' +
'        <div class="form-row">\n' +
'          <div class="form-group">\n' +
'            <label for="customerName">Customer Name <span class="required">*</span></label>\n' +
'            <input id="customerName" name="customerName" type="text" placeholder="e.g., ABC Industries" required />\n' +
'          </div>\n' +
'          <div class="form-group">\n' +
'            <label for="projectName">Project Name <span class="required">*</span></label>\n' +
'            <input id="projectName" name="projectName" type="text" placeholder="e.g., HVAC System Upgrade" required />\n' +
'          </div>\n' +
'        </div>\n' +
'\n' +
'        <div class="form-row">\n' +
'          <div class="form-group">\n' +
'            <label for="locationOfInstallation">Location of Installation <span class="required">*</span></label>\n' +
'            <input id="locationOfInstallation" name="locationOfInstallation" type="text" placeholder="e.g., Copenhagen, Denmark" required />\n' +
'          </div>\n' +
'          <div class="form-group">\n' +
'            <label for="applicationType">Application Type <span class="required">*</span></label>\n' +
'            <input id="applicationType" name="applicationType" type="text" placeholder="e.g., Industrial Cooling" required />\n' +
'          </div>\n' +
'        </div>\n' +
'\n' +
'        <div class="form-row">\n' +
'          <div class="form-group">\n' +
'            <label for="contactPerson">Contact Person <span class="required">*</span></label>\n' +
'            <input id="contactPerson" name="contactPerson" type="text" placeholder="e.g., John Doe" required />\n' +
'          </div>\n' +
'          <div class="form-group">\n' +
'            <label for="mobileNumber">Mobile Number <span class="required">*</span></label>\n' +
'            <input id="mobileNumber" name="mobileNumber" type="tel" placeholder="e.g., +45 1234 5678" required />\n' +
'            <div class="hint">Include country code for international numbers</div>\n' +
'          </div>\n' +
'        </div>\n' +
'\n' +
'        <div class="actions">\n' +
'          <button id="resetBtn" class="btn-ghost" type="button">Reset</button>\n' +
'          <button id="nextBtn" class="btn-primary" type="submit">Next →</button>\n' +
'        </div>\n' +
'      </form>\n' +
'    </section>\n' +
'  </div>\n' +
'\n' +
'  <script>\n' +
'    var CONFIG = {\n' +
'      NEXT_PAGE_URL: "https://aladin-webapp.net/webhook/test_submit",\n' +
'      DRAFT_SAVE_API_URL: "http://localhost:5678/webhook-test/save-draft",\n' +
'      REQUIRED_FIELDS: [\n' +
'        { id: "customerName", label: "Customer Name" },\n' +
'        { id: "projectName", label: "Project Name" },\n' +
'        { id: "locationOfInstallation", label: "Location of Installation" },\n' +
'        { id: "applicationType", label: "Application Type" },\n' +
'        { id: "contactPerson", label: "Contact Person" },\n' +
'        { id: "mobileNumber", label: "Mobile Number" }\n' +
'      ]\n' +
'    };\n' +
'\n' +
'    var DOM = {\n' +
'      form: document.getElementById("customer-form"),\n' +
'      nextBtn: document.getElementById("nextBtn"),\n' +
'      resetBtn: document.getElementById("resetBtn"),\n' +
'      errorMessage: document.getElementById("errorMessage")\n' +
'    };\n' +
'\n' +
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
'        var inputs = DOM.form.querySelectorAll("input");\n' +
'        for (var i = 0; i < inputs.length; i++) {\n' +
'          inputs[i].classList.remove("error");\n' +
'        }\n' +
'      },\n' +
'      isValidPhoneNumber: function(phone) {\n' +
'        var phoneRegex = /^[\\+]?[\\d\\s\\-\\(\\)]{10,}$/;\n' +
'        return phoneRegex.test(phone);\n' +
'      }\n' +
'    };\n' +
'\n' +
'    var Validator = {\n' +
'      validateForm: function() {\n' +
'        var data = {};\n' +
'        var errors = [];\n' +
'        \n' +
'        for (var i = 0; i < CONFIG.REQUIRED_FIELDS.length; i++) {\n' +
'          var field = CONFIG.REQUIRED_FIELDS[i];\n' +
'          var element = document.getElementById(field.id);\n' +
'          var value = (element.value || "").trim();\n' +
'          \n' +
'          if (!value) {\n' +
'            errors.push(field.label + " is required");\n' +
'            element.classList.add("error");\n' +
'          } else {\n' +
'            element.classList.remove("error");\n' +
'            data[field.id] = value;\n' +
'            \n' +
'            if (field.id === "mobileNumber" && !Utils.isValidPhoneNumber(value)) {\n' +
'              errors.push("Mobile Number format is invalid");\n' +
'              element.classList.add("error");\n' +
'            }\n' +
'          }\n' +
'        }\n' +
'        \n' +
'        if (errors.length > 0) {\n' +
'          throw new Error(errors.join(", "));\n' +
'        }\n' +
'        \n' +
'        return data;\n' +
'      }\n' +
'    };\n' +
'\n' +
'    var FormHandler = {\n' +
'      createOutputObject: function(data) {\n' +
'        return {\n' +
'          customerName: data.customerName,\n' +
'          locationOfInstallation: data.locationOfInstallation,\n' +
'          projectName: data.projectName,\n' +
'          contactPerson: data.contactPerson,\n' +
'          mobileNumber: data.mobileNumber,\n' +
'          applicationType: data.applicationType,\n' +
'          createdAt: new Date().toISOString()\n' +
'        };\n' +
'      },\n' +
'      saveToSessionStorage: function(outputData) {\n' +
'        sessionStorage.setItem("aladin_customer_data", JSON.stringify(outputData));\n' +
'        console.log("Customer data saved:", outputData);\n' +
'      },\n' +
'      saveToDraftAPI: async function(outputData) {\n' +
'        var draftId = sessionStorage.getItem("aladin_draft_id") || null;\n' +
'        \n' +
'        var payload = {\n' +
'          draft_id: draftId,\n' +
'          page_number: 1,\n' +
'          page_data: outputData,\n' +
'          metadata: {\n' +
'            username: sessionStorage.getItem("aladin_username"),\n' +
'            timestamp: new Date().toISOString()\n' +
'          }\n' +
'        };\n' +
'        \n' +
'        try {\n' +
'          var response = await fetch(CONFIG.DRAFT_SAVE_API_URL, {\n' +
'            method: "POST",\n' +
'            headers: { "Content-Type": "application/json" },\n' +
'            body: JSON.stringify(payload)\n' +
'          });\n' +
'          \n' +
'          var result = await response.json();\n' +
'          \n' +
'          if (response.ok && result.success) {\n' +
'            sessionStorage.setItem("aladin_draft_id", result.data.draft_id);\n' +
'            return { success: true, data: result.data };\n' +
'          } else {\n' +
'            return { \n' +
'              success: false, \n' +
'              error: result.error || result.message || "Failed to save draft" \n' +
'            };\n' +
'          }\n' +
'        } catch (error) {\n' +
'          return { \n' +
'            success: false, \n' +
'            error: "Network error: " + error.message \n' +
'          };\n' +
'        }\n' +
'      },\n' +
'      handleSubmit: function(event) {\n' +
'        event.preventDefault();\n' +
'        Utils.clearErrors();\n' +
'        \n' +
'        try {\n' +
'          var formData = Validator.validateForm();\n' +
'          var outputData = FormHandler.createOutputObject(formData);\n' +
'          \n' +
'          DOM.nextBtn.disabled = true;\n' +
'          DOM.nextBtn.textContent = "Saving...";\n' +
'          \n' +
'          FormHandler.saveToDraftAPI(outputData).then(function(result) {\n' +
'            if (result.success) {\n' +
'              FormHandler.saveToSessionStorage(outputData);\n' +
'              \n' +
'              DOM.nextBtn.innerHTML = "✓ Saved! Redirecting...";\n' +
'              DOM.nextBtn.classList.add("success");\n' +
'              \n' +
'              console.log("Draft saved successfully:", result.data);\n' +
'              \n' +
'              setTimeout(function() {\n' +
'                window.location.href = CONFIG.NEXT_PAGE_URL;\n' +
'              }, 800);\n' +
'              \n' +
'            } else {\n' +
'              throw new Error(result.error);\n' +
'            }\n' +
'          }).catch(function(error) {\n' +
'            DOM.nextBtn.disabled = false;\n' +
'            DOM.nextBtn.textContent = "Next →";\n' +
'            DOM.nextBtn.classList.remove("success");\n' +
'            Utils.showError(error.message || "Failed to save draft. Please try again.");\n' +
'            console.error("Draft save error:", error);\n' +
'          });\n' +
'          \n' +
'        } catch (error) {\n' +
'          Utils.showError(error.message || "Please fill in all required fields correctly");\n' +
'          console.error("Form validation error:", error);\n' +
'        }\n' +
'      },\n' +
'      handleReset: function() {\n' +
'        DOM.form.reset();\n' +
'        Utils.clearErrors();\n' +
'      }\n' +
'    };\n' +
'\n' +
'    function loadSavedData() {\n' +
'      try {\n' +
'        var savedData = sessionStorage.getItem("aladin_customer_data");\n' +
'        if (savedData) {\n' +
'          var data = JSON.parse(savedData);\n' +
'          for (var key in data) {\n' +
'            if (data.hasOwnProperty(key) && key !== "createdAt") {\n' +
'              var element = document.getElementById(key);\n' +
'              if (element) element.value = data[key];\n' +
'            }\n' +
'          }\n' +
'          console.log("Loaded saved customer data");\n' +
'        }\n' +
'      } catch (error) {\n' +
'        console.error("Error loading saved data:", error);\n' +
'      }\n' +
'    }\n' +
'\n' +
'    function init() {\n' +
'      DOM.form.addEventListener("submit", FormHandler.handleSubmit);\n' +
'      DOM.resetBtn.addEventListener("click", FormHandler.handleReset);\n' +
'      \n' +
'      var inputs = DOM.form.querySelectorAll("input");\n' +
'      for (var i = 0; i < inputs.length; i++) {\n' +
'        inputs[i].addEventListener("input", function() {\n' +
'          this.classList.remove("error");\n' +
'        });\n' +
'      }\n' +
'      \n' +
'      loadSavedData();\n' +
'      console.log("Danfoss ALADIN customer form initialized");\n' +
'    }\n' +
'    \n' +
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
        fileName: 'customer-input.html'
      }
    }
  }
];
