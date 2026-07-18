'use strict';

const DomainError = require('../../../shared/domain/DomainError');

class MakeUserAdminUseCase {
  /**
   * @param {import('../domain/IUserRepository')} userRepository
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * @param {Object} params
   * @param {string} params.userId
   * @returns {Promise<Object>}
   */
  async execute({ userId }) {
    if (!userId) {
      throw new DomainError('El ID de usuario es requerido.', 'MISSING_USER_ID');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new DomainError('Usuario no encontrado.', 'USER_NOT_FOUND');
    }

    user.promoteToAdmin();
    const updatedUser = await this.userRepository.update(user);

    return updatedUser.toPublicObject();
  }
}

module.exports = MakeUserAdminUseCase;
