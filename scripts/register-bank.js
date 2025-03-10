/**
 * Script to register the bank with the Central Bank
 * 
 * Usage: node scripts/register-bank.js
 */

const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Get environment variables
const BANK_PREFIX = process.env.BANK_PREFIX || 'JMB';
const CENTRAL_BANK_URL = process.env.CENTRAL_BANK_URL || 'http://localhost:8080';

// Bank details for registration
const bankDetails = {
  name: 'JoonasMägi Bank',
  prefix: BANK_PREFIX,
  transactionUrl: `http://localhost:${process.env.PORT || 3000}/transactions/b2b`,
  jwksUrl: `http://localhost:${process.env.PORT || 3000}/transactions/jwks`,
  owner: 'Joonas Mägi',
  email: 'joonas.magi@example.com'
};

// Register bank with Central Bank
async function registerBank() {
  try {
    console.log(`Registering bank with Central Bank at ${CENTRAL_BANK_URL}...`);
    console.log('Bank details:', bankDetails);
    
    const response = await axios.post(`${CENTRAL_BANK_URL}/api/banks/register`, bankDetails, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Registration successful!');
    console.log('Response:', response.data);
    
    // Save API key to .env file
    if (response.data && response.data.apiKey) {
      console.log('Received API key. Update your .env file with:');
      console.log(`API_KEY=${response.data.apiKey}`);
    }
  } catch (error) {
    console.error('Error registering bank:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Execute the registration
registerBank();
