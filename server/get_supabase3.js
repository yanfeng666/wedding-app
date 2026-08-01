const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const keyPassword = 'zHk+1c8moIzMYus//AT6xg==';
const derivedKey = crypto.pbkdf2Sync(
  Buffer.from(keyPassword, 'utf8'),
  Buffer.from('saltysalt', 'utf8'),
  1003, 16, 'sha1'
);

const cookieDbPath = path.join(process.env.HOME, 'Library/Application Support/Google/Chrome/Default/Cookies');
const tmpDbPath = '/tmp/chrome_cookies_sb3.db';
fs.copyFileSync(cookieDbPath, tmpDbPath);

const output = execSync(
  `sqlite3 "${tmpDbPath}" "SELECT host_key, name, hex(encrypted_value) FROM cookies WHERE host_key LIKE '%supabase%';"`,
  { encoding: 'utf8', maxBuffer: 1024 * 1024 }
);
fs.unlinkSync(tmpDbPath);

const cookies = {};
for (const line of output.trim().split('\n').filter(Boolean)) {
  const [hostKey, name, hexEncrypted] = line.split('|');
  const encryptedValue = Buffer.from(hexEncrypted, 'hex');
  try {
    const prefix = encryptedValue.slice(0, 3).toString();
    if (prefix === 'v10' || prefix === 'v11') {
      const decipher = crypto.createDecipheriv('aes-128-cbc', derivedKey, Buffer.alloc(16, 0x20));
      let decrypted = Buffer.concat([decipher.update(encryptedValue.slice(3)), decipher.final()]);
      const padLen = decrypted[decrypted.length - 1];
      if (padLen > 0 && padLen <= 16) decrypted = decrypted.slice(0, decrypted.length - padLen);
      cookies[name] = decrypted.slice(32).toString('utf8');
    }
  } catch (e) { /* skip */ }
}

const cookieHeader = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
const projectRef = cookies['project_ref'];

console.log('Project URL:', `https://${projectRef}.supabase.co`);

// Try various Supabase API endpoints
const endpoints = [
  `https://api.supabase.com/v1/projects/${projectRef}/api-keys`,
  `https://supabase.com/api/project/${projectRef}/api-keys`,
  `https://app.supabase.com/api/project/${projectRef}/api-keys`,
  `https://supabase.com/api/projects/${projectRef}/api-keys`,
];

for (const url of endpoints) {
  console.log(`\n=== Trying: ${url} ===`);
  try {
    const result = execSync(
      `curl -s --max-time 10 -H "Cookie: ${cookieHeader}" -H "Accept: application/json" "${url}"`,
      { encoding: 'utf8', maxBuffer: 1024 * 1024 }
    );
    if (result.trim().startsWith('<')) {
      console.log('Got HTML (length:', result.length, ')');
    } else {
      try {
        const data = JSON.parse(result);
        console.log('JSON response:', JSON.stringify(data, null, 2).substring(0, 500));
      } catch {
        console.log('Non-JSON response:', result.substring(0, 200));
      }
    }
  } catch (e) {
    console.log('Failed:', e.message.substring(0, 100));
  }
}

// Try with Authorization header (supabase might use Bearer token from session)
console.log('\n=== Trying with Authorization Bearer ===');
try {
  const result = execSync(
    `curl -s --max-time 10 -H "Cookie: ${cookieHeader}" -H "Accept: application/json" -H "Authorization: Bearer ${cookies['FPAU'] || ''}" "https://api.supabase.com/v1/projects/${projectRef}/api-keys"`,
    { encoding: 'utf8', maxBuffer: 1024 * 1024 }
  );
  if (result.trim().startsWith('<')) {
    console.log('Got HTML');
  } else {
    const data = JSON.parse(result);
    console.log('Response:', JSON.stringify(data, null, 2).substring(0, 500));
  }
} catch (e) {
  console.log('Failed:', e.message.substring(0, 100));
}

// Try accessing the dashboard settings page to scrape the key
console.log('\n=== Trying dashboard settings page ===');
try {
  const result = execSync(
    `curl -s --max-time 10 -H "Cookie: ${cookieHeader}" "https://supabase.com/dashboard/project/${projectRef}/settings/api"`,
    { encoding: 'utf8', maxBuffer: 1024 * 1024 }
  );
  // Look for the API key pattern in the HTML/JS
  const anonKeyMatch = result.match(/eyJ[A-Za-z0-9_-]{20,}/);
  if (anonKeyMatch) {
    console.log('Found API key in page:', anonKeyMatch[0]);
  } else {
    console.log('No API key found in page (length:', result.length, ')');
    // Check if it's a redirect
    if (result.includes('sign-in') || result.includes('login')) {
      console.log('Page appears to be a login page');
    }
  }
} catch (e) {
  console.log('Failed:', e.message.substring(0, 100));
}
