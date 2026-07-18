/**
 * LoginUserUseCase.js — Caso de Uso: Inicio de Sesión
 * Capa: src/modules/users/application/
 *
 * Orquesta el proceso de autenticación:
 *   1. Busca el usuario por email.
 *   2. Compara el password con el hash almacenado.
 *   3. Genera y retorna un JWT válido.
 *
 * Principio de Seguridad: No se distingue entre "usuario no existe"
 * y "contraseña incorrecta" para evitar enumeración de usuarios.
 */

'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const DomainError = require('../../../shared/domain/DomainError');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET || 'invest_super_secret_key_change_in_production';

class LoginUserUseCase {
  /**
   * @param {IUserRepository} userRepository
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Ejecuta el caso de uso de login.
   *
   * @param {Object} params
   * @param {string} params.email    - Correo electrónico
   * @param {string} params.password - Contraseña en texto plano
   * @returns {Promise<{token: string, user: Object}>}
   * @throws {DomainError} Si las credenciales son incorrectas
   */
  async execute({ email, password }) {
    // 1. Buscar usuario por email
    const user = await this.userRepository.findByEmail(email);

    // 2. Verificar credenciales (mensaje genérico por seguridad)
    if (!user) {
      // Realizamos un hash dummy para evitar timing attacks
      await bcrypt.compare(password, '$2b$12$invalidhashinvalidhashinvalidhash');
      throw new DomainError(
        'Credenciales incorrectas.',
        'INVALID_CREDENTIALS'
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new DomainError(
        'Credenciales incorrectas.',
        'INVALID_CREDENTIALS'
      );
    }

    // 3. Generar JWT
    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
      token,
      user: user.toPublicObject(),
    };
  }
}

module.exports = LoginUserUseCase;
