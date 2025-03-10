const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Account:
 *       type: object
 *       required:
 *         - owner
 *       properties:
 *         accountNumber:
 *           type: string
 *           description: The auto-generated account number
 *         owner:
 *           type: string
 *           description: The name of the account owner
 *         balance:
 *           type: number
 *           description: The account balance
 *         currency:
 *           type: string
 *           description: The account currency (EUR, USD, GBP)
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the account was created
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the account was last updated
 */

/**
 * @swagger
 * tags:
 *   name: Accounts
 *   description: Account management API
 */

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Get all accounts
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: The list of accounts
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
 *                     $ref: '#/components/schemas/Account'
 */
router.get('/', accountController.getAccounts);

/**
 * @swagger
 * /accounts/{accountNumber}:
 *   get:
 *     summary: Get an account by account number
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         schema:
 *           type: string
 *         required: true
 *         description: The account number
 *     responses:
 *       200:
 *         description: The account details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Account'
 *       404:
 *         description: Account not found
 */
router.get('/:accountNumber', accountController.getAccount);

/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Create a new account
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - owner
 *             properties:
 *               owner:
 *                 type: string
 *               balance:
 *                 type: number
 *               currency:
 *                 type: string
 *                 enum: [EUR, USD, GBP]
 *     responses:
 *       201:
 *         description: The account was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Account'
 */
router.post('/', accountController.createAccount);

/**
 * @swagger
 * /accounts/{accountNumber}:
 *   put:
 *     summary: Update an account
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         schema:
 *           type: string
 *         required: true
 *         description: The account number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               owner:
 *                 type: string
 *               balance:
 *                 type: number
 *               currency:
 *                 type: string
 *                 enum: [EUR, USD, GBP]
 *     responses:
 *       200:
 *         description: The account was updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Account'
 *       404:
 *         description: Account not found
 */
router.put('/:accountNumber', accountController.updateAccount);

/**
 * @swagger
 * /accounts/{accountNumber}:
 *   delete:
 *     summary: Delete an account
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         schema:
 *           type: string
 *         required: true
 *         description: The account number
 *     responses:
 *       200:
 *         description: The account was deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       404:
 *         description: Account not found
 */
router.delete('/:accountNumber', accountController.deleteAccount);

module.exports = router;
