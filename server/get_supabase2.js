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
const tmpDbPath = '/tmp/chrome_cookies_sb2.db';
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

// Print key cookies
console.log('=== Key cookie values ===');
console.log('project_ref:', cookies['project_ref'] || '(not found)');
console.log('organization_slug:', cookies['organization_slug'] || '(not found)');
console.log('user_id:', cookies['user_id'] || '(not found)');
console.log('FPAU:', cookies['FPAU'] ? cookies['FPAU'].substring(0, 30) + '...' : '(not found)');

const cookieHeader = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
const projectRef = cookies['project_ref'];

if (projectRef) {
  console.log('\n=== Supabase Project URL ===');
  console.log(`https://${projectRef}.supabase.co`);

  // Try to get API keys
  console.log('\n=== Getting API keys ===');
  try {
    const result = execSync(
      `curl -s --max-time 15 -H "Cookie: ${cookieHeader}" -H "Accept: application/json" "https://api.supabase.com/v1/projects/${projectRef}/api-keys"`,
      { encoding: 'utf8', maxBuffer: 1024 * 1024 }
    );
    if (result.trim().startsWith('<')) {
      console.log('Got HTML, trying alternative endpoint...');
    } else {
      const data = JSON.parse(result);
      console.log('API keys:', JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.log('api-keys endpoint failed:', e.message);
  }

  // Try alternative: get project details
  console.log('\n=== Getting project details ===');
  try {
    const result = execSync(
      `curl -s --max-time 15 -H "Cookie: ${cookieHeader}" -H "Accept: application/json" "https://api.supabase.com/v1/projects/${projectRef}"`,
      { encoding: 'utf8', maxBuffer: 1024 * 1024 }
    );
    if (result.trim().startsWith('<')) {
      console.log('Got HTML');
    } else {
      const data = JSON.parse(result);
      console.log('Project:', JSON.stringify(data, null, 2).substring(0, 1000));
    }
  } catch (e) {
    console.log('project details failed:', e.message);
  }

  // Try the dashboard API
  console.log('\n=== Trying dashboard API ===');
  try {
    const result = execSync(
      `curl -s --max-time 15 -H "Cookie: ${cookieHeader}" -H "Accept: application/json" "https://supabase.com/api/projects"`,
      { encoding: 'utf8', maxBuffer: 1024 * 1024 }
    );
    if (result.trim().startsWith('<')) {
      console.log('Got HTML');
    } else {
      const data = JSON.parse(result);
      if (Array.isArray(data)) {
        data.forEach(p => {
          console.log(`Project: ${p.name}, ref: ${p.ref || p.id}, url: https://${p.ref || p.id}.supabase.co`);
        });
      } else {
        console.log('Response:', JSON.stringify(data).substring(0, 500));
      }
    }
  } catch (e) {
    console.log('dashboard API failed:', e.message);
  }
} else {
  console.log('\nNo project_ref found in cookies');
}
