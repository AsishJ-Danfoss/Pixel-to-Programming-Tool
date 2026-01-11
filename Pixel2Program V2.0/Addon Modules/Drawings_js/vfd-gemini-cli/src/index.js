// src/index.js
// Single-file CLI version of your notebook logic.
// Run: npm start  -> paste/drag-drop a PDF path -> prints model output.
//
// NOTE: This CLI supports env var GEMINI_API_KEY, or it will prompt you in the terminal.

import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";

import {
    GoogleGenAI,
    createUserContent,
    createModelContent,
    createPartFromUri,
} from "@google/genai";

const GEMINI_MODEL_NAME = "gemini-3-pro-preview";

const DETAILED_PROMPT = `
You are an expert Electrical Automation Engineer. Your goal i...extract the **FUNCTION** of VFD terminals from a wiring diagram.



**TARGET LIST:**
Extract data ONLY for these numbers:
* DIN: [18, 19, 37, 32, 33]
* DIN/DOUT: [27, 29]
* AIN: [53, 54]
* AOUT: [42]
* RELAYS: [-R01, -R02]

Look at the examples and get to understand. For every number try to underst...omparing the instruction in the image and the below instruction.
But the target list of the numbers may not be the same. in the c...ck the output of the type 8 with the document and understand the
pattern. Also in the DIN, DI/DOUT and for other there are number...with no instruction and 54 with some instruction. If you find an
instruction associated with 53, then double check it whether the actual instruction is written for 53 or 54. Many time 53 and 54
are close. And its not always 18/19 etc, instead look for DIN or DIN1 or something like that and then extract the instruction and and
the numbers. So its not always the numbers, but also based on the DIN section. Sometimes only few may be available, in that case extarct
only those numbers and corresponding instruction. Do not list all the numbers with no instruction. That instructions may also include
D.IN or DIN1, DI/DOUT1. This would be helpful to identify under which section in the image and the below instruction.
When the list says the all the DIN numbers are available. Sometimes only few may be available, in that case extarct only
those numbers and corresponding instruction. Do not list all the numbers with no instruction.
`;

const EXAMPLES = [
    {
        filename: "Type - 2 Document.pdf",
        output_json: `
        {
           "DIN": {
                "18": "START/STOP",
                "19": "FREEZE REFERENCE",
                "32": "SPEED INCREASE",
                "33": "SPEED DECREASE",
                "37": "RUN ENABLE"
        },

            "DIN/DOUT": {
                "27": "VFD READY",
                "29": "PHF CONT.",
        },

            "AIN": {
                "53": "NO INSTRUCTION",
                "54": "4-20Ma SPEED REF, FROM UCP",

        },
            "AOUT": {
                "42": "4-20Ma SPEED FEEDBACK TO UCP"
            },
            "RELAYS": {
                "-R01": "VFD RUN",
                "-R02": "VFD TRIP"
            }
        }
        `
    },
    {
        filename: "Type - 4 Document.pdf",
        output_json: `
        {
            "DIN": {
                "18": "START/STOP",
                "19": "FREEZE REFERENCE",
                "32": "SPEED INCREASE",
                "33": "SPEED DECREASE",
                "37": "RUN ENABLE"
        },

            "DIN/DOUT": {
                    "27": "VFD READY",
                    "29": "PHF CONT. DISCONNECT"

        },

            "AIN": {
                "53": "NO INSTRUCTION",
                "54": "4-20mA SPEED REFERENCE from DCS"

        },

            "AOUT": {
                "42": "4-20mA SPEED FEEDBACK to DCS"
        },

            "RELAYS": {
                "-R01": "VFD RUN",
                "-R02": "VFD TRIP"
            }
        }
        `
    },
    {
        filename: "Type - 6 Document.pdf",
        output_json: `
        {
            "DIN": {
                "18": "MOTOR START",
                "19": "FREEZE REFERENCE",
                "32": "SPEED DECREASE",
                "33": "MOTOR THERMISTOR",
                "37": "NO INSTRUCTION"
        },

            "DIN/DOUT": {
                    "27": "VFD READY",
                    "29": "SPEED INCREASE",

        },

            "AIN": {
                "53": " NO INSTRUCTION",
                "54": " 4-20mA SPEED REFERENCE from DCS"

        },
            "AOUT": {
                "42": "4-20Ma SPEED FB TO DCS(SIGNAL ISOLATOR)"
        },

            "RELAYS": {
                "-R01": "MOTOR RUN",
                "-R02": "VFD TRIP"
            }
        }
        `
    },
    {
        filename: "Type - 9 Document.pdf",
        output_json: `
        {
            "DIN": {
                "13": "START/STOP",
                "14": "PANEL/REMOTE MODE SELECTED",
                "17": "NO INSTRUCTION",
                "18": "NO INSTRUCTION",
        },

            "DIN/DOUT": {
                    "15": "NO INSTRUCTION",
                    "16": "VFD READY"

        },

            "AIN": {
                "33": "4-20mA SPEED REF. FROM DCS",
                "34": "4-20mA SPEED REF. FROM DCS"

        },
            "AOUT": {
                "31": "4-20mA SPEED Fbk TO DCS"
        },

            "RELAYS": {
                "R01": "VFD RUN",
                "R02": "VFD TRIP"
            }
        }
        `
    },
    {
        filename: "Type - 10 Document.pdf",
        output_json: `
        {
            "DIN": {
                "18": "MAIN DRIVE ON/OFF",
                "19": "MAIN DRIVE FAULT/RESET",
                "32": "NO INSTRUCTION",
                "33": "MAIN DRIVE RPM DOWN",
                "37": "STO FROM FIELD"
        },

            "DIN/DOUT": {
                "53": "NO INTRUCTION",
                "54": "TO MOTOR PTC"

        },

            "AIN": {
                "53": "NO INTRUCTION",
                "54": "TO MOTOR PTC"    

        },
            "AOUT": {
                "42": "NO INSTRUCTION"
        },

            "RELAYS": {
                "-R01": "MAIN DRIVE RUNNING",
                "-R02": "MAIN DRIVE FAULT"
            }
        }
        `
    },
    {
        filename: "Type - 11 Document.pdf",
        output_json: `
        {
            "DIN": {
                "18": "START",
                "19": "NO INSTRUCTION",
        },

            "DIN/DOUT": {
                "27": "CASCADE PUMP - 3",
                "29": "NO INSTRUCTION"

        },

            "AIN": {
                "53": "NO INSTRUCTION",
                "54": "PRESSURE TRANSMITTER",

        },
            "AOUT": {
                "42": "NO INSTRUCTION",
                "45": "NO INSTRUCTION"
        },

            "RELAYS": {
                "RELAY-01": "TO CONTROL CIRCUIT CASCADE PUMP-1",
                "RELAY-02": "TO CONTROL CIRCUIT CASCADE PUMP-2"
            }
        }
        `
    },
    {
        filename: "Type - 13 Document.pdf",
        output_json: `
        {
            "DIN": {
                "18": "START/STOP",
                "19": "STEP CHANGE",
                "32": "SPEED INCREASE",
                "33": "SPEED DECREASE",
                "37": "NO INSTRUCTION"
        },

            "DIN/DOUT": {
                    "27": "VFD READY",
                    "29": "FREEZE REF.",

        },

            "AIN": {
                "53": "NO INSTRUCTION",
                "54": "SPEED Ref 4-20mA From DCS",

        },
            "AOUT": {
                "42": "4-20mA Amps Fbk TO DCS"
        },

            "RELAYS": {
                "-R01": "Drive Run",
                "-R02": "Drive Trip"
            }
        }
        `
    },
    {
        filename: "Type - 14 Document.pdf",
        output_json: `
        {
            "DIN": {
                "18": "START",
                "19": "NO INSTRUCTION",
                "32": "DP1",
                "33": "DP2"
        },

            "DIN/DOUT": {
                    "27": "TO SLAVE VFD 1&2 TERMINALS NO-20",
                    "29": "TO SLAVE VFD 1&2 TERMINALS NO-20"

        },

            "AIN": {
                "53": "PRESSURE TRANSMITTER-1",
                "54": "PRESSURE TRANSMITTER-2",

        },
            "AOUT": {
                "42": "4-20mA Amps Fbk TO DCS"
            },
            "RELAYS": {
                "RELAY 01": "TECH 502 VFD TRIP 6-8",
                "-R02": "NO INSTRUCTION"
            }
        }
        `
    }
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const EXAMPLES_DIR = path.join(PROJECT_ROOT, "examples");

async function exists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

function cleanCliPath(p) {
    // drag & drop in Windows terminal often wraps in quotes
    return (p ?? "").trim().replace(/^['"]|['"]$/g, "");
}

function stripCodeFences(text) {
    const t = (text ?? "").trim();
    if (t.includes("```json")) {
        return t.split("```json")[1].split("```")[0].trim();
    }
    if (t.startsWith("```")) {
        return t.split("```")[1]?.split("```")[0]?.trim() ?? t;
    }
    return t;
}

async function uploadPdf(ai, localPath) {
    const file = await ai.files.upload({
        file: localPath,
        config: { mimeType: "application/pdf" },
    });
    if (!file?.uri || !file?.mimeType) {
        throw new Error("Upload did not return uri/mimeType");
    }
    return file;
}

async function buildFewShotContents(ai) {
    const contents = [];

    for (const ex of EXAMPLES) {
        const exPath = path.join(EXAMPLES_DIR, ex.filename);
        if (!(await exists(exPath))) {
            console.log(`  - ⚠️ Missing example PDF, skipping: examples/${ex.filename}`);
            continue;
        }

        const exFile = await uploadPdf(ai, exPath);

        // USER TURN: example PDF + prompt
        contents.push(
            createUserContent([
                createPartFromUri(exFile.uri, exFile.mimeType),
                { text: DETAILED_PROMPT },
            ])
        );

        // MODEL TURN: expected JSON output
        // IMPORTANT: must be a text part (or createModelContent), NOT a raw string.
        contents.push(
            createModelContent([
                { text: String(ex.output_json) },
            ])
        );

        console.log(`  - Learned: ${ex.filename}`);
    }

    return contents;
}

async function main() {
    const rl = readline.createInterface({ input, output });

    try {
        // API key: env var OR prompt (since you asked no separate .env file)
        let apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            apiKey = cleanCliPath(
                await rl.question("🔑 Enter GEMINI API key:\n> ")
            );
        }
        if (!apiKey) {
            console.error("❌ Missing API key. Set GEMINI_API_KEY or paste it when prompted.");
            process.exit(1);
        }

        const ai = new GoogleGenAI({ apiKey });

        console.log("🧠 Learning from examples (few-shot)...");
        const fewShotContents = await buildFewShotContents(ai);
        console.log("✅ Ready.");

        const rawPdfPath = await rl.question(
            "\n📄 Enter PDF path (or drag & drop the PDF here, then press Enter):\n> "
        );
        const pdfPath = cleanCliPath(rawPdfPath);

        if (!pdfPath) {
            console.error("❌ No path provided.");
            process.exit(1);
        }
        if (!(await exists(pdfPath))) {
            console.error(`❌ File not found: ${pdfPath}`);
            process.exit(1);
        }

        console.log(`\n🚀 Analyzing: ${pdfPath}`);
        const targetFile = await uploadPdf(ai, pdfPath);

        const resp = await ai.models.generateContent({
            model: GEMINI_MODEL_NAME,
            contents: [
                ...fewShotContents,
                createUserContent([
                    createPartFromUri(targetFile.uri, targetFile.mimeType),
                    { text: DETAILED_PROMPT },
                ]),
            ],
        });

        const result = stripCodeFences(resp.text);

        console.log("\n--- RESULT ---");
        console.log(result);
    } finally {
        rl.close();
    }
}

main().catch((e) => {
    console.error("❌ Error:", e?.message ?? e);
    process.exit(1);
});
