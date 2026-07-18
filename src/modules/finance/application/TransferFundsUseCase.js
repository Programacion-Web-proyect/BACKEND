/**
 * TransferFundsUseCase.js — Caso de Uso: Transferir Fondos Entre Billeteras
 * Capa: src/modules/finance/application/
 *
 * Orquesta la transferencia de fondos entre dos billeteras:
 *   1. Valida que ambas billeteras existen y pertenecen al usuario.
 *   2. Si las billeteras tienen la misma moneda: transferencia 1:1.
 *   3. Si tienen monedas distintas (PEN↔USD): aplica tipo de cambio.
 *   4. Debita de la billetera origen (con validación de fondos).
 *   5. Acredita en la billetera destino (monto convertido si aplica).
 *   6. Registra dos transacciones (una por billetera).
 *   7. Actualiza ambas billeteras en la BD.
 *
 * Tipo de cambio: configurable vía variable de entorno EXCHANGE_RATE_SOL_TO_USD.
 */

'use strict';

const Transaction = require('../domain/Transaction');
const DomainError = require('../../../shared/domain/DomainError');
require('dotenv').config();

class TransferFundsUseCase {
  /**
   * @param {IFinanceRepository} financeRepository
   */
  constructor(financeRepository) {
    this.financeRepository = financeRepository;
  }

  /**
   * Convierte un monto entre monedas.
   *
   * @param {number} amount        - Monto en moneda origen
   * @param {string} fromCurrency  - 'PEN' | 'USD'
   * @param {string} toCurrency    - 'PEN' | 'USD'
   * @returns {number} Monto convertido
   */
  _convert(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;

    const rate = parseFloat(process.env.EXCHANGE_RATE_SOL_TO_USD || '0.27');

    if (fromCurrency === 'PEN' && toCurrency === 'USD') {
      // Soles → Dólares
      return parseFloat((amount * rate).toFixed(2));
    } else if (fromCurrency === 'USD' && toCurrency === 'PEN') {
      // Dólares → Soles
      return parseFloat((amount / rate).toFixed(2));
    }

    return amount;
  }

  /**
   * @param {Object} params
   * @param {string} params.userId          - UUID del usuario autenticado
   * @param {string} params.sourceWalletId  - UUID de billetera origen
   * @param {string} params.targetWalletId  - UUID de billetera destino
   * @param {number} params.amount          - Monto a transferir (en moneda origen)
   * @param {string} [params.description]   - Descripción de la transferencia
   * @returns {Promise<{sourceWallet, targetWallet, sourceTransaction, targetTransaction}>}
   */
  async execute({ userId, sourceWalletId, targetWalletId, amount, description = 'Transferencia' }) {
    // 1. Validar que origen y destino son distintos
    if (sourceWalletId === targetWalletId) {
      throw new DomainError(
        'La billetera origen y destino no pueden ser la misma.',
        'SAME_WALLET_TRANSFER'
      );
    }

    // 2. Obtener ambas billeteras
    const [sourceWallet, targetWallet] = await Promise.all([
      this.financeRepository.findWalletById(sourceWalletId),
      this.financeRepository.findWalletById(targetWalletId),
    ]);

    if (!sourceWallet) {
      throw new DomainError('Billetera origen no encontrada.', 'WALLET_NOT_FOUND');
    }
    if (!targetWallet) {
      throw new DomainError('Billetera destino no encontrada.', 'WALLET_NOT_FOUND');
    }

    // 3. Verificar que ambas pertenecen al usuario
    if (sourceWallet.userId !== userId || targetWallet.userId !== userId) {
      throw new DomainError(
        'No tienes permiso para operar en estas billeteras.',
        'WALLET_FORBIDDEN'
      );
    }

    const parsedAmount = parseFloat(amount);

    // 4. Calcular monto convertido si las monedas son distintas
    const convertedAmount = this._convert(
      parsedAmount,
      sourceWallet.currency,
      targetWallet.currency
    );

    // 5. Debitar de la billetera origen (lanza DomainError si fondos insuficientes)
    sourceWallet.debit(parsedAmount);

    // 6. Acreditar en la billetera destino (monto ya convertido)
    targetWallet.credit(convertedAmount);

    // 7. Actualizar ambas billeteras en la BD
    const [updatedSource, updatedTarget] = await Promise.all([
      this.financeRepository.updateWallet(sourceWallet),
      this.financeRepository.updateWallet(targetWallet),
    ]);

    // 8. Registrar transacciones para ambas billeteras
    const conversionNote = sourceWallet.currency !== targetWallet.currency
      ? ` (Conversión: ${parsedAmount} ${sourceWallet.currency} → ${convertedAmount} ${targetWallet.currency})`
      : '';

    const [sourceTx, targetTx] = await Promise.all([
      this.financeRepository.saveTransaction(new Transaction({
        walletId: sourceWalletId,
        userId,
        type: 'transferencia',
        amount: parsedAmount,
        description: `${description} — Enviado a billetera ${targetWallet.name}${conversionNote}`,
        category: 'transferencia',
        targetWalletId,
      })),
      this.financeRepository.saveTransaction(new Transaction({
        walletId: targetWalletId,
        userId,
        type: 'transferencia',
        amount: convertedAmount,
        description: `${description} — Recibido de billetera ${sourceWallet.name}${conversionNote}`,
        category: 'transferencia',
        targetWalletId: sourceWalletId,
      })),
    ]);

    return {
      sourceWallet: updatedSource,
      targetWallet: updatedTarget,
      sourceTransaction: sourceTx,
      targetTransaction: targetTx,
      exchangeRate: sourceWallet.currency !== targetWallet.currency
        ? { from: sourceWallet.currency, to: targetWallet.currency, rate: parseFloat(process.env.EXCHANGE_RATE_SOL_TO_USD || '0.27') }
        : null,
    };
  }
}

module.exports = TransferFundsUseCase;
