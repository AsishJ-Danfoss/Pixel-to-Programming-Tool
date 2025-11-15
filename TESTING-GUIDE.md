# Danfoss ALADIN - Form Validation Guide

## 📋 Testing Overview

This guide will help you validate that the JavaScript form is generating proper JSON and binary files for n8n integration.

---

## 🛠️ Test Setup

### Files Created:
1. **`test-form.html`** - Standalone HTML form for testing
2. **`test-webhook-server.js`** - Node.js server to capture and validate payloads

---

## 🚀 How to Test

### Step 1: Start the Test Server

Open PowerShell in the ALADIN folder and run:

```powershell
node test-webhook-server.js
```

**Expected Output:**
```
================================================================================
🚀 ALADIN Test Webhook Server Running
================================================================================
Server: http://localhost:3000
Webhook endpoint: http://localhost:3000/webhook

Waiting for form submissions...
```

### Step 2: Open the Test Form

Open `test-form.html` in your browser (Chrome, Edge, or Firefox).

### Step 3: Fill Out the Form

Fill in all required fields:
- **Customer Name**: Test Industries
- **Location of Installation**: Mumbai, Maharashtra
- **Contact Person**: Rajesh Kumar
- **Mobile Number**: +91-9876543210
- **Motor Type**: 3-Phase Induction Motor
- **VFD Type**: Danfoss FC51
- **Application Type**: Pump

Upload two test images (any JPEG/PNG images will work).

### Step 4: Submit and Observe

Click **Submit** and check:

1. **Browser Response Box** - Should show success JSON
2. **Server Console** - Should display detailed analysis

---

## ✅ What to Validate

### 1. JSON Text Fields (Server Console)

You should see output like:
```
📝 TEXT FIELDS (JSON Data):
--------------------------------------------------------------------------------
  customerName: Test Industries
  locationOfInstallation: Mumbai, Maharashtra
  contactPerson: Rajesh Kumar
  mobileNumber: +91-9876543210
  motorType: 3-Phase Induction Motor
  vfdType: Danfoss FC51
  applicationType: Pump
  source: Danfoss ALADIN Web UI
  timestamp: 2025-11-15T10:30:45.123Z
  submittedAt: 15/11/2025, 4:00:45 pm
```

**✓ Validation:**
- All 7 required fields are present
- Metadata fields (source, timestamp, submittedAt) are included
- Values are properly formatted strings

---

### 2. Binary File Uploads (Server Console)

You should see:
```
📎 FILE UPLOADS (Binary Data):
--------------------------------------------------------------------------------
  File 1:
    Field Name: vfdNameplate
    Filename: vfd-image.jpg
    Content-Type: image/jpeg
    Size: 245.67 KB (251586 bytes)
  File 2:
    Field Name: motorNameplate
    Filename: motor-image.jpg
    Content-Type: image/jpeg
    Size: 189.23 KB (193771 bytes)
```

**✓ Validation:**
- Both files present (vfdNameplate, motorNameplate)
- Content-Type starts with `image/`
- File sizes are within 10 MB limit
- Original filenames preserved

---

### 3. Browser Response

The form should display a success message with JSON:
```json
{
  "success": true,
  "message": "Form data received and validated successfully",
  "timestamp": "2025-11-15T10:30:45.123Z",
  "received": {
    "textFieldCount": 10,
    "fileCount": 2,
    "totalSize": 445357
  },
  "validation": {
    "allTextFieldsPresent": true,
    "allFilesPresent": true,
    "allImagesValid": true
  }
}
```

---

## 🔍 Validation Checklist

### Text Field Validation
- [ ] All 7 required fields present
- [ ] No empty values
- [ ] Mobile number format validated
- [ ] Metadata automatically added

### Binary File Validation
- [ ] Both image files uploaded
- [ ] Files sent as binary data (not base64 in JSON)
- [ ] Content-Type is image/*
- [ ] File sizes under 10 MB
- [ ] Original filenames preserved

### FormData Structure
- [ ] Text fields accessible as separate form fields
- [ ] Files sent as multipart/form-data
- [ ] Proper Content-Disposition headers
- [ ] Boundary properly set

---

## 🎯 n8n Integration Verification

### How n8n Will Receive the Data:

#### Text Fields (JSON)
```javascript
// Access in n8n expressions:
{{ $json.customerName }}              // "Test Industries"
{{ $json.locationOfInstallation }}    // "Mumbai, Maharashtra"
{{ $json.contactPerson }}             // "Rajesh Kumar"
{{ $json.mobileNumber }}              // "+91-9876543210"
{{ $json.motorType }}                 // "3-Phase Induction Motor"
{{ $json.vfdType }}                   // "Danfoss FC51"
{{ $json.applicationType }}           // "Pump"
{{ $json.timestamp }}                 // "2025-11-15T10:30:45.123Z"
```

#### Binary Files
```javascript
// Access in n8n expressions:
{{ $binary.vfdNameplate }}            // Binary data object
{{ $binary.motorNameplate }}          // Binary data object

// Binary object structure:
{
  data: Buffer,                       // File content
  mimeType: "image/jpeg",            // Content type
  fileName: "vfd-image.jpg"          // Original filename
}
```

---

## 🐛 Troubleshooting

### Issue: Form validation errors

**Check:**
- All fields filled?
- Phone number in correct format?
- Images selected?
- Images under 10 MB?

### Issue: Server connection failed

**Check:**
- Is Node.js server running?
- Correct URL: `http://localhost:3000/webhook`
- Browser console for CORS errors

### Issue: Files not showing as binary

**Check:**
- Files sent as multipart/form-data (not JSON)
- Content-Type header includes boundary
- FormData API used (not JSON.stringify)

---

## 📊 Expected Payload Structure

### HTTP Request
```
POST /webhook HTTP/1.1
Host: localhost:3000
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
Content-Length: 456789

------WebKitFormBoundary...
Content-Disposition: form-data; name="customerName"

Test Industries
------WebKitFormBoundary...
Content-Disposition: form-data; name="vfdNameplate"; filename="vfd.jpg"
Content-Type: image/jpeg

[BINARY IMAGE DATA]
------WebKitFormBoundary...
```

### What n8n Receives

**Webhook Node Output:**
```json
{
  "headers": { ... },
  "params": {},
  "query": {},
  "body": {
    "customerName": "Test Industries",
    "locationOfInstallation": "Mumbai, Maharashtra",
    "contactPerson": "Rajesh Kumar",
    "mobileNumber": "+91-9876543210",
    "motorType": "3-Phase Induction Motor",
    "vfdType": "Danfoss FC51",
    "applicationType": "Pump",
    "source": "Danfoss ALADIN Web UI",
    "timestamp": "2025-11-15T10:30:45.123Z"
  }
}
```

**Binary Attachments:**
- `$binary.vfdNameplate` - VFD image
- `$binary.motorNameplate` - Motor image

---

## ✨ Success Indicators

### ✅ Everything is working correctly if:

1. **Server Console Shows:**
   - All 7 text fields received
   - Both image files received
   - All validation checks pass (✓)
   - No missing fields or errors

2. **Browser Shows:**
   - Green success message
   - HTTP 200 status
   - JSON response with validation details
   - Image previews display correctly

3. **FormData Structure:**
   - Text sent as form fields (not JSON string)
   - Images sent as binary blobs
   - Proper multipart/form-data encoding
   - All metadata included

---

## 🔄 Next Steps

### For Production n8n Deployment:

1. **Update Webhook URL** in `Generate_page.js`:
   ```javascript
   WEBHOOK_URL: "https://your-n8n-instance.com/webhook/aladin-submit"
   ```

2. **n8n Workflow Configuration:**
   - **Webhook Node**: POST method, "When Last Node Finishes"
   - **Extract Binary**: Use "Move Binary Data" node if needed
   - **Process Images**: Add image processing nodes
   - **Response**: Return success/error JSON

3. **Deploy HTML**:
   - Serve `Generate_page.js` output via n8n "Respond to Webhook" node
   - Or host HTML on web server

---

## 📞 Support

If validation fails, check:
- Browser console (F12) for JavaScript errors
- Server console for detailed request analysis
- Network tab to inspect actual payload

All validation results are logged to help debug any issues!
