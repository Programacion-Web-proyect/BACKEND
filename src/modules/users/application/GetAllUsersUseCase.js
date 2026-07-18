/**
 * GetAllUsersUseCase.js — Caso de Uso: Listar Todos los Usuarios
 * Capa: src/modules/users/application/
 */

'use strict';

class GetAllUsersUseCase {
  /**
   * @param {Object} dependencies
   * @param {IUserRepository} dependencies.userRepository
   */
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  /**
   * Ejecuta el caso de uso
   * @returns {Promise<Object[]>} Lista de usuarios serializados
   */
  async execute() {
    const users = await this.userRepository.findAll();
    return users.map((user) => user.toPublicObject());
  }
}

module.exports = GetAllUsersUseCase;
