// VFD Configuration UI with Integrated VFD Extraction Logic
// n8n Code Node - Complete integration of VFD nameplate extraction

/**
 * This file integrates the VFD nameplate extraction logic directly into the VFD Configuration UI.
 * No external dependencies needed - fully self-contained for n8n Code Node usage.
 * 
 * Features:
 * - Auto Config Mode: Upload image → Gemini extraction → Display fields → Verify
 * - Manual Config Mode: Form entry → Verify
 * - Uses exact extraction logic from drive-ocr-json/app.js
 * - Matches Motor Configuration UI theme exactly
 */

var html = "<!DOCTYPE html>" +
  "<html lang='en'>" +
  "<head>" +
  "  <meta charset='utf-8' />" +
  "  <title>VFD Configuration - Danfoss ALADIN</title>" +
  "  <meta name='viewport' content='width=device-width, initial-scale=1' />" +
  "  " +
  "  <!-- Auth Check -->" +
  "  <script>" +
  "    (function() {" +
  "      var isAuthenticated = sessionStorage.getItem('aladin_authenticated');" +
  "      if (!isAuthenticated || isAuthenticated !== 'true') {" +
  "        console.warn('Session not authenticated');" +
  "      }" +
  "      var loginTime = sessionStorage.getItem('aladin_login_time');" +
  "      if (loginTime) {" +
  "        var elapsed = (new Date() - new Date(loginTime)) / 1000 / 60;" +
  "        if (elapsed > 60) {" +
  "          sessionStorage.clear();" +
  "          console.warn('Session expired after 60 minutes');" +
  "        }" +
  "      }" +
  "      console.log('Auth check passed - User:', sessionStorage.getItem('aladin_username'));" +
  "    })();" +
  "  </script>" +
  "  " +
  "  <style>" +
  "    :root {" +
  "      --bg: #0f172a;" +
  "      --fg: #e5e7eb;" +
  "      --muted: #94a3b8;" +
  "      --accent: #ef4444;" +
  "      --accent-2: #22c55e;" +
  "      --accent-3: #3b82f6;" +
  "      --card: #111827;" +
  "      --border: #1f2937;" +
  "      --input: #0b1220;" +
  "      --focus: #3b82f6;" +
  "    }" +
  "    * { box-sizing: border-box; }" +
  "    body {" +
  "      margin: 0; padding: 2rem;" +
  "      background: linear-gradient(180deg, var(--bg), #0b1020 60%, #050914);" +
  "      color: var(--fg);" +
  "      font-family: system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, sans-serif;" +
  "      min-height: 100vh;" +
  "    }" +
  "    .wrap { max-width: 780px; margin: 0 auto; }" +
  "    header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }" +
  "    .brand { display: flex; align-items: center; gap: .75rem; font-weight: 700; letter-spacing: .5px; }" +
  "    .brand .logo { width: 36px; height: 36px; border-radius: 10px; background: var(--accent); display: grid; place-items: center; color: white; font-weight: 900; }" +
  "    .subtitle { color: var(--muted); font-size: .95rem; margin-top: .25rem; }" +
  "    " +
  "    .progress-bar { display: flex; justify-content: space-between; margin-bottom: 2rem; position: relative; }" +
  "    .progress-bar::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 2px; background: var(--border); transform: translateY(-50%); z-index: 0; }" +
  "    .progress-step { flex: 1; text-align: center; position: relative; z-index: 1; }" +
  "    .progress-step-circle { width: 32px; height: 32px; border-radius: 50%; background: var(--border); margin: 0 auto 0.5rem; display: grid; place-items: center; font-size: .85rem; font-weight: 600; transition: all .2s; }" +
  "    .progress-step.active .progress-step-circle { background: var(--accent); color: white; }" +
  "    .progress-step.completed .progress-step-circle { background: var(--accent-2); color: white; }" +
  "    .progress-step span { font-size: .85rem; color: var(--muted); display: block; }" +
  "    .progress-step.active span { color: var(--fg); font-weight: 600; }" +
  "    " +
  "    .card { background: rgba(17,24,39,.7); border: 1px solid var(--border); border-radius: 16px; padding: 2rem; backdrop-filter: blur(6px); box-shadow: 0 6px 24px rgba(0,0,0,.35); }" +
  "    .card h2 { margin: 0 0 .5rem 0; font-size: 1.5rem; color: var(--fg); }" +
  "    .card p { margin: 0 0 2rem 0; color: var(--muted); font-size: .95rem; }" +
  "    " +
  "    .mode-toggle { display: flex; gap: .75rem; margin-bottom: 2rem; background: var(--input); padding: .5rem; border-radius: .75rem; }" +
  "    .mode-btn { flex: 1; padding: .75rem 1rem; border: none; border-radius: .5rem; background: transparent; color: var(--muted); font-weight: 600; cursor: pointer; transition: all .2s; font-size: .9rem; }" +
  "    .mode-btn.active { background: var(--accent); color: white; box-shadow: 0 4px 12px rgba(239,68,68,.3); }" +
  "    .mode-btn:hover:not(.active) { background: rgba(255,255,255,.05); }" +
  "    .mode-content { display: none; }" +
  "    .mode-content.active { display: block; }" +
  "    " +
  "    .upload-area { border: 2px dashed var(--border); background: var(--input); padding: 3rem 2rem; text-align: center; cursor: pointer; border-radius: .75rem; transition: all .2s; margin-bottom: 1.5rem; }" +
  "    .upload-area:hover { border-color: var(--accent); background: rgba(239,68,68,.05); }" +
  "    .upload-area.has-file { border-color: var(--accent-2); background: rgba(34, 197, 94, 0.05); }" +
  "    .upload-icon { font-size: 3rem; margin-bottom: 1rem; color: var(--muted); }" +
  "    .upload-text { color: var(--fg); font-weight: 600; margin-bottom: .5rem; }" +
  "    .upload-hint { color: var(--muted); font-size: .85rem; }" +
  "    " +
  "    form { display: grid; gap: 1.25rem; }" +
  "    .form-group { display: flex; flex-direction: column; }" +
  "    .form-row { display: grid; gap: 1.25rem; grid-template-columns: 1fr 1fr; }" +
  "    label { display: block; font-size: .9rem; color: var(--muted); margin-bottom: .5rem; font-weight: 500; }" +
  "    label .required { color: var(--accent); }" +
  "    label .optional { color: var(--muted); font-weight: 400; font-size: .85rem; }" +
  "    " +
  "    input[type='text'], input[type='number'], select { width: 100%; background: var(--input); color: var(--fg); border: 1px solid var(--border); border-radius: .75rem; padding: .85rem 1rem; outline: none; transition: border .15s, box-shadow .15s; font-size: .95rem; }" +
  "    input:focus, select:focus { border-color: var(--focus); box-shadow: 0 0 0 3px rgba(59,130,246,.25); }" +
  "    input.error, select.error { border-color: var(--accent) !important; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2) !important; }" +
  "    input:read-only { background: rgba(148, 163, 184, 0.1); cursor: not-allowed; }" +
  "    select { cursor: pointer; }" +
  "    .hint { font-size: .8rem; color: var(--muted); margin-top: .35rem; }" +
  "    " +
  "    .actions { display: flex; gap: .75rem; justify-content: flex-end; margin-top: 1rem; }" +
  "    button { appearance: none; border: none; border-radius: .75rem; padding: .9rem 1.5rem; font-weight: 600; cursor: pointer; transition: transform .04s ease, box-shadow .15s ease, opacity .15s; font-size: .95rem; }" +
  "    .btn-primary { background: linear-gradient(180deg, #ef4444, #dc2626); color: white; box-shadow: 0 10px 24px rgba(239,68,68,.35); min-width: 140px; }" +
  "    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(239,68,68,.45); }" +
  "    .btn-primary:active { transform: translateY(0); }" +
  "    .btn-primary:disabled { background: #6b7280; cursor: not-allowed; transform: none; opacity: .6; }" +
  "    .btn-primary.success { background: linear-gradient(180deg, #22c55e, #16a34a) !important; }" +
  "    .btn-primary.loading { background: linear-gradient(180deg, #3b82f6, #2563eb) !important; }" +
  "    " +
  "    .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }" +
  "    .btn-ghost:hover { background: rgba(255,255,255,.05); }" +
  "    " +
  "    .message { padding: 1rem; border-radius: .75rem; margin-bottom: 1rem; font-size: .9rem; border-left: 4px solid; display: none; }" +
  "    .message.show { display: block; }" +
  "    .message.error { background: rgba(239, 68, 68, 0.1); color: var(--accent); border-color: var(--accent); }" +
  "    .message.success { background: rgba(34, 197, 94, 0.1); color: var(--accent-2); border-color: var(--accent-2); }" +
  "    .message.info { background: rgba(59, 130, 246, 0.1); color: var(--accent-3); border-color: var(--accent-3); }" +
  "    " +
  "    @media (max-width: 720px) { .form-row { grid-template-columns: 1fr; } }" +
  "  </style>" +
  "</head>" +
  "<body>" +
  "  <div class='wrap'>" +
  "    <header>" +
  "      <div class='brand'>" +
  "        <div class='logo' aria-hidden='true'>A</div>" +
  "        <div>" +
  "          <div style='font-size:1.15rem;'>Danfoss ALADIN</div>" +
  "          <div class='subtitle'>VFD Configuration</div>" +
  "        </div>" +
  "      </div>" +
  "    </header>" +
  "" +
  "    <div class='progress-bar'>" +
  "      <div class='progress-step completed'>" +
  "        <div class='progress-step-circle'>1</div>" +
  "        <span>Customer Info</span>" +
  "      </div>" +
  "      <div class='progress-step completed'>" +
  "        <div class='progress-step-circle'>2</div>" +
  "        <span>Motor Details</span>" +
  "      </div>" +
  "      <div class='progress-step active'>" +
  "        <div class='progress-step-circle'>3</div>" +
  "        <span>VFD Details</span>" +
  "      </div>" +
  "      <div class='progress-step'>" +
  "        <div class='progress-step-circle'>4</div>" +
  "        <span>Review</span>" +
  "      </div>" +
  "    </div>" +
  "" +
  "    <div id='statusMessage' class='message'></div>" +
  "" +
  "    <section class='card'>" +
  "      <h2>VFD Configuration</h2>" +
  "      <p>Configure your VFD details via auto extraction or manual entry.</p>" +
  "" +
  "      <div class='mode-toggle'>" +
  "        <button class='mode-btn active' onclick=\"switchMode('auto', this)\">⚡ Auto Config</button>" +
  "        <button class='mode-btn' onclick=\"switchMode('manual', this)\">✍️ Manual Config</button>" +
  "      </div>" +
  "" +
  "      <!-- Auto Config Mode -->" +
  "      <div id='autoMode' class='mode-content active'>" +
  "        <div class='upload-area' id='uploadArea' onclick=\"document.getElementById('imageInput').click()\">" +
  "          <input type='file' id='imageInput' accept='image/*' style='display: none;' onchange='handleFileSelect(event)' />" +
  "          <div class='upload-icon' id='uploadIcon'>📸</div>" +
  "          <div class='upload-text' id='uploadText'>Click to upload VFD Nameplate Image</div>" +
  "          <div class='upload-hint' id='uploadHint'>Supported formats: JPG, PNG (Max 5MB)</div>" +
  "        </div>" +
  "" +
  "        <div id='selectedFileInfo' style='display: none; margin-bottom: 1rem; padding: 0.75rem; background: rgba(34, 197, 94, 0.1); border-radius: 0.5rem; color: var(--accent-2); font-size: 0.9rem;'></div>" +
  "" +
  "        <!-- Extracted Fields Display (becomes visible after extraction) -->" +
  "        <div id='extractedFields' style='display: none;'>" +
  "          <form id='auto-form' novalidate>" +
  "            <div class='form-row'>" +
  "              <div class='form-group'>" +
  "                <label for='auto_driveModel'>Drive Model <span class='required'>*</span></label>" +
  "                <input id='auto_driveModel' name='driveModel' type='text' readonly />" +
  "              </div>" +
  "              <div class='form-group'>" +
  "                <label for='auto_stringCode'>String Code</label>" +
  "                <input id='auto_stringCode' name='stringCode' type='text' readonly />" +
  "              </div>" +
  "            </div>" +
  "" +
  "            <div class='form-row'>" +
  "              <div class='form-group'>" +
  "                <label for='auto_partNumber'>Part Number <span class='required'>*</span></label>" +
  "                <input id='auto_partNumber' name='partNumber' type='text' readonly />" +
  "              </div>" +
  "              <div class='form-group'>" +
  "                <label for='auto_serialNumber'>Serial Number <span class='required'>*</span></label>" +
  "                <input id='auto_serialNumber' name='serialNumber' type='text' readonly />" +
  "              </div>" +
  "            </div>" +
  "" +
  "            <div class='form-row'>" +
  "              <div class='form-group'>" +
  "                <label for='auto_power'>Power (kW) <span class='required'>*</span></label>" +
  "                <input id='auto_power' name='power' type='number' step='0.1' readonly />" +
  "              </div>" +
  "              <div class='form-group'>" +
  "                <label for='auto_hp'>Motor Power (HP) <span class='optional'>(Optional)</span></label>" +
  "                <input id='auto_hp' name='hp' type='number' step='0.1' readonly />" +
  "              </div>" +
  "            </div>" +
  "          </form>" +
  "        </div>" +
  "" +
  "        <div class='actions'>" +
  "          <button class='btn-primary' id='processImageBtn' onclick='submitAuto()'>Process Image</button>" +
  "          <button class='btn-primary success' id='autoVerifyBtn' onclick='verifyAuto()' style='display: none;'>Verify</button>" +
  "          <button class='btn-primary success' id='autoNextBtn' onclick='proceedToNext()' style='display: none;'>Next →</button>" +
  "        </div>" +
  "      </div>" +
  "" +
  "      <!-- Manual Config Mode -->" +
  "      <div id='manualMode' class='mode-content'>" +
  "        <form id='manual-form' novalidate>" +
  "          <div class='form-row'>" +
  "            <div class='form-group'>" +
  "              <label for='manual_driveModel'>Drive Model <span class='required'>*</span></label>" +
  "              <select id='manual_driveModel' name='driveModel' required>" +
  "                <option value=''>Select Drive Model</option>" +
  "                <option value='FC-302'>FC-302</option>" +
  "                <option value='FC-102'>FC-102</option>" +
  "              </select>" +
  "              <div class='hint'>Select the VFD drive model</div>" +
  "            </div>" +
  "            <div class='form-group'>" +
  "              <label for='manual_partNumber'>Part Number <span class='required'>*</span></label>" +
  "              <input id='manual_partNumber' name='partNumber' type='text' placeholder='e.g., 132L4236' required />" +
  "              <div class='hint'>VFD part number</div>" +
  "            </div>" +
  "          </div>" +
  "" +
  "          <div class='form-row'>" +
  "            <div class='form-group'>" +
  "              <label for='manual_serialNumber'>Serial Number <span class='required'>*</span></label>" +
  "              <input id='manual_serialNumber' name='serialNumber' type='text' placeholder='e.g., 000308E161' required />" +
  "              <div class='hint'>VFD serial number</div>" +
  "            </div>" +
  "            <div class='form-group'>" +
  "              <label for='manual_power'>Power (kW) <span class='required'>*</span></label>" +
  "              <input id='manual_power' name='power' type='number' step='0.1' placeholder='e.g., 250' required />" +
  "              <div class='hint'>VFD power rating in kW</div>" +
  "            </div>" +
  "          </div>" +
  "" +
  "          <div class='form-group'>" +
  "            <label for='manual_hp'>Motor Power (HP) <span class='optional'>(Optional)</span></label>" +
  "            <input id='manual_hp' name='hp' type='number' step='0.1' placeholder='e.g., 350' />" +
  "            <div class='hint'>Motor power rating in HP (optional)</div>" +
  "          </div>" +
  "" +
  "          <div class='actions'>" +
  "            <button id='resetBtn' class='btn-ghost' type='button'>Reset</button>" +
  "            <button id='submitBtn' class='btn-primary' type='submit'>Verify</button>" +
  "            <button class='btn-primary success' id='manualNextBtn' onclick='proceedToNext()' style='display: none;'>Next →</button>" +
  "          </div>" +
  "        </form>" +
  "      </div>" +
  "    </section>" +
  "  </div>" +
  "" +
  "  <script>" +
  "    // ========== VFD Extraction Processor ==========\n" +
  "    // Integrated extraction logic from drive-ocr-json/app.js\n" +
  "    \n" +
  "    class VFDExtractionProcessor {\n" +
  "      constructor(config) {\n" +
  "        this.apiKey = config?.apiKey || null;\n" +
  "      }\n" +
  "\n" +
  "      async _fileToBase64(file) {\n" +
  "        return new Promise((resolve, reject) => {\n" +
  "          const reader = new FileReader();\n" +
  "          reader.onload = () => {\n" +
  "            const base64 = reader.result.split(',')[1];\n" +
  "            resolve(base64);\n" +
  "          };\n" +
  "          reader.onerror = reject;\n" +
  "          reader.readAsDataURL(file);\n" +
  "        });\n" +
  "      }\n" +
  "\n" +
  "      async _extractWithGeminiAPI(base64Data, mimeType) {\n" +
  "        console.log('🤖 Calling Gemini API for VFD extraction...');\n" +
  "\n" +
  "        const systemPrompt = " +
  "          'You convert equipment nameplate OCR text into a compact JSON representation.\\n\\n' +" +
  "          'Create a single JSON object with these top-level keys exactly:\\n' +" +
  "          'drive type, drive model, stringCode, partNumber, serialNumber, kw, hp,\\n' +" +
  "          'input, output, temp, maxTemp, assemblyLocation.\\n\\n' +" +
  "          'Rules for each field:\\n\\n' +" +
  "          '- drive: the drive type, for example from \"VLT HVAC Drive\" use \"HVAC\".\\n' +" +
  "          '- stringCode: the long model/type code string (often starting with FC- or similar).\\n' +" +
  "          '- partNumber: value from the part number line (P/N or similar).\\n' +" +
  "          '- serialNumber: value from the serial number line (S/N or similar).\\n' +" +
  "          '- kw: kW value only (numeric as string, no units), taken from the power line like \"250 kW / 350 HP\" -> \"250\".\\n' +" +
  "          '- hp: HP value only (numeric as string, no units), from the same power line like \"250 kW / 350 HP\" -> \"350\".\\n\\n' +" +
  "          '- input: an object with keys phase, voltage, frequency, current.\\n' +" +
  "          '    • phase: number of phases (e.g. \"3\" from \"IN: 3x380-480V ...\").\\n' +" +
  "          '    • voltage: voltage range without the phase multiplier, e.g. \"380-480V\".\\n' +" +
  "          '    • frequency: the frequency part with Hz (e.g. \"50/60Hz\").\\n' +" +
  "          '    • current: the current part with A (e.g. \"463/427A\").\\n' +" +
  "          '  Use the line that starts with \"IN:\" as the source.\\n\\n' +" +
  "          '- output: an object with keys phase, voltage, frequency, current.\\n' +" +
  "          '    • phase: number of phases from the OUT line.\\n' +" +
  "          '    • voltage: voltage or voltage range part from the OUT line.\\n' +" +
  "          '    • frequency: frequency range with Hz from the OUT line.\\n' +" +
  "          '    • current: current part with A from the OUT line.\\n' +" +
  "          '  Use the line that starts with \"OUT:\" as the source.\\n\\n' +" +
  "          'Temperature fields:\\n' +" +
  "          '- temp: take only ONE temperature value that contains a degree symbol.\\n' +" +
  "          '    • If the line shows both °C and °F (e.g. \"40°C/104°F\"), prefer the °C value and output exactly \"40°C\".\\n' +" +
  "          '    • If only °F is present with a degree symbol, output that (e.g. \"104°F\").\\n' +" +
  "          '- maxTemp: same rule as temp, using the maximum temperature line (e.g. from \"Max Tamb. 55°C/131°F w/Output Current Derating\" -> \"55°C\").\\n\\n' +" +
  "          '- assemblyLocation: the location taken from the \"ASSEMBLED IN ...\" line (e.g. \"USA\" or \"India\"), without the words \"Assembled in\".\\n\\n' +" +
  "          'If any of these values cannot be found, still include the key with an empty string.\\n' +" +
  "          'All values must be strings.\\n' +" +
  "          'Do not create any additional keys besides the ones listed.\\n' +" +
  "          'Output ONLY valid JSON, with no extra text.';\n" +
  "\n" +
  "        const requestBody = {\n" +
  "          contents: [{\n" +
  "            parts: [\n" +
  "              { text: systemPrompt },\n" +
  "              { inline_data: { mime_type: mimeType, data: base64Data } }\n" +
  "            ]\n" +
  "          }],\n" +
  "          generationConfig: { temperature: 0, responseMimeType: 'application/json' }\n" +
  "        };\n" +
  "\n" +
  "        const response = await fetch(\n" +
  "          'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=' + this.apiKey,\n" +
  "          {\n" +
  "            method: 'POST',\n" +
  "            headers: { 'Content-Type': 'application/json' },\n" +
  "            body: JSON.stringify(requestBody)\n" +
  "          }\n" +
  "        );\n" +
  "\n" +
  "        if (!response.ok) {\n" +
  "          const errorData = await response.json();\n" +
  "          throw new Error('Gemini API error: ' + (errorData.error?.message || response.statusText));\n" +
  "        }\n" +
  "\n" +
  "        console.log('📥 Gemini response received');\n" +
  "        const data = await response.json();\n" +
  "        const generatedText = data.candidates[0]?.content?.parts[0]?.text;\n" +
  "\n" +
  "        if (!generatedText) throw new Error('No response from Gemini API');\n" +
  "        console.log('📄 Raw Gemini response:', generatedText);\n" +
  "\n" +
  "        let parsed;\n" +
  "        try {\n" +
  "          const jsonText = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();\n" +
  "          parsed = JSON.parse(jsonText);\n" +
  "          console.log('✅ Parsed Gemini JSON:', parsed);\n" +
  "        } catch (e) {\n" +
  "          console.error('❌ JSON parse error:', e.message);\n" +
  "          throw new Error('Failed to parse Gemini response as JSON');\n" +
  "        }\n" +
  "\n" +
  "        parsed = this._addABCDfromStringCode(parsed);\n" +
  "\n" +
  "        if (parsed?.assemblyLocation && typeof parsed.assemblyLocation === 'string') {\n" +
  "          parsed.assemblyLocation = parsed.assemblyLocation.toLowerCase().replace(/\\b\\w/g, (c) => c.toUpperCase());\n" +
  "        }\n" +
  "\n" +
  "        return parsed;\n" +
  "      }\n" +
  "\n" +
  "      _addABCDfromStringCode(data) {\n" +
  "        const sc = String(data?.stringCode ?? '');\n" +
  "        data.A = data.A || { A0: '' };\n" +
  "        data.B = data.B || { B0: '' };\n" +
  "        data.C = data.C || { C0: '', C1: '', C2: '' };\n" +
  "        data.D = data.D || { D0: '' };\n" +
  "        const m = sc.match(/A(.)B(.)C(.)(.)(.)(.)D(.)$/);\n" +
  "        if (!m) return data;\n" +
  "        data.A.A0 = m[1];\n" +
  "        data.B.B0 = m[2];\n" +
  "        data.C.C0 = m[3];\n" +
  "        data.C.C1 = m[4];\n" +
  "        data.C.C2 = m[5] + m[6];\n" +
  "        data.D.D0 = m[7];\n" +
  "        return data;\n" +
  "      }\n" +
  "\n" +
  "      async processAutoConfig(imageFile) {\n" +
  "        console.log('🚀 === VFD Auto Config Processing Started ===');\n" +
  "        console.log('📸 Image file:', { name: imageFile.name, size: imageFile.size, type: imageFile.type });\n" +
  "        try {\n" +
  "          const base64Data = await this._fileToBase64(imageFile);\n" +
  "          const extracted = await this._extractWithGeminiAPI(base64Data, imageFile.type);\n" +
  "          console.log('📊 Extraction complete:', extracted);\n" +
  "          return { success: true, data: extracted };\n" +
  "        } catch (error) {\n" +
  "          console.error('❌ VFD Auto Config Error:', error);\n" +
  "          return { success: false, error: error.message };\n" +
  "        } finally {\n" +
  "          console.log('🏁 === VFD Auto Config Processing Ended ===');\n" +
  "        }\n" +
  "      }\n" +
  "    }\n" +
  "\n" +
  "    var CONFIG = {\n" +
  "      NEXT_PAGE_URL: 'http://localhost:5678/webhook-test/review',\n" +
  "      GEMINI_API_KEY: 'AIzaSyBhIK_hrBy5oZjNq0OZei6WGJ2ce57jlRg'\n" +
  "    };\n" +
  "\n" +
  "    var DOM = {\n" +
  "      statusMessage: document.getElementById('statusMessage'),\n" +
  "      uploadArea: document.getElementById('uploadArea'),\n" +
  "      uploadIcon: document.getElementById('uploadIcon'),\n" +
  "      uploadText: document.getElementById('uploadText'),\n" +
  "      uploadHint: document.getElementById('uploadHint'),\n" +
  "      selectedFileInfo: document.getElementById('selectedFileInfo'),\n" +
  "      extractedFields: document.getElementById('extractedFields'),\n" +
  "      processImageBtn: document.getElementById('processImageBtn'),\n" +
  "      autoVerifyBtn: document.getElementById('autoVerifyBtn'),\n" +
  "      autoNextBtn: document.getElementById('autoNextBtn'),\n" +
  "      submitBtn: document.getElementById('submitBtn'),\n" +
  "      resetBtn: document.getElementById('resetBtn'),\n" +
  "      manualNextBtn: document.getElementById('manualNextBtn')\n" +
  "    };\n" +
  "\n" +
  "    var currentMode = 'auto';\n" +
  "    var extractedVFDData = null;\n" +
  "\n" +
  "    var Utils = {\n" +
  "      showMessage: function(msg, type) {\n" +
  "        DOM.statusMessage.textContent = msg;\n" +
  "        DOM.statusMessage.className = 'message show ' + type;\n" +
  "      },\n" +
  "      showError: function(msg) { Utils.showMessage(msg, 'error'); },\n" +
  "      showSuccess: function(msg) { Utils.showMessage(msg, 'success'); },\n" +
  "      showInfo: function(msg) { Utils.showMessage(msg, 'info'); },\n" +
  "      clearMessages: function() {\n" +
  "        DOM.statusMessage.classList.remove('show');\n" +
  "        var inputs = document.querySelectorAll('input, select');\n" +
  "        for (var i = 0; i < inputs.length; i++) inputs[i].classList.remove('error');\n" +
  "      }\n" +
  "    };\n" +
  "\n" +
  "    function switchMode(mode, btn) {\n" +
  "      currentMode = mode;\n" +
  "      document.getElementById('autoMode').classList.remove('active');\n" +
  "      document.getElementById('manualMode').classList.remove('active');\n" +
  "      document.querySelectorAll('.mode-btn').forEach(function(b) { b.classList.remove('active'); });\n" +
  "      btn.classList.add('active');\n" +
  "      document.getElementById(mode + 'Mode').classList.add('active');\n" +
  "      Utils.clearMessages();\n" +
  "    }\n" +
  "\n" +
  "    function handleFileSelect(event) {\n" +
  "      console.log('📸 Image upload event triggered');\n" +
  "      var file = event.target.files[0];\n" +
  "      if (file) {\n" +
  "        console.log('📁 File selected:', { name: file.name, size: file.size + ' bytes', type: file.type });\n" +
  "        DOM.selectedFileInfo.textContent = '✓ Selected: ' + file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';\n" +
  "        DOM.selectedFileInfo.style.display = 'block';\n" +
  "        DOM.uploadArea.classList.add('has-file');\n" +
  "        DOM.uploadIcon.textContent = '✓';\n" +
  "        DOM.uploadText.textContent = 'File Selected: ' + file.name;\n" +
  "        DOM.uploadHint.textContent = \"Click 'Process Image' to extract VFD data\";\n" +
  "      }\n" +
  "    }\n" +
  "\n" +
  "    async function submitAuto() {\n" +
  "      console.log('🎬 === submitAuto clicked ===');\n" +
  "      var fileInput = document.getElementById('imageInput');\n" +
  "      if (!fileInput.files || fileInput.files.length === 0) {\n" +
  "        console.log('❌ No file selected');\n" +
  "        Utils.showError('Please upload a VFD nameplate image');\n" +
  "        return;\n" +
  "      }\n" +
  "      console.log('⏳ Starting image processing...');\n" +
  "      Utils.showInfo('Processing image with AI...');\n" +
  "      DOM.processImageBtn.disabled = true;\n" +
  "      DOM.processImageBtn.classList.add('loading');\n" +
  "      DOM.processImageBtn.textContent = 'Processing...';\n" +
  "      try {\n" +
  "        const processor = new VFDExtractionProcessor({ apiKey: CONFIG.GEMINI_API_KEY });\n" +
  "        const result = await processor.processAutoConfig(fileInput.files[0]);\n" +
  "        console.log('📦 processAutoConfig result:', result);\n" +
  "        if (result.success && result.data) {\n" +
  "          console.log('✅ Extraction successful');\n" +
  "          document.getElementById('auto_driveModel').value = result.data['drive model'] || '';\n" +
  "          document.getElementById('auto_stringCode').value = result.data.stringCode || '';\n" +
  "          document.getElementById('auto_partNumber').value = result.data.partNumber || '';\n" +
  "          document.getElementById('auto_serialNumber').value = result.data.serialNumber || '';\n" +
  "          document.getElementById('auto_power').value = result.data.kw || '';\n" +
  "          document.getElementById('auto_hp').value = result.data.hp || '';\n" +
  "          extractedVFDData = result.data;\n" +
  "          DOM.extractedFields.style.display = 'block';\n" +
  "          DOM.processImageBtn.innerHTML = '✓ Extraction Complete';\n" +
  "          DOM.processImageBtn.classList.remove('loading');\n" +
  "          DOM.processImageBtn.classList.add('success');\n" +
  "          DOM.autoVerifyBtn.style.display = 'inline-block';\n" +
  "          Utils.showSuccess('VFD data extracted successfully! Review and click Verify.');\n" +
  "        } else {\n" +
  "          console.log('❌ Extraction failed');\n" +
  "          Utils.showError(result.error || 'Failed to extract VFD data');\n" +
  "          DOM.processImageBtn.disabled = false;\n" +
  "          DOM.processImageBtn.classList.remove('loading');\n" +
  "          DOM.processImageBtn.textContent = 'Try Again';\n" +
  "        }\n" +
  "      } catch (error) {\n" +
  "        console.error('❌ submitAuto error:', error);\n" +
  "        Utils.showError('Failed to process image: ' + error.message);\n" +
  "        DOM.processImageBtn.disabled = false;\n" +
  "        DOM.processImageBtn.classList.remove('loading');\n" +
  "        DOM.processImageBtn.textContent = 'Try Again';\n" +
  "      }\n" +
  "    }\n" +
  "\n" +
  "    function verifyAuto() {\n" +
  "      console.log('✅ Auto verify clicked');\n" +
  "      var driveModel = document.getElementById('auto_driveModel').value;\n" +
  "      var partNumber = document.getElementById('auto_partNumber').value;\n" +
  "      var serialNumber = document.getElementById('auto_serialNumber').value;\n" +
  "      var power = document.getElementById('auto_power').value;\n" +
  "      if (!driveModel || !partNumber || !serialNumber || !power) {\n" +
  "        Utils.showError('Missing required fields. Please ensure drive model, part number, serial number, and power are extracted.');\n" +
  "        return;\n" +
  "      }\n" +
  "      var vfdData = {\n" +
  "        VFD_data: {\n" +
  "          drive_model: driveModel,\n" +
  "          serial_Number: serialNumber,\n" +
  "          part_Number: partNumber,\n" +
  "          power: power,\n" +
  "          hp: document.getElementById('auto_hp').value || ''\n" +
  "        }\n" +
  "      };\n" +
  "      sessionStorage.setItem('aladin_vfd_config', JSON.stringify(vfdData));\n" +
  "      console.log('💾 Stored VFD data:', vfdData);\n" +
  "      DOM.autoVerifyBtn.innerHTML = '✓ Verified!';\n" +
  "      DOM.autoVerifyBtn.disabled = true;\n" +
  "      DOM.autoNextBtn.style.display = 'inline-block';\n" +
  "      Utils.showSuccess('VFD configuration verified!');\n" +
  "    }\n" +
  "\n" +
  "    document.getElementById('manual-form').addEventListener('submit', async function(event) {\n" +
  "      event.preventDefault();\n" +
  "      Utils.clearMessages();\n" +
  "      try {\n" +
  "        var formData = {\n" +
  "          driveModel: document.getElementById('manual_driveModel').value.trim(),\n" +
  "          partNumber: document.getElementById('manual_partNumber').value.trim(),\n" +
  "          serialNumber: document.getElementById('manual_serialNumber').value.trim(),\n" +
  "          power: document.getElementById('manual_power').value.trim(),\n" +
  "          hp: document.getElementById('manual_hp').value.trim()\n" +
  "        };\n" +
  "        console.log('📝 Manual form data:', formData);\n" +
  "        var errors = [];\n" +
  "        if (!formData.driveModel) errors.push('Drive Model is required');\n" +
  "        if (!formData.partNumber) errors.push('Part Number is required');\n" +
  "        if (!formData.serialNumber) errors.push('Serial Number is required');\n" +
  "        if (!formData.power) errors.push('Power is required');\n" +
  "        if (errors.length > 0) throw new Error(errors.join(', '));\n" +
  "        Utils.showInfo('Verifying VFD data...');\n" +
  "        DOM.submitBtn.disabled = true;\n" +
  "        DOM.submitBtn.classList.add('loading');\n" +
  "        DOM.submitBtn.textContent = 'Verifying...';\n" +
  "        var vfdData = {\n" +
  "          VFD_data: {\n" +
  "            drive_model: formData.driveModel,\n" +
  "            serial_Number: formData.serialNumber,\n" +
  "            part_Number: formData.partNumber,\n" +
  "            power: formData.power,\n" +
  "            hp: formData.hp || ''\n" +
  "          }\n" +
  "        };\n" +
  "        sessionStorage.setItem('aladin_vfd_config', JSON.stringify(vfdData));\n" +
  "        console.log('💾 Stored VFD data:', vfdData);\n" +
  "        Utils.showSuccess('VFD configuration verified!');\n" +
  "        DOM.submitBtn.innerHTML = '✓ Verified!';\n" +
  "        DOM.submitBtn.classList.remove('loading');\n" +
  "        DOM.submitBtn.classList.add('success');\n" +
  "        DOM.submitBtn.disabled = true;\n" +
  "        DOM.manualNextBtn.style.display = 'inline-block';\n" +
  "      } catch (error) {\n" +
  "        Utils.showError(error.message || 'Validation failed');\n" +
  "        DOM.submitBtn.disabled = false;\n" +
  "        DOM.submitBtn.classList.remove('loading');\n" +
  "        DOM.submitBtn.textContent = 'Verify';\n" +
  "      }\n" +
  "    });\n" +
  "\n" +
  "    DOM.resetBtn.addEventListener('click', function() {\n" +
  "      document.getElementById('manual-form').reset();\n" +
  "      Utils.clearMessages();\n" +
  "    });\n" +
  "\n" +
  "    function proceedToNext() {\n" +
  "      var storedData = sessionStorage.getItem('aladin_vfd_config');\n" +
  "      if (storedData) {\n" +
  "        console.log('📤 Proceeding to next page with stored data:', JSON.parse(storedData));\n" +
  "        window.location.href = CONFIG.NEXT_PAGE_URL;\n" +
  "      } else {\n" +
  "        Utils.showError('No VFD configuration data found. Please complete verification first.');\n" +
  "      }\n" +
  "    }\n" +
  "\n" +
  "    console.log('✅ VFD Configuration UI initialized');\n" +
  "  </script>" +
  "</body>" +
  "</html>";

return [{
  json: {},
  binary: {
    data: {
      data: Buffer.from(html).toString('base64'),
      mimeType: 'text/html',
      fileName: 'vfd-config.html'
    }
  }
}];
