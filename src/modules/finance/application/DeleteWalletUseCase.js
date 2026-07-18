/**
 * DeleteWalletUseCase.js — Caso de Uso: Eliminar Billetera
 * Capa: src/modules/finance/application/
 *
 * Orquesta la eliminación de una billetera:
 *   1. Verifica que la billetera existe y pertenece al usuario.
 *   2. Invoca la regla de dominio: no se puede eliminar con saldo > 0.
 *   3. Elimina la billetera del repositorio.
 */

'use strict';

const DomainError = require('../../../shared/domain/DomainError');

class DeleteWalletUseCase {
  /**
   * @param {IFinanceRepository} financeRepository
   */
  constructor(financeRepository) {
    this.financeRepository = financeRepository;
  }

  /**
   * @param {Object} params
   * @param {string} params.walletId - UUID de la billetera a eliminar
   * @param {string} params.userId   - UUID del usuario autenticado (para autorización)
   * @returns {Promise<void>}
   * @throws {DomainError} Si la billetera tiene saldo > 0 o no pertenece al usuario
   */
  async execute({ walletId, userId }) {
    // 1. Obtener la billetera
    const wallet = await this.financeRepository.findWalletById(walletId);

    if (!wallet) {
      throw new DomainError('Billetera no encontrada.', 'WALLET_NOT_FOUND');
    }

    // 2. Verificar que pertenece al usuario autenticado
    if (wallet.userId !== userId) {
      throw new DomainError(
        'No tienes permiso para eliminar esta billetera.',
        'WALLET_FORBIDDEN'
      );
    }

    // 3. Validar regla de dominio: saldo debe ser 0
    wallet.validateCanBeDeleted(); // Lanza DomainError si balance > 0

    // 4. Eliminar
    await this.financeRepository.deleteWallet(walletId);
  }
}

module.exports = DeleteWalletUseCase;
