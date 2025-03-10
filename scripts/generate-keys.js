/**
 * Script to generate RSA key pair for the bank
 * 
 * Usage: node scripts/generate-keys.js
 */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// Generate RSA key pair
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Save private key
fs.writeFileSync(path.join(__dirname, '..', 'private-key.pem'), privateKey);
console.log('Private key saved to private-key.pem');

// Save public key
fs.writeFileSync(path.join(__dirname, '..', 'public-key.pem'), publicKey);
console.log('Public key saved to public-key.pem');

console.log('RSA key pair generated successfully.');
