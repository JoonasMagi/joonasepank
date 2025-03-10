const Transaction = require('../models/transaction');
const Account = require('../models/account');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { sequelize } = require('../db/database');

// Import bank utils
const { isSameBank, getCentralBankInfo, getBankInfo } = require('../utils/bankUtils');

// Create an internal transaction (within the same bank)
exports.createInternalTransaction = async (req, res) => {
  // Start a transaction to ensure data consistency
  const dbTransaction = await sequelize.transaction();
  
  try {
    const { accountFrom, accountTo, amount, currency, explanation, senderName } = req.body;

    // Check if both accounts exist
    const sourceAccount = await Account.findOne({ 
      where: { accountNumber: accountFrom },
      transaction: dbTransaction
    });
    
    const targetAccount = await Account.findOne({ 
      where: { accountNumber: accountTo },
      transaction: dbTransaction
    });

    if (!sourceAccount) {
      await dbTransaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Source account not found',
      });
    }

    if (!targetAccount) {
      await dbTransaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Target account not found',
      });
    }

    // Check if source account has sufficient funds
    if (sourceAccount.balance < amount) {
      await dbTransaction.rollback();
      return res.status(402).json({
        success: false,
        error: 'Insufficient funds',
      });
    }

    // Create a transaction record
    const transaction = await Transaction.create({
      accountFrom,
      accountTo,
      amount,
      currency,
      explanation,
      senderName,
      receiverName: targetAccount.owner,
      status: 'completed',
      isInternalTransaction: true,
    }, { transaction: dbTransaction });

    // Update account balances
    await sourceAccount.update({
      balance: sourceAccount.balance - amount
    }, { transaction: dbTransaction });
    
    await targetAccount.update({
      balance: targetAccount.balance + amount
    }, { transaction: dbTransaction });

    // Commit the transaction
    await dbTransaction.commit();

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await dbTransaction.rollback();
    console.error('Error creating internal transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Create an external transaction (to another bank)
exports.createExternalTransaction = async (req, res) => {
  // Start a transaction to ensure data consistency
  const dbTransaction = await sequelize.transaction();
  
  try {
    const { accountFrom, accountTo, amount, currency, explanation, senderName } = req.body;

    // Check if source account exists
    const sourceAccount = await Account.findOne({ 
      where: { accountNumber: accountFrom },
      transaction: dbTransaction
    });

    if (!sourceAccount) {
      await dbTransaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Source account not found',
      });
    }

    // Check if source account has sufficient funds
    if (sourceAccount.balance < amount) {
      await dbTransaction.rollback();
      return res.status(402).json({
        success: false,
        error: 'Insufficient funds',
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
      isInternalTransaction: false,
    }, { transaction: dbTransaction });

    // Check if target account is in the same bank
    if (isSameBank(accountTo)) {
      // Handle as internal transaction
      const targetAccount = await Account.findOne({ 
        where: { accountNumber: accountTo },
        transaction: dbTransaction
      });

      if (!targetAccount) {
        await transaction.update({ status: 'failed' }, { transaction: dbTransaction });
        await dbTransaction.commit();
        return res.status(404).json({
          success: false,
          error: 'Target account not found',
        });
      }

      // Update account balances
      await sourceAccount.update({
        balance: sourceAccount.balance - amount
      }, { transaction: dbTransaction });
      
      await targetAccount.update({
        balance: targetAccount.balance + amount
      }, { transaction: dbTransaction });

      // Update transaction status
      await transaction.update({
        status: 'completed',
        receiverName: targetAccount.owner,
        isInternalTransaction: true,
      }, { transaction: dbTransaction });

      // Commit the transaction
      await dbTransaction.commit();

      return res.status(201).json({
        success: true,
        data: transaction,
      });
    }

    // Handle external transaction
    try {
      // Get target bank information from Central Bank
      const targetBankPrefix = accountTo.substring(0, 3);
      const bankInfo = await getBankInfo(targetBankPrefix);

      if (!bankInfo) {
        await transaction.update({ status: 'failed' }, { transaction: dbTransaction });
        await dbTransaction.commit();
        return res.status(404).json({
          success: false,
          error: 'Target bank not found',
        });
      }

      // Create JWT payload
      const payload = {
        accountFrom,
        accountTo,
        currency,
        amount,
        explanation,
        senderName,
      };

      // Load private key
      const privateKeyPath = process.env.PRIVATE_KEY_PATH || path.join(__dirname, '../private-key.pem');
      const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

      // Sign JWT
      const token = jwt.sign(payload, privateKey, { algorithm: 'RS256', keyid: '1' });

      // Send transaction to target bank
      const response = await axios.post(bankInfo.transactionUrl, { jwt: token });

      // Check response
      if (response.status === 200 && response.data.receiverName) {
        // Update transaction status
        await transaction.update({
          status: 'completed',
          receiverName: response.data.receiverName
        }, { transaction: dbTransaction });

        // Update source account balance
        await sourceAccount.update({
          balance: sourceAccount.balance - amount
        }, { transaction: dbTransaction });

        // Commit the transaction
        await dbTransaction.commit();

        return res.status(201).json({
          success: true,
          data: transaction,
        });
      } else {
        // Transaction failed
        await transaction.update({ status: 'failed' }, { transaction: dbTransaction });
        await dbTransaction.commit();

        return res.status(502).json({
          success: false,
          error: 'Target bank returned an error',
        });
      }
    } catch (error) {
      // Transaction failed
      await transaction.update({ status: 'failed' }, { transaction: dbTransaction });
      await dbTransaction.commit();

      console.error('Error processing external transaction:', error);
      return res.status(502).json({
        success: false,
        error: error.message || 'Error processing external transaction',
      });
    }
  } catch (error) {
    // Rollback the transaction in case of error
    await dbTransaction.rollback();
    console.error('Error creating external transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Handle incoming B2B transactions
exports.handleB2BTransaction = async (req, res) => {
  // Start a transaction to ensure data consistency
  const dbTransaction = await sequelize.transaction();
  
  try {
    const { jwt: token } = req.body;

    if (!token) {
      await dbTransaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'JWT token is required',
      });
    }

    // Verify JWT structure (without signature verification yet)
    let payload;
    try {
      // Decode without verification first to get the header
      const decoded = jwt.decode(token, { complete: true });
      
      if (!decoded) {
        await dbTransaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Invalid JWT structure',
        });
      }
      
      payload = decoded.payload;
    } catch (error) {
      await dbTransaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Invalid JWT format',
      });
    }

    // Extract transaction details
    const { accountFrom, accountTo, amount, currency, explanation, senderName } = payload;

    // Verify the receiving account exists
    const targetAccount = await Account.findOne({ 
      where: { accountNumber: accountTo },
      transaction: dbTransaction
    });

    if (!targetAccount) {
      await dbTransaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Receiving account not found',
      });
    }

    // Get source bank information from Central Bank
    const sourceBankPrefix = accountFrom.substring(0, 3);
    const sourceBankInfo = await getBankInfo(sourceBankPrefix);

    if (!sourceBankInfo) {
      await dbTransaction.rollback();
      return res.status(404).json({
        success: false,
        error: 'Source bank not found',
      });
    }

    // Get the source bank's public key from their JWKS endpoint
    try {
      const jwksResponse = await axios.get(sourceBankInfo.jwksUrl);
      const jwks = jwksResponse.data;

      // Find the key used to sign the JWT (using kid from the JWT header)
      const header = jwt.decode(token, { complete: true }).header;
      const kid = header.kid;

      const signingKey = jwks.keys.find(key => key.kid === kid);

      if (!signingKey) {
        await dbTransaction.rollback();
        return res.status(400).json({
          success: false,
          error: 'Invalid signing key',
        });
      }

      // Convert JWK to PEM format
      const publicKey = signingKey.x5c ? `-----BEGIN CERTIFICATE-----\n${signingKey.x5c[0]}\n-----END CERTIFICATE-----` :
        `-----BEGIN PUBLIC KEY-----\n${signingKey.n}\n-----END PUBLIC KEY-----`;

      // Verify JWT signature
      jwt.verify(token, publicKey, { algorithms: ['RS256'] });

      // Create a transaction record
      const transaction = await Transaction.create({
        accountFrom,
        accountTo,
        amount,
        currency,
        explanation,
        senderName,
        receiverName: targetAccount.owner,
        status: 'completed',
        isInternalTransaction: false,
      }, { transaction: dbTransaction });

      // Update account balance
      await targetAccount.update({
        balance: targetAccount.balance + amount
      }, { transaction: dbTransaction });

      // Commit the transaction
      await dbTransaction.commit();

      // Return success with receiver's name
      return res.status(200).json({
        receiverName: targetAccount.owner,
      });
    } catch (error) {
      await dbTransaction.rollback();
      console.error('Error verifying JWT:', error);
      return res.status(400).json({
        success: false,
        error: 'JWT verification failed',
      });
    }
  } catch (error) {
    // Rollback the transaction in case of error
    if (dbTransaction) await dbTransaction.rollback();
    console.error('Error handling B2B transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Provide JWKS (JSON Web Key Set) with the bank's public key
exports.getJWKS = async (req, res) => {
  try {
    // Load public key
    const publicKeyPath = process.env.PUBLIC_KEY_PATH || path.join(__dirname, '../public-key.pem');
    const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

    // Convert PEM to JWK (simplified for this example)
    // In a production environment, use a library like 'jwk-to-pem' to properly convert between formats
    const jwks = {
      keys: [
        {
          kty: 'RSA',
          use: 'sig',
          kid: '1',
          alg: 'RS256',
          n: publicKey
            .replace('-----BEGIN PUBLIC KEY-----', '')
            .replace('-----END PUBLIC KEY-----', '')
            .replace(/\s/g, ''),
          e: 'AQAB',
        },
      ],
    };

    res.status(200).json(jwks);
  } catch (error) {
    console.error('Error providing JWKS:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get a single transaction
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Error getting transaction:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get transactions for a specific account
exports.getAccountTransactions = async (req, res) => {
  try {
    const { accountNumber } = req.params;

    // Find transactions where the account is either the sender or receiver
    const transactions = await Transaction.findAll({
      where: {
        [Op.or]: [
          { accountFrom: accountNumber },
          { accountTo: accountNumber },
        ],
      },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error('Error getting account transactions:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
