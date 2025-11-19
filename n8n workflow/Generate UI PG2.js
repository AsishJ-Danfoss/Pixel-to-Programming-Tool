// n8n Code Node: Motor Configuration Selector
// This node receives motor data and returns an HTML page with the selector UI
// Compatible with n8n vm2 environment (ES5 only)

// Input: $json should contain the motor data response
// Output: Returns HTML page as binary for immediate display

// Extract customer data from webhook
var webhookData = $('PG2 Webhook').first().json.body || {};
var customerData = {
  customerName: webhookData.customerName || '',
  locationOfInstallation: webhookData.locationOfInstallation || '',
  contactPerson: webhookData.contactPerson || '',
  mobileNumber: webhookData.mobileNumber || '',
  motorType: webhookData.motorType || '',
  vfdType: webhookData.vfdType || '',
  applicationType: webhookData.applicationType || ''
};

var motorDataJson = JSON.stringify($json);
var customerDataJson = JSON.stringify(customerData);

var htmlContent = '<!DOCTYPE html>' +
'<html lang="en">' +
'<head>' +
'  <meta charset="UTF-8">' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
'  <title>Motor Configuration Selector - Danfoss ALADIN</title>' +
'  <style>' +
'    * {' +
'      margin: 0;' +
'      padding: 0;' +
'      box-sizing: border-box;' +
'    }' +
'    body {' +
'      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;' +
'      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);' +
'      min-height: 100vh;' +
'      padding: 20px;' +
'      display: flex;' +
'      justify-content: center;' +
'      align-items: center;' +
'    }' +
'    .container {' +
'      background: white;' +
'      border-radius: 12px;' +
'      box-shadow: 0 20px 60px rgba(0,0,0,0.3);' +
'      padding: 30px;' +
'      max-width: 1200px;' +
'      width: 100%;' +
'    }' +
'    .header {' +
'      text-align: center;' +
'      margin-bottom: 30px;' +
'      padding-bottom: 20px;' +
'      border-bottom: 2px solid #e5e7eb;' +
'    }' +
'    .header h1 {' +
'      color: #1f2937;' +
'      font-size: 28px;' +
'      margin-bottom: 8px;' +
'    }' +
'    .header .subtitle {' +
'      color: #6b7280;' +
'      font-size: 14px;' +
'    }' +
'    .customer-info {' +
'      background: #f0f9ff;' +
'      padding: 20px;' +
'      border-radius: 8px;' +
'      margin-bottom: 25px;' +
'      border-left: 4px solid #0284c7;' +
'    }' +
'    .customer-info h3 {' +
'      color: #0c4a6e;' +
'      font-size: 16px;' +
'      margin-bottom: 12px;' +
'      font-weight: 600;' +
'    }' +
'    .customer-info-grid {' +
'      display: grid;' +
'      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));' +
'      gap: 12px;' +
'    }' +
'    .customer-info-item {' +
'      display: flex;' +
'      flex-direction: column;' +
'    }' +
'    .customer-info-label {' +
'      font-size: 12px;' +
'      color: #64748b;' +
'      font-weight: 600;' +
'      margin-bottom: 4px;' +
'    }' +
'    .customer-info-value {' +
'      font-size: 14px;' +
'      color: #1e293b;' +
'      font-weight: 500;' +
'    }' +
'    .model-info {' +
'      background: #f3f4f6;' +
'      padding: 15px;' +
'      border-radius: 8px;' +
'      margin-bottom: 25px;' +
'      text-align: center;' +
'    }' +
'    .model-info strong {' +
'      color: #374151;' +
'      font-size: 18px;' +
'    }' +
'    .section-title {' +
'      font-size: 18px;' +
'      font-weight: 600;' +
'      color: #1f2937;' +
'      margin-bottom: 15px;' +
'      padding-bottom: 10px;' +
'      border-bottom: 2px solid #e5e7eb;' +
'    }' +
'    .ratings-table-wrapper {' +
'      overflow-x: auto;' +
'      margin-bottom: 30px;' +
'    }' +
'    table {' +
'      width: 100%;' +
'      border-collapse: collapse;' +
'      background: white;' +
'    }' +
'    th {' +
'      background: #667eea;' +
'      color: white;' +
'      padding: 12px;' +
'      text-align: left;' +
'      font-weight: 600;' +
'      font-size: 13px;' +
'      white-space: nowrap;' +
'    }' +
'    td {' +
'      padding: 12px;' +
'      border-bottom: 1px solid #e5e7eb;' +
'      font-size: 14px;' +
'      color: #374151;' +
'    }' +
'    tr:hover {' +
'      background: #f9fafb;' +
'    }' +
'    tr.selected {' +
'      background: #dbeafe !important;' +
'    }' +
'    input[type="radio"] {' +
'      cursor: pointer;' +
'      width: 18px;' +
'      height: 18px;' +
'    }' +
'    .config-form {' +
'      display: none;' +
'      background: #f9fafb;' +
'      padding: 25px;' +
'      border-radius: 8px;' +
'      margin-bottom: 25px;' +
'    }' +
'    .config-form.active {' +
'      display: block;' +
'    }' +
'    .form-grid {' +
'      display: grid;' +
'      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));' +
'      gap: 20px;' +
'      margin-bottom: 20px;' +
'    }' +
'    .form-group {' +
'      display: flex;' +
'      flex-direction: column;' +
'    }' +
'    label {' +
'      font-weight: 600;' +
'      color: #374151;' +
'      margin-bottom: 6px;' +
'      font-size: 14px;' +
'    }' +
'    select, input[type="number"] {' +
'      padding: 10px;' +
'      border: 1px solid #d1d5db;' +
'      border-radius: 6px;' +
'      font-size: 14px;' +
'      color: #1f2937;' +
'      background: white;' +
'    }' +
'    select:focus, input[type="number"]:focus {' +
'      outline: none;' +
'      border-color: #667eea;' +
'      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);' +
'    }' +
'    .json-output {' +
'      background: #1f2937;' +
'      color: #10b981;' +
'      padding: 15px;' +
'      border-radius: 6px;' +
'      font-family: "Courier New", monospace;' +
'      font-size: 12px;' +
'      max-height: 300px;' +
'      overflow-y: auto;' +
'      white-space: pre-wrap;' +
'      word-break: break-all;' +
'      margin-bottom: 20px;' +
'    }' +
'    .button-group {' +
'      display: flex;' +
'      gap: 15px;' +
'      justify-content: center;' +
'    }' +
'    button {' +
'      padding: 12px 30px;' +
'      border: none;' +
'      border-radius: 6px;' +
'      font-size: 16px;' +
'      font-weight: 600;' +
'      cursor: pointer;' +
'      transition: all 0.3s ease;' +
'    }' +
'    .btn-primary {' +
'      background: #667eea;' +
'      color: white;' +
'    }' +
'    .btn-primary:hover {' +
'      background: #5568d3;' +
'      transform: translateY(-2px);' +
'      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);' +
'    }' +
'    .btn-primary:disabled {' +
'      background: #9ca3af;' +
'      cursor: not-allowed;' +
'      transform: none;' +
'    }' +
'    .btn-secondary {' +
'      background: #e5e7eb;' +
'      color: #374151;' +
'    }' +
'    .btn-secondary:hover {' +
'      background: #d1d5db;' +
'    }' +
'    .error-message {' +
'      background: #fee2e2;' +
'      color: #991b1b;' +
'      padding: 12px;' +
'      border-radius: 6px;' +
'      margin-bottom: 20px;' +
'      border-left: 4px solid #dc2626;' +
'    }' +
'    .success-message {' +
'      background: #d1fae5;' +
'      color: #065f46;' +
'      padding: 12px;' +
'      border-radius: 6px;' +
'      margin-bottom: 20px;' +
'      border-left: 4px solid #10b981;' +
'    }' +
'    .loading {' +
'      text-align: center;' +
'      padding: 40px;' +
'      color: #6b7280;' +
'    }' +
'    @media (max-width: 768px) {' +
'      .container {' +
'        padding: 20px;' +
'      }' +
'      .form-grid {' +
'        grid-template-columns: 1fr;' +
'      }' +
'      th, td {' +
'        padding: 8px;' +
'        font-size: 12px;' +
'      }' +
'    }' +
'  </style>' +
'</head>' +
'<body>' +
'  <div class="container">' +
'    <div class="header">' +
'      <h1>Motor Configuration Selector</h1>' +
'      <div class="subtitle">Select a motor rating and configure parameters</div>' +
'    </div>' +
'    <div id="appContainer"></div>' +
'  </div>' +
'' +
'  <script>' +
'    (function() {' +
'      var motorData = ' + motorDataJson + ';' +
'      var customerData = ' + customerDataJson + ';' +
'      var parsedData = null;' +
'      var selectedRating = null;' +
'' +
'      function parseMotorData(response) {' +
'        try {' +
'          if (!response || typeof response !== "object") {' +
'            throw new Error("Invalid response format");' +
'          }' +
'          var content = response.content || response;' +
'          if (Array.isArray(response) && response.length > 0) {' +
'            content = response[0].content;' +
'          }' +
'          if (!content || !content.parts || !Array.isArray(content.parts)) {' +
'            throw new Error("Missing content.parts in response");' +
'          }' +
'          var text = content.parts[0].text;' +
'          if (!text) {' +
'            throw new Error("No text found in content.parts[0]");' +
'          }' +
'          var jsonMatch = text.match(/```json\\s*([\\s\\S]*?)```/);' +
'          if (!jsonMatch) {' +
'            jsonMatch = text.match(/```\\s*([\\s\\S]*?)```/);' +
'          }' +
'          if (!jsonMatch) {' +
'            throw new Error("No JSON code block found in response");' +
'          }' +
'          var jsonStr = jsonMatch[1].trim();' +
'          var data = JSON.parse(jsonStr);' +
'          if (!data.model_number || !Array.isArray(data.ratings)) {' +
'            throw new Error("Invalid motor data structure");' +
'          }' +
'          return data;' +
'        } catch (e) {' +
'          throw new Error("Failed to parse motor data: " + e.message);' +
'        }' +
'      }' +
'' +
'      function renderError(message) {' +
'        document.getElementById("appContainer").innerHTML = ' +
'          "<div class=\\"error-message\\">" + message + "</div>";' +
'      }' +
'' +
'      function renderCustomerInfo() {' +
'        var html = "<div class=\\"customer-info\\">";' +
'        html += "<h3>Customer Information</h3>";' +
'        html += "<div class=\\"customer-info-grid\\">";' +
'        ' +
'        if (customerData.customerName) {' +
'          html += "<div class=\\"customer-info-item\\">";' +
'          html += "<span class=\\"customer-info-label\\">Customer Name:</span>";' +
'          html += "<span class=\\"customer-info-value\\">" + customerData.customerName + "</span>";' +
'          html += "</div>";' +
'        }' +
'        ' +
'        if (customerData.locationOfInstallation) {' +
'          html += "<div class=\\"customer-info-item\\">";' +
'          html += "<span class=\\"customer-info-label\\">Location:</span>";' +
'          html += "<span class=\\"customer-info-value\\">" + customerData.locationOfInstallation + "</span>";' +
'          html += "</div>";' +
'        }' +
'        ' +
'        if (customerData.contactPerson) {' +
'          html += "<div class=\\"customer-info-item\\">";' +
'          html += "<span class=\\"customer-info-label\\">Contact Person:</span>";' +
'          html += "<span class=\\"customer-info-value\\">" + customerData.contactPerson + "</span>";' +
'          html += "</div>";' +
'        }' +
'        ' +
'        if (customerData.mobileNumber) {' +
'          html += "<div class=\\"customer-info-item\\">";' +
'          html += "<span class=\\"customer-info-label\\">Mobile:</span>";' +
'          html += "<span class=\\"customer-info-value\\">" + customerData.mobileNumber + "</span>";' +
'          html += "</div>";' +
'        }' +
'        ' +
'        if (customerData.motorType) {' +
'          html += "<div class=\\"customer-info-item\\">";' +
'          html += "<span class=\\"customer-info-label\\">Motor Type:</span>";' +
'          html += "<span class=\\"customer-info-value\\">" + customerData.motorType + "</span>";' +
'          html += "</div>";' +
'        }' +
'        ' +
'        if (customerData.vfdType) {' +
'          html += "<div class=\\"customer-info-item\\">";' +
'          html += "<span class=\\"customer-info-label\\">VFD Type:</span>";' +
'          html += "<span class=\\"customer-info-value\\">" + customerData.vfdType + "</span>";' +
'          html += "</div>";' +
'        }' +
'        ' +
'        if (customerData.applicationType) {' +
'          html += "<div class=\\"customer-info-item\\">";' +
'          html += "<span class=\\"customer-info-label\\">Application:</span>";' +
'          html += "<span class=\\"customer-info-value\\">" + customerData.applicationType + "</span>";' +
'          html += "</div>";' +
'        }' +
'        ' +
'        html += "</div></div>";' +
'        return html;' +
'      }' +
'' +
'      function renderTable() {' +
'        var headers = ["Select"];' +
'        if (parsedData.ratings.length > 0) {' +
'          for (var key in parsedData.ratings[0]) {' +
'            if (parsedData.ratings[0].hasOwnProperty(key)) {' +
'              headers.push(key);' +
'            }' +
'          }' +
'        }' +
'' +
'        var tableHtml = renderCustomerInfo();' +
'        tableHtml += "<div class=\\"model-info\\"><strong>Motor Model: " + parsedData.model_number + "</strong></div>";' +
'        tableHtml += "<h2 class=\\"section-title\\">Available Ratings</h2>";' +
'        tableHtml += "<div class=\\"ratings-table-wrapper\\">";' +
'        tableHtml += "<table><thead><tr>";' +
'' +
'        for (var i = 0; i < headers.length; i++) {' +
'          tableHtml += "<th>" + headers[i] + "</th>";' +
'        }' +
'        tableHtml += "</tr></thead><tbody>";' +
'' +
'        for (var j = 0; j < parsedData.ratings.length; j++) {' +
'          var rating = parsedData.ratings[j];' +
'          tableHtml += "<tr id=\\"row-" + j + "\\">";' +
'          tableHtml += "<td><input type=\\"radio\\" name=\\"rating\\" value=\\"" + j + "\\"></td>";' +
'          for (var key in rating) {' +
'            if (rating.hasOwnProperty(key)) {' +
'              tableHtml += "<td>" + rating[key] + "</td>";' +
'            }' +
'          }' +
'          tableHtml += "</tr>";' +
'        }' +
'' +
'        tableHtml += "</tbody></table></div>";' +
'        tableHtml += renderConfigForm();' +
'        tableHtml += "<div id=\\"messageContainer\\"></div>";' +
'        tableHtml += "<div id=\\"jsonOutput\\" class=\\"json-output\\" style=\\"display:none;\\"></div>";' +
'        tableHtml += "<div class=\\"button-group\\">";' +
'        tableHtml += "<button id=\\"submitBtn\\" class=\\"btn-primary\\" disabled>Submit Configuration</button>";' +
'        tableHtml += "<button id=\\"resetBtn\\" class=\\"btn-secondary\\">Reset</button>";' +
'        tableHtml += "</div>";' +
'' +
'        document.getElementById("appContainer").innerHTML = tableHtml;' +
'        attachEventListeners();' +
'      }' +
'' +
'      function renderConfigForm() {' +
'        var html = "<div id=\\"configForm\\" class=\\"config-form\\">";' +
'        html += "<h2 class=\\"section-title\\">Configuration Parameters</h2>";' +
'        html += "<div class=\\"form-grid\\">";' +
'' +
'        html += "<div class=\\"form-group\\">";' +
'        html += "<label for=\\"controlMode\\">Control Mode:</label>";' +
'        html += "<select id=\\"controlMode\\" required>";' +
'        html += "<option value=\\"0\\">0 - Speed Control</option>";' +
'        html += "<option value=\\"3\\">3 - Torque Control</option>";' +
'        html += "</select></div>";' +
'' +
'        html += "<div class=\\"form-group\\">";' +
'        html += "<label for=\\"motorControlPrinciple\\">Motor Control Principle:</label>";' +
'        html += "<select id=\\"motorControlPrinciple\\" required>";' +
'        html += "<option value=\\"0\\">0 - U/f Control</option>";' +
'        html += "<option value=\\"1\\">1 - VVC+ Control</option>";' +
'        html += "</select></div>";' +
'' +
'        html += "<div class=\\"form-group\\">";' +
'        html += "<label for=\\"motorConstruction\\">Motor Construction:</label>";' +
'        html += "<select id=\\"motorConstruction\\" required>";' +
'        html += "<option value=\\"0\\">0 - Async Motor</option>";' +
'        html += "<option value=\\"1\\">1 - PM Motor, Surf Mount</option>";' +
'        html += "<option value=\\"2\\">2 - PM Motor, Interior Mount</option>";' +
'        html += "<option value=\\"5\\">5 - Sync Reluctance Motor</option>";' +
'        html += "<option value=\\"6\\">6 - Async Motor (AEO)</option>";' +
'        html += "</select></div>";' +
'' +
'        html += "<div class=\\"form-group\\">";' +
'        html += "<label for=\\"referenceSite\\">Reference Site:</label>";' +
'        html += "<select id=\\"referenceSite\\" required>";' +
'        html += "<option value=\\"1\\">1 - Digital/Bus</option>";' +
'        html += "<option value=\\"2\\">2 - Analog Input 53</option>";' +
'        html += "</select></div>";' +
'' +
'        html += "<div class=\\"form-group\\">";' +
'        html += "<label for=\\"currentLimit\\">Current Limit (A):</label>";' +
'        html += "<input type=\\"number\\" id=\\"currentLimit\\" step=\\"0.1\\" required></div>";' +
'' +
'        html += "<div class=\\"form-group\\">";' +
'        html += "<label for=\\"torqueLimit\\">Torque Limit (%):</label>";' +
'        html += "<input type=\\"number\\" id=\\"torqueLimit\\" value=\\"100\\" min=\\"0\\" max=\\"200\\" step=\\"0.1\\" required></div>";' +
'' +
'        html += "</div></div>";' +
'        return html;' +
'      }' +
'' +
'      function attachEventListeners() {' +
'        var radios = document.getElementsByName("rating");' +
'        for (var i = 0; i < radios.length; i++) {' +
'          radios[i].addEventListener("change", handleRatingSelection);' +
'        }' +
'' +
'        var configInputs = document.querySelectorAll("#configForm select, #configForm input");' +
'        for (var j = 0; j < configInputs.length; j++) {' +
'          configInputs[j].addEventListener("change", updateJsonOutput);' +
'          configInputs[j].addEventListener("input", updateJsonOutput);' +
'        }' +
'' +
'        document.getElementById("submitBtn").addEventListener("click", handleSubmit);' +
'        document.getElementById("resetBtn").addEventListener("click", handleReset);' +
'      }' +
'' +
'      function handleRatingSelection(event) {' +
'        var selectedIndex = parseInt(event.target.value);' +
'        selectedRating = parsedData.ratings[selectedIndex];' +
'' +
'        var rows = document.querySelectorAll("tbody tr");' +
'        for (var i = 0; i < rows.length; i++) {' +
'          rows[i].classList.remove("selected");' +
'        }' +
'        document.getElementById("row-" + selectedIndex).classList.add("selected");' +
'' +
'        var configForm = document.getElementById("configForm");' +
'        configForm.classList.add("active");' +
'' +
'        var currentValue = selectedRating.Current || selectedRating.current;' +
'        if (currentValue) {' +
'          document.getElementById("currentLimit").value = currentValue;' +
'        }' +
'' +
'        updateJsonOutput();' +
'      }' +
'' +
'      function updateJsonOutput() {' +
'        if (!selectedRating) return;' +
'' +
'        var config = {' +
'          customer_info: {' +
'            customer_name: customerData.customerName || "",' +
'            location_of_installation: customerData.locationOfInstallation || "",' +
'            contact_person: customerData.contactPerson || "",' +
'            phone: customerData.mobileNumber || "",' +
'            application: customerData.applicationType || "",' +
'            submission_timestamp: new Date().toISOString()' +
'          },' +
'          motor_data: {' +
'            model_number: parsedData.model_number,' +
'            selected_rating: selectedRating' +
'          },' +
'          configuration: {' +
'            control_mode: parseInt(document.getElementById("controlMode").value),' +
'            motor_control_principle: parseInt(document.getElementById("motorControlPrinciple").value),' +
'            motor_construction: parseInt(document.getElementById("motorConstruction").value),' +
'            reference_site: parseInt(document.getElementById("referenceSite").value),' +
'            current_limit: parseFloat(document.getElementById("currentLimit").value) || 0,' +
'            torque_limit: parseFloat(document.getElementById("torqueLimit").value) || 100' +
'          },' +
'          timestamp: new Date().toISOString()' +
'        };' +
'' +
'        var jsonOutput = document.getElementById("jsonOutput");' +
'        jsonOutput.textContent = JSON.stringify(config, null, 2);' +
'        jsonOutput.style.display = "block";' +
'' +
'        var isValid = config.configuration.current_limit > 0;' +
'        document.getElementById("submitBtn").disabled = !isValid;' +
'      }' +
'' +
'      function handleSubmit() {' +
'        var config = JSON.parse(document.getElementById("jsonOutput").textContent);' +
'        var messageContainer = document.getElementById("messageContainer");' +
'        var submitBtn = document.getElementById("submitBtn");' +
'        ' +
'        submitBtn.disabled = true;' +
'        submitBtn.textContent = "Submitting...";' +
'        messageContainer.innerHTML = "<div class=\\"loading\\">Submitting configuration to server...</div>";' +
'        ' +
'        var xhr = new XMLHttpRequest();' +
'        xhr.open("POST", "http://localhost:5678/webhook-test/final-submit", true);' +
'        xhr.setRequestHeader("Content-Type", "application/json");' +
'        ' +
'        xhr.onload = function() {' +
'          if (xhr.status >= 200 && xhr.status < 300) {' +
'            messageContainer.innerHTML = "<div class=\\"success-message\\"><strong>Configuration submitted successfully!</strong><br>Your motor configuration has been sent to the server.<br>Status: " + xhr.status + "</div>";' +
'            submitBtn.textContent = "Submitted ✓";' +
'            console.log("Server Response:", xhr.responseText);' +
'          } else {' +
'            messageContainer.innerHTML = "<div class=\\"error-message\\"><strong>Submission failed!</strong><br>Server returned status: " + xhr.status + "<br>Please try again or contact support.</div>";' +
'            submitBtn.textContent = "Submit Configuration";' +
'            submitBtn.disabled = false;' +
'          }' +
'        };' +
'        ' +
'        xhr.onerror = function() {' +
'          messageContainer.innerHTML = "<div class=\\"error-message\\"><strong>Network error!</strong><br>Could not connect to the server.<br>Please check if the webhook URL is correct and the server is running.</div>";' +
'          submitBtn.textContent = "Submit Configuration";' +
'          submitBtn.disabled = false;' +
'        };' +
'        ' +
'        xhr.send(JSON.stringify(config));' +
'        console.log("Motor Configuration:", config);' +
'      }' +
'' +
'      function handleReset() {' +
'        selectedRating = null;' +
'        renderTable();' +
'      }' +
'' +
'      try {' +
'        parsedData = parseMotorData(motorData);' +
'        renderTable();' +
'      } catch (e) {' +
'        renderError("Error: " + e.message);' +
'      }' +
'    })();' +
'  </script>' +
'</body>' +
'</html>';

// Convert HTML string to Buffer for n8n binary format
var buffer = Buffer.from(htmlContent, 'utf-8');

return [
  {
    json: {
      status: 'success',
      message: 'Motor configuration page generated'
    },
    binary: {
      data: {
        data: buffer.toString('base64'),
        mimeType: 'text/html',
        fileName: 'motor-config-selector.html'
      }
    }
  }
];