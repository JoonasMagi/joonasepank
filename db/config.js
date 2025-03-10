const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Set up Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH || path.join(__dirname, '../joonasepank.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false
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
