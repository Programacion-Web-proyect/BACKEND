/**
 * Wallet.js — Entidad de Dominio: Billetera
 * Capa: src/modules/finance/domain/
 *
 * Reglas de dominio críticas (según especificación del Sprint 1):
 *   1. Una billetera no puede ser eliminada si su saldo es mayor a 0.
 *   2. El saldo nunca puede ser negativo.
 *
 * ❌ Esta clase NO importa Sequelize, Express ni ninguna librería externa.
 */

'use strict';

const DomainError = require('../../../shared/domain/DomainError');

class Wallet {
  /**
   * @param {Object} props
   * @param {string|null} props.id       - UUID de la billetera
   * @param {string}      props.userId   - UUID del propietario
   * @param {string}      props.name     - Nombre descriptivo (ej: "Ahorros UPC")
   * @param {string}      props.currency - 'PEN' (Soles) | 'USD' (Dólares)
   * @param {number}      props.balance  - Saldo actual (siempre >= 0)
   * @param {Date}        [props.createdAt]
   */
  constructor({ id = null, userId, name, currency, balance = 0, createdAt = new Date() }) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.currency = currency;
    this.balance = balance;
    this.createdAt = createdAt;
  }

  /**
   * Valida que la billetera tenga datos correctos al crearse.
   * @throws {DomainError}
   */
  validate() {
    if (!this.name || this.name.trim().length < 2) {
      throw new DomainError(
        'El nombre de la billetera debe tener al menos 2 caracteres.',
        'INVALID_WALLET_NAME'
      );
    }

    const validCurrencies = ['PEN', 'USD'];
    if (!validCurrencies.includes(this.currency)) {
      throw new DomainError(
        `La moneda '${this.currency}' no es válida. Use: PEN o USD.`,
        'INVALID_CURRENCY'
      );
    }

    if (this.balance < 0) {
      throw new DomainError(
        'El saldo inicial no puede ser negativo.',
        'NEGATIVE_BALANCE'
      );
    }
  }

  /**
   * Regla de dominio: Verifica que la billetera puede ser eliminada.
   * Una billetera con saldo mayor a 0 NO puede eliminarse.
   *
   * @throws {DomainError} Si el saldo es mayor a 0
   */
  validateCanBeDeleted() {
    if (this.balance > 0) {
      throw new DomainError(
        `No se puede eliminar la billetera '${this.name}' porque tiene un saldo de ${this.balance} ${this.currency}. Transfiere o retira el saldo antes de eliminarla.`,
        'WALLET_HAS_BALANCE'
      );
    }
  }

  /**
   * Acredita (suma) un monto al saldo de la billetera.
   * @param {number} amount - Monto a acreditar (debe ser positivo)
   * @throws {DomainError} Si el monto es inválido
   */
  credit(amount) {
    if (amount <= 0) {
      throw new DomainError(
        'El monto a acreditar debe ser mayor a 0.',
        'INVALID_AMOUNT'
      );
    }
    this.balance = parseFloat((this.balance + amount).toFixed(2));
  }

  /**
   * Debita (resta) un monto del saldo de la billetera.
   * Valida que haya fondos suficientes antes de operar.
   *
   * @param {number} amount - Monto a debitar (debe ser positivo)
   * @throws {DomainError} Si fondos insuficientes o monto inválido
   */
  debit(amount) {
    if (amount <= 0) {
      throw new DomainError(
        'El monto a debitar debe ser mayor a 0.',
        'INVALID_AMOUNT'
      );
    }
    if (amount > this.balance) {
      throw new DomainError(
        `Fondos insuficientes. Saldo disponible: ${this.balance} ${this.currency}, monto requerido: ${amount} ${this.currency}.`,
        'INSUFFICIENT_FUNDS'
      );
    }
    this.balance = parseFloat((this.balance - amount).toFixed(2));
  }
}

module.exports = Wallet;
