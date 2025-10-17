const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const IV_LENGTH = 16; 

function encrypt(text, secretKey) {
  const key = crypto.scryptSync(secretKey, 'salt', 32);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Combina IV y texto cifrado
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text, secretKey) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = textParts.join(':');
  
  const key = crypto.scryptSync(secretKey, 'salt', 32);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

module.exports = {
  encrypt,
  decrypt
};