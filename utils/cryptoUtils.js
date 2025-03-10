/**
 * Cryptographic utility functions for the bank application
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Default paths for keys
const PRIVATE_KEY_PATH = process.env.PRIVATE_KEY_PATH || path.join(__dirname, '../keys/private-key.pem');
const PUBLIC_KEY_PATH = process.env.PUBLIC_KEY_PATH || path.join(__dirname, '../keys/public-key.pem');

// Get bank name from environment
const BANK_NAME = process.env.BANK_NAME || 'Joonas Mägi Bank';

/**
 * Read a key file
 * @param {string} keyPath - Path to the key file
 * @returns {string|null} - Key content or null if not found
 */
const readKeyFile = (keyPath) => {
  try {
    return fs.readFileSync(keyPath, 'utf8');
  } catch (error) {
    console.error(`Error reading key file ${keyPath}:`, error.message);
    return null;
  }
};

/**
 * Sign a payload with the bank's private key
 * @param {Object} payload - Data to sign
 * @returns {string} - Signed JWT
 */
const signJWT = (payload) => {
  try {
    const privateKey = readKeyFile(PRIVATE_KEY_PATH);
    
    if (!privateKey) {
      throw new Error('Private key not found. Run npm run generate-keys first.');
    }
    
    // Add standard JWT claims
    const enhancedPayload = {
      ...payload,
      iss: BANK_NAME,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiry
      jti: uuidv4() // Unique JWT ID
    };
    
    // Sign with RS256 algorithm
    return jwt.sign(enhancedPayload, privateKey, { 
      algorithm: 'RS256',
      header: {
        kid: 'bank-signing-key-1', // Key ID for JWKS
        typ: 'JWT'
      }
    });
  } catch (error) {
    console.error('Error signing JWT:', error.message);
    throw error;
  }
};

/**
 * Verify a JWT with a public key
 * @param {string} token - JWT to verify
 * @param {string} publicKey - Public key to use for verification
 * @returns {Object} - Decoded payload
 */
const verifyJWT = (token, publicKey) => {
  try {
    // If no external public key provided, use our own
    const key = publicKey || readKeyFile(PUBLIC_KEY_PATH);
    
    if (!key) {
      throw new Error('Public key not found');
    }
    
    return jwt.verify(token, key, { algorithms: ['RS256'] });
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    throw error;
  }
};

/**
 * Generate a JSON Web Key Set (JWKS) containing the bank's public key
 * @returns {Object} - JWKS object
 */
const getJWKS = () => {
  try {
    const publicKey = readKeyFile(PUBLIC_KEY_PATH);
    
    if (!publicKey) {
      throw new Error('Public key not found. Run npm run generate-keys first.');
    }
    
    // Extract modulus and exponent from the public key
    // This is a simplified example and should use a proper JWK library
    // in a production environment
    const key = crypto.createPublicKey(publicKey);
    const keyData = key.export({ format: 'jwk' });
    
    // Return JWKS structure
    return {
      keys: [
        {
          ...keyData,
          kid: 'bank-signing-key-1',
          use: 'sig',
          alg: 'RS256'
        }
      ]
    };
  } catch (error) {
    console.error('Error generating JWKS:', error.message);
    throw error;
  }
};

module.exports = {
  signJWT,
  verifyJWT,
  getJWKS
};
