const { DataTypes } = require('sequelize');
const { sequelize } = require('../db/config');

// Define Transaction model
const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  transactionId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    unique: true,
  },
  accountFrom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accountTo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01,
    },
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['EUR', 'USD', 'GBP']],
    },
  },
  explanation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  senderName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  receiverName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'completed', 'failed']],
    },
  },
  isInternal: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  externalBankId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  failureReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = { Transaction };
