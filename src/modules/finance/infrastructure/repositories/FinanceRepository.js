/**
 * FinanceRepository.js — Implementación Concreta del Repositorio Financiero
 * Capa: src/modules/finance/infrastructure/repositories/
 *
 * Implementa IFinanceRepository usando Sequelize.
 * Maneja el mapeo entre modelos de BD y entidades de dominio.
 */

'use strict';

const IFinanceRepository = require('../../domain/IFinanceRepository');
const Wallet = require('../../domain/Wallet');
const Transaction = require('../../domain/Transaction');
const WalletModel = require('./WalletModel');
const TransactionModel = require('./TransactionModel');

class FinanceRepository extends IFinanceRepository {
  // ──────────────────────────────────────────────────────
  // MAPPERS (BD → Dominio)
  // ──────────────────────────────────────────────────────

  _walletToDomain(record) {
    if (!record) return null;
    return new Wallet({
      id: record.id,
      userId: record.userId,
      name: record.name,
      currency: record.currency,
      balance: parseFloat(record.balance),
      createdAt: record.createdAt,
    });
  }

  _transactionToDomain(record) {
    if (!record) return null;
    return new Transaction({
      id: record.id,
      walletId: record.walletId,
      userId: record.userId,
      type: record.type,
      amount: parseFloat(record.amount),
      description: record.description,
      category: record.category,
      targetWalletId: record.targetWalletId,
      date: record.date,
    });
  }

  // ──────────────────────────────────────────────────────
  // BILLETERAS
  // ──────────────────────────────────────────────────────

  async findWalletById(walletId) {
    const record = await WalletModel.findByPk(walletId);
    return this._walletToDomain(record);
  }

  async findWalletsByUserId(userId) {
    const records = await WalletModel.findAll({
      where: { userId },
      order: [['createdAt', 'ASC']],
    });
    return records.map(r => this._walletToDomain(r));
  }

  async saveWallet(wallet) {
    const record = await WalletModel.create({
      userId: wallet.userId,
      name: wallet.name,
      currency: wallet.currency,
      balance: wallet.balance,
    });
    return this._walletToDomain(record);
  }

  async updateWallet(wallet) {
    await WalletModel.update(
      { balance: wallet.balance, name: wallet.name },
      { where: { id: wallet.id } }
    );
    const updated = await WalletModel.findByPk(wallet.id);
    return this._walletToDomain(updated);
  }

  async deleteWallet(walletId) {
    await WalletModel.destroy({ where: { id: walletId } });
  }

  // ──────────────────────────────────────────────────────
  // TRANSACCIONES
  // ──────────────────────────────────────────────────────

  async saveTransaction(transaction) {
    const record = await TransactionModel.create({
      walletId: transaction.walletId,
      userId: transaction.userId,
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      targetWalletId: transaction.targetWalletId,
      date: transaction.date,
    });
    return this._transactionToDomain(record);
  }

  async findTransactionsByWalletId(walletId) {
    const records = await TransactionModel.findAll({
      where: { walletId },
      order: [['date', 'DESC']],
    });
    return records.map(r => this._transactionToDomain(r));
  }

  async findTransactionsByUserId(userId) {
    const records = await TransactionModel.findAll({
      where: { userId },
      order: [['date', 'DESC']],
    });
    return records.map(r => this._transactionToDomain(r));
  }
}

module.exports = FinanceRepository;
