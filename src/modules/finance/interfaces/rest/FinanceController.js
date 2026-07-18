/**
 * FinanceController.js — Controlador REST para el módulo Financiero
 * Capa: src/modules/finance/interfaces/rest/
 *
 * Endpoints manejados:
 *   GET    /api/wallets              → Listar billeteras del usuario
 *   POST   /api/wallets              → Crear billetera
 *   DELETE /api/wallets/:id          → Eliminar billetera
 *   POST   /api/wallets/transfer     → Transferir fondos
 *   GET    /api/transactions         → Listar todas las transacciones
 *   POST   /api/transactions         → Registrar ingreso/gasto
 */

'use strict';

const { validationResult } = require('express-validator');
const CreateWalletUseCase = require('../../application/CreateWalletUseCase');
const DeleteWalletUseCase = require('../../application/DeleteWalletUseCase');
const RecordTransactionUseCase = require('../../application/RecordTransactionUseCase');
const TransferFundsUseCase = require('../../application/TransferFundsUseCase');
const FinanceRepository = require('../../infrastructure/repositories/FinanceRepository');

// Instancia compartida del repositorio
const financeRepository = new FinanceRepository();

class FinanceController {
  /**
   * GET /api/wallets
   * Retorna todas las billeteras del usuario autenticado.
   */
  static async getWallets(req, res, next) {
    try {
      const wallets = await financeRepository.findWalletsByUserId(req.userId);
      return res.status(200).json({
        success: true,
        data: { wallets },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/wallets
   * Crea una nueva billetera para el usuario autenticado.
   * Body: { name, currency, initialBalance? }
   */
  static async createWallet(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          success: false,
          error: { type: 'ValidationError', details: errors.array() },
        });
      }

      const { name, currency, initialBalance } = req.body;
      const useCase = new CreateWalletUseCase(financeRepository);
      const wallet = await useCase.execute({
        userId: req.userId,
        name,
        currency,
        initialBalance,
      });

      return res.status(201).json({
        success: true,
        message: 'Billetera creada exitosamente.',
        data: { wallet },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/wallets/:id
   * Elimina una billetera (falla si tiene saldo > 0).
   */
  static async deleteWallet(req, res, next) {
    try {
      const useCase = new DeleteWalletUseCase(financeRepository);
      await useCase.execute({
        walletId: req.params.id,
        userId: req.userId,
      });

      return res.status(200).json({
        success: true,
        message: 'Billetera eliminada exitosamente.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/wallets/transfer
   * Transfiere fondos entre dos billeteras del usuario.
   * Body: { sourceWalletId, targetWalletId, amount, description? }
   */
  static async transfer(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          success: false,
          error: { type: 'ValidationError', details: errors.array() },
        });
      }

      const { sourceWalletId, targetWalletId, amount, description } = req.body;
      const useCase = new TransferFundsUseCase(financeRepository);
      const result = await useCase.execute({
        userId: req.userId,
        sourceWalletId,
        targetWalletId,
        amount: parseFloat(amount),
        description,
      });

      return res.status(200).json({
        success: true,
        message: 'Transferencia realizada exitosamente.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/transactions
   * Lista todas las transacciones del usuario.
   * Query param opcional: ?walletId=<uuid> para filtrar por billetera
   */
  static async getTransactions(req, res, next) {
    try {
      let transactions;
      if (req.query.walletId) {
        transactions = await financeRepository.findTransactionsByWalletId(req.query.walletId);
      } else {
        transactions = await financeRepository.findTransactionsByUserId(req.userId);
      }

      return res.status(200).json({
        success: true,
        data: { transactions },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/transactions
   * Registra un ingreso o gasto en una billetera.
   * Body: { walletId, type, amount, description?, category? }
   */
  static async createTransaction(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          success: false,
          error: { type: 'ValidationError', details: errors.array() },
        });
      }

      const { walletId, type, amount, description, category } = req.body;
      const useCase = new RecordTransactionUseCase(financeRepository);
      const result = await useCase.execute({
        userId: req.userId,
        walletId,
        type,
        amount: parseFloat(amount),
        description,
        category,
      });

      return res.status(201).json({
        success: true,
        message: 'Transacción registrada exitosamente.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FinanceController;
