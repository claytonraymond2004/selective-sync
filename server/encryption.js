const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
// Ensure key is 32 bytes. In prod, this must come from .env and be proper length.
// For now we pad or slice if needed, but really we should warn.
const getKey = () => {
    let key = process.env.ENCRYPTION_KEY || 'default-secret-key-32-bytes-long!';
    return crypto.scryptSync(key, 'salt', 32);
};

function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    if (!text) return null;
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

module.exports = { encrypt, decrypt };
