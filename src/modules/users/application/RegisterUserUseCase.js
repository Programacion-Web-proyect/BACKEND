/**
 * RegisterUserUseCase.js — Caso de Uso: Registro de Usuario
 * Capa: src/modules/users/application/
 *
 * Orquesta el proceso completo de registro:
 *   1. Verifica que el email no esté registrado.
 *   2. Hashea el password usando bcrypt.
 *   3. Construye la entidad User y valida sus reglas de dominio.
 *   4. Persiste el usuario a través del repositorio.
 *   5. Genera y retorna un JWT.
 *
 * Depende de:
 *   - IUserRepository (interfaz, no implementación)
 *   - bcrypt (librería de infraestructura, aceptable en Application)
 *   - jsonwebtoken
 */

'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../domain/User');
const DomainError = require('../../../shared/domain/DomainError');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET || 'invest_super_secret_key_change_in_production';

class RegisterUserUseCase {
  /**
   * @param {IUserRepository} userRepository - Repositorio inyectado (inversión de dependencias)
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Ejecuta el caso de uso de registro.
   *
   * @param {Object} params
   * @param {string} params.name     - Nombre completo del usuario
   * @param {string} params.email    - Correo electrónico
   * @param {string} params.password - Contraseña en texto plano
   * @returns {Promise<{token: string, user: Object}>}
   * @throws {DomainError} Si el email ya está registrado
   */
  async execute({ name, email, password }) {
    // 1. Verificar unicidad del email
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new DomainError(
        'El correo electrónico ya está registrado.',
        'EMAIL_ALREADY_EXISTS'
      );
    }

    // 2. Validar fortaleza mínima del password
    if (!password || password.length < 6) {
      throw new DomainError(
        'La contraseña debe tener al menos 6 caracteres.',
        'WEAK_PASSWORD'
      );
    }

    // 3. Hashear el password con bcrypt (salt rounds = 12)
    const passwordHash = await bcrypt.hash(password, 12);

    // 4. Construir entidad de dominio y validar reglas
    const user = new User({ name, email, passwordHash });
    user.validate(); // Lanza DomainError si email/nombre inválido

    // 5. Persistir usuario
    const savedUser = await this.userRepository.save(user);

    // 6. Generar JWT
    const token = jwt.sign(
      { userId: savedUser.id },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
      token,
      user: savedUser.toPublicObject(),
    };
  }
}

module.exports = RegisterUserUseCase;
