'use strict';

const DomainError = require('../../../shared/domain/DomainError');

class ChangeUserRoleUseCase {
  /**
   * @param {import('../domain/IUserRepository')} userRepository
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * @param {Object} params
   * @param {string} params.userId
   * @param {string} params.role
   * @returns {Promise<Object>}
   */
  async execute({ userId, role }) {
    if (!userId) {
      throw new DomainError('El ID de usuario es requerido.', 'MISSING_USER_ID');
    }
    if (!role || !['admin', 'student'].includes(role)) {
      throw new DomainError('El rol especificado no es válido.', 'INVALID_ROLE');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new DomainError('Usuario no encontrado.', 'USER_NOT_FOUND');
    }

    user.assignRole(role);
    const updatedUser = await this.userRepository.update(user);

    return updatedUser.toPublicObject();
  }
}

module.exports = ChangeUserRoleUseCase;
