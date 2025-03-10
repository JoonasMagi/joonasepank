const Sequelize = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Create a new Sequelize instance with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH || path.join(__dirname, '../joonasepank.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to SQLite database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the SQLite database:', error);
  }
};

// Export the sequelize instance
module.exports = {
  sequelize,
  testConnection
};
