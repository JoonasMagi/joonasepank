/**
 * Script to generate RSA key pair for the bank
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Paths for key files
const keysDir = path.join(__dirname, '../keys');
const privateKeyPath = process.env.PRIVATE_KEY_PATH || path.join(keysDir, 'private-key.pem');
const publicKeyPath = process.env.PUBLIC_KEY_PATH || path.join(keysDir, 'public-key.pem');

// Create keys directory if it doesn't exist
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
  console.log('Created keys directory:', keysDir);
}

// Generate RSA key pair
const generateKeyPair = () => {
  console.log('Generating RSA key pair...');
  
  try {
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

    // Write keys to files
    fs.writeFileSync(privateKeyPath, privateKey);
    fs.writeFileSync(publicKeyPath, publicKey);

    console.log(`Private key saved to: ${privateKeyPath}`);
    console.log(`Public key saved to: ${publicKeyPath}`);
    console.log('Key pair generated successfully!');
  } catch (error) {
    console.error('Error generating key pair:', error.message);
    process.exit(1);
  }
};

// Check if keys already exist
if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
  console.log('RSA keys already exist:');
  console.log(`Private key: ${privateKeyPath}`);
  console.log(`Public key: ${publicKeyPath}`);
  
  // Ask user if they want to regenerate keys
  console.log('\nDo you want to regenerate keys? (y/N)');
  process.stdin.once('data', (input) => {
    const answer = input.toString().trim().toLowerCase();
    if (answer === 'y' || answer === 'yes') {
      generateKeyPair();
    } else {
      console.log('Keys left unchanged.');
    }
    process.exit(0);
  });
} else {
  // Keys don't exist, generate them
  generateKeyPair();
}
