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
const tmpDbPath = '/tmp/chrome_cookies_check.db';
fs.copyFileSync(cookieDbPath, tmpDbPath);

const output = execSync(
  `sqlite3 "${tmpDbPath}" "SELECT host_key, name, expires_utc FROM cookies WHERE host_key LIKE '%render%';"`,
  { encoding: 'utf8', maxBuffer: 1024 * 1024 }
);
fs.unlinkSync(tmpDbPath);

const now = Date.now() / 1000;
console.log('=== Render cookies in Chrome ===');
let hasValid = false;
for (const line of output.trim().split('\n').filter(Boolean)) {
  const [hostKey, name, expiresUtc] = line.split('|');
  const expires = parseInt(expiresUtc) / 1000000 - 11644473600;
  const expired = expires < now;
  if (!expired) hasValid = true;
  console.log(`${hostKey} | ${name} | ${expired ? 'EXPIRED' : 'VALID'} | expires: ${new Date(expires * 1000).toISOString()}`);
}
if (!hasValid) console.log('\n⚠️ No valid Render cookies found - session has expired');
else console.log('\n✅ Found valid Render cookies');
