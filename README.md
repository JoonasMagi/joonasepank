# JoonasMägi Bank (JMB)

A bank application that can interoperate with other banks via the Central Bank for processing transactions.

## Features

- Account creation and management
- Intra-bank transactions
- Inter-bank transactions
- JWT-based authentication
- Swagger UI for API documentation

## Setup

1. Clone the repository
```
git clone https://github.com/JoonasMagi/joonasepank.git
cd joonasepank
```

2. Install dependencies
```
npm install
```

3. Set up environment variables
```
cp .env.example .env
# Edit .env with your configuration
```

4. Generate RSA key pair
```
# Generate private key
openssl genrsa -out private-key.pem 2048

# Generate public key
openssl rsa -in private-key.pem -pubout -out public-key.pem
```

5. Start the server
```
npm start
```

## API Documentation

API documentation is available at `/api-docs` when the server is running.

## License

ISC
