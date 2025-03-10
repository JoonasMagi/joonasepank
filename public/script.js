// DOM Elements
const accountsList = document.getElementById('accounts-list');
const transactionsList = document.getElementById('transactions-list');
const createAccountForm = document.getElementById('create-account-form');
const createTransactionForm = document.getElementById('create-transaction-form');
const accountFromSelect = document.getElementById('accountFrom');
const accountFilter = document.getElementById('account-filter');

// API Base URL
const API_BASE_URL = '';

// Fetch all accounts
async function fetchAccounts() {
  try {
    const response = await axios.get(`${API_BASE_URL}/accounts`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return [];
  }
}

// Fetch all transactions
async function fetchTransactions() {
  try {
    const response = await axios.get(`${API_BASE_URL}/transactions`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

// Fetch transactions for a specific account
async function fetchAccountTransactions(accountNumber) {
  try {
    const response = await axios.get(`${API_BASE_URL}/transactions/account/${accountNumber}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching transactions for account ${accountNumber}:`, error);
    return [];
  }
}

// Create a new account
async function createAccount(accountData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/accounts`, accountData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
}

// Create a new transaction
async function createTransaction(transactionData) {
  try {
    // Determine if it's an internal or external transaction based on the accountTo
    const isSameBank = transactionData.accountTo.startsWith(accountFromSelect.options[0].value.substring(0, 3));
    const endpoint = isSameBank ? 'internal' : 'external';
    
    const response = await axios.post(`${API_BASE_URL}/transactions/${endpoint}`, transactionData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

// Render accounts in the table
function renderAccounts(accounts) {
  accountsList.innerHTML = '';
  accountFromSelect.innerHTML = '';
  accountFilter.innerHTML = '<option value="">All Accounts</option>';

  accounts.forEach(account => {
    // Add to accounts table
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${account.accountNumber}</td>
      <td>${account.owner}</td>
      <td>${account.balance.toFixed(2)}</td>
      <td>${account.currency}</td>
      <td>
        <button class="view-transactions-btn" data-account="${account.accountNumber}">View Transactions</button>
      </td>
    `;
    accountsList.appendChild(row);

    // Add to transaction form select
    const option = document.createElement('option');
    option.value = account.accountNumber;
    option.textContent = `${account.accountNumber} (${account.owner} - ${account.balance.toFixed(2)} ${account.currency})`;
    accountFromSelect.appendChild(option);

    // Add to filter select
    const filterOption = document.createElement('option');
    filterOption.value = account.accountNumber;
    filterOption.textContent = option.textContent;
    accountFilter.appendChild(filterOption);
  });

  // Add event listeners to view transaction buttons
  document.querySelectorAll('.view-transactions-btn').forEach(button => {
    button.addEventListener('click', async () => {
      const accountNumber = button.getAttribute('data-account');
      accountFilter.value = accountNumber;
      const transactions = await fetchAccountTransactions(accountNumber);
      renderTransactions(transactions);
    });
  });
}

// Render transactions in the table
function renderTransactions(transactions) {
  transactionsList.innerHTML = '';

  transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  transactions.forEach(transaction => {
    const row = document.createElement('tr');
    const date = new Date(transaction.createdAt).toLocaleString();
    row.innerHTML = `
      <td>${date}</td>
      <td>${transaction.accountFrom}</td>
      <td>${transaction.accountTo}</td>
      <td>${transaction.amount.toFixed(2)}</td>
      <td>${transaction.currency}</td>
      <td>${transaction.explanation}</td>
      <td>${transaction.status}</td>
    `;
    transactionsList.appendChild(row);
  });
}

// Initialize the application
async function init() {
  // Load accounts and transactions
  const accounts = await fetchAccounts();
  renderAccounts(accounts);

  const transactions = await fetchTransactions();
  renderTransactions(transactions);

  // Create account form submission
  createAccountForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(createAccountForm);
    const accountData = {
      owner: formData.get('owner'),
      balance: parseFloat(formData.get('balance')),
      currency: formData.get('currency'),
    };

    try {
      await createAccount(accountData);
      createAccountForm.reset();
      const accounts = await fetchAccounts();
      renderAccounts(accounts);
      alert('Account created successfully!');
    } catch (error) {
      alert(`Error creating account: ${error.response?.data?.error || error.message}`);
    }
  });

  // Create transaction form submission
  createTransactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(createTransactionForm);
    const transactionData = {
      accountFrom: formData.get('accountFrom'),
      accountTo: formData.get('accountTo'),
      amount: parseFloat(formData.get('amount')),
      currency: formData.get('currency'),
      explanation: formData.get('explanation'),
      senderName: formData.get('senderName'),
    };

    try {
      await createTransaction(transactionData);
      createTransactionForm.reset();
      
      // Refresh data
      const accounts = await fetchAccounts();
      renderAccounts(accounts);
      
      const transactions = await fetchTransactions();
      renderTransactions(transactions);
      
      alert('Transaction created successfully!');
    } catch (error) {
      alert(`Error creating transaction: ${error.response?.data?.error || error.message}`);
    }
  });

  // Account filter change
  accountFilter.addEventListener('change', async () => {
    const accountNumber = accountFilter.value;
    let transactions;

    if (accountNumber) {
      transactions = await fetchAccountTransactions(accountNumber);
    } else {
      transactions = await fetchTransactions();
    }

    renderTransactions(transactions);
  });
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
