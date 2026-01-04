// n8n Code Node: Draft Save - Process & Build SQL
// This node combines validation and SQL building for the Draft Save API

// Extract request body - handle different webhook configurations
const inputData = $input.item.json;

// Try to get data from body first (Raw Body enabled), then from root
let requestData;
try {
  if (inputData.body) {
    // Raw Body is enabled - body is a string
    requestData = typeof inputData.body === 'string' ? JSON.parse(inputData.body) : inputData.body;
  } else if (inputData.draft_id !== undefined || inputData.page_number !== undefined) {
    // Data is directly in the root (Raw Body disabled)
    requestData = inputData;
  } else {
    throw new Error('No valid request data found');
  }
} catch (error) {
  return {
    json: {
      _error: true,
      success: false,
      error: 'Invalid JSON format: ' + error.message,
      statusCode: 400
    }
  };
}

// Debug logging - remove after testing
console.log('Input data structure:', JSON.stringify(inputData, null, 2));
console.log('Parsed request data:', JSON.stringify(requestData, null, 2));

// Validate required inputs
const pageNumber = requestData.page_number;
const pageData = requestData.page_data;

if (!pageNumber || pageNumber < 1 || pageNumber > 4) {
  return {
    json: {
      _error: true,
      success: false,
      error: 'page_number must be between 1 and 4',
      statusCode: 400
    }
  };
}

if (!pageData || typeof pageData !== 'object') {
  return {
    json: {
      _error: true,
      success: false,
      error: 'page_data is required and must be an object',
      statusCode: 400
    }
  };
}

// Generate or use existing draft_id
// n8n vm2 sandbox doesn't support require('crypto'), so we generate UUID manually
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const draftId = requestData.draft_id || generateUUID();
const timestamp = new Date().toISOString();
const isNew = !requestData.draft_id;

// Map page number to database column
const pageColumns = {
  1: 'customerinput_pg1',
  2: 'motorconfig_pg2',
  3: 'vfdconfig_pg3',
  4: 'drawingconfig_pg4'
};
const columnName = pageColumns[pageNumber];

// Build metadata JSON that will be returned by PostgreSQL
// Escape single quotes for SQL safety
const metadataJson = JSON.stringify({
  page_number: pageNumber,
  column_name: columnName,
  is_new: isNew
}).replace(/'/g, "''");

// Build SQL UPSERT query with metadata in RETURNING clause
// The metadata is returned as a JSON literal so it survives PostgreSQL execution
const query = `
INSERT INTO draft_form (draft_id, current_page, ${columnName}, created_at, updated_at)
VALUES ($1, $2, $3::jsonb, $4, $4)
ON CONFLICT (draft_id) 
DO UPDATE SET current_page = $2, ${columnName} = $3::jsonb, updated_at = $4
RETURNING 
  draft_id, 
  current_page, 
  created_at, 
  updated_at,
  '${metadataJson}'::jsonb as _metadata;
`;

// Prepare parameterized query values (prevents SQL injection)
const parameters = [
  draftId,                      // $1
  pageNumber,                   // $2
  JSON.stringify(pageData),     // $3 (converted to JSONB)
  timestamp                     // $4
];

// Return data for PostgreSQL node
return {
  json: {
    query: query,
    parameters: parameters
  }
};
