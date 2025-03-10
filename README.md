# Joonas Mägi Bank Application

A banking application for handling interbank transactions.

## Installation

1. Clone the repository:
```bash
git clone git@github.com:JoonasMagi/joonasepank.git
cd joonasepank
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file from the example:
```bash
cp .env.example .env
```

4. Edit the `.env` file with your specific configuration:
```
PORT=3000
NODE_ENV=development

# Database
DB_PATH=./joonasepank.sqlite

# Bank information
BANK_PREFIX=JMB
BANK_NAME="Joonas Mägi Bank"
BANK_OWNER="Joonas Mägi"
BANK_OWNER_EMAIL="joonas.magi@example.com"

# Central Bank integration
CENTRAL_BANK_URL=http://localhost:8080
API_KEY=your-api-key-here

# Security
PRIVATE_KEY_PATH=./keys/private-key.pem
PUBLIC_KEY_PATH=./keys/public-key.pem

# Test mode
TEST_MODE=false
```

## Setup

### Generate RSA keys

Before starting the application, you need to generate the RSA key pair that will be used for signing and verifying transactions:

```bash
npm run generate-keys
```

### Initialize the database

Initialize the database with demo data:

```bash
npm run init-db
```

### Register with Central Bank

If you're connecting to a Central Bank system, register your bank:

```bash
npm run register-bank
```

## Running the Application

Start the application in development mode:

```bash
npm run dev
```

Or in production mode:

```bash
npm start
```

The application will be available at: http://localhost:3000

API documentation is available at: http://localhost:3000/api-docs

## API Endpoints

### Authentication
- POST `/api/auth/login` - Log in to the system
- POST `/api/auth/register` - Register a new user (if enabled)

### Accounts
- GET `/api/accounts` - Get all accounts
- GET `/api/accounts/:id` - Get account by ID
- POST `/api/accounts` - Create a new account
- PUT `/api/accounts/:id` - Update an account
- DELETE `/api/accounts/:id` - Delete an account

### Transactions
- GET `/api/transactions` - Get all transactions
- GET `/api/transactions/:id` - Get transaction by ID
- POST `/api/transactions/internal` - Create an internal transaction
- POST `/api/transactions/external` - Create an external transaction (to another bank)
- POST `/api/transactions/b2b` - Handle B2B transaction from another bank
- GET `/api/transactions/jwks` - Get bank's JWKS (JSON Web Key Set)

## Troubleshooting

If you encounter any issues, here are some common solutions:

### Application Fails to Start

1. Make sure the `.env` file exists and is properly configured
2. Ensure that RSA keys have been generated using `npm run generate-keys`
3. Check that the database has been initialized with `npm run init-db`

### Transaction Issues

1. For external transactions, ensure that the target bank is properly registered
2. Check that the Central Bank URL and API key are correct in the `.env` file
3. Verify that your bank is registered with the Central Bank using `npm run register-bank`

### JWT Authentication Problems

If you're having issues with JWT authentication:

1. Regenerate your RSA keys: `npm run generate-keys`
2. Make sure the key paths in `.env` are correct
3. Check if the Central Bank has your correct public key

## License

This project is licensed under the ISC License.
