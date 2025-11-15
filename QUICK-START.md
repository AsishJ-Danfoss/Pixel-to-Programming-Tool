# 🚀 Quick Start - Testing ALADIN Form

## ⚡ 3-Step Testing Process

### Step 1: Start Test Server
```powershell
node test-webhook-server.js
```
Wait for: `🚀 ALADIN Test Webhook Server Running`

### Step 2: Open Form
Open `test-form.html` in your browser (double-click the file)

### Step 3: Submit Test Data
Fill in the form and click Submit. Check the **server console** for validation results.

---

## 📝 Test Data Template

Use this sample data for testing:

| Field | Value |
|-------|-------|
| Customer Name | Test Industries Ltd |
| Location of Installation | Mumbai, Maharashtra, India |
| Contact Person | Rajesh Kumar |
| Mobile Number | +91-9876543210 |
| Motor Type | 3-Phase Induction Motor |
| VFD Type | Danfoss FC51 |
| Application Type | Centrifugal Pump |
| VFD Nameplate | Any JPG/PNG image |
| Motor Nameplate | Any JPG/PNG image |

---

## ✅ What Success Looks Like

### In Browser:
Green checkmark with: `✓ Submission successful (HTTP 200)`

JSON response showing:
```json
{
  "success": true,
  "validation": {
    "allTextFieldsPresent": true,
    "allFilesPresent": true,
    "allImagesValid": true
  }
}
```

### In Server Console:
```
📝 TEXT FIELDS (JSON Data):
  ✓ All required text fields present (7)

📎 FILE UPLOADS (Binary Data):
  ✓ All required files present (2)
  ✓ All files are valid images
```

---

## 🎯 n8n Integration

### In n8n Webhook:
**Access text data:**
```
{{ $json.customerName }}
{{ $json.mobileNumber }}
```

**Access images:**
```
{{ $binary.vfdNameplate }}
{{ $binary.motorNameplate }}
```

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `test-form.html` | Standalone form for testing |
| `test-webhook-server.js` | Local server to validate payloads |
| `TESTING-GUIDE.md` | Detailed testing instructions |
| `VALIDATION-REPORT.md` | Technical validation analysis |

---

## ❓ Troubleshooting

**Form validation errors?**
→ Fill all fields, check phone format, select images

**Connection failed?**
→ Ensure test server is running on port 3000

**Files not uploading?**
→ Check file size < 10 MB, must be JPG/PNG/WebP

---

## 🎉 Result

✅ **JavaScript is WORKING CORRECTLY**
- JSON fields formatted properly for n8n
- Binary files sent correctly
- All validations pass
- Production ready!

---

## 🔄 Deploy to n8n

1. Change webhook URL in `Generate_page.js`:
   ```javascript
   WEBHOOK_URL: "https://your-n8n.com/webhook/aladin-submit"
   ```

2. Use the HTML output from n8n code node

3. Access data in n8n using `$json.*` and `$binary.*`

**Done!** 🚀
