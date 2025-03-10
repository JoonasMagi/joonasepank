# JoonasMägi Bank (JMB)

A bank application that can interoperate with other banks via the Central Bank for processing transactions. This application implements the specifications from [Central Bank repository](https://github.com/henno/keskpank).

## Features

- Account creation and management
- Intra-bank transactions (within JMB)
- Inter-bank transactions (to other banks via Central Bank)
- JWT-based authentication for secure transactions
- Swagger UI for API documentation
- Simple frontend interface

## Technical Overview

This application consists of:

- **Backend**: Node.js with Express.js framework
- **Database**: SQLite with Sequelize ORM
- **API Documentation**: Swagger UI
- **Authentication**: JWT-based signing for transactions
- **Frontend**: Simple HTML/CSS/JavaScript interface

## Prerequisites

- Node.js (v14 or higher)
- No external database needed (SQLite is embedded)
- Access to Central Bank API

## Setup

1. **Clone the repository**
   ```
   git clone https://github.com/JoonasMagi/joonasepank.git
   cd joonasepank
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Set up environment variables**
   ```
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Generate RSA key pair**
   ```
   npm run generate-keys
   ```
   This will create a keys directory with private-key.pem and public-key.pem files.

5. **Initialize the database**
   ```
   npm run init-db
   ```
   This will create the SQLite database file and initialize it with tables and test data.

6. **Register with the Central Bank**
   ```
   node scripts/register-bank.js
   ```
   This will register your bank with the Central Bank and update your .env file with the received API key.

7. **Start the server**
   ```
   npm start
   ```
   The application will be available at http://localhost:3000

## API Documentation

API documentation is available via Swagger UI at the `/api-docs` endpoint when the server is running. This provides an interactive interface to explore and test all API endpoints.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get current user profile

### Accounts

- `GET /api/accounts` - Get all accounts
- `GET /api/accounts/:accountNumber` - Get account by account number
- `POST /api/accounts` - Create a new account
- `PUT /api/accounts/:accountNumber` - Update an account
- `DELETE /api/accounts/:accountNumber` - Delete an account
- `GET /api/accounts/:accountNumber/transactions` - Get transactions for an account

### Transactions

- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions/internal` - Create an internal transaction
- `POST /api/transactions/external` - Create an external transaction
- `POST /api/transactions/b2b` - Handle incoming B2B transaction
- `GET /api/transactions/jwks` - Get bank's JWKS

## Database Structure

The application uses SQLite with Sequelize ORM for data storage. The database schema includes:

### Accounts Table
- `id` - Primary key
- `accountNumber` - Unique account identifier (includes bank prefix)
- `owner` - Account owner's name
- `balance` - Current account balance
- `currency` - Account currency (EUR, USD, GBP)
- `status` - Account status (active, blocked, closed)
- `createdAt` - Account creation timestamp
- `updatedAt` - Account update timestamp

### Transactions Table
- `id` - Primary key
- `transactionId` - Unique UUID for the transaction
- `accountFrom` - Source account number
- `accountTo` - Target account number
- `amount` - Transaction amount
- `currency` - Transaction currency
- `explanation` - Transaction description
- `senderName` - Name of the sender
- `receiverName` - Name of the receiver
- `status` - Transaction status (pending, completed, failed)
- `isInternal` - Whether transaction is within the same bank
- `externalBankId` - ID of external bank (if not internal)
- `failureReason` - Reason for failure (if failed)
- `createdAt` - Transaction creation timestamp
- `updatedAt` - Transaction update timestamp

### Users Table
- `id` - Primary key
- `username` - Unique username
- `password` - Hashed password
- `email` - User's email
- `firstName` - User's first name
- `lastName` - User's last name
- `role` - User's role (user, admin)
- `lastLogin` - Last login timestamp
- `createdAt` - User creation timestamp
- `updatedAt` - User update timestamp

## Interoperability with Central Bank

The application implements the Central Bank specifications from https://github.com/henno/keskpank/blob/master/SPECIFICATIONS.md including:

- Account number format with bank prefix
- JWT-based transaction authorization
- Transaction flow for both internal and external transfers
- Public key sharing via JWKS endpoint

## Implementation Details

### Account Numbers

Account numbers follow the format: `{BANK_PREFIX}{UUID}` where:
- `BANK_PREFIX` is the 3-character code assigned by the Central Bank
- `UUID` is a random UUID without hyphens

### Transaction Security

Transactions between banks are secured using:
- RSA key pairs (2048-bit)
- JWT tokens signed with the private key
- Signature verification using the public key from JWKS endpoint

## Frontend

A simple frontend is provided for testing and demonstration purposes. It allows:

- User registration and login
- Account management (create, view details)
- Transaction history viewing
- Making internal and external transfers
- Profile management

## Testing

You can test the application in various ways:

1. **Using the Web Interface**
   - Create accounts and make transactions through the frontend UI
   - Test both internal and external transfers

2. **Using Swagger UI**
   - Access `/api-docs` to interact with the API directly
   - Test individual endpoints with different parameters

3. **Bank-to-Bank Testing**
   - Set up multiple banks to test interbank transfers
   - Use TEST_MODE in .env to simulate Central Bank interactions

## Security Considerations

- All passwords are hashed using bcrypt before storage
- JWT tokens are used for API authentication
- RSA-256 signing is used for secure interbank transactions
- The application implements proper input validation and error handling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC
