/**
 * Models index file
 * Sets up model associations and exports models
 */

const Account = require('./Account');
const Transaction = require('./Transaction');
const User = require('./User');

// Define associations
// For now, we won't set up direct foreign key relationships since
// transactions can reference accounts from external banks
// We could add explicit associations later if needed

// Export all models
module.exports = {
  Account,
  Transaction,
  User
};
