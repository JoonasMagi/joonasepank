const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { auth, adminAuth } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID
 *         transactionId:
 *           type: string
 *           format: uuid
 *           description: Unique transaction ID
 *         accountFrom:
 *           type: string
 *           description: Source account number
 *         accountTo:
 *           type: string
 *           description: Target account number
 *         amount:
 *           type: number
 *           format: float
 *           description: Transaction amount
 *         currency:
 *           type: string
 *           enum: [EUR, USD, GBP]
 *           description: Transaction currency
 *         explanation:
 *           type: string
 *           description: Purpose of the transaction
 *         senderName:
 *           type: string
 *           description: Name of the sender
 *         receiverName:
 *           type: string
 *           description: Name of the receiver
 *         status:
 *           type: string
 *           enum: [pending, completed, failed]
 *           description: Transaction status
 *         isInternal:
 *           type: boolean
 *           description: Whether transaction is within the same bank
 *         externalBankId:
 *           type: string
 *           description: ID of external bank (if not internal)
 *         failureReason:
 *           type: string
 *           description: Reason for failure (if failed)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Transaction management API
 */

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all transactions
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
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', auth, transactionController.getAllTransactions);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction details
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
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id', auth, transactionController.getTransactionById);

/**
 * @swagger
 * /api/transactions/internal:
 *   post:
 *     summary: Create an internal transaction (within same bank)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
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
 *                 format: float
 *               currency:
 *                 type: string
 *                 enum: [EUR, USD, GBP]
 *               explanation:
 *                 type: string
 *               senderName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Invalid input
 *       402:
 *         description: Insufficient funds
 *       404:
 *         description: Account not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/internal', auth, transactionController.createInternalTransaction);

/**
 * @swagger
 * /api/transactions/external:
 *   post:
 *     summary: Create an external transaction (to another bank)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
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
 *                 format: float
 *               currency:
 *                 type: string
 *                 enum: [EUR, USD, GBP]
 *               explanation:
 *                 type: string
 *               senderName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Invalid input
 *       402:
 *         description: Insufficient funds
 *       404:
 *         description: Account or bank not found
 *       401:
 *         description: Unauthorized
 *       502:
 *         description: Error communicating with external bank
 *       500:
 *         description: Server error
 */
router.post('/external', auth, transactionController.createExternalTransaction);

/**
 * @swagger
 * /api/transactions/b2b:
 *   post:
 *     summary: Handle B2B transaction from another bank
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
 *         description: Invalid JWT or transaction
 *       401:
 *         description: JWT verification failed
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */
router.post('/b2b', transactionController.handleB2BTransaction);

/**
 * @swagger
 * /api/transactions/jwks:
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
 *       500:
 *         description: Server error
 */
router.get('/jwks', transactionController.getJWKS);

module.exports = router;
