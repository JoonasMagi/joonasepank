const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

dotenv.config();

// Get the bank prefix from environment variables
const BANK_PREFIX = process.env.BANK_PREFIX || 'JMB';

// Function to generate a unique account number
const generateAccountNumber = () => {
  // Create a random UUID
  const uuid = uuidv4().replace(/-/g, '');
  
  // Combine bank prefix and UUID
  return `${BANK_PREFIX}${uuid}`;
};

// Define the Account model
const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    defaultValue: generateAccountNumber
  },
  owner: {
    type: DataTypes.STRING,
    allowNull: false
  },
  balance: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'EUR',
    validate: {
      isIn: [['EUR', 'USD', 'GBP']]
    }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  tableName: 'accounts'
});

module.exports = Account;
