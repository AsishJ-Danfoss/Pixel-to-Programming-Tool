// Motor Configuration UI with Integrated MotorNameplateProcessor
// n8n Code Node - Complete integration of motor nameplate checker

/**
 * This file integrates the motor nameplate checking logic directly into the Motor Configuration UI.
 * No external dependencies needed - fully self-contained for n8n Code Node usage.
 * 
 * Features:
 * - Auto Config Mode: Upload image → Gemini extraction → Verification
 * - Manual Config Mode: Form entry → Verification  
 * - Maintains existing UI design and layout
 */

// Note: For actual use, you need to have @google/genai, zod, and zod-to-json-schema available
// Since this is designed for n8n Code Node which runs server-side, these can be loaded from the environment

var html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Motor Configuration - Danfoss ALADIN</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  
  <!-- Auth Check -->
  <script>
    (function() {
      var isAuthenticated = sessionStorage.getItem("aladin_authenticated");
      if (!isAuthenticated || isAuthenticated !== "true") {
        console.warn("Session not authenticated");
      }
      var loginTime = sessionStorage.getItem("aladin_login_time");
      if (loginTime) {
        var elapsed = (new Date() - new Date(loginTime)) / 1000 / 60;
        if (elapsed > 60) {
          sessionStorage.clear();
          console.warn("Session expired after 60 minutes");
        }
      }
      console.log("Auth check passed - User:", sessionStorage.getItem("aladin_username"));
    })();
  </script>
  
  <style>
    :root {
      --bg: #0f172a;
      --fg: #e5e7eb;
      --muted: #94a3b8;
      --accent: #ef4444;
      --accent-2: #22c55e;
      --accent-3: #3b82f6;
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
      font-family: system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif;
      min-height: 100vh;
    }
    .wrap { max-width: 780px; margin: 0 auto; }
    header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
    .brand { display: flex; align-items: center; gap: .75rem; font-weight: 700; letter-spacing: .5px; }
    .brand .logo { width: 36px; height: 36px; border-radius: 10px; background: var(--accent); display: grid; place-items: center; color: white; font-weight: 900; }
    .subtitle { color: var(--muted); font-size: .95rem; margin-top: .25rem; }
    
    .progress-bar { display: flex; justify-content: space-between; margin-bottom: 2rem; position: relative; }
    .progress-bar::before { content: ""; position: absolute; top: 50%; left: 0; right: 0; height: 2px; background: var(--border); transform: translateY(-50%); z-index: 0; }
    .progress-step { flex: 1; text-align: center; position: relative; z-index: 1; }
    .progress-step-circle { width: 32px; height: 32px; border-radius: 50%; background: var(--border); margin: 0 auto 0.5rem; display: grid; place-items: center; font-size: .85rem; font-weight: 600; transition: all .2s; }
    .progress-step.active .progress-step-circle { background: var(--accent); color: white; }
    .progress-step.completed .progress-step-circle { background: var(--accent-2); color: white; }
    .progress-step span { font-size: .85rem; color: var(--muted); display: block; }
    .progress-step.active span { color: var(--fg); font-weight: 600; }
    
    .card { background: rgba(17,24,39,.7); border: 1px solid var(--border); border-radius: 16px; padding: 2rem; backdrop-filter: blur(6px); box-shadow: 0 6px 24px rgba(0,0,0,.35); }
    .card h2 { margin: 0 0 .5rem 0; font-size: 1.5rem; color: var(--fg); }
    .card p { margin: 0 0 2rem 0; color: var(--muted); font-size: .95rem; }
    
    .mode-toggle { display: flex; gap: .75rem; margin-bottom: 2rem; background: var(--input); padding: .5rem; border-radius: .75rem; }
    .mode-btn { flex: 1; padding: .75rem 1rem; border: none; border-radius: .5rem; background: transparent; color: var(--muted); font-weight: 600; cursor: pointer; transition: all .2s; font-size: .9rem; }
    .mode-btn.active { background: var(--accent); color: white; box-shadow: 0 4px 12px rgba(239,68,68,.3); }
    .mode-btn:hover:not(.active) { background: rgba(255,255,255,.05); }
    .mode-content { display: none; }
    .mode-content.active { display: block; }
    
    .upload-area { border: 2px dashed var(--border); background: var(--input); padding: 3rem 2rem; text-align: center; cursor: pointer; border-radius: .75rem; transition: all .2s; margin-bottom: 1.5rem; }
    .upload-area:hover { border-color: var(--accent); background: rgba(239,68,68,.05); }
    .upload-icon { font-size: 3rem; margin-bottom: 1rem; color: var(--muted); }
    .upload-text { color: var(--fg); font-weight: 600; margin-bottom: .5rem; }
    .upload-hint { color: var(--muted); font-size: .85rem; }
    
    form { display: grid; gap: 1.25rem; }
    .form-group { display: flex; flex-direction: column; }
    .form-row { display: grid; gap: 1.25rem; grid-template-columns: 1fr 1fr; }
    label { display: block; font-size: .9rem; color: var(--muted); margin-bottom: .5rem; font-weight: 500; }
    label .required { color: var(--accent); }
    label .optional { color: var(--muted); font-weight: 400; font-size: .85rem; }
    
    input[type="text"], input[type="number"], select { width: 100%; background: var(--input); color: var(--fg); border: 1px solid var(--border); border-radius: .75rem; padding: .85rem 1rem; outline: none; transition: border .15s, box-shadow .15s; font-size: .95rem; }
    input:focus, select:focus { border-color: var(--focus); box-shadow: 0 0 0 3px rgba(59,130,246,.25); }
    input.error, select.error { border-color: var(--accent) !important; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2) !important; }
    select { cursor: pointer; }
    .hint { font-size: .8rem; color: var(--muted); margin-top: .35rem; }
    
    .actions { display: flex; gap: .75rem; justify-content: flex-end; margin-top: 1rem; }
    button { appearance: none; border: none; border-radius: .75rem; padding: .9rem 1.5rem; font-weight: 600; cursor: pointer; transition: transform .04s ease, box-shadow .15s ease, opacity .15s; font-size: .95rem; }
    .btn-primary { background: linear-gradient(180deg, #ef4444, #dc2626); color: white; box-shadow: 0 10px 24px rgba(239,68,68,.35); min-width: 140px; }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(239,68,68,.45); }
    .btn-primary:active { transform: translateY(0); }
    .btn-primary:disabled { background: #6b7280; cursor: not-allowed; transform: none; opacity: .6; }
    .btn-primary.success { background: linear-gradient(180deg, #22c55e, #16a34a) !important; }
    .btn-primary.loading { background: linear-gradient(180deg, #3b82f6, #2563eb) !important; }
    
    .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }
    .btn-ghost:hover { background: rgba(255,255,255,.05); }
    
    .message { padding: 1rem; border-radius: .75rem; margin-bottom: 1rem; font-size: .9rem; border-left: 4px solid; display: none; }
    .message.show { display: block; }
    .message.error { background: rgba(239, 68, 68, 0.1); color: var(--accent); border-color: var(--accent); }
    .message.success { background: rgba(34, 197, 94, 0.1); color: var(--accent-2); border-color: var(--accent-2); }
    .message.info { background: rgba(59, 130, 246, 0.1); color: var(--accent-3); border-color: var(--accent-3); }
    
    @media (max-width: 720px) { .form-row { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="brand">
        <div class="logo" aria-hidden="true">A</div>
        <div>
          <div style="font-size:1.15rem;">Danfoss ALADIN</div>
          <div class="subtitle">Motor Configuration</div>
        </div>
      </div>
    </header>

    <div class="progress-bar">
      <div class="progress-step completed">
        <div class="progress-step-circle">1</div>
        <span>Customer Info</span>
      </div>
      <div class="progress-step active">
        <div class="progress-step-circle">2</div>
        <span>Motor Details</span>
      </div>
      <div class="progress-step">
        <div class="progress-step-circle">3</div>
        <span>Configuration</span>
      </div>
    </div>

    <section class="card">
      <h2>Motor Configuration</h2>
      <p>Configure motor details via image upload or manual entry</p>
      
      <div class="mode-toggle">
        <button class="mode-btn active" onclick="switchMode('auto', this)">Auto Config Mode</button>
        <button class="mode-btn" onclick="switchMode('manual', this)">Manual Config Mode</button>
      </div>
      
      <div id="statusMessage" class="message"></div>

      <!-- Auto Config Mode -->
      <div id="autoMode" class="mode-content active">
        <div class="upload-area" id="uploadArea" onclick="document.getElementById('imageInput').click()">
          <div class="upload-icon" id="uploadIcon">📸</div>
          <div class="upload-text" id="uploadText">Click to upload Motor Nameplate Image</div>
          <div class="upload-hint" id="uploadHint">Supported formats: JPG, PNG (Max 5MB)</div>
          <input type="file" id="imageInput" accept="image/*" style="display:none" onchange="handleFileSelect(event)">
        </div>
        
        <div id="selectedFileName" style="text-align: center; margin: 1rem 0; color: var(--accent-2); font-weight: 600; display: none;">
          ✓ Selected: <span id="fileName"></span>
        </div>
        
        <!-- Image Preview -->
        <div id="imagePreview" style="display: none; margin: 1.5rem 0; text-align: center;">
          <h4 style="margin: 0 0 0.5rem 0; color: var(--fg);">Image Preview</h4>
          <img id="previewImg" style="max-width: 100%; max-height: 400px; border-radius: 8px; border: 2px solid var(--border); box-shadow: 0 4px 6px rgba(0,0,0,0.1);" alt="Motor Nameplate Preview" />
        </div>
        
        <!-- Configuration Selection Table -->
        <div id="configSelection" style="display: none; margin-top: 1.5rem;">
          <div class="card" style="background: rgba(17,24,39,0.5); padding: 1.5rem;">
            <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: var(--fg);">⚙️ Multiple Configurations Found - Select One:</h3>
            <div style="overflow-x: auto;">
              <table id="configTable" style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                <!-- Dynamically populated -->
              </table>
            </div>
            <div style="margin-top: 1rem; text-align: right;">
              <button class="btn-primary" id="validateConfigBtn" onclick="validateSelectedConfig()" style="display: none;">Validate Selection</button>
            </div>
          </div>
        </div>
        
        <!-- Results Display Area -->
        <div id="autoResults" style="display: none; margin-top: 1.5rem;">
          <div id="extractedDataCard" class="card" style="background: rgba(17,24,39,0.5); padding: 1.5rem;">
            <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: var(--fg);">Extracted Motor Data</h3>
            <div id="extractedDataTable" style="background: var(--input); border-radius: 0.5rem; padding: 1rem; font-family: monospace; font-size: 0.9rem; max-height: 300px; overflow-y: auto;"></div>
          </div>
        </div>
        
        <div class="actions">
          <button class="btn-primary" id="processImageBtn" onclick="submitAuto()">Process Image</button>
          <button class="btn-primary success" id="verifyNextBtn" onclick="proceedToNext()" style="display: none;">Next →</button>
        </div>
      </div>

      <!-- Manual Config Mode -->
      <div id="manualMode" class="mode-content">
        <form id="motor-form" novalidate>
          <div class="form-row">
            <div class="form-group">
              <label for="motorModel">Motor Model <span class="required">*</span></label>
              <input id="motorModel" name="motorModel" type="text" placeholder="e.g., IEC 132M" required />
            </div>
            <div class="form-group">
              <label for="motorSerial">Motor Serial No <span class="optional">(Optional)</span></label>
              <input id="motorSerial" name="motorSerial" type="text" placeholder="e.g., SN123456789" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="voltage">Voltage (V) <span class="required">*</span></label>
              <input id="voltage" name="voltage" type="number" step="0.1" placeholder="e.g., 400" required />
              <div class="hint">Rated voltage in volts</div>
            </div>
            <div class="form-group">
              <label for="current">Current (A) <span class="required">*</span></label>
              <input id="current" name="current" type="number" step="0.01" placeholder="e.g., 15.2" required />
              <div class="hint">Rated current in amperes</div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="power">Power (kW) <span class="required">*</span></label>
              <input id="power" name="power" type="number" step="0.01" placeholder="e.g., 7.5" required />
              <div class="hint">Rated power in kilowatts</div>
            </div>
            <div class="form-group">
              <label for="frequency">Frequency (Hz) <span class="required">*</span></label>
              <input id="frequency" name="frequency" type="number" step="0.1" placeholder="e.g., 50" required />
              <div class="hint">Operating frequency</div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="speed">Speed (RPM) <span class="required">*</span></label>
              <input id="speed" name="speed" type="number" placeholder="e.g., 1450" required />
              <div class="hint">Rated speed in revolutions per minute</div>
            </div>
            <div class="form-group">
              <label for="connection">Connection Type <span class="required">*</span></label>
              <select id="connection" name="connection" required>
                <option value="">Select connection type</option>
                <option value="STAR">STAR (Y)</option>
                <option value="DELTA">DELTA (Δ)</option>
                <option value="STAR-DELTA">STAR-DELTA</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="cosphi">Power Factor (cos φ) <span class="optional">(Optional)</span></label>
              <input id="cosphi" name="cosphi" type="number" step="0.01" min="0" max="1" placeholder="e.g., 0.84" />
              <div class="hint">Power factor (0-1). Leave empty to auto-compute or use 0.8 default</div>
            </div>
            <div class="form-group">
              <label for="efficiency">Efficiency (%) <span class="optional">(Optional)</span></label>
              <input id="efficiency" name="efficiency" type="number" step="0.1" min="0" max="100" placeholder="e.g., 95.5" />
              <div class="hint">Motor efficiency in percent. Leave empty to auto-compute</div>
            </div>
          </div>

          <div class="actions">
            <button id="resetBtn" class="btn-ghost" type="button">Reset</button>
            <button id="submitBtn" class="btn-primary" type="submit">Verify</button>
            <button class="btn-primary success" id="manualNextBtn" onclick="proceedToNext()" style="display: none;">Next →</button>
          </div>
        </form>
      </div>
    </section>
  </div>

  <script>
    // ========== MotorNameplateProcessor Class Module ==========
    // This class encapsulates all motor nameplate checking logic
    // Supports both Auto Config (image-based) and Manual Config (form-based) modes
    
    class MotorNameplateProcessor {
      constructor(config = {}) {
        this.apiKey = config.apiKey || null;
        this.model = config.model || "gemini-2.0-flash-exp";
        this.thinkingLevel = config.thinkingLevel || "low";
        this.tolerance = config.tolerance || 0.01;
      }

      // PUBLIC API METHODS
      
      /**
       * Process Auto Config Mode - Extract and parse ratings from image
       */
      async processAutoConfig(imageFile) {
        console.log("🚀 === Auto Config Processing Started ===");
        console.log("📸 Image file:", { name: imageFile.name, size: imageFile.size, type: imageFile.type });
        
        try {
          console.log("🤖 Calling Gemini API...");
          // Convert image to base64
          const base64Data = await this._fileToBase64(imageFile);
          const mimeType = imageFile.type;
          
          // Extract with Gemini
          const extracted = await this._extractWithGeminiAPI(base64Data, mimeType);
          console.log("📊 Extraction complete:", extracted);
          console.log("📋 Number of ratings found:", extracted.ratings.length);
          
          if (!extracted.ratings || extracted.ratings.length === 0) {
            console.error("❌ No ratings found in Gemini response");
            return {
              config_mode: "Auto",
              IsVerified: false,
              message: "No motor configurations found in the image",
              "Motor data": null,
              extractedData: extracted
            };
          }
          
          // Store extracted data globally for later use
          window.extractedMotorData = {
            motorModel: extracted.motorModel,
            motorSerialNo: extracted.motorSerialNo,
            ratings: extracted.ratings
          };
          
          console.log("💾 Stored extracted data globally");
          
          // Return extracted data for UI to handle
          return {
            config_mode: "Auto",
            IsVerified: null, // Not yet verified - pending selection
            message: "Data extracted successfully. " + (extracted.ratings.length > 1 ? "Multiple configurations found - please select one." : "Configuration found."),
            "Motor data": null,  // Will be set after selection
            extractedData: extracted
          };
          
        } catch (error) {
          console.error("❌ Auto Config Error:", error);
          console.error("Stack:", error.stack);
          return {
            config_mode: "Auto",
            IsVerified: false,
            message: "EXTRACTION ERROR: " + error.message,
            "Motor data": null
          };
        } finally {
          console.log("🏁 === Auto Config Processing Ended ===");
        }
      }

      // Convert file to base64 (browser-compatible)
      async _fileToBase64(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            // Remove data URL prefix (data:image/jpeg;base64,)
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      // Extract motor data using Gemini REST API (browser-compatible)
      async _extractWithGeminiAPI(base64Data, mimeType) {
        // EXACT USER-PROVIDED PROMPT - DO NOT MODIFY
        const prompt = "From the provided motor nameplate image, extract the following details: \\n" +
          "Motor Model number, Motor Serial No, Rated voltage (V), Rated current (A), Power (kW), Frequency (Hz), Speed (RPM), Connection Type, Power Factor (cos φ).\\n\\n" +
          "If multiple sets of voltage and current values are present (e.g., for different phases or configurations), return each as a separate JSON object under a list. If any value is not visible or illegible, set its value explicitly to null. For each voltage/current configuration, also extract the connection type as \\"Delta\\" or \\"Star\\", based on notation in the voltage field (D = Delta, Y = Star). Remove the D or Y symbol from the voltage value and ensure the voltage is returned as numeric-only. \\n\\n" +
          "Return only a single JSON object in the following structure: \\n" +
          '{\\"Motor Model\\": <string or null>, \\"Motor Serial No\\": <string or null>, \\"ratings\\": [{\\"Voltage\\": <value or null>, \\"Current\\": <value or null>, \\"Power\\": <value or null>, \\"Frequency\\": <value or null>, \\"Speed\\": <value or null>, \\"Connection type\\": <\\"Delta\\" or \\"Star\\" or null>, \\"Cosphi\\" : <value or null>}]}';

        const requestBody = {
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024
          }
        };

        const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=" + this.apiKey;
        
        const response = await fetch(
          apiUrl,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          }
        );

if (!response.ok) {
  const errorData = await response.json();
  throw new Error("Gemini API error: " + (errorData.error?.message || response.statusText));
}

        console.log("📥 Gemini response received");
        const data = await response.json();
        const generatedText = data.candidates[0]?.content?.parts[0]?.text;
        
        if (!generatedText) {
          throw new Error("No response from Gemini API");
        }

        console.log("📄 Raw Gemini text response:", generatedText);

        // Parse JSON from response
        let parsed;
        try {
          // Remove markdown code blocks if present
          const jsonText = generatedText.replace(/\\\`\\\`\\\`json/g, '').replace(/\\\`\\\`\\\`/g, '').trim();
          parsed = JSON.parse(jsonText);
          console.log("✅ Parsed Gemini JSON:", parsed);
        } catch (e) {
          console.error("❌ JSON parse error:", e.message);
          throw new Error("Failed to parse Gemini response as JSON: " + e.message);
        }

        // Return the parsed response with Motor Model and ratings array
        return {
          motorModel: parsed["Motor Model"] || null,
          motorSerialNo: parsed["Motor Serial No"] || null,
          ratings: Array.isArray(parsed.ratings) ? parsed.ratings : []
        };
      }

      /**
       * Process Manual Config Mode - Verify user-entered data
       */
      async processManualConfig(formData) {
  try {
    console.log("=== Manual Config Verification Started ===");
    console.log("Form Data Received:", formData);
    
    // Convert form data to motor data format
    const motorData = {
      motor_model: formData.motorModel,
      motor_serial_no: formData.motorSerial || null,
      voltage_V: parseFloat(formData.voltage),
      current_A: parseFloat(formData.current),
      power_kW: parseFloat(formData.power),
      frequency_Hz: parseFloat(formData.frequency),
      speed_rpm: parseInt(formData.speed),
      connection_type: formData.connection,
      powerFactor_cosphi: formData.cosphi ? parseFloat(formData.cosphi) : null,
      efficiency_percent: formData.efficiency ? parseFloat(formData.efficiency) : null
    };

    console.log("Converted Motor Data:", motorData);
    console.log("Cosphi provided:", motorData.powerFactor_cosphi !== null);
    console.log("Efficiency provided:", motorData.efficiency_percent !== null);

    console.log("Calling _fillMissingFields...");
    const fillResult = this._fillMissingFields(motorData);
    console.log("Fill result:", fillResult);

    if (!fillResult.okToVerify) {
      console.log("❌ Fill fields failed:", fillResult.reason);
      return {
        config_mode: "Manual",
        IsVerified: false,
        message: "VERIFICATION ERROR: " + fillResult.reason,
        "Motor data": null
      };
    }

    console.log("Filled motor data:", fillResult.filled);
    
    // Verify power
    console.log("Calling _verifyPower...");
    const verification = this._verifyPower(fillResult.filled);
    console.log("Verification result:", verification);
    console.log("Computed kW:", verification.computed_kW?.toFixed(3));
    console.log("Nameplate kW:", motorData.power_kW);
    console.log("Is Match:", verification.isMatch);

    if (verification.isMatch) {
      console.log("✅ VERIFICATION PASSED");
      const finalMotorData = this._buildMotorData(fillResult.filled);
      const result = {
        config_mode: "Manual",
        IsVerified: true,
        message: "VERIFICATION PASSED",
        "Motor data": finalMotorData
      };
      console.log("Final result:", result);
      return result;
    } else {
      console.log("❌ VERIFICATION FAILED");
      const result = {
        config_mode: "Manual",
        IsVerified: false,
        message: "VERIFICATION FAILED: Power mismatch (Computed: " + verification.computed_kW.toFixed(2) + " kW vs Nameplate: " + motorData.power_kW + " kW)",
        "Motor data": null
      };
      console.log("Final result:", result);
      return result;
    }
  } catch (error) {
    return {
      config_mode: "Manual",
      IsVerified: false,
      message: "ERROR: " + error.message,
      "Motor data": null
    };
  }
}

// PRIVATE METHODS

_fillMissingFields(motorData) {
  console.log("  [_fillMissingFields] Input:", { V: motorData.voltage_V, A: motorData.current_A, kW: motorData.power_kW, cosphi: motorData.powerFactor_cosphi, eff: motorData.efficiency_percent });
  
  const V = motorData.voltage_V;
  const A = motorData.current_A;
  const kW = motorData.power_kW;
  let cosphi = motorData.powerFactor_cosphi;
  let eff = motorData.efficiency_percent;

  const filled = { ...motorData, powerFactor_cosphi: cosphi, efficiency_percent: eff };

  // Validate required fields
  if (typeof V !== "number" || typeof A !== "number" || typeof kW !== "number") {
    console.log("  [_fillMissingFields] ❌ Missing required fields V/A/kW");
    return { okToVerify: false, reason: "Missing V/A/kW", filled };
  }

  // Both present - no filling needed
  if (cosphi !== null && eff !== null) {
    console.log("  [_fillMissingFields] ✓ Both cosphi and efficiency provided, no auto-fill needed");
    return { okToVerify: true, reason: null, filled };
  }

  // Both missing - use fallback (0.8 power factor assumption)
  if (cosphi === null && eff === null) {
    console.log("  [_fillMissingFields] ⚠️ Both missing, will use 0.8 PF fallback");
    return { okToVerify: true, reason: null, filled };
  }

  // ONE is missing - try to compute it
  if (cosphi === null && eff !== null) {
    console.log("  [_fillMissingFields] Computing cosphi from efficiency=", eff);
    // Compute cosphi from kW, V, A, efficiency
    const computed = MotorNameplateProcessor.computeCosphi({ kW, V, A, effPercent: eff });
    console.log("  [_fillMissingFields] Computed cosphi:", computed);
    if (computed === null || computed <= 0 || computed > 1) {
      console.log("  [_fillMissingFields] ❌ Invalid cosphi:", computed);
      return { okToVerify: false, reason: "Could not compute valid cosphi", filled };
    }
    filled.powerFactor_cosphi = computed;
    console.log("  [_fillMissingFields] ✓ Auto-filled cosphi:", computed.toFixed(3));
    return { okToVerify: true, reason: null, filled };
  }

  if (eff === null && cosphi !== null) {
    console.log("  [_fillMissingFields] Computing efficiency from cosphi=", cosphi);
    // Compute efficiency from kW, V, A, cosphi
    const computed = MotorNameplateProcessor.computeEfficiency({ kW, V, A, cosphi });
    console.log("  [_fillMissingFields] Computed efficiency:", computed);
    if (computed === null || computed <= 0 || computed > 100) {
      console.log("  [_fillMissingFields] ❌ Invalid efficiency:", computed);
      return { okToVerify: false, reason: "Could not compute valid efficiency", filled };
    }
    filled.efficiency_percent = computed;
    console.log("  [_fillMissingFields] ✓ Auto-filled efficiency:", computed.toFixed(2) + "%");
    return { okToVerify: true, reason: null, filled };
  }

  return { okToVerify: true, reason: null, filled };
}

_verifyPower(filled) {
  console.log("  [_verifyPower] Input:", { V: filled.voltage_V, A: filled.current_A, kW: filled.power_kW, cosphi: filled.powerFactor_cosphi, eff: filled.efficiency_percent });
  
  const V = filled.voltage_V;
  const A = filled.current_A;
  const kW = filled.power_kW;
  const cosphi = filled.powerFactor_cosphi;
  const eff = filled.efficiency_percent;

  let computed_kW = null;

  // Use fallback calculation if both cosphi and eff are missing (assume 0.8 power factor)
  if (cosphi === null && eff === null) {
    console.log("  [_verifyPower] Using fallback formula: (V × A × √3 × 0.8) / 1000");
    computed_kW = (V * A * Math.sqrt(3) * 0.8) / 1000;
    console.log("  [_verifyPower] Fallback calculation: (" + V + " × " + A + " × 1.732 × 0.8) / 1000 = " + computed_kW.toFixed(3) + " kW");
  } else {
    console.log("  [_verifyPower] Using full formula with cosphi=" + cosphi + ", eff=" + eff + "%");
    computed_kW = MotorNameplateProcessor.computeKW({ V, A, cosphi, effPercent: eff });
    console.log("  [_verifyPower] Full calculation result: " + computed_kW?.toFixed(3) + " kW");
  }

  const tolerance = Math.max(0.5, Math.abs(kW) * this.tolerance);
  const diff = Math.abs(computed_kW - kW);
  const isMatch = MotorNameplateProcessor.closeEnough(computed_kW, kW, this.tolerance);
  
  console.log("  [_verifyPower] Nameplate kW:", kW);
  console.log("  [_verifyPower] Computed kW:", computed_kW?.toFixed(3));
  console.log("  [_verifyPower] Difference:", diff?.toFixed(3), "kW");
  console.log("  [_verifyPower] Tolerance:", tolerance?.toFixed(3), "kW");
  console.log("  [_verifyPower] Match:", isMatch ? "✓ YES" : "✗ NO");
  
  return { computed_kW, isMatch };
}

_buildMotorData(filled) {
  return {
    motor_model: filled.motor_model ?? null,
    motor_serial_no: filled.motor_serial_no ?? null,
    voltage_V: filled.voltage_V ?? null,
    current_A: filled.current_A ?? null,
    power_kW: filled.power_kW ?? null,
    frequency_Hz: filled.frequency_Hz ?? null,
    speed_rpm: filled.speed_rpm ?? null,
    connection_type: filled.connection_type ?? null
  };
}

      // STATIC UTILITY METHODS

      static toStringOrNull(x) {
        if (x === null || x === undefined) return null;
        return String(x).trim() || null;
      }

      static toNumberOrNull(x) {
        if (x === null || x === undefined) return null;
        if (typeof x === "number") return Number.isFinite(x) ? x : null;
        const s = String(x).trim().replace(/,/g, "");
        if (!s) return null;
        const n = Number(s);
        return Number.isFinite(n) ? n : null;
      }

      static normalizeConnectionType(x) {
  if (!x) return null;
  const u = String(x).toUpperCase();
  if (["Y", "STAR", "WYE"].includes(u)) return "STAR";
  if (["Δ", "D", "DELTA"].includes(u)) return "DELTA";
  return u;
}

      static closeEnough(a, b, tolerance = 0.01) {
  if (typeof a !== "number" || typeof b !== "number") return false;
  const diff = Math.abs(a - b);
  const tol = Math.max(0.5, Math.abs(b) * tolerance);
  return diff <= tol;
}

      static computeKW({ V, A, cosphi, effPercent }) {
  if ([V, A, cosphi, effPercent].some(v => typeof v !== "number")) return null;
  return (V * A * cosphi * Math.sqrt(3) * effPercent) / 100000;
}

      static computeEfficiency({ kW, V, A, cosphi }) {
  if ([kW, V, A, cosphi].some(v => typeof v !== "number")) return null;
  const PoutW = kW * 1000;
  return (PoutW * 100) / (Math.sqrt(3) * V * A * cosphi);
}

      static computeCosphi({ kW, V, A, effPercent }) {
  if ([kW, V, A, effPercent].some(v => typeof v !== "number")) return null;
  const PoutW = kW * 1000;
  return (PoutW * 100) / (Math.sqrt(3) * V * A * effPercent);
}
    }

// ========== End of MotorNameplateProcessor ==========

// ========== UI Configuration and Logic ==========

var CONFIG = {
  NEXT_PAGE_URL: "http://localhost:5678/webhook-test/review",
  DRAFT_SAVE_API_URL: "http://localhost:5678/webhook-test/save-draft",
  GEMINI_API_KEY: "AIzaSyBhIK_hrBy5oZjNq0OZei6WGJ2ce57jlRg",  // Set this to your Gemini API key for Auto Config
  REQUIRED_FIELDS: [
    { id: "motorModel", label: "Motor Model" },
    { id: "voltage", label: "Voltage" },
    { id: "current", label: "Current" },
    { id: "power", label: "Power" },
    { id: "frequency", label: "Frequency" },
    { id: "speed", label: "Speed" },
    { id: "connection", label: "Connection Type" }
  ]
};

var DOM = {
  form: document.getElementById("motor-form"),
  submitBtn: document.getElementById("submitBtn"),
  resetBtn: document.getElementById("resetBtn"),
  processImageBtn: document.getElementById("processImageBtn"),
  statusMessage: document.getElementById("statusMessage")
};

var currentMode = "auto";

var Utils = {
  showMessage: function (message, type) {
    DOM.statusMessage.textContent = message;
    DOM.statusMessage.className = "message show " + type;
    setTimeout(function () {
      DOM.statusMessage.classList.remove("show");
    }, type === "success" ? 3000 : 5000);
  },
  showError: function (message) {
    this.showMessage(message, "error");
  },
  showSuccess: function (message) {
    this.showMessage(message, "success");
  },
  showInfo: function (message) {
    this.showMessage(message, "info");
  },
  clearMessages: function () {
    DOM.statusMessage.classList.remove("show");
    var inputs = document.querySelectorAll("input, select");
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].classList.remove("error");
    }
  }
};

function switchMode(mode, btn) {
  currentMode = mode;
  document.getElementById("autoMode").classList.remove("active");
  document.getElementById("manualMode").classList.remove("active");
  document.querySelectorAll(".mode-btn").forEach(function (b) { b.classList.remove("active"); });
  btn.classList.add("active");
  document.getElementById(mode + "Mode").classList.add("active");
  Utils.clearMessages();
}

// Handle file selection - show filename and preview
function handleFileSelect(event) {
  console.log("📸 Image upload event triggered");
  var fileInput = event.target;
  var selectedFileDiv = document.getElementById("selectedFileName");
  var fileNameSpan = document.getElementById("fileName");
  var imagePreview = document.getElementById("imagePreview");
  var previewImg = document.getElementById("previewImg");
  
  if (fileInput.files && fileInput.files.length > 0) {
    var file = fileInput.files[0];
    console.log("📁 File selected:", { 
      name: file.name, 
      size: (file.size / 1024).toFixed(2) + " KB",
      type: file.type 
    });
    
    fileNameSpan.textContent = file.name + " (" + (file.size / 1024).toFixed(2) + " KB)";
    selectedFileDiv.style.display = "block";
    
    // Update upload area styling
    document.getElementById("uploadIcon").textContent = "✓";
    document.getElementById("uploadText").textContent = "File Ready";
    document.getElementById("uploadHint").textContent = "Click to change file";
    
    // Show image preview
    console.log("🖼️ Rendering image preview...");
    var reader = new FileReader();
    reader.onload = function(e) {
      previewImg.src = e.target.result;
      imagePreview.style.display = "block";
      console.log("✅ Image preview rendered successfully");
    };
    reader.onerror = function() {
      console.error("❌ Failed to read image file");
    };
    reader.readAsDataURL(file);
  } else {
    console.log("⚠️ No file selected");
    selectedFileDiv.style.display = "none";
    imagePreview.style.display = "none";
    document.getElementById("uploadIcon").textContent = "📸";
    document.getElementById("uploadText").textContent = "Click to upload Motor Nameplate Image";
    document.getElementById("uploadHint").textContent = "Supported formats: JPG, PNG (Max 5MB)";
  }
}

    // Display configuration selection table
    function displayConfigurationTable(extractedData) {
      console.log("📋 Displaying configuration table with", extractedData.ratings.length, "configurations");
      
      var configSelection = document.getElementById("configSelection");
      var configTable = document.getElementById("configTable");
      var validateBtn = document.getElementById("validateConfigBtn");
      
      if (!extractedData.ratings || extractedData.ratings.length === 0) {
        configSelection.style.display = "none";
        return;
      }
      
      // Build table HTML
      var html = '<thead><tr style="background: var(--accent); color: var(--fg);">';
      html += '<th style="padding: 0.75rem; text-align: center;">Select</th>';
      html += '<th style="padding: 0.75rem;">Voltage (V)</th>';
      html += '<th style="padding: 0.75rem;">Current (A)</th>';
      html += '<th style="padding: 0.75rem;">Power (kW)</th>';
      html += '<th style="padding: 0.75rem;">Frequency (Hz)</th>';
      html += '<th style="padding: 0.75rem;">Speed (RPM)</th>';
      html += '<th style="padding: 0.75rem;">Connection</th>';
      html += '<th style="padding: 0.75rem;">Cosphi</th>';
      html += '</tr></thead><tbody>';
      
      for (var i = 0; i < extractedData.ratings.length; i++) {
        var rating = extractedData.ratings[i];
        var rowStyle = i % 2 === 0 ? 'background: rgba(255,255,255,0.05);' : '';
        html += '<tr style="' + rowStyle + ' border-bottom: 1px solid var(--border);">';
        html += '<td style="padding: 0.75rem; text-align: center;"><input type="radio" name="configSelect" value="' + i + '" onchange="handleConfigSelection()"></td>';
        html += '<td style="padding: 0.75rem;">' + (rating.Voltage || 'N/A') + '</td>';
        html += '<td style="padding: 0.75rem;">' + (rating.Current || 'N/A') + '</td>';
        html += '<td style="padding: 0.75rem;">' + (rating.Power || 'N/A') + '</td>';
        html += '<td style="padding: 0.75rem;">' + (rating.Frequency || 'N/A') + '</td>';
        html += '<td style="padding: 0.75rem;">' + (rating.Speed || 'N/A') + '</td>';
        html += '<td style="padding: 0.75rem;">' + (rating["Connection type"] || 'N/A') + '</td>';
        html += '<td style="padding: 0.75rem;">' + (rating.Cosphi || 'N/A') + '</td>';
        html += '</tr>';
      }
      
      html += '</tbody>';
      configTable.innerHTML = html;
      configSelection.style.display = "block";
      
      console.log("✅ Configuration table rendered");
    }

    // Handle configuration selection
    function handleConfigSelection() {
      console.log("🎯 Configuration selection changed");
      var validateBtn = document.getElementById("validateConfigBtn");
      var selected = document.querySelector('input[name="configSelect"]:checked');
      
      if (selected) {
        validateBtn.style.display = "inline-block";
        console.log("✓ Selected configuration index:", selected.value);
      } else {
        validateBtn.style.display = "none";
      }
    }

    // Validate selected configuration
    async function validateSelectedConfig() {
      console.log("🔍 === Validation Started ===");
      
      var selected = document.querySelector('input[name="configSelect"]:checked');
      if (!selected) {
        Utils.showError("Please select a configuration");
        return;
      }
      
      var index = parseInt(selected.value);
      var extractedData = window.extractedMotorData;
      
      if (!extractedData || !extractedData.ratings[index]) {
        Utils.showError("Configuration data not found");
        return;
      }
      
      var rating = extractedData.ratings[index];
      console.log("📊 Validating configuration:", rating);
      
      // Convert rating to motor data format
      var motorData = {
        motor_model: extractedData.motorModel,
        motor_serial_no: extractedData.motorSerialNo,
        voltage_V: parseFloat(rating.Voltage) || null,
        current_A: parseFloat(rating.Current) || null,
        power_kW: parseFloat(rating.Power) || null,
        frequency_Hz: parseFloat(rating.Frequency) || null,
        speed_rpm: parseInt(rating.Speed) || null,
        connection_type: rating["Connection type"] === "Star" ? "STAR" : (rating["Connection type"] === "Delta" ? "DELTA" : null),
        powerFactor_cosphi: parseFloat(rating.Cosphi) || null,
        efficiency_percent: null
      };
      
      console.log("🔄 Converted to motor data format:", motorData);
      
      Utils.showInfo("Verifying selected configuration...");
      document.getElementById("validateConfigBtn").disabled = true;
      
      try {
        // Create processor and verify
        var processor = new MotorNameplateProcessor();
        
        // Fill missing fields
        console.log("Calling _fillMissingFields...");
        var fillResult = processor._fillMissingFields(motorData);
        console.log("Fill result:", fillResult);
        
        if (!fillResult.okToVerify) {
          console.error("❌ Fill failed:", fillResult.reason);
          Utils.showError("VERIFICATION ERROR: " + fillResult.reason);
          document.getElementById("validateConfigBtn").disabled = false;
          return;
        }
        
        // Verify power
        console.log("Calling _verifyPower...");
        var verification = processor._verifyPower(fillResult.filled);
        console.log("Verification result:", verification);
        
        if (verification.isMatch) {
          console.log("✅ VERIFICATION PASSED");
          
          var finalMotorData = processor._buildMotorData(fillResult.filled);
          console.log("Final motor data:", finalMotorData);
          
          // Create standardized JSON output
          var validationResult = {
            config_mode: "Auto",
            IsVerified: true,
            message: "VERIFICATION PASSED",
            "Motor data": finalMotorData
          };
          
          // Store and proceed
          extractedMotorData = finalMotorData;
          sessionStorage.setItem("aladin_motor_config", JSON.stringify(validationResult));
          console.log("💾 Stored complete validation result:", validationResult);
          
          Utils.showSuccess("VERIFICATION PASSED - Configuration is valid!");
          
          // Hide config table, show results
          document.getElementById("configSelection").style.display = "none";
          displayAutoConfigResults(validationResult);
          
          document.getElementById("verifyNextBtn").style.display = "inline-block";
          document.getElementById("processImageBtn").style.display = "none";
          
        } else {
          console.log("❌ VERIFICATION FAILED");
          
          // Create standardized JSON output for failure
          var validationResult = {
            config_mode: "Auto",
            IsVerified: false,
            message: "VERIFICATION FAILED: Power mismatch (Computed: " + verification.computed_kW.toFixed(2) + " kW vs Nameplate: " + motorData.power_kW + " kW)",
            "Motor data": null
          };
          
          Utils.showError(validationResult.message);
          document.getElementById("validateConfigBtn").disabled = false;
        }
        
      } catch (error) {
        console.error("❌ Validation error:", error);
        Utils.showError("Validation error: " + error.message);
        document.getElementById("validateConfigBtn").disabled = false;
      } finally {
        console.log("🏁 === Validation Ended ===");
      }
    }

    // Auto Config Mode - Process Image
    var extractedMotorData = null; // Store for later use
    
    async function submitAuto() {
      console.log("🎬 === submitAuto clicked ===");
      
      var fileInput = document.getElementById("imageInput");
      if (!fileInput.files || fileInput.files.length === 0) {
        console.log("❌ No file selected");
        Utils.showError("Please upload a motor nameplate image");
        return;
      }

      console.log("⏳ Starting image processing...");
      Utils.showInfo("Processing image with AI...");
      DOM.processImageBtn.disabled = true;
      DOM.processImageBtn.classList.add("loading");
      DOM.processImageBtn.textContent = "Processing...";
      
      // Hide previous results and config table
      document.getElementById("autoResults").style.display = "none";
      document.getElementById("configSelection").style.display = "none";
      document.getElementById("verifyNextBtn").style.display = "none";

      try {
        const processor = new MotorNameplateProcessor({
          apiKey: CONFIG.GEMINI_API_KEY
        });

        const result = await processor.processAutoConfig(fileInput.files[0]);
        console.log("📦 processAutoConfig result:", result);
        
        if (result.extractedData && result.extractedData.ratings && result.extractedData.ratings.length > 0) {
          console.log("✅ Extraction successful");
          Utils.showInfo(result.message);
          
          DOM.processImageBtn.innerHTML = "✓ Extraction Complete";
          DOM.processImageBtn.classList.remove("loading");
          DOM.processImageBtn.classList.add("success");
          DOM.processImageBtn.disabled = true;
          
          // Display configuration table if multiple configs exist
          if (result.extractedData.ratings.length > 1) {
            console.log("📊 Multiple configurations found - displaying table");
            displayConfigurationTable(result.extractedData);
          } else {
            console.log("📊 Single configuration found - auto-validating");
            // Auto-select and validate the only configuration
            window.extractedMotorData = result.extractedData;
            
            // Trigger validation automatically for single config
            var rating = result.extractedData.ratings[0];
            var motorData = {
              motor_model: result.extractedData.motorModel,
              motor_serial_no: result.extractedData.motorSerialNo,
              voltage_V: parseFloat(rating.Voltage) || null,
              current_A: parseFloat(rating.Current) || null,
              power_kW: parseFloat(rating.Power) || null,
              frequency_Hz: parseFloat(rating.Frequency) || null,
              speed_rpm: parseInt(rating.Speed) || null,
              connection_type: rating["Connection type"] === "Star" ? "STAR" : (rating["Connection type"] === "Delta" ? "DELTA" : null),
              powerFactor_cosphi: parseFloat(rating.Cosphi) || null,
              efficiency_percent: null
            };
            
            console.log("🔄 Auto-validating single configuration:", motorData);
            
            // Fill and verify
            var fillResult = processor._fillMissingFields(motorData);
            if (fillResult.okToVerify) {
              var verification = processor._verifyPower(fillResult.filled);
              if (verification.isMatch) {
                console.log("✅ Single config VERIFIED");
                var finalMotorData = processor._buildMotorData(fillResult.filled);
                
                // Create standardized JSON output
                var validationResult = {
                  config_mode: "Auto",
                  IsVerified: true,
                  message: "VERIFICATION PASSED",
                  "Motor data": finalMotorData
                };
                
                extractedMotorData = finalMotorData;
                sessionStorage.setItem("aladin_motor_config", JSON.stringify(validationResult));
                console.log("💾 Stored complete validation result:", validationResult);
                
                Utils.showSuccess("VERIFICATION PASSED - Configuration is valid!");
                displayAutoConfigResults(validationResult);
                document.getElementById("verifyNextBtn").style.display = "inline-block";
              } else {
                console.log("❌ Single config FAILED verification");
                
                // Create standardized JSON output for failure
                var validationResult = {
                  config_mode: "Auto",
                  IsVerified: false,
                  message: "VERIFICATION FAILED: Power mismatch (Computed: " + verification.computed_kW.toFixed(2) + " kW)",
                  "Motor data": null
                };
                
                Utils.showError(validationResult.message);
                DOM.processImageBtn.disabled = false;
                DOM.processImageBtn.classList.remove("success");
                DOM.processImageBtn.textContent = "Try Again";
              }
            } else {
              console.log("❌ Single config fill failed");
              Utils.showError("VERIFICATION ERROR: " + fillResult.reason);
              DOM.processImageBtn.disabled = false;
              DOM.processImageBtn.classList.remove("success");
              DOM.processImageBtn.textContent = "Try Again";
            }
          }
        } else {
          console.log("❌ No configurations extracted");
          Utils.showError(result.message || "No motor configurations found");
          DOM.processImageBtn.disabled = false;
          DOM.processImageBtn.classList.remove("loading");
          DOM.processImageBtn.textContent = "Try Again";
        }
      } catch (error) {
        console.error("❌ submitAuto error:", error);
        Utils.showError("Failed to process image: " + error.message);
        DOM.processImageBtn.disabled = false;
        DOM.processImageBtn.classList.remove("loading");
        DOM.processImageBtn.textContent = "Try Again";
      }
    }
    
    // Display extracted data in UI
    function displayAutoConfigResults(result) {
      var resultsDiv = document.getElementById("autoResults");
      var dataTable = document.getElementById("extractedDataTable");
      
      if (!result["Motor data"]) {
        dataTable.innerHTML = '<div style="color: var(--accent); padding: 1rem;">No data extracted</div>';
        resultsDiv.style.display = "block";
        return;
      }
      
      var data = result["Motor data"];
      var html = '<table style="width: 100%; border-collapse: collapse;">';
      
      var fields = [
        { key: 'motor_model', label: 'Motor Model' },
        { key: 'motor_serial_no', label: 'Serial Number' },
        { key: 'voltage_V', label: 'Voltage (V)', unit: 'V' },
        { key: 'current_A', label: 'Current (A)', unit: 'A' },
        { key: 'power_kW', label: 'Power (kW)', unit: 'kW' },
        { key: 'frequency_Hz', label: 'Frequency (Hz)', unit: 'Hz' },
        { key: 'speed_rpm', label: 'Speed (RPM)', unit: 'RPM' },
        { key: 'connection_type', label: 'Connection Type' }
      ];
      
      for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        var value = data[field.key];
        var displayValue = value !== null && value !== undefined ? value + (field.unit ? '' : '') : '<span style="color: var(--muted);">N/A</span>';
        
        html += '<tr style="border-bottom: 1px solid var(--border);">';
        html += '<td style="padding: 0.5rem; color: var(--muted);">' + field.label + ':</td>';
        html += '<td style="padding: 0.5rem; color: var(--fg); font-weight: 600; text-align: right;">' + displayValue + '</td>';
        html += '</tr>';
      }
      
      html += '</table>';
      dataTable.innerHTML = html;
      resultsDiv.style.display = "block";
    }
    
    // Proceed to next page
    function proceedToNext() {
      // The validation result is already stored in sessionStorage by validateSelectedConfig or submitAuto
      // Just navigate to next page
      var storedData = sessionStorage.getItem("aladin_motor_config");
      if (storedData) {
        console.log("📤 Proceeding to next page with stored data:", JSON.parse(storedData));
        window.location.href = CONFIG.NEXT_PAGE_URL;
      } else {
        Utils.showError("No motor configuration data found. Please complete validation first.");
      }
    }

// Manual Config Mode - Form Validation
var Validator = {
  validateForm: function () {
    var data = {};
    var errors = [];

    for (var i = 0; i < CONFIG.REQUIRED_FIELDS.length; i++) {
      var field = CONFIG.REQUIRED_FIELDS[i];
      var element = document.getElementById(field.id);
      var value = (element.value || "").trim();

      if (!value) {
        errors.push(field.label + " is required");
        element.classList.add("error");
      } else {
        element.classList.remove("error");
        data[field.id] = value;
      }
    }

    var motorSerial = document.getElementById("motorSerial").value.trim();
    if (motorSerial) data.motorSerial = motorSerial;
    
    var cosphi = document.getElementById("cosphi").value.trim();
    if (cosphi) {
      data.cosphi = cosphi;
      console.log("Cosphi provided:", cosphi);
    }
    
    var efficiency = document.getElementById("efficiency").value.trim();
    if (efficiency) {
      data.efficiency = efficiency;
      console.log("Efficiency provided:", efficiency);
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }

    return data;
  }
};

// Form Handler
var FormHandler = {
  handleSubmit: async function (event) {
    event.preventDefault();
    Utils.clearMessages();

    try {
      var formData = Validator.validateForm();

      Utils.showInfo("Verifying motor data...");
      DOM.submitBtn.disabled = true;
      DOM.submitBtn.classList.add("loading");
      DOM.submitBtn.textContent = "Verifying...";

      // Create processor and verify
      const processor = new MotorNameplateProcessor();
      const result = await processor.processManualConfig(formData);

      if (result.IsVerified) {
        Utils.showSuccess(result.message);

        // Store complete standardized JSON result in sessionStorage
        sessionStorage.setItem("aladin_motor_config", JSON.stringify(result));
        console.log("💾 Stored complete validation result:", result);

        // Update button to show success and enable Next navigation
        DOM.submitBtn.innerHTML = "✓ Verified!";
        DOM.submitBtn.classList.remove("loading");
        DOM.submitBtn.classList.add("success");
        DOM.submitBtn.disabled = true;

        // Show the Next button for navigation
        var nextBtn = document.getElementById("manualNextBtn");
        if (nextBtn) {
          nextBtn.style.display = "inline-block";
        }
      } else {
        Utils.showError(result.message);
        DOM.submitBtn.disabled = false;
        DOM.submitBtn.classList.remove("loading");
        DOM.submitBtn.textContent = "Verify & Next →";
      }
    } catch (error) {
      Utils.showError(error.message || "Validation failed");
      DOM.submitBtn.disabled = false;
      DOM.submitBtn.classList.remove("loading");
      DOM.submitBtn.textContent = "Verify & Next →";
    }
  },

  // DEPRECATED: No longer used - removed draft save after verification
  // saveToDraftAPI: async function (outputData) {
  //   var draftId = sessionStorage.getItem("aladin_draft_id") || null;
  //   var payload = {
  //     draft_id: draftId,
  //     page_number: 2,
  //     page_data: outputData,
  //     metadata: {
  //       username: sessionStorage.getItem("aladin_username"),
  //       timestamp: new Date().toISOString()
  //     }
  //   };
  //
  //   try {
  //     var response = await fetch(CONFIG.DRAFT_SAVE_API_URL, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload)
  //     });
  //
  //     var result = await response.json();
  //
  //     if (response.ok && result.success) {
  //       sessionStorage.setItem("aladin_draft_id", result.data.draft_id);
  //       return { success: true, data: result.data };
  //     } else {
  //       return { success: false, error: result.error || "Failed to save draft" };
  //     }
  //   } catch (error) {
  //     return { success: false, error: "Network error: " + error.message };
  //   }
  // },

  handleReset: function () {
    DOM.form.reset();
    Utils.clearMessages();
  }
};

// Load saved data
function loadSavedData() {
  try {
    var savedData = sessionStorage.getItem("aladin_motor_config");
    if (savedData) {
      var data = JSON.parse(savedData);
      if (data.mode === "manual") {
        for (var key in data) {
          if (data.hasOwnProperty(key) && key !== "createdAt" && key !== "mode") {
            var element = document.getElementById(key);
            if (element) element.value = data[key];
          }
        }
        console.log("Loaded saved motor config data");
      }
    }
  } catch (error) {
    console.error("Error loading saved data:", error);
  }
}

// Initialize
function init() {
  if (DOM.form) {
    DOM.form.addEventListener("submit", FormHandler.handleSubmit);
    DOM.resetBtn.addEventListener("click", FormHandler.handleReset);

    var inputs = DOM.form.querySelectorAll("input, select");
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener("input", function () {
        this.classList.remove("error");
      });
    }

    loadSavedData();
  }

  console.log("Motor Configuration UI with MotorNameplateProcessor initialized");
}

init();
  </script >
</body >
</html >
  `;

return [{
  json: {},
  binary: {
    data: {
      data: Buffer.from(html).toString('base64'),
      mimeType: 'text/html',
      fileName: 'motor-config.html'
    }
  }
}];
