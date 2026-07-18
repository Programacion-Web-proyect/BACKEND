/**
 * IFinanceRepository.js — Interfaz / Contrato del Repositorio Financiero
 * Capa: src/modules/finance/domain/
 *
 * Define el contrato de persistencia para Billeteras y Transacciones.
 * Los Casos de Uso dependen de esta interfaz, no de la implementación concreta.
 *
 * ❌ Esta clase NO importa Sequelize, Express ni ninguna librería externa.
 */

'use strict';

class IFinanceRepository {
  // ──────────────────────────────────────────────────────
  // BILLETERAS
  // ──────────────────────────────────────────────────────

  /**
   * Busca una billetera por su ID.
   * @param {string} walletId
   * @returns {Promise<Wallet|null>}
   */
  async findWalletById(walletId) {
    throw new Error('IFinanceRepository.findWalletById() must be implemented');
  }

  /**
   * Obtiene todas las billeteras de un usuario.
   * @param {string} userId
   * @returns {Promise<Wallet[]>}
   */
  async findWalletsByUserId(userId) {
    throw new Error('IFinanceRepository.findWalletsByUserId() must be implemented');
  }

  /**
   * Persiste una nueva billetera.
   * @param {Wallet} wallet
   * @returns {Promise<Wallet>}
   */
  async saveWallet(wallet) {
    throw new Error('IFinanceRepository.saveWallet() must be implemented');
  }

  /**
   * Actualiza el saldo u otros datos de una billetera.
   * @param {Wallet} wallet
   * @returns {Promise<Wallet>}
   */
  async updateWallet(wallet) {
    throw new Error('IFinanceRepository.updateWallet() must be implemented');
  }

  /**
   * Elimina una billetera por su ID.
   * @param {string} walletId
   * @returns {Promise<void>}
   */
  async deleteWallet(walletId) {
    throw new Error('IFinanceRepository.deleteWallet() must be implemented');
  }

  // ──────────────────────────────────────────────────────
  // TRANSACCIONES
  // ──────────────────────────────────────────────────────

  /**
   * Persiste una nueva transacción.
   * @param {Transaction} transaction
   * @returns {Promise<Transaction>}
   */
  async saveTransaction(transaction) {
    throw new Error('IFinanceRepository.saveTransaction() must be implemented');
  }

  /**
   * Obtiene todas las transacciones de una billetera.
   * @param {string} walletId
   * @returns {Promise<Transaction[]>}
   */
  async findTransactionsByWalletId(walletId) {
    throw new Error('IFinanceRepository.findTransactionsByWalletId() must be implemented');
  }

  /**
   * Obtiene todas las transacciones de un usuario.
   * @param {string} userId
   * @returns {Promise<Transaction[]>}
   */
  async findTransactionsByUserId(userId) {
    throw new Error('IFinanceRepository.findTransactionsByUserId() must be implemented');
  }
}

module.exports = IFinanceRepository;
