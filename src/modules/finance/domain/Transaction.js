/**
 * Transaction.js — Entidad de Dominio: Transacción
 * Capa: src/modules/finance/domain/
 *
 * Tipos de transacción:
 *   - 'ingreso'      → Suma al saldo de la billetera
 *   - 'gasto'        → Resta del saldo (valida fondos suficientes)
 *   - 'transferencia'→ Movimiento entre billeteras (maneja la capa de aplicación)
 *
 * Regla crítica: Un 'gasto' no puede superar el saldo disponible.
 * Esta validación se realiza en el Caso de Uso mediante Wallet.debit().
 *
 * ❌ Esta clase NO importa Sequelize, Express ni ninguna librería externa.
 */

'use strict';

const DomainError = require('../../../shared/domain/DomainError');

class Transaction {
  /**
   * @param {Object} props
   * @param {string|null} props.id           - UUID de la transacción
   * @param {string}      props.walletId     - UUID de la billetera origen
   * @param {string}      props.userId       - UUID del propietario
   * @param {string}      props.type         - 'ingreso' | 'gasto' | 'transferencia'
   * @param {number}      props.amount       - Monto positivo de la transacción
   * @param {string}      [props.description]- Descripción/concepto opcional
   * @param {string}      [props.category]   - Categoría (alimentación, transporte, etc.)
   * @param {string|null} [props.targetWalletId] - UUID de billetera destino (solo transferencias)
   * @param {Date}        [props.date]
   */
  constructor({
    id = null,
    walletId,
    userId,
    type,
    amount,
    description = '',
    category = 'sin categoría',
    targetWalletId = null,
    date = new Date(),
  }) {
    this.id = id;
    this.walletId = walletId;
    this.userId = userId;
    this.type = type;
    this.amount = amount;
    this.description = description;
    this.category = category;
    this.targetWalletId = targetWalletId;
    this.date = date;
  }

  /**
   * Valida las reglas de dominio de la transacción.
   * Llamar antes de persistir.
   *
   * @throws {DomainError}
   */
  validate() {
    const validTypes = ['ingreso', 'gasto', 'transferencia'];
    if (!validTypes.includes(this.type)) {
      throw new DomainError(
        `Tipo de transacción '${this.type}' inválido. Use: ${validTypes.join(', ')}.`,
        'INVALID_TRANSACTION_TYPE'
      );
    }

    if (!this.amount || this.amount <= 0) {
      throw new DomainError(
        'El monto de la transacción debe ser mayor a 0.',
        'INVALID_TRANSACTION_AMOUNT'
      );
    }

    if (this.type === 'transferencia' && !this.targetWalletId) {
      throw new DomainError(
        'Las transferencias requieren una billetera destino (targetWalletId).',
        'MISSING_TARGET_WALLET'
      );
    }

    if (this.type === 'transferencia' && this.walletId === this.targetWalletId) {
      throw new DomainError(
        'La billetera origen y destino no pueden ser la misma.',
        'SAME_WALLET_TRANSFER'
      );
    }
  }
}

module.exports = Transaction;
