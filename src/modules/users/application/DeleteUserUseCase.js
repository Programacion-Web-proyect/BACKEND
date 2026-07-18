'use strict';

const DomainError = require('../../../shared/domain/DomainError');

class DeleteUserUseCase {
  /**
   * @param {import('../domain/IUserRepository')} userRepository
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * @param {Object} params
   * @param {string} params.userId
   * @returns {Promise<void>}
   */
  async execute({ userId }) {
    if (!userId) {
      throw new DomainError('El ID de usuario es requerido.', 'MISSING_USER_ID');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new DomainError('Usuario no encontrado.', 'USER_NOT_FOUND');
    }

    await this.userRepository.delete(userId);
  }
}

module.exports = DeleteUserUseCase;
