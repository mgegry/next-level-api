const data = {
  softone_base_url: 'https://fisc.oncloud.gr/s1services',
  softone_app_id: '1002',
  softone_username: 'master',
  softone_password: '1',
  softone_company: '1000',
  softone_branch: '1000',
  softone_module: '0',
  softone_refid: '12',

  wme_base_url: 'http://86.124.72.120:8080/datasnap/rest/TServerMethods',
  user: '',
  password: '',
  port: '',
};

const crypto = require('crypto');
// require('dotenv').config();

const algorithm = 'aes-256-gcm';
const key = Buffer.from('12345678901234567890123456789012', 'utf-8');

if (key.length !== 32) {
  console.error('ERROR: ENCRYPTION_KEY must be exactly 32 bytes');
  process.exit(1);
}

function encrypt(data) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const json = JSON.stringify(data);
  const encrypted = Buffer.concat([
    cipher.update(json, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, encrypted, tag]).toString('base64');
}

// ---- MODIFY THIS PART ----
const erpConfig = data;
// ---------------------------

console.log('Encrypted string:');
console.log(encrypt(erpConfig));
