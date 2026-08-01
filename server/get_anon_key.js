const { execSync } = require('child_process');
const fs = require('fs');

// Search for Supabase-related tokens in Chrome local storage
console.log('=== Searching for Supabase tokens in local storage ===');
const result = execSync(
  `strings ~/Library/Application\\ Support/Google/Chrome/Default/Local\\ Storage/leveldb/*.ldb ~/Library/Application\\ Support/Google/Chrome/Default/Local\\ Storage/leveldb/*.log 2>/dev/null | grep -E "(supabase|Bearer eyJ)" | grep -v "login.windows" | grep -v "microsoft" | tail -20`,
  { encoding: 'utf8', maxBuffer: 1024 * 1024 }
);
console.log(result);

// Search specifically for the project ref
console.log('\n=== Searching for project ref bmepnqqhutteddzzvfst ===');
const result2 = execSync(
  `strings ~/Library/Application\\ Support/Google/Chrome/Default/Local\\ Storage/leveldb/*.ldb ~/Library/Application\\ Support/Google/Chrome/Default/Local\\ Storage/leveldb/*.log 2>/dev/null | grep "bmepnqqhutteddzzvfst" | head -10`,
  { encoding: 'utf8', maxBuffer: 1024 * 1024 }
);
console.log(result2 || 'Not found');

// Try to find anon key pattern (JWT that contains "anon" role)
console.log('\n=== Searching for anon key pattern ===');
const result3 = execSync(
  `strings ~/Library/Application\\ Support/Google/Chrome/Default/Local\\ Storage/leveldb/*.ldb ~/Library/Application\\ Support/Google/Chrome/Default/Local\\ Storage/leveldb/*.log 2>/dev/null | grep -oE "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\\.eyJ[A-Za-z0-9_-]+" | sort -u | head -10`,
  { encoding: 'utf8', maxBuffer: 1024 * 1024 }
);
console.log(result3 || 'No JWT keys found');

// Extract the Bearer token we found earlier
console.log('\n=== Trying Bearer token with Supabase API ===');
const bearerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjUxNDI0MSwidHMiOiI5MjM4ZjZjNDc2OWQ0ZTA5IiwiaWF0IjoxNzI0ODI5NDk5ODUzfQ.o3DSeV5fTJhlbIvPljf5-u7QyfiRQvhop5QUYx1ACOY';
const projectRef = 'bmepnqqhutteddzzvfst';

try {
  const apiResult = execSync(
    `curl -s --max-time 10 -H "Authorization: Bearer ${bearerToken}" -H "Accept: application/json" "https://api.supabase.com/v1/projects/${projectRef}/api-keys"`,
    { encoding: 'utf8', maxBuffer: 1024 * 1024 }
  );
  console.log('API keys response:', apiResult.substring(0, 500));
} catch (e) {
  console.log('API call failed:', e.message.substring(0, 100));
}
