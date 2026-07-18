/**
 * financeRoutes.js — Enrutador Express para el módulo Financiero
 * Capa: src/modules/finance/interfaces/rest/
 *
 * Todos los endpoints requieren autenticación JWT (authMiddleware).
 *
 * Endpoints:
 *   GET    /api/wallets              → Listar billeteras
 *   POST   /api/wallets              → Crear billetera
 *   DELETE /api/wallets/:id          → Eliminar billetera
 *   POST   /api/wallets/transfer     → Transferir fondos
 *   GET    /api/transactions         → Listar transacciones (con ?walletId=)
 *   POST   /api/transactions         → Registrar ingreso/gasto
 */

'use strict';

const { Router } = require('express');
const { body, param } = require('express-validator');
const FinanceController = require('./FinanceController');
const authMiddleware = require('../../../../shared/infrastructure/authMiddleware');

const router = Router();

// Todos los endpoints del módulo finance requieren autenticación
router.use(authMiddleware);

// ──────────────────────────────────────────────────────────────────────────────
// BILLETERAS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/wallets
 */
router.get('/wallets', FinanceController.getWallets);

/**
 * POST /api/wallets
 * Body: { name, currency, initialBalance? }
 */
router.post(
  '/wallets',
  [
    body('name')
      .trim()
      .notEmpty().withMessage('El nombre de la billetera es requerido.')
      .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres.'),
    body('currency')
      .notEmpty().withMessage('La moneda es requerida.')
      .isIn(['PEN', 'USD']).withMessage("La moneda debe ser 'PEN' o 'USD'."),
    body('initialBalance')
      .optional()
      .isFloat({ min: 0 }).withMessage('El saldo inicial debe ser un número positivo.'),
  ],
  FinanceController.createWallet
);

/**
 * DELETE /api/wallets/:id
 */
router.delete(
  '/wallets/:id',
  [
    param('id').isUUID().withMessage('El ID de la billetera debe ser un UUID válido.'),
  ],
  FinanceController.deleteWallet
);

/**
 * POST /api/wallets/transfer
 * Body: { sourceWalletId, targetWalletId, amount, description? }
 *
 * ⚠️ Esta ruta debe definirse ANTES de /wallets/:id para evitar
 *    que Express interprete 'transfer' como un UUID param.
 */
router.post(
  '/wallets/transfer',
  [
    body('sourceWalletId')
      .notEmpty().withMessage('La billetera origen es requerida.')
      .isUUID().withMessage('sourceWalletId debe ser un UUID válido.'),
    body('targetWalletId')
      .notEmpty().withMessage('La billetera destino es requerida.')
      .isUUID().withMessage('targetWalletId debe ser un UUID válido.'),
    body('amount')
      .notEmpty().withMessage('El monto es requerido.')
      .isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor a 0.'),
    body('description')
      .optional()
      .isString().isLength({ max: 255 }),
  ],
  FinanceController.transfer
);

// ──────────────────────────────────────────────────────────────────────────────
// TRANSACCIONES
// ──────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/transactions
 * Query: ?walletId=<uuid> (opcional, para filtrar por billetera)
 */
router.get('/transactions', FinanceController.getTransactions);

/**
 * POST /api/transactions
 * Body: { walletId, type, amount, description?, category? }
 */
router.post(
  '/transactions',
  [
    body('walletId')
      .notEmpty().withMessage('La billetera es requerida.')
      .isUUID().withMessage('walletId debe ser un UUID válido.'),
    body('type')
      .notEmpty().withMessage('El tipo de transacción es requerido.')
      .isIn(['ingreso', 'gasto']).withMessage("El tipo debe ser 'ingreso' o 'gasto'. Use /wallets/transfer para transferencias."),
    body('amount')
      .notEmpty().withMessage('El monto es requerido.')
      .isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor a 0.'),
    body('description')
      .optional()
      .isString().isLength({ max: 255 }),
    body('category')
      .optional()
      .isString().isLength({ max: 100 }),
  ],
  FinanceController.createTransaction
);

module.exports = router;
