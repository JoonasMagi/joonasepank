/**
 * Script to register the bank with the Central Bank
 */

const { registerBank } = require('../utils/bankUtils');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Check if RSA keys exist
const privateKeyPath = process.env.PRIVATE_KEY_PATH || path.join(__dirname, '../keys/private-key.pem');
const publicKeyPath = process.env.PUBLIC_KEY_PATH || path.join(__dirname, '../keys/public-key.pem');

if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
  console.error('RSA keys not found!');
  console.error('Please run: npm run generate-keys');
  process.exit(1);
}

console.log('Registering bank with Central Bank...');

// Register bank with Central Bank
registerBank()
  .then((result) => {
    if (result.success) {
      console.log('Bank registered successfully!');
      
      if (result.apiKey) {
        console.log('\nReceived API key:', result.apiKey);
        console.log('\nPlease update your .env file with:');
        console.log(`API_KEY=${result.apiKey}`);
        
        // Try to update .env file
        const envPath = path.join(__dirname, '../.env');
        if (fs.existsSync(envPath)) {
          let envContent = fs.readFileSync(envPath, 'utf8');
          
          // Replace or add API_KEY
          if (envContent.includes('API_KEY=')) {
            envContent = envContent.replace(/API_KEY=.*/, `API_KEY=${result.apiKey}`);
          } else {
            envContent += `\nAPI_KEY=${result.apiKey}`;
          }
          
          fs.writeFileSync(envPath, envContent);
          console.log('Updated .env file with new API key.');
        }
      }
    } else {
      console.error('Bank registration failed:', result.error);
    }
  })
  .catch((error) => {
    console.error('Error during registration:', error.message);
  });
