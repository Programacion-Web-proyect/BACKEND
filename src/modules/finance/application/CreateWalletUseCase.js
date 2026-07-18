/**
 * CreateWalletUseCase.js — Caso de Uso: Crear Billetera
 * Capa: src/modules/finance/application/
 *
 * Orquesta la creación de una nueva billetera para el usuario:
 *   1. Construye la entidad Wallet y valida reglas de dominio.
 *   2. Persiste la billetera.
 */

'use strict';

const Wallet = require('../domain/Wallet');

class CreateWalletUseCase {
  /**
   * @param {IFinanceRepository} financeRepository
   */
  constructor(financeRepository) {
    this.financeRepository = financeRepository;
  }

  /**
   * @param {Object} params
   * @param {string} params.userId   - UUID del usuario autenticado
   * @param {string} params.name     - Nombre de la billetera
   * @param {string} params.currency - 'PEN' | 'USD'
   * @param {number} [params.initialBalance] - Saldo inicial (default: 0)
   * @returns {Promise<Wallet>}
   */
  async execute({ userId, name, currency, initialBalance = 0 }) {
    const wallet = new Wallet({
      userId,
      name,
      currency: currency.toUpperCase(),
      balance: parseFloat(initialBalance) || 0,
    });

    // Validar reglas de dominio
    wallet.validate();

    // Persistir y retornar
    return await this.financeRepository.saveWallet(wallet);
  }
}

module.exports = CreateWalletUseCase;
