// app_fixed_v3.js
// Motor Nameplate Extract + Verify (Terminal)
// Fixes:
// 1) SyntaxError due to accidental newline inside split("\n")
// 2) Auto-mode failure path referencing base.power_kW (base not in scope)
// 3) IsVerified: true on pass, false on any failure; message is short one-line

import fs from "fs";
import path from "path";
import readline from "readline";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

/** ---------- Utils ---------- **/
function guessMime(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
}

function toNumberOrNull(x) {
  if (x === null || x === undefined) return null;
  if (typeof x === "number") return Number.isFinite(x) ? x : null;
  const s = String(x).trim().replace(/,/g, "");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function toStringOrNull(x) {
  if (x === null || x === undefined) return null;
  const s = String(x).trim();
  return s ? s : null;
}

function normalizeConnType(x) {
  const s = toStringOrNull(x);
  if (!s) return null;
  const u = s.toUpperCase();
  if (["Y", "STAR", "WYE"].includes(u)) return "STAR";
  if (["Δ", "D", "DELTA"].includes(u)) return "DELTA";
  return u;
}

function printDivider() {
  console.log("\n" + "-".repeat(80) + "\n");
}

function closeEnough(a, b) {
  if (typeof a !== "number" || typeof b !== "number") return false;
  const diff = Math.abs(a - b);
  const tol = Math.max(0.5, Math.abs(b) * 0.01); // 0.5 kW or 1%
  return diff <= tol;
}

/**
 * computed_kW = (V * A * cosphi * sqrt(3) * eff_percent) / 100000
 */
function computeKW_from_VIAcos_effPercent({ V, A, cosphi, effPercent }) {
  if ([V, A, cosphi, effPercent].some((v) => typeof v !== "number")) return null;
  return (V * A * cosphi * Math.sqrt(3) * effPercent) / 100000;
}

/**
 * eff(%) = (Pout*100) / (sqrt(3)*V*I*cosphi)
 */
function computeEffPercent_from_kW_VIAcos({ kW, V, A, cosphi }) {
  if ([kW, V, A, cosphi].some((v) => typeof v !== "number")) return null;
  const PoutW = kW * 1000;
  return (PoutW * 100) / (Math.sqrt(3) * V * A * cosphi);
}

/**
 * cosphi = (Pout*100) / (sqrt(3)*V*I*eff(%))
 */
function computeCosphi_from_kW_VIAeffPercent({ kW, V, A, effPercent }) {
  if ([kW, V, A, effPercent].some((v) => typeof v !== "number")) return null;
  const PoutW = kW * 1000;
  return (PoutW * 100) / (Math.sqrt(3) * V * A * effPercent);
}

/** ---------- Requested Output JSON builder ---------- **/
function buildMotorDataNull() {
  return {
    motor_model: null,
    motor_serial_no: null,
    voltage_V: null,
    current_A: null,
    power_kW: null,
    frequency_Hz: null,
    speed_rpm: null,
    connection_type: null,
  };
}

function buildMotorDataFromFilled(filled) {
  return {
    motor_model: filled.motor_model ?? null,
    motor_serial_no: filled.motor_serial_no ?? null,
    voltage_V: filled.voltage_V ?? null,
    current_A: filled.current_A ?? null,
    power_kW: filled.power_kW ?? null,
    frequency_Hz: filled.frequency_Hz ?? null,
    speed_rpm: filled.speed_rpm ?? null,
    connection_type: filled.connection_type ?? null,
  };
}

function buildOutputJson({ config_mode, isVerified, message, motorData }) {
  return {
    config_mode,
    IsVerified: isVerified,
    message,
    "Motor data": motorData,
  };
}

function buildVerificationFailureMessage({ reason, computed_kW, nameplate_kW }) {
  // One-line, short message as requested
  if (reason) {
    const short = String(reason).split("|")[0].trim();
    return (`VERIFICATION ERROR: ${short}`).slice(0, 120);
  }
  if (typeof computed_kW === "number" && typeof nameplate_kW === "number") {
    return "VERIFICATION FAILED: kW mismatch";
  }
  return "VERIFICATION FAILED";
}

/** ---------- Zod schema Gemini must match ---------- **/
const extractSchema = z.object({
  motor_model: z.string().nullable().describe("Motor model/type. If not readable, null."),
  motor_serial_no: z.string().nullable().describe("Motor serial number. If not readable, null."),

  voltage_V: z.number().nullable().describe("Rated voltage in volts (line-to-line). Prefer 50 Hz row if multiple."),
  current_A: z.number().nullable().describe("Rated current in amps for the same row."),
  power_kW: z.number().nullable().describe("Power in kW for the same row."),
  frequency_Hz: z.number().nullable().describe("Frequency in Hz for the same row (typically 50 or 60)."),
  speed_rpm: z.number().nullable().describe("Speed in r/min (rpm) for the same row."),
  connection_type: z.string().nullable().describe("Connection type: STAR/DELTA (or Y/Δ). If unclear, null."),

  powerFactor_cosphi: z.number().nullable().describe("Power factor cos(phi), e.g. 0.84."),
  efficiency_percent: z.number().nullable().describe("Efficiency in percent, e.g. 95.8 (NOT 0.958)."),

  chosen_row_reason: z.string().describe("Which row you used."),
  extraction_notes: z.string().describe("Ambiguities/missing text/multiple rows or anything uncertain."),
});

/** ---------- Readline ---------- **/
function createRL() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });
}

function question(rl, prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

async function askYesNo(rl, prompt) {
  while (true) {
    const ans = (await question(rl, prompt)).trim().toLowerCase();
    if (["y", "yes"].includes(ans)) return true;
    if (["n", "no"].includes(ans)) return false;
    console.log("Please type yes or no.");
  }
}

async function askNumber(rl, label) {
  while (true) {
    const raw = (await question(rl, `${label}: `)).trim();
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
    console.log("Please enter a valid number.");
  }
}

async function askNumberOrNo(rl, label) {
  while (true) {
    const raw = (await question(rl, `${label} (type 'no' if not available): `)).trim().toLowerCase();
    if (raw === "no") return null;
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
    console.log("Please enter a valid number or 'no'.");
  }
}

async function askTextOrEmpty(rl, label) {
  const raw = (await question(rl, `${label}: `)).trim();
  return raw ? raw : null;
}

/** ---------- Gemini call ---------- **/
async function extractWithGemini({ apiKey, filePath }) {
  const buf = fs.readFileSync(filePath);
  const mimeType = guessMime(filePath);
  const base64 = buf.toString("base64");

  const ai = new GoogleGenAI({ apiKey });

  const prompt =
    `You are extracting motor nameplate data from an image.\n\n` +
    `Return ONLY JSON that matches the provided JSON schema.\n\n` +
    `Rules:\n` +
    `- Extract these fields from ONE consistent rated row:\n` +
    `  motor_model, motor_serial_no,\n` +
    `  voltage_V, current_A, power_kW, frequency_Hz, speed_rpm, connection_type,\n` +
    `  powerFactor_cosphi, efficiency_percent\n` +
    `- Prefer the 50 Hz rated row if multiple rows exist.\n` +
    `- efficiency_percent must be percent like 95.8 (NOT 0.958).\n` +
    `- If a value is unreadable, return null.\n` +
    `- For connection_type, use STAR or DELTA if possible; otherwise null.\n`;

  const resp = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: [{ inlineData: { mimeType, data: base64 } }, { text: prompt }],
    config: {
      thinkingConfig: { thinkingLevel: "low" },
      responseMimeType: "application/json",
      responseJsonSchema: zodToJsonSchema(extractSchema),
    },
  });

  const parsed = JSON.parse(resp.text);

  return {
    motor_model: toStringOrNull(parsed.motor_model),
    motor_serial_no: toStringOrNull(parsed.motor_serial_no),

    voltage_V: toNumberOrNull(parsed.voltage_V),
    current_A: toNumberOrNull(parsed.current_A),
    power_kW: toNumberOrNull(parsed.power_kW),
    frequency_Hz: toNumberOrNull(parsed.frequency_Hz),
    speed_rpm: toNumberOrNull(parsed.speed_rpm),
    connection_type: normalizeConnType(parsed.connection_type),

    powerFactor_cosphi: toNumberOrNull(parsed.powerFactor_cosphi),
    efficiency_percent: toNumberOrNull(parsed.efficiency_percent),

    chosen_row_reason: String(parsed.chosen_row_reason ?? ""),
    extraction_notes: String(parsed.extraction_notes ?? ""),
  };
}

/** ---------- Fill missing (ONLY the two allowed cases) ---------- **/
function fillMissingCosphiOrEff(extracted) {
  const V = extracted.voltage_V;
  const A = extracted.current_A;
  const kW = extracted.power_kW;

  let cosphi = extracted.powerFactor_cosphi;
  let eff = extracted.efficiency_percent;

  const filled = {
    ...extracted,
    powerFactor_cosphi: cosphi,
    efficiency_percent: eff,
  };

  if (typeof V !== "number" || typeof A !== "number" || typeof kW !== "number") {
    return {
      okToVerify: false,
      reason: "Missing V/A/kW",
      filled,
    };
  }

  // If BOTH missing: allow fallback verify
  if (cosphi === null && eff === null) {
    return { okToVerify: true, reason: null, filled };
  }

  // If cosphi missing, eff present => compute cosphi
  if (cosphi === null && typeof eff === "number") {
    const c = computeCosphi_from_kW_VIAeffPercent({ kW, V, A, effPercent: eff });
    if (typeof c === "number" && Number.isFinite(c)) {
      filled.powerFactor_cosphi = c;
    } else {
      return { okToVerify: false, reason: "Missing cosphi", filled };
    }
  }

  // If eff missing, cosphi present => compute eff
  if (eff === null && typeof filled.powerFactor_cosphi === "number") {
    const e = computeEffPercent_from_kW_VIAcos({ kW, V, A, cosphi: filled.powerFactor_cosphi });
    if (typeof e === "number" && Number.isFinite(e)) {
      filled.efficiency_percent = e;
    } else {
      return { okToVerify: false, reason: "Missing efficiency", filled };
    }
  }

  if (
    filled.powerFactor_cosphi !== null &&
    typeof filled.powerFactor_cosphi !== "number"
  ) {
    return { okToVerify: false, reason: "Invalid cosphi", filled };
  }

  if (
    filled.efficiency_percent !== null &&
    typeof filled.efficiency_percent !== "number"
  ) {
    return { okToVerify: false, reason: "Invalid efficiency", filled };
  }

  // If one still missing, cannot verify
  if (filled.powerFactor_cosphi === null || filled.efficiency_percent === null) {
    return { okToVerify: false, reason: "Missing cosphi/eff", filled };
  }

  return { okToVerify: true, reason: null, filled };
}

/** ---------- Verify ---------- **/
function verifyKW(filled) {
  const V = filled.voltage_V;
  const A = filled.current_A;
  const cosphi = filled.powerFactor_cosphi;
  const eff = filled.efficiency_percent;
  const kW = filled.power_kW;

  let computed_kW = null;

  const hasVAI = typeof V === "number" && typeof A === "number" && typeof kW === "number";

  if (cosphi === null && eff === null) {
    if (hasVAI) {
      computed_kW = (V * A * Math.sqrt(3) * 0.8) / 1000;
    }
  } else {
    computed_kW = computeKW_from_VIAcos_effPercent({ V, A, cosphi, effPercent: eff });
  }

  const isMatch = typeof computed_kW === "number" && typeof kW === "number" && closeEnough(computed_kW, kW);
  return { computed_kW, isMatch };
}

/** ---------- Manual flow ---------- **/
async function manualEntryLoop(rl) {
  while (true) {
    printDivider();
    console.log("Manual entry\n");

    const motor_model = await askTextOrEmpty(rl, "Motor Model (required)");
    if (!motor_model) {
      console.log("Motor Model is required.");
      continue;
    }
    const motor_serial_no = await askTextOrEmpty(rl, "Motor Serial No (optional)");

    const voltage_V = await askNumber(rl, "voltage_V");
    const current_A = await askNumber(rl, "current_A");
    const power_kW = await askNumber(rl, "power_kW");
    const frequency_Hz = await askNumber(rl, "frequency_Hz");
    const speed_rpm = await askNumber(rl, "speed_rpm");
    const connection_type = normalizeConnType(await askTextOrEmpty(rl, "connection_type (STAR/DELTA)"));

    const cosphi = await askNumberOrNo(rl, "cosphi");
    const effi = await askNumberOrNo(rl, "efficiency_percent");

    const base = {
      motor_model,
      motor_serial_no,
      voltage_V,
      current_A,
      power_kW,
      frequency_Hz,
      speed_rpm,
      connection_type,
      powerFactor_cosphi: cosphi,
      efficiency_percent: effi,
      chosen_row_reason: "manual_entry",
      extraction_notes: "manual_entry",
    };

    const filledResult = fillMissingCosphiOrEff(base);
    if (!filledResult.okToVerify) {
      const out = buildOutputJson({
        config_mode: "Manual",
        isVerified: false,
        message: buildVerificationFailureMessage({ reason: filledResult.reason, computed_kW: null, nameplate_kW: base.power_kW }),
        motorData: buildMotorDataNull(),
      });
      console.log(JSON.stringify(out, null, 2));

      const again = await askYesNo(rl, "Do you want to enter details manually again? (yes/no): ");
      if (again) continue;
      return { success: false };
    }

    const check = verifyKW(filledResult.filled);

    if (check.isMatch) {
      const out = buildOutputJson({
        config_mode: "Manual",
        isVerified: true,
        message: "VERIFICATION PASSED",
        motorData: buildMotorDataFromFilled(filledResult.filled),
      });
      console.log(JSON.stringify(out, null, 2));
      console.log("✅ VERIFICATION PASSED");
      return { success: true };
    }

    const out = buildOutputJson({
      config_mode: "Manual",
      isVerified: false,
      message: buildVerificationFailureMessage({ reason: null, computed_kW: check.computed_kW, nameplate_kW: base.power_kW }),
      motorData: buildMotorDataNull(),
    });
    console.log(JSON.stringify(out, null, 2));
    console.log("❌ VERIFICATION FAILED");

    const again = await askYesNo(rl, "Do you want to enter the details manually again? (yes/no): ");
    if (again) continue;
    return { success: false };
  }
}

/** ---------- Main ---------- **/
async function main() {
  const rl = createRL();

  try {
    console.log("Motor Nameplate Extract + Verify (Terminal)\n");

    let apiKey = (await question(rl, "Enter Gemini API key: ")).trim();
    if (!apiKey) {
      console.log("No API key provided. Exiting.");
      process.exit(1);
    }

    let attempts = 0;

    while (attempts < 3) {
      const filePath = (await question(rl, "Enter image file path to analyze: "))
        .trim()
        .replace(/^\"(.*)\"$/, "$1");

      if (!filePath) continue;

      if (!fs.existsSync(filePath)) {
        console.log("File not found. Please enter a valid path.");
        continue;
      }

      attempts += 1;

      printDivider();
      console.log(`Attempt ${attempts}/3 — analyzing: ${filePath}\n`);

      let extracted;
      try {
        extracted = await extractWithGemini({ apiKey, filePath });
      } catch (e) {
        const msg = e?.message || String(e);

        console.log("Gemini request failed:", msg);

        const out = buildOutputJson({
          config_mode: "Auto",
          isVerified: false,
          // FIX: keep it one line and safe
          message: `EXTRACTION ERROR: ${String(msg).split("\n")[0].slice(0, 80)}`,
          motorData: buildMotorDataNull(),
        });
        console.log(JSON.stringify(out, null, 2));
        console.log("Please reupload (try again with a clearer image).");
        continue;
      }

      const filledResult = fillMissingCosphiOrEff(extracted);
      if (!filledResult.okToVerify) {
        const out = buildOutputJson({
          config_mode: "Auto",
          isVerified: false,
          // FIX: use extracted.power_kW (base not in scope)
          message: buildVerificationFailureMessage({
            reason: filledResult.reason,
            computed_kW: null,
            nameplate_kW: extracted.power_kW,
          }),
          motorData: buildMotorDataNull(),
        });
        console.log(JSON.stringify(out, null, 2));
        console.log("➡️ Please reupload a clearer image.");
        continue;
      }

      const check = verifyKW(filledResult.filled);
      if (check.isMatch) {
        const out = buildOutputJson({
          config_mode: "Auto",
          isVerified: true,
          message: "VERIFICATION PASSED",
          motorData: buildMotorDataFromFilled(filledResult.filled),
        });
        console.log(JSON.stringify(out, null, 2));
        console.log("✅ VERIFICATION PASSED");
        rl.close();
        return;
      }

      const out = buildOutputJson({
        config_mode: "Auto",
        isVerified: false,
        message: buildVerificationFailureMessage({
          reason: null,
          computed_kW: check.computed_kW,
          nameplate_kW: extracted.power_kW,
        }),
        motorData: buildMotorDataNull(),
      });
      console.log(JSON.stringify(out, null, 2));
      console.log("❌ VERIFICATION FAILED");
      console.log("➡️ Please reupload a clearer image.");
    }

    printDivider();
    console.log("3 image attempts failed. Switching to manual entry.");

    const manual = await manualEntryLoop(rl);
    if (!manual.success) {
      printDivider();
      console.log("Stopping. No successful verification.");
    }

    rl.close();
  } catch (err) {
    console.log("Fatal error:", err?.message || String(err));
    rl.close();
    process.exit(1);
  }
}

main();
