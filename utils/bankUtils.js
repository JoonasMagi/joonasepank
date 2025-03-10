const axios = require('axios');
const dotenv = require('dotenv');
const { signJWT, verifyJWT, getJWKS } = require('./cryptoUtils');

// Load environment variables
dotenv.config();

// Get the bank prefix from environment variables
const BANK_PREFIX = process.env.BANK_PREFIX || 'JMB';
const CENTRAL_BANK_URL = process.env.CENTRAL_BANK_URL || 'http://localhost:8080';
const API_KEY = process.env.API_KEY || 'your-api-key-here';

/**
 * Check if an account belongs to the same bank
 * @param {string} accountNumber - The account number to check
 * @returns {boolean} - True if the account belongs to this bank
 */
exports.isSameBank = (accountNumber) => {
  return accountNumber.startsWith(BANK_PREFIX);
};

/**
 * Get bank information from the Central Bank
 * @param {string} bankPrefix - The bank prefix to lookup
 * @returns {Object} - Bank information or null if not found
 */
exports.getBankInfo = async (bankPrefix) => {
  try {
    // Make a request to the Central Bank API
    const response = await axios.get(`${CENTRAL_BANK_URL}/api/banks/${bankPrefix}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    // Return the bank information
    return response.data;
  } catch (error) {
    console.error(`Error getting bank info for prefix ${bankPrefix}:`, error);
    return null;
  }
};

/**
 * Get information about the Central Bank
 * @returns {Object} - Central Bank information
 */
exports.getCentralBankInfo = async () => {
  try {
    // Make a request to the Central Bank API
    const response = await axios.get(`${CENTRAL_BANK_URL}/api/info`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    // Return the Central Bank information
    return response.data;
  } catch (error) {
    console.error('Error getting Central Bank info:', error);
    return null;
  }
};

/**
 * Register the bank with the Central Bank
 * @param {Object} bankDetails - Bank registration details
 * @returns {Object} - Registration response or null if failed
 */
exports.registerBank = async (bankDetails) => {
  try {
    // Make a request to the Central Bank API
    const response = await axios.post(`${CENTRAL_BANK_URL}/api/banks/register`, bankDetails, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Return the registration response
    return response.data;
  } catch (error) {
    console.error('Error registering bank:', error);
    return null;
  }
};

// Export JWT utility functions
exports.signJWT = signJWT;
exports.verifyJWT = verifyJWT;
exports.getJWKS = getJWKS;

// Export bank prefix
exports.BANK_PREFIX = BANK_PREFIX;
