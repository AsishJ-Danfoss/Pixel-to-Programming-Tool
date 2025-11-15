const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Parse multipart/form-data
function parseMultipartFormData(body, boundary) {
  const parts = body.split(boundary);
  const formData = {
    textFields: {},
    files: []
  };

  parts.forEach(part => {
    if (!part || part === '--\r\n' || part === '--') return;

    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd === -1) return;

    const headers = part.substring(0, headerEnd);
    const content = part.substring(headerEnd + 4, part.length - 2);

    const nameMatch = headers.match(/name="([^"]+)"/);
    if (!nameMatch) return;

    const fieldName = nameMatch[1];
    const filenameMatch = headers.match(/filename="([^"]+)"/);
    const contentTypeMatch = headers.match(/Content-Type: (.+)/);

    if (filenameMatch) {
      // It's a file
      formData.files.push({
        fieldName,
        filename: filenameMatch[1],
        contentType: contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream',
        size: Buffer.byteLength(content, 'binary'),
        sizeFormatted: formatBytes(Buffer.byteLength(content, 'binary'))
      });
    } else {
      // It's a text field
      formData.textFields[fieldName] = content.trim();
    }
  });

  return formData;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString('binary');
    });

    req.on('end', () => {
      try {
        const contentType = req.headers['content-type'] || '';
        const boundaryMatch = contentType.match(/boundary=(.+)/);

        if (!boundaryMatch) {
          throw new Error('No boundary found in Content-Type');
        }

        const boundary = '--' + boundaryMatch[1];
        const parsedData = parseMultipartFormData(body, boundary);

        console.log('\n' + '='.repeat(80));
        console.log('📨 WEBHOOK REQUEST RECEIVED');
        console.log('='.repeat(80));
        console.log('Timestamp:', new Date().toISOString());
        console.log('Content-Type:', contentType);
        console.log('Content-Length:', req.headers['content-length'], 'bytes');
        
        console.log('\n📝 TEXT FIELDS (JSON Data):');
        console.log('-'.repeat(80));
        Object.entries(parsedData.textFields).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`);
        });

        console.log('\n📎 FILE UPLOADS (Binary Data):');
        console.log('-'.repeat(80));
        parsedData.files.forEach((file, index) => {
          console.log(`  File ${index + 1}:`);
          console.log(`    Field Name: ${file.fieldName}`);
          console.log(`    Filename: ${file.filename}`);
          console.log(`    Content-Type: ${file.contentType}`);
          console.log(`    Size: ${file.sizeFormatted} (${file.size} bytes)`);
        });

        console.log('\n✅ VALIDATION RESULTS:');
        console.log('-'.repeat(80));
        
        // Validate text fields
        const requiredTextFields = [
          'customerName', 'locationOfInstallation', 'contactPerson',
          'mobileNumber', 'motorType', 'vfdType', 'applicationType'
        ];
        const missingFields = requiredTextFields.filter(f => !parsedData.textFields[f]);
        
        if (missingFields.length > 0) {
          console.log(`  ❌ Missing text fields: ${missingFields.join(', ')}`);
        } else {
          console.log(`  ✓ All required text fields present (${requiredTextFields.length})`);
        }

        // Validate files
        const requiredFiles = ['vfdNameplate', 'motorNameplate'];
        const missingFiles = requiredFiles.filter(f => 
          !parsedData.files.some(file => file.fieldName === f)
        );

        if (missingFiles.length > 0) {
          console.log(`  ❌ Missing files: ${missingFiles.join(', ')}`);
        } else {
          console.log(`  ✓ All required files present (${requiredFiles.length})`);
        }

        // Check file types
        const invalidFiles = parsedData.files.filter(f => 
          !f.contentType.startsWith('image/')
        );
        if (invalidFiles.length > 0) {
          console.log(`  ⚠️  Non-image files detected: ${invalidFiles.map(f => f.filename).join(', ')}`);
        } else {
          console.log(`  ✓ All files are valid images`);
        }

        // Check metadata fields
        const hasMetadata = parsedData.textFields.source && 
                           parsedData.textFields.timestamp;
        if (hasMetadata) {
          console.log(`  ✓ Metadata fields present (source, timestamp)`);
        } else {
          console.log(`  ⚠️  Metadata fields missing`);
        }

        console.log('\n📦 n8n WEBHOOK FORMAT:');
        console.log('-'.repeat(80));
        console.log('  Text fields accessible as: $json.customerName, $json.mobileNumber, etc.');
        console.log('  Files accessible as: $binary.vfdNameplate, $binary.motorNameplate');
        
        console.log('\n' + '='.repeat(80) + '\n');

        // Send success response
        const response = {
          success: true,
          message: 'Form data received and validated successfully',
          timestamp: new Date().toISOString(),
          received: {
            textFieldCount: Object.keys(parsedData.textFields).length,
            fileCount: parsedData.files.length,
            totalSize: parsedData.files.reduce((sum, f) => sum + f.size, 0)
          },
          textFields: parsedData.textFields,
          files: parsedData.files.map(f => ({
            fieldName: f.fieldName,
            filename: f.filename,
            contentType: f.contentType,
            size: f.sizeFormatted
          })),
          validation: {
            allTextFieldsPresent: missingFields.length === 0,
            allFilesPresent: missingFiles.length === 0,
            allImagesValid: invalidFiles.length === 0
          }
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response, null, 2));

      } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: error.message
        }));
      }
    });

  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 ALADIN Test Webhook Server Running');
  console.log('='.repeat(80));
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log('\nWaiting for form submissions...');
  console.log('Press Ctrl+C to stop\n');
});
