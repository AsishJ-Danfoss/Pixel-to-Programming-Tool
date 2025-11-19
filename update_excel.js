// update_excel.js
const XLSX = require("xlsx");
const fs = require("fs");

// Arguments from command line:
// node update_excel.js <inputPath> <outputPath> [jsonString]
// If jsonString is not provided, reads from stdin
const args = process.argv.slice(2);
const inputPath = args[0];
const outputPath = args[1];
let jsonString = args[2];

if (!inputPath || !outputPath) {
  console.error("❌ Usage: node update_excel.js <inputPath> <outputPath> [jsonString]");
  process.exit(1);
}

console.log("Input File:", inputPath);
console.log("Output File:", outputPath);

// Mapping table: JSON path -> Excel cell
const cellMapping = {
  "configuration.control_mode": "J109",
  "configuration.motor_control_principle": "J110",
  "configuration.motor_construction": "J114",
  "motor_data.selected_rating.Power": "J115",
  "motor_data.selected_rating.Voltage": "J116",
  "motor_data.selected_rating.Frequency": "J117",
  "motor_data.selected_rating.Current": "J118",
  "motor_data.selected_rating.Speed": "J119",
  "configuration.reference_site": "J120",
  "configuration.torque_limit": "J200",
  "configuration.current_limit": "J201"
};

/**
 * Recursively extracts a value from a nested object using a dot-notation path.
 * Handles keys with spaces (e.g., "Connection type").
 * @param {Object} obj - The object to search
 * @param {string} path - Dot-notation path (e.g., "motor_data.selected_rating.Power")
 * @returns {*} The value at the path, or undefined if not found
 */
function getNestedValue(obj, path) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length; i++) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[keys[i]];
  }
  
  return current;
}

/**
 * Parses JSON string, handling both direct JSON and n8n webhook format
 * @param {string} jsonStr - JSON string from webhook
 * @returns {Object} Parsed JSON object
 */
function parseWebhookJSON(jsonStr) {
  if (!jsonStr) {
    throw new Error("No JSON string provided");
  }
  
  let parsed = JSON.parse(jsonStr);
  
  // Handle n8n webhook format: [[{...}]]
  if (Array.isArray(parsed) && parsed.length > 0) {
    if (Array.isArray(parsed[0]) && parsed[0].length > 0) {
      parsed = parsed[0][0];
    } else {
      parsed = parsed[0];
    }
  }
  
  // If webhook structure, extract body
  if (parsed.body) {
    return parsed.body;
  }
  
  return parsed;
}

/**
 * Process the Excel file with the provided JSON data
 * @param {string} jsonStr - JSON string to process
 */
function processExcel(jsonStr) {
  // 1. Parse JSON payload
  let jsonData;
  try {
    console.log("📝 Parsing JSON payload...");
    jsonData = parseWebhookJSON(jsonStr);
    console.log("✅ JSON parsed successfully");
    console.log("Customer:", jsonData.customer_info?.customer_name || "N/A");
    console.log("Motor Model:", jsonData.motor_data?.model_number || "N/A");
  } catch (err) {
    console.error("❌ Error parsing JSON:", err.message);
    process.exit(1);
  }

  // 2. Read Excel template
  let workbook;
  try {
    console.log("📖 Reading Excel template...");
    workbook = XLSX.readFile(inputPath);
    console.log("✅ Excel template loaded");
  } catch (err) {
    console.error("❌ Error reading Excel file:", err.message);
    process.exit(1);
  }

  const sheetName = workbook.SheetNames[0];  // first sheet
  const sheet = workbook.Sheets[sheetName];

  // 3. Map JSON values to Excel cells
  console.log("🔄 Mapping JSON values to Excel cells...");
  let mappedCount = 0;
  let missingCount = 0;

  for (const [jsonPath, cellAddress] of Object.entries(cellMapping)) {
    const value = getNestedValue(jsonData, jsonPath);
    
    if (value !== undefined && value !== null) {
      // Determine cell type based on value type
      let cellType = "s"; // default to string
      let cellValue = value;
      
      if (typeof value === "number") {
        cellType = "n";
      } else if (typeof value === "boolean") {
        cellType = "b";
      } else {
        cellValue = String(value);
      }
      
      // Write to Excel cell
      sheet[cellAddress] = { t: cellType, v: cellValue };
      console.log(`  ✓ ${cellAddress} = ${cellValue} (from ${jsonPath})`);
      mappedCount++;
    } else {
      console.warn(`  ⚠ ${cellAddress}: No value found for ${jsonPath}`);
      missingCount++;
    }
  }

  console.log(`📊 Mapping complete: ${mappedCount} values written, ${missingCount} missing`);

  // 4. Save updated workbook
  try {
    console.log("💾 Saving Excel file...");
    XLSX.writeFile(workbook, outputPath);
    console.log("✅ Excel updated successfully");
    console.log("Output saved to:", outputPath);
  } catch (err) {
    console.error("❌ Error writing Excel file:", err.message);
    process.exit(1);
  }
}

// Check if JSON string is provided as argument or if we need to read from stdin
if (jsonString) {
  // JSON provided as command line argument
  processExcel(jsonString);
} else {
  // Read JSON from stdin (for n8n Execute Command with pipe)
  console.log("📥 Waiting for JSON input from stdin...");
  let inputData = '';
  
  process.stdin.setEncoding('utf8');
  
  process.stdin.on('data', function(chunk) {
    inputData += chunk;
  });
  
  process.stdin.on('end', function() {
    if (!inputData.trim()) {
      console.error("❌ No JSON data received from stdin");
      process.exit(1);
    }
    processExcel(inputData);
  });
}
