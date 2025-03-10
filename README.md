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
   node scripts/generate-keys.js
   ```
   This will create `private-key.pem` and `public-key.pem` files in the root directory.

5. **Initialize the database**
   ```
   node db/init.js
   ```
   This will create the SQLite database file and initialize it with tables and test data.

6. **Register with the Central Bank**
   ```
   node scripts/register-bank.js
   ```
   Update your `.env` file with the received API key.

7. **Start the server**
   ```
   npm start
   ```
   The application will be available at http://localhost:3000

## API Documentation

API documentation is available via Swagger UI at the `/api-docs` endpoint when the server is running. This provides an interactive interface to explore and test all API endpoints.

## API Endpoints

### Accounts

- `GET /accounts` - Get all accounts
- `GET /accounts/:accountNumber` - Get account by account number
- `POST /accounts` - Create a new account
- `PUT /accounts/:accountNumber` - Update an account
- `DELETE /accounts/:accountNumber` - Delete an account

### Transactions

- `GET /transactions` - Get all transactions
- `GET /transactions/:id` - Get transaction by ID
- `GET /transactions/account/:accountNumber` - Get transactions for an account
- `POST /transactions/internal` - Create an internal transaction
- `POST /transactions/external` - Create an external transaction
- `POST /transactions/b2b` - Handle incoming B2B transaction
- `GET /transactions/jwks` - Get bank's JWKS

## Testing

You can test the application functionality using:

1. **Swagger UI** - Test API endpoints directly
2. **Frontend Interface** - Use the web interface at the root URL
3. **Postman** - Import the included Swagger documentation

## Database Structure

The application uses SQLite with Sequelize ORM for data storage. The database schema includes:

### Accounts Table
- `id` - Primary key
- `accountNumber` - Unique account identifier (includes bank prefix)
- `owner` - Account owner's name
- `balance` - Current account balance
- `currency` - Account currency (EUR, USD, GBP)
- `createdAt` - Account creation timestamp
- `updatedAt` - Account update timestamp

### Transactions Table
- `id` - Primary key
- `accountFrom` - Source account number
- `accountTo` - Target account number
- `amount` - Transaction amount
- `currency` - Transaction currency
- `explanation` - Transaction description
- `senderName` - Name of the sender
- `receiverName` - Name of the receiver
- `status` - Transaction status (pending, completed, failed)
- `isInternalTransaction` - Whether transaction is within the same bank
- `createdAt` - Transaction creation timestamp
- `updatedAt` - Transaction update timestamp

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

- Creating and viewing accounts
- Initiating internal and external transactions
- Viewing transaction history

## License

ISC
