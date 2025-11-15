// update_excel.js
const XLSX = require("xlsx");

// Arguments from command line:
// node update_excel.js <inputPath> <outputPath> <modelNumber> <voltage> <current>
const [inputPath, outputPath, modelNumber, voltage, current] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  console.error("❌ Usage: node update_excel.js <inputPath> <outputPath> <modelNumber> <voltage> <current>");
  process.exit(1);
}

console.log("Input File:", inputPath);
console.log("Output File:", outputPath);
console.log("Model:", modelNumber);
console.log("Voltage:", voltage);
console.log("Current:", current);

// 1. Read Excel template
let workbook;
try {
  workbook = XLSX.readFile(inputPath);
} catch (err) {
  console.error("❌ Error reading Excel file:", err.message);
  process.exit(1);
}

const sheetName = workbook.SheetNames[0];  // first sheet
const sheet = workbook.Sheets[sheetName];

// 2. Update cells (adjust B2/C2/D2 as needed)
//sheet["B2"] = { t: "s", v: modelNumber || "" };  // model number
sheet["J116"] = { t: "s", v: voltage || "" };      // voltage
sheet["J118"] = { t: "s", v: current || "" };      // current
//sheet["E2"] = { t: "s", v: new Date().toISOString() }; // optional timestamp

// 3. Save updated workbook
try {
  XLSX.writeFile(workbook, outputPath);
  console.log("✅ Excel updated successfully");
} catch (err) {
  console.error("❌ Error writing Excel file:", err.message);
  process.exit(1);
}
