const Account = require('../models/account');

// Create a new account
exports.createAccount = async (req, res) => {
  try {
    const { owner, balance, currency } = req.body;

    // Create a new account
    const account = await Account.create({
      owner,
      balance,
      currency,
    });

    // Return the account
    res.status(201).json({
      success: true,
      data: account,
    });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all accounts
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.findAll();

    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts,
    });
  } catch (error) {
    console.error('Error getting accounts:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get a single account
exports.getAccount = async (req, res) => {
  try {
    const account = await Account.findOne({ 
      where: { accountNumber: req.params.accountNumber } 
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found',
      });
    }

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    console.error('Error getting account:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update an account
exports.updateAccount = async (req, res) => {
  try {
    const { owner, balance, currency } = req.body;

    // Find the account
    let account = await Account.findOne({ 
      where: { accountNumber: req.params.accountNumber } 
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found',
      });
    }

    // Update the account
    const updatedFields = {};
    if (owner) updatedFields.owner = owner;
    if (balance !== undefined) updatedFields.balance = balance;
    if (currency) updatedFields.currency = currency;

    await account.update(updatedFields);

    // Get the updated account
    account = await Account.findOne({ 
      where: { accountNumber: req.params.accountNumber } 
    });

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete an account
exports.deleteAccount = async (req, res) => {
  try {
    const account = await Account.findOne({ 
      where: { accountNumber: req.params.accountNumber } 
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found',
      });
    }

    await account.destroy();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
