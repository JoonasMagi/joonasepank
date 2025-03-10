/**
 * Database initialization script
 * Creates and initializes the SQLite database tables
 */

const { sequelize } = require('./config');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import models directly, not using destructuring
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Initialize database
const initDatabase = async () => {
  try {
    console.log('Starting database initialization...');

    // Force sync all models (drops tables if they exist)
    await sequelize.sync({ force: true });
    console.log('Database tables created!');

    // Create a demo admin user
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

    for (const account of demoAccounts) {
      await Account.create(account);
    }
    console.log('Demo accounts created!', demoAccounts.length, 'accounts');

    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Run the initialization
initDatabase();
