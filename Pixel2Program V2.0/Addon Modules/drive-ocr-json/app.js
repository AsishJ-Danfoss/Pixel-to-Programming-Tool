/**
 * app.js
 * Same OCR → JSON logic and SAME system prompt as your notebook,
 * but uses Gemini 3 Pro Review instead of Hugging Face.
 *
 * Flow (terminal):
 * 1) Ask Gemini API key
 * 2) Ask (optional) Vision key path (defaults to ./vision-key.json if present)
 * 3) Ask image file path
 * 4) Run Google Vision OCR
 * 5) Send OCR text to Gemini (model: gemini-3-pro-review) with the SAME system prompt
 * 6) Parse JSON from model output
 * 7) Add A/B/C/D fields from stringCode (same regex logic)
 * 8) Print FINAL JSON
 */

import fs from "fs";
import readline from "readline";
import vision from "@google-cloud/vision";
import { GoogleGenAI } from "@google/genai";

// ---------------- Readline ----------------
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function question(prompt) {
    return new Promise((resolve) => rl.question(prompt, resolve));
}

function cleanPath(p) {
    if (!p) return "";
    let s = String(p).trim();

    // Remove wrapping single/double quotes: "C:\path\file.jpg" or 'C:\path\file.jpg'
    s = s.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");

    // Also remove a trailing quote if user pasted an unmatched one
    s = s.replace(/["']$/, "").trim();

    return s;
}


// ---------------- Google Vision OCR ----------------
async function runVisionOCR(imagePath, visionKeyPath) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = visionKeyPath;

    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.textDetection(imagePath);

    if (result?.error?.message) {
        throw new Error(`Vision API error: ${result.error.message}`);
    }

    const annotations = result?.textAnnotations;
    if (!annotations || annotations.length === 0) return "";

    // first annotation is the full text
    return annotations[0].description || "";
}

// ---------------- A/B/C/D post-processing ----------------
function addABCDfromStringCode(data) {
    const sc = String(data?.stringCode ?? "");

    data.A = data.A || { A0: "" };
    data.B = data.B || { B0: "" };
    data.C = data.C || { C0: "", C1: "", C2: "" };
    data.D = data.D || { D0: "" };

    // Regex: A(.)B(.)C(.)(.)(.)(.)D(.) at the END of the string
    const m = sc.match(/A(.)B(.)C(.)(.)(.)(.)D(.)$/);
    if (!m) return data;

    data.A.A0 = m[1];
    data.B.B0 = m[2];
    data.C.C0 = m[3];
    data.C.C1 = m[4];
    // C2 should include both original c2 and c3 characters
    data.C.C2 = m[5] + m[6];
    data.D.D0 = m[7];

    return data;
}

// ---------------- OCR → JSON via Gemini (same prompt) ----------------
async function convertOCRtoJSON_Gemini(ocrText, geminiApiKey) {
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    // EXACT same system prompt text from your notebook (verbatim)
    const system_msg = `
    You convert equipment nameplate OCR text into a compact JSON representation.

    Create a single JSON object with these top-level keys exactly:
    drive type, drive model, stringCode, partNumber, serialNumber, kw, hp,
    input, output, temp, maxTemp, assemblyLocation.

    Rules for each field:

    - drive: the drive type, for example from "VLT HVAC Drive" use "HVAC".
    - stringCode: the long model/type code string (often starting with FC- or similar).
    - partNumber: value from the part number line (P/N or similar).
    - serialNumber: value from the serial number line (S/N or similar).
    - kw: kW value only (numeric as string, no units), taken from the power line
      like "250 kW / 350 HP" -> "250".
    - hp: HP value only (numeric as string, no units), from the same power line
      like "250 kW / 350 HP" -> "350".

    - input: an object with keys phase, voltage, frequency, current.
        • phase: number of phases (e.g. "3" from "IN: 3x380-480V ...").
        • voltage: voltage range without the phase multiplier, e.g. "380-480V".
        • frequency: the frequency part with Hz (e.g. "50/60Hz").
        • current: the current part with A (e.g. "463/427A").
      Use the line that starts with "IN:" as the source.

    - output: an object with keys phase, voltage, frequency, current.
        • phase: number of phases from the OUT line.
        • voltage: voltage or voltage range part from the OUT line.
        • frequency: frequency range with Hz from the OUT line.
        • current: current part with A from the OUT line.
      Use the line that starts with "OUT:" as the source.

    Temperature fields:
    - temp: take only ONE temperature value that contains a degree symbol.
        • If the line shows both °C and °F (e.g. "40°C/104°F"), prefer the °C value
          and output exactly "40°C".
        • If only °F is present with a degree symbol, output that (e.g. "104°F").
    - maxTemp: same rule as temp, using the maximum temperature line
      (e.g. from "Max Tamb. 55°C/131°F w/Output Current Derating" -> "55°C").

    - assemblyLocation: the location taken from the "ASSEMBLED IN ..." line
      (e.g. "USA" or "India"), without the words "Assembled in".

    If any of these values cannot be found, still include the key with an empty string.
    All values must be strings.
    Do not create any additional keys besides the ones listed.
    Output ONLY valid JSON, with no extra text.
    `;

    const resp = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: [
            { text: system_msg },
            { text: ocrText },
        ],
        config: {
            // keep behavior deterministic-ish
            temperature: 0,
            responseMimeType: "application/json",
        },
    });

    const raw = String(resp.text ?? "").trim();

    // Extract JSON substring (same idea as notebook)
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
        throw new Error("Model did not return a JSON object.");
    }

    const jsonStr = raw.slice(start, end + 1);

    let data;
    try {
        data = JSON.parse(jsonStr);
    } catch (e) {
        throw new Error("Failed to parse JSON returned by model.");
    }

    // Post-process stringCode to add A/B/C/D fields
    data = addABCDfromStringCode(data);

    return data;
}

// ---------------- Full pipeline ----------------
async function processNameplateImage(imagePath, visionKeyPath, geminiApiKey) {
    console.log("Running OCR...");
    const ocrText = await runVisionOCR(imagePath, visionKeyPath);
    console.log("OCR text extracted:\n", ocrText);

    console.log("\nConverting to JSON using Gemini...");
    const result = await convertOCRtoJSON_Gemini(ocrText, geminiApiKey);
    console.log("Conversion complete.");

    // Normalize "INDIA" → "India" (same as notebook)
    if (result?.assemblyLocation && typeof result.assemblyLocation === "string") {
        result.assemblyLocation = result.assemblyLocation
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    return result;
}

// ---------------- Interactive CLI ----------------
async function main() {
    try {
        console.log("\nDrive Info Extraction (Node.js) — Gemini 3 Pro Review\n");

        const geminiApiKey = (await question("Enter Gemini API key: ")).trim();
        if (!geminiApiKey) {
            console.error("❌ Gemini API key required.");
            process.exit(1);
        }

        // Vision key: default to ./vision-key.json if present
        let visionKeyPath = "./vision-key.json";
        if (fs.existsSync(visionKeyPath)) {
            console.log(`Using Vision key: ${visionKeyPath}`);
        } else {
            visionKeyPath =
                (await question(
                    "Enter Google Vision key file path (default: ./vision-key.json): "
                )).trim() || "./vision-key.json";
        }

        if (!fs.existsSync(visionKeyPath)) {
            console.error("❌ Vision key file not found.");
            process.exit(1);
        }

        const imagePath = cleanPath(await question("Enter image file path: "));
        if (!imagePath || !fs.existsSync(imagePath)) {
            console.error(`❌ Image file not found: ${imagePath}`);
            console.log("Tip: If your path has spaces, you can paste it with quotes, e.g. \"C:\\Users\\...\\file.jpg\"");
            process.exit(1);
        }


        const result = await processNameplateImage(imagePath, visionKeyPath, geminiApiKey);

        console.log("\n===== FINAL JSON =====");
        console.log(JSON.stringify(result, null, 2));

        rl.close();
    } catch (err) {
        console.error("Fatal error:", err?.message || String(err));
        rl.close();
        process.exit(1);
    }
}

main();
