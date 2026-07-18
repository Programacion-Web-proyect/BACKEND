/**
 * RecordTransactionUseCase.js — Caso de Uso: Registrar Transacción
 * Capa: src/modules/finance/application/
 *
 * Orquesta el registro de un ingreso o gasto:
 *   1. Valida que la billetera existe y pertenece al usuario.
 *   2. Construye la entidad Transaction y la valida.
 *   3. Para 'gasto': usa Wallet.debit() que lanza DomainError si fondos insuficientes.
 *   4. Para 'ingreso': usa Wallet.credit().
 *   5. Actualiza el saldo de la billetera.
 *   6. Persiste la transacción.
 *
 * REGLA DE DOMINIO CRÍTICA:
 *   Un 'gasto' que supere el saldo disponible lanza DomainError("Fondos insuficientes").
 */

'use strict';

const Transaction = require('../domain/Transaction');
const DomainError = require('../../../shared/domain/DomainError');

class RecordTransactionUseCase {
  /**
   * @param {IFinanceRepository} financeRepository
   */
  constructor(financeRepository) {
    this.financeRepository = financeRepository;
  }

  /**
   * @param {Object} params
   * @param {string} params.userId      - UUID del usuario autenticado
   * @param {string} params.walletId    - UUID de la billetera
   * @param {string} params.type        - 'ingreso' | 'gasto'
   * @param {number} params.amount      - Monto positivo
   * @param {string} [params.description]
   * @param {string} [params.category]
   * @returns {Promise<{transaction: Transaction, wallet: Wallet}>}
   */
  async execute({ userId, walletId, type, amount, description, category }) {
    // 1. Verificar que la billetera existe y pertenece al usuario
    const wallet = await this.financeRepository.findWalletById(walletId);
    if (!wallet) {
      throw new DomainError('Billetera no encontrada.', 'WALLET_NOT_FOUND');
    }
    if (wallet.userId !== userId) {
      throw new DomainError(
        'No tienes permiso para operar en esta billetera.',
        'WALLET_FORBIDDEN'
      );
    }

    // 2. Solo se permite 'ingreso' o 'gasto' en este caso de uso
    if (type === 'transferencia') {
      throw new DomainError(
        "Use el endpoint /api/wallets/transfer para transferencias.",
        'USE_TRANSFER_ENDPOINT'
      );
    }

    // 3. Construir y validar la entidad Transaction
    const parsedAmount = parseFloat(amount);
    const transaction = new Transaction({
      walletId,
      userId,
      type,
      amount: parsedAmount,
      description,
      category,
    });
    transaction.validate();

    // 4. Aplicar operación en la entidad Wallet (contiene la regla de fondos insuficientes)
    if (type === 'gasto') {
      wallet.debit(parsedAmount); // 🔥 Lanza DomainError("Fondos insuficientes") si aplica
    } else if (type === 'ingreso') {
      wallet.credit(parsedAmount);
    }

    // 5. Persistir el nuevo saldo de la billetera
    const updatedWallet = await this.financeRepository.updateWallet(wallet);

    // 6. Persistir la transacción
    const savedTransaction = await this.financeRepository.saveTransaction(transaction);

    return {
      transaction: savedTransaction,
      wallet: updatedWallet,
    };
  }
}

module.exports = RecordTransactionUseCase;
