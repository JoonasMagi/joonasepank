const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - accountFrom
 *         - accountTo
 *         - amount
 *         - currency
 *         - explanation
 *         - senderName
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the transaction
 *         accountFrom:
 *           type: string
 *           description: The source account number
 *         accountTo:
 *           type: string
 *           description: The target account number
 *         amount:
 *           type: number
 *           description: The amount to transfer
 *         currency:
 *           type: string
 *           description: The currency of the transfer (EUR, USD, GBP)
 *         explanation:
 *           type: string
 *           description: The reason for the transfer
 *         senderName:
 *           type: string
 *           description: The name of the sender
 *         receiverName:
 *           type: string
 *           description: The name of the receiver
 *         status:
 *           type: string
 *           enum: [pending, completed, failed]
 *           description: The status of the transaction
 *         isInternalTransaction:
 *           type: boolean
 *           description: Whether the transaction is within the same bank
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the transaction was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the transaction was last updated
 */

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Transaction management API
 */

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: The list of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 */
router.get('/', transactionController.getTransactions);

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: Get a transaction by ID
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The transaction ID
 *     responses:
 *       200:
 *         description: The transaction details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found
 */
router.get('/:id', transactionController.getTransaction);

/**
 * @swagger
 * /transactions/account/{accountNumber}:
 *   get:
 *     summary: Get transactions for a specific account
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         schema:
 *           type: string
 *         required: true
 *         description: The account number
 *     responses:
 *       200:
 *         description: The list of transactions for the account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 */
router.get('/account/:accountNumber', transactionController.getAccountTransactions);

/**
 * @swagger
 * /transactions/internal:
 *   post:
 *     summary: Create an internal transaction (within the same bank)
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountFrom
 *               - accountTo
 *               - amount
 *               - currency
 *               - explanation
 *               - senderName
 *             properties:
 *               accountFrom:
 *                 type: string
 *               accountTo:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 enum: [EUR, USD, GBP]
 *               explanation:
 *                 type: string
 *               senderName:
 *                 type: string
 *     responses:
 *       201:
 *         description: The transaction was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       402:
 *         description: Insufficient funds
 *       404:
 *         description: Account not found
 */
router.post('/internal', transactionController.createInternalTransaction);

/**
 * @swagger
 * /transactions/external:
 *   post:
 *     summary: Create an external transaction (to another bank)
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountFrom
 *               - accountTo
 *               - amount
 *               - currency
 *               - explanation
 *               - senderName
 *             properties:
 *               accountFrom:
 *                 type: string
 *               accountTo:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 enum: [EUR, USD, GBP]
 *               explanation:
 *                 type: string
 *               senderName:
 *                 type: string
 *     responses:
 *       201:
 *         description: The transaction was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       402:
 *         description: Insufficient funds
 *       404:
 *         description: Account not found
 */
router.post('/external', transactionController.createExternalTransaction);

/**
 * @swagger
 * /transactions/b2b:
 *   post:
 *     summary: Handle incoming B2B transaction
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jwt
 *             properties:
 *               jwt:
 *                 type: string
 *                 description: JWT token containing transaction details
 *     responses:
 *       200:
 *         description: Transaction processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 receiverName:
 *                   type: string
 *       400:
 *         description: Bad request (parsing JWT failed, invalid signature)
 *       404:
 *         description: Account not found
 */
router.post('/b2b', transactionController.handleB2BTransaction);

/**
 * @swagger
 * /transactions/jwks:
 *   get:
 *     summary: Get bank's JWKS (JSON Web Key Set)
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: JWKS containing the bank's public key
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 keys:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/jwks', transactionController.getJWKS);

module.exports = router;
