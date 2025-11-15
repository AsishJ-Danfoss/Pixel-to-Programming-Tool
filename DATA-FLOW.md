# 📊 Data Flow Visualization

## Complete Data Flow: Browser → n8n

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER FILLS FORM                             │
│                                                                   │
│  Text Inputs:                      File Uploads:                 │
│  • Customer Name                   • VFD Nameplate Image         │
│  • Location of Installation        • Motor Nameplate Image       │
│  • Contact Person                                                │
│  • Mobile Number                                                 │
│  • Motor Type                                                    │
│  • VFD Type                                                      │
│  • Application Type                                              │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                            │ User clicks SUBMIT
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   JAVASCRIPT VALIDATION                          │
│                                                                   │
│  Validator.validateTextFields()                                  │
│  ✓ All fields filled?                                           │
│  ✓ Phone number format valid?                                   │
│                                                                   │
│  Validator.validateFiles()                                       │
│  ✓ Both images selected?                                        │
│  ✓ File sizes < 10 MB?                                          │
│  ✓ File types are images?                                       │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                            │ Validation PASSES
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                 FormData CONSTRUCTION                            │
│                                                                   │
│  const formData = new FormData();                               │
│                                                                   │
│  formData.append('customerName', 'Test Industries');            │
│  formData.append('locationOfInstallation', 'Mumbai...');        │
│  formData.append('contactPerson', 'Rajesh Kumar');              │
│  formData.append('mobileNumber', '+91-9876543210');             │
│  formData.append('motorType', '3-Phase Induction');             │
│  formData.append('vfdType', 'Danfoss FC51');                    │
│  formData.append('applicationType', 'Pump');                    │
│  formData.append('vfdNameplate', [File Object]);                │
│  formData.append('motorNameplate', [File Object]);              │
│  formData.append('source', 'Danfoss ALADIN Web UI');            │
│  formData.append('timestamp', '2025-11-15T10:30:45.123Z');      │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                            │ HTTP POST Request
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   HTTP TRANSMISSION                              │
│                                                                   │
│  POST https://n8n.example.com/webhook/aladin-submit             │
│  Content-Type: multipart/form-data; boundary=----WebKit...      │
│                                                                   │
│  ------WebKitFormBoundary7MA4YWxkTrZu0gW                        │
│  Content-Disposition: form-data; name="customerName"            │
│                                                                   │
│  Test Industries                                                 │
│  ------WebKitFormBoundary7MA4YWxkTrZu0gW                        │
│  Content-Disposition: form-data; name="vfdNameplate";           │
│                          filename="vfd-image.jpg"                │
│  Content-Type: image/jpeg                                        │
│                                                                   │
│  [BINARY IMAGE DATA - 245 KB]                                    │
│  ------WebKitFormBoundary7MA4YWxkTrZu0gW--                      │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                            │ Arrives at n8n
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    n8n WEBHOOK NODE                              │
│                                                                   │
│  Receives multipart/form-data                                   │
│  Parses into JSON + Binary                                      │
│                                                                   │
│  JSON Output ($json):                                           │
│  {                                                               │
│    customerName: "Test Industries",                             │
│    locationOfInstallation: "Mumbai, Maharashtra",               │
│    contactPerson: "Rajesh Kumar",                               │
│    mobileNumber: "+91-9876543210",                              │
│    motorType: "3-Phase Induction Motor",                        │
│    vfdType: "Danfoss FC51",                                     │
│    applicationType: "Pump",                                     │
│    source: "Danfoss ALADIN Web UI",                             │
│    timestamp: "2025-11-15T10:30:45.123Z"                        │
│  }                                                               │
│                                                                   │
│  Binary Output ($binary):                                       │
│  {                                                               │
│    vfdNameplate: {                                              │
│      data: Buffer<...>,                                         │
│      mimeType: "image/jpeg",                                    │
│      fileName: "vfd-image.jpg"                                  │
│    },                                                            │
│    motorNameplate: {                                            │
│      data: Buffer<...>,                                         │
│      mimeType: "image/jpeg",                                    │
│      fileName: "motor-image.jpg"                                │
│    }                                                             │
│  }                                                               │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                            │ Process in workflow
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  n8n WORKFLOW NODES                              │
│                                                                   │
│  1. Access Text Data:                                           │
│     {{ $json.customerName }}                                    │
│     {{ $json.mobileNumber }}                                    │
│                                                                   │
│  2. Access Binary Files:                                        │
│     {{ $binary.vfdNameplate }}                                  │
│     {{ $binary.motorNameplate }}                                │
│                                                                   │
│  3. Process Images:                                             │
│     • Send to OCR API                                           │
│     • Extract nameplate data                                    │
│     • Store in database                                         │
│     • Generate reports                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Field Mapping

### Text Fields → JSON Properties

| Form Field | n8n Access | Example Value |
|-----------|-----------|---------------|
| Customer Name | `{{ $json.customerName }}` | "Test Industries" |
| Location of Installation | `{{ $json.locationOfInstallation }}` | "Mumbai, Maharashtra" |
| Contact Person | `{{ $json.contactPerson }}` | "Rajesh Kumar" |
| Mobile Number | `{{ $json.mobileNumber }}` | "+91-9876543210" |
| Motor Type | `{{ $json.motorType }}` | "3-Phase Induction Motor" |
| VFD Type | `{{ $json.vfdType }}` | "Danfoss FC51" |
| Application Type | `{{ $json.applicationType }}` | "Pump" |

### Binary Fields → Binary Attachments

| Form Field | n8n Access | MIME Type | Size |
|-----------|-----------|-----------|------|
| VFD Nameplate | `{{ $binary.vfdNameplate }}` | image/jpeg | ~200-500 KB |
| Motor Nameplate | `{{ $binary.motorNameplate }}` | image/jpeg | ~200-500 KB |

---

## Data Structure Comparison

### ❌ WRONG Way (Don't do this)
```javascript
// Sending as JSON string (n8n can't parse files)
const data = {
  fields: { customerName: "...", ... },
  files: { vfdNameplate: "base64string..." }
};
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)  // ❌ Files as base64 in JSON
});
```

### ✅ CORRECT Way (Current implementation)
```javascript
// Sending as multipart/form-data (n8n parses automatically)
const formData = new FormData();
formData.append('customerName', 'Test Industries');  // Text field
formData.append('vfdNameplate', fileObject);         // Binary file
fetch(url, {
  method: 'POST',
  body: formData  // ✅ Browser handles multipart encoding
});
```

---

## Technical Details

### Content-Type Header
```
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
```

### Individual Field Structure
```
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="customerName"

Test Industries
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="vfdNameplate"; filename="image.jpg"
Content-Type: image/jpeg

[RAW BINARY DATA - NOT ENCODED]
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

### Why This Works with n8n

1. **Text Fields**: Automatically parsed into `$json` object
2. **Binary Files**: Automatically parsed into `$binary` object
3. **No Manual Parsing**: n8n handles multipart/form-data natively
4. **Memory Efficient**: Binary data stays as buffers, not base64
5. **Original Filenames**: Preserved for downstream processing

---

## Summary

✅ **Text Data**: Form fields → FormData → multipart/form-data → n8n $json
✅ **Binary Data**: File objects → FormData → multipart/form-data → n8n $binary
✅ **Validation**: Client-side checks before submission
✅ **Metadata**: Automatically added (source, timestamp)
✅ **n8n Ready**: No additional parsing required

This is the **correct** and **optimal** way to send mixed text and binary data to n8n webhooks!
