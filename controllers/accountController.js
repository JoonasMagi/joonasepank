const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const { sequelize } = require('../db/config');
const { Op } = require('sequelize');

/**
 * Get all accounts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.findAll();
    
    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts
    });
  } catch (error) {
    console.error('Error getting accounts:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get account by account number
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAccountByNumber = async (req, res) => {
  try {
    const account = await Account.findOne({
      where: { accountNumber: req.params.accountNumber }
    });
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: account
    });
  } catch (error) {
    console.error('Error getting account:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Create a new account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createAccount = async (req, res) => {
  try {
    const { owner, balance, currency } = req.body;
    
    // Validate input
    if (!owner) {
      return res.status(400).json({
        success: false,
        error: 'Please provide account owner name'
      });
    }
    
    // Create account
    const account = await Account.create({
      owner,
      balance: balance || 0,
      currency: currency || 'EUR'
    });
    
    res.status(201).json({
      success: true,
      data: account
    });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Update an account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateAccount = async (req, res) => {
  try {
    const { owner, balance, currency, status } = req.body;
    
    // Find account
    const account = await Account.findOne({
      where: { accountNumber: req.params.accountNumber }
    });
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }
    
    // Update account fields
    if (owner) account.owner = owner;
    if (balance !== undefined) account.balance = balance;
    if (currency) account.currency = currency;
    if (status) account.status = status;
    
    await account.save();
    
    res.status(200).json({
      success: true,
      data: account
    });
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Delete an account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteAccount = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Find account
    const account = await Account.findOne({
      where: { accountNumber: req.params.accountNumber },
      transaction
    });
    
    if (!account) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }
    
    // Check if there are any active transactions for this account
    const pendingTransactions = await Transaction.findOne({
      where: {
        [Op.or]: [
          { accountFrom: account.accountNumber },
          { accountTo: account.accountNumber }
        ],
        status: 'pending'
      },
      transaction
    });
    
    if (pendingTransactions) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Cannot delete account with pending transactions'
      });
    }
    
    // Delete account
    await account.destroy({ transaction });
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get transactions for an account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAccountTransactions = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    
    // Find account
    const account = await Account.findOne({
      where: { accountNumber }
    });
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }
    
    // Get transactions for this account (sent or received)
    const transactions = await Transaction.findAll({
      where: {
        [Op.or]: [
          { accountFrom: accountNumber },
          { accountTo: accountNumber }
        ]
      },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Error getting account transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
