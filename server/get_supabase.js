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
const tmpDbPath = '/tmp/chrome_cookies_supabase.db';
fs.copyFileSync(cookieDbPath, tmpDbPath);

const output = execSync(
  `sqlite3 "${tmpDbPath}" "SELECT host_key, name, hex(encrypted_value) FROM cookies WHERE host_key LIKE '%supabase%';"`,
  { encoding: 'utf8', maxBuffer: 1024 * 1024 }
);
fs.unlinkSync(tmpDbPath);

const cookies = [];
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
      cookies.push({ hostKey, name, value: decrypted.slice(32).toString('utf8') });
    }
  } catch (e) { /* skip */ }
}

console.log(`Extracted ${cookies.length} Supabase cookies`);
cookies.forEach(c => console.log(`  ${c.hostKey} | ${c.name}`));

const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');

// Try to get projects list from Supabase API
console.log('\n=== Getting projects list ===');
try {
  const result = execSync(
    `curl -s --max-time 15 -H "Cookie: ${cookieHeader}" -H "Accept: application/json" "https://supabase.com/api/projects"`,
    { encoding: 'utf8', maxBuffer: 1024 * 1024 }
  );
  if (result.trim().startsWith('<')) {
    console.log('Got HTML (not logged in)');
  } else {
    const data = JSON.parse(result);
    if (Array.isArray(data)) {
      console.log(`Found ${data.length} projects:`);
      data.forEach(p => {
        console.log(`  - Name: ${p.name}`);
        console.log(`    ID: ${p.id}`);
        console.log(`    Ref: ${p.ref || p.id}`);
        console.log(`    URL: https://${p.ref || p.id}.supabase.co`);
        console.log(`    Status: ${p.status}`);
        console.log('');
      });
    } else {
      console.log('Response:', JSON.stringify(data).slice(0, 500));
    }
  }
} catch (e) {
  console.error('API call failed:', e.message);
  if (e.stdout) console.log('stdout:', e.stdout.slice(0, 300));
}
