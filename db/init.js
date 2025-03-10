/**
 * Database initialization script
 * 
 * This script creates and initializes the SQLite database and tables
 * Run with: node db/init.js
 */

const { sequelize } = require('./database');
const Account = require('../models/account');
const Transaction = require('../models/transaction');

// Function to initialize the database
const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');
    
    // Sync all models with the database
    // Force: true will drop tables if they exist
    await sequelize.sync({ force: true });
    
    console.log('Database synchronized successfully');
    
    // Create a test account
    const testAccount = await Account.create({
      owner: 'Test User',
      balance: 1000,
      currency: 'EUR'
    });
    
    console.log('Test account created:', testAccount.toJSON());
    
    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Run the initialization
initializeDatabase();
