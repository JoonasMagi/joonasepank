const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const { sequelize } = require('../db/config');
const { Op } = require('sequelize');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

// Import utility functions
const {
  isSameBank,
  getBankInfo,
  signJWT,
  verifyJWT,
  getJWKS,
  BANK_PREFIX
} = require('../utils/bankUtils');

/**
 * Get all transactions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get transaction by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      where: { id: req.params.id }
    });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error getting transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Create internal transaction (within the same bank)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createInternalTransaction = async (req, res) => {
  // Start a database transaction for consistency
  const dbTransaction = await sequelize.transaction();
  
  try {
    const { accountFrom, accountTo, amount, currency, explanation, senderName } = req.body;
    
    // Input validation
    if (!accountFrom || !accountTo || !amount || !currency || !explanation || !senderName) {
      await dbTransaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }
    
    // Check if amount is valid
    if (amount <= 0) {
      await dbTransaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than 0'
      });
    }
    
    // Find source and target accounts
    const sourceAccount = await Account.findOne({ 
      where: { accountNumber: accountFrom },
      transaction: dbTransaction
    });
    
    const targetAccount = await Account.findOne({ 
      where: { accountNumber: accountTo },
      transaction: dbTransaction
    });
    
    // Validate source account
    if (!sourceAccount) {
      await dbTransaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Source account not found'
      });
    }
    
    // Validate target account
    if (!targetAccount) {
      await dbTransaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Target account not found'
      });
    }
    
    // Check if source account has sufficient funds
    if (sourceAccount.balance < amount) {
      await dbTransaction.rollback();
      return res.status(402).json({
        success: false,
        error: 'Insufficient funds'
      });
    }
    
    // Create transaction record
    const transaction = await Transaction.create({
      accountFrom,
      accountTo,
      amount,
      currency,
      explanation,
      senderName,
      receiverName: targetAccount.owner,
      status: 'completed',
      isInternal: true
    }, { transaction: dbTransaction });
    
    // Update account balances
    await sourceAccount.update(
      { balance: sequelize.literal(`balance - ${amount}`) },
      { transaction: dbTransaction }
    );
    
    await targetAccount.update(
      { balance: sequelize.literal(`balance + ${amount}`) },
      { transaction: dbTransaction }
    );
    
    // Commit the transaction
    await dbTransaction.commit();
    
    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    // Rollback in case of error
    await dbTransaction.rollback();
    console.error('Error creating internal transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Create external transaction (to another bank)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createExternalTransaction = async (req, res) => {
  // Start a database transaction for consistency
  const dbTransaction = await sequelize.transaction();
  
  try {
    const { accountFrom, accountTo, amount, currency, explanation, senderName } = req.body;
    
    // Input validation
    if (!accountFrom || !accountTo || !amount || !currency || !explanation || !senderName) {
      await dbTransaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }
    
    // Check if amount is valid
    if (amount <= 0) {
      await dbTransaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than 0'
      });
    }
    
    // Find source account
    const sourceAccount = await Account.findOne({ 
      where: { accountNumber: accountFrom },
      transaction: dbTransaction
    });
    
    // Validate source account
    if (!sourceAccount) {
      await dbTransaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Source account not found'
      });
    }
    
    // Check if source account has sufficient funds
    if (sourceAccount.balance < amount) {
      await dbTransaction.rollback();
      return res.status(402).json({
        success: false,
        error: 'Insufficient funds'
      });
    }
    
    // Create a pending transaction record
    const transaction = await Transaction.create({
      accountFrom,
      accountTo,
      amount,
      currency,
      explanation,
      senderName,
      status: 'pending',
      isInternal: false
    }, { transaction: dbTransaction });
    
    // Check if the target account is in the same bank
    if (isSameBank(accountTo)) {
      // It's actually an internal transaction
      const targetAccount = await Account.findOne({
        where: { accountNumber: accountTo },
        transaction: dbTransaction
      });
      
      if (!targetAccount) {
        await transaction.update(
          { status: 'failed', failureReason: 'Target account not found' },
          { transaction: dbTransaction }
        );
        
        await dbTransaction.commit();
        
        return res.status(404).json({
          success: false,
          error: 'Target account not found'
        });
      }
      
      // Update transaction to be internal
      await transaction.update({
        isInternal: true,
        receiverName: targetAccount.owner,
        status: 'completed'
      }, { transaction: dbTransaction });
      
      // Update account balances
      await sourceAccount.update(
        { balance: sequelize.literal(`balance - ${amount}`) },
        { transaction: dbTransaction }
      );
      
      await targetAccount.update(
        { balance: sequelize.literal(`balance + ${amount}`) },
        { transaction: dbTransaction }
      );
      
      await dbTransaction.commit();
      
      return res.status(201).json({
        success: true,
        data: transaction
      });
    }
    
    // It's a truly external transaction to another bank
    try {
      // Get the target bank prefix
      const targetBankPrefix = accountTo.substring(0, 3);
      
      // Get target bank information from Central Bank
      const bankInfo = await getBankInfo(targetBankPrefix);
      
      if (!bankInfo || !bankInfo.transactionUrl) {
        await transaction.update(
          { status: 'failed', failureReason: 'Target bank not found' },
          { transaction: dbTransaction }
        );
        
        await dbTransaction.commit();
        
        return res.status(404).json({
          success: false,
          error: 'Target bank not found or invalid'
        });
      }
      
      // Update transaction with external bank info
      await transaction.update({
        externalBankId: targetBankPrefix
      }, { transaction: dbTransaction });
      
      // Create JWT payload
      const payload = {
        accountFrom,
        accountTo,
        amount,
        currency,
        explanation,
        senderName
      };
      
      // Sign JWT with bank's private key
      const token = signJWT(payload);
      
      // Send transaction to target bank
      const response = await axios.post(bankInfo.transactionUrl, { jwt: token });
      
      if (response.status === 200 && response.data.receiverName) {
        // Transaction successful, update transaction
        await transaction.update({
          status: 'completed',
          receiverName: response.data.receiverName
        }, { transaction: dbTransaction });
        
        // Deduct amount from source account
        await sourceAccount.update(
          { balance: sequelize.literal(`balance - ${amount}`) },
          { transaction: dbTransaction }
        );
        
        await dbTransaction.commit();
        
        return res.status(201).json({
          success: true,
          data: transaction
        });
      } else {
        throw new Error('Invalid response from target bank');
      }
    } catch (error) {
      console.error('External transaction error:', error.message);
      
      // Mark transaction as failed
      await transaction.update({
        status: 'failed',
        failureReason: error.message || 'External bank communication error'
      }, { transaction: dbTransaction });
      
      await dbTransaction.commit();
      
      return res.status(502).json({
        success: false,
        error: 'Failed to process transaction with external bank',
        details: error.message
      });
    }
  } catch (error) {
    // Rollback in case of error
    await dbTransaction.rollback();
    console.error('Error creating external transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Handle incoming B2B transaction from another bank
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.handleB2BTransaction = async (req, res) => {
  // Start a database transaction for consistency
  const dbTransaction = await sequelize.transaction();
  
  try {
    const { jwt: token } = req.body;
    
    if (!token) {
      await dbTransaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'JWT token is required'
      });
    }
    
    // Decode token to get header and payload (without verifying signature yet)
    let decodedToken;
    try {
      decodedToken = jwt.decode(token, { complete: true });
      if (!decodedToken) {
        throw new Error('Invalid JWT structure');
      }
    } catch (error) {
      await dbTransaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Invalid JWT format'
      });
    }
    
    // Extract payload and header
    const { payload, header } = decodedToken;
    const { accountFrom, accountTo, amount, currency, explanation, senderName } = payload;
    
    // Verify that the target account belongs to this bank
    if (!isSameBank(accountTo)) {
      await dbTransaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Target account does not belong to this bank'
      });
    }
    
    // Check if target account exists
    const targetAccount = await Account.findOne({
      where: { accountNumber: accountTo },
      transaction: dbTransaction
    });
    
    if (!targetAccount) {
      await dbTransaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Target account not found'
      });
    }
    
    // Get source bank info
    const sourceBankPrefix = accountFrom.substring(0, 3);
    const sourceBankInfo = await getBankInfo(sourceBankPrefix);
    
    if (!sourceBankInfo || !sourceBankInfo.jwksUrl) {
      await dbTransaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Source bank not found or invalid'
      });
    }
    
    // Get source bank's public key from JWKS
    let publicKey;
    try {
      const jwksResponse = await axios.get(sourceBankInfo.jwksUrl);
      const jwks = jwksResponse.data;
      
      // Find the key used to sign the JWT
      const kid = header.kid;
      const key = jwks.keys.find(k => k.kid === kid);
      
      if (!key) {
        throw new Error('Signing key not found in JWKS');
      }
      
      // Convert JWK to PEM format
      // This is a simplified version, in practice use a library like jwk-to-pem
      publicKey = `-----BEGIN PUBLIC KEY-----\n${key.n}\n-----END PUBLIC KEY-----`;
    } catch (error) {
      await dbTransaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Failed to retrieve source bank public key'
      });
    }
    
    // Verify JWT signature
    try {
      verifyJWT(token, publicKey);
    } catch (error) {
      await dbTransaction.rollback();
      return res.status(401).json({
        success: false,
        error: 'JWT signature verification failed'
      });
    }
    
    // Create transaction record
    const transaction = await Transaction.create({
      transactionId: decodedToken.jti || null,
      accountFrom,
      accountTo,
      amount,
      currency,
      explanation,
      senderName,
      receiverName: targetAccount.owner,
      status: 'completed',
      isInternal: false,
      externalBankId: sourceBankPrefix
    }, { transaction: dbTransaction });
    
    // Credit target account
    await targetAccount.update(
      { balance: sequelize.literal(`balance + ${amount}`) },
      { transaction: dbTransaction }
    );
    
    // Commit transaction
    await dbTransaction.commit();
    
    // Return success with receiver name (as required by spec)
    res.status(200).json({
      receiverName: targetAccount.owner
    });
  } catch (error) {
    // Rollback in case of error
    if (dbTransaction) await dbTransaction.rollback();
    console.error('Error handling B2B transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get JWKS (JSON Web Key Set) for the bank
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getJWKS = (req, res) => {
  try {
    const jwks = getJWKS();
    res.status(200).json(jwks);
  } catch (error) {
    console.error('Error getting JWKS:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve JWKS'
    });
  }
};
