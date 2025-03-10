const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/config');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Get bank prefix from environment variables
const BANK_PREFIX = process.env.BANK_PREFIX || 'JMB';

// Function to generate a unique account number
const generateAccountNumber = () => {
  // Generate UUID and remove hyphens
  const uuid = uuidv4().replace(/-/g, '');
  
  // Return account number with bank prefix
  return `${BANK_PREFIX}${uuid}`;
};

// Define Account model
const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  accountNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    defaultValue: generateAccountNumber,
  },
  owner: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'EUR',
    validate: {
      isIn: [['EUR', 'USD', 'GBP']],
    },
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'blocked', 'closed']],
    },
  },
}, {
  timestamps: true,
});

module.exports = Account;
