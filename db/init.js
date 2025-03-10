/**
 * Database initialization script
 * Creates and initializes the SQLite database tables
 */

const { sequelize } = require('./config');
const path = require('path');
const fs = require('fs');

// Load environment variables with the correct path
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import models from the index file
const { Account, Transaction, User } = require('../models');

// Initialize database
const initDatabase = async () => {
  try {
    console.log('Starting database initialization...');

    // Test the database connection first
    try {
      await sequelize.authenticate();
      console.log('Database connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
      process.exit(1);
    }

    // Force sync all models (drops tables if they exist)
    // This creates the tables based on model definitions
    console.log('Creating database tables...');
    await sequelize.sync({ force: true });
    console.log('Database tables created successfully!');
    
    // Wait for tables to be fully created
    console.log('Waiting for tables to be properly initialized...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create a demo admin user
    console.log('Creating demo admin user...');
    const adminUser = await User.create({
      username: 'admin',
      password: 'admin123', // Will be hashed automatically
      email: 'admin@joonasepank.com',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User'
    });
    console.log('Demo admin user created:', adminUser.username);

    // Create demo accounts
    console.log('Creating demo accounts...');
    const demoAccounts = [
      {
        owner: 'John Doe',
        balance: 10000,
        currency: 'EUR'
      },
      {
        owner: 'Jane Smith',
        balance: 5000,
        currency: 'USD'
      },
      {
        owner: 'Bob Johnson',
        balance: 7500,
        currency: 'GBP'
      }
    ];

    // Create accounts one by one with proper error handling
    for (const accountData of demoAccounts) {
      try {
        const account = await Account.create(accountData);
        console.log(`Created account: ${account.accountNumber} (${account.owner})`);
      } catch (err) {
        console.error('Error creating demo account:', err);
        throw err;
      }
    }
    console.log('Demo accounts created:', demoAccounts.length, 'accounts');

    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Run the initialization
initDatabase();
