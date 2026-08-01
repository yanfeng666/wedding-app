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
const tmpDbPath = '/tmp/chrome_cookies_fresh.db';
fs.copyFileSync(cookieDbPath, tmpDbPath);

const output = execSync(
  `sqlite3 "${tmpDbPath}" "SELECT host_key, name, hex(encrypted_value) FROM cookies WHERE host_key LIKE '%render%';"`,
  { encoding: 'utf8', maxBuffer: 1024 * 1024 }
);
fs.unlinkSync(tmpDbPath);

const cookies = [];
for (const line of output.trim().split('\n').filter(Boolean)) {
  const [hostKey, name, hexEncrypted] = line.split('|');
  const encryptedValue = Buffer.from(hexEncrypted, 'hex');
  try {
    if (encryptedValue.slice(0, 3).toString() === 'v10') {
      const decipher = crypto.createDecipheriv('aes-128-cbc', derivedKey, Buffer.alloc(16, 0x20));
      let decrypted = Buffer.concat([decipher.update(encryptedValue.slice(3)), decipher.final()]);
      const padLen = decrypted[decrypted.length - 1];
      if (padLen > 0 && padLen <= 16) decrypted = decrypted.slice(0, decrypted.length - padLen);
      cookies.push({ hostKey, name, value: decrypted.slice(32).toString('utf8') });
    } else if (encryptedValue.slice(0, 3).toString() === 'v11') {
      // v11 encryption - try same approach
      const decipher = crypto.createDecipheriv('aes-128-cbc', derivedKey, Buffer.alloc(16, 0x20));
      let decrypted = Buffer.concat([decipher.update(encryptedValue.slice(3)), decipher.final()]);
      const padLen = decrypted[decrypted.length - 1];
      if (padLen > 0 && padLen <= 16) decrypted = decrypted.slice(0, decrypted.length - padLen);
      cookies.push({ hostKey, name, value: decrypted.slice(32).toString('utf8') });
    }
  } catch (e) { /* skip */ }
}

const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
fs.writeFileSync('/tmp/render_cookie_fresh.txt', cookieHeader);
console.log(`Extracted ${cookies.length} cookies`);
console.log('Cookie names:', cookies.map(c => c.name).join(', '));

// Try dashboard API
console.log('\n=== Trying dashboard API ===');
try {
  const result = execSync(
    `curl -s --max-time 15 -H "Cookie: $(cat /tmp/render_cookie_fresh.txt)" -H "Accept: application/json" "https://dashboard.render.com/v1/services"`,
    { encoding: 'utf8', maxBuffer: 1024 * 1024 }
  );
  if (result.trim().startsWith('<')) {
    console.log('Got HTML (not logged in)');
    console.log(result.substring(0, 200));
  } else {
    const data = JSON.parse(result);
    if (Array.isArray(data)) {
      console.log(`Found ${data.length} services:`);
      data.forEach(svc => {
        console.log(`  - ${svc.service.name} (ID: ${svc.service.id}, URL: ${svc.service.serviceUrl || 'N/A'})`);
      });
    } else {
      console.log('Response:', JSON.stringify(data).slice(0, 500));
    }
  }
} catch (e) {
  console.error('API call failed:', e.message);
}

// Also try api.render.com
console.log('\n=== Trying api.render.com ===');
try {
  const result = execSync(
    `curl -s --max-time 15 -H "Cookie: $(cat /tmp/render_cookie_fresh.txt)" -H "Accept: application/json" "https://api.render.com/v1/services"`,
    { encoding: 'utf8', maxBuffer: 1024 * 1024 }
  );
  if (result.trim().startsWith('<')) {
    console.log('Got HTML');
  } else {
    const data = JSON.parse(result);
    console.log('Response:', JSON.stringify(data).slice(0, 500));
  }
} catch (e) {
  console.error('API call failed:', e.message);
}
