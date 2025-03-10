const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Get database path from environment or use default
const dbPath = process.env.DB_PATH || path.join(__dirname, '../joonasepank.sqlite');

// Ensure the directory exists
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// Create a new Sequelize instance with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    freezeTableName: false, // Allow Sequelize to pluralize table names
    timestamps: true, // Add createdAt and updatedAt fields
    underscored: false // Use camelCase for attributes
  },
  // SQLite-specific options for better compatibility
  dialectOptions: {
    // Better foreign key support
    foreign_keys: true
  }
});

// Test the database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection
};
