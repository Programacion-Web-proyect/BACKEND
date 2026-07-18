/**
 * User.js — Entidad de Dominio: Usuario
 * Capa: src/modules/users/domain/
 *
 * Reglas importantes de Clean Architecture:
 *   ✅ Esta clase NO importa Express, Sequelize, bcrypt ni ninguna librería externa.
 *   ✅ Contiene únicamente lógica de negocio pura (validaciones de formato).
 *   ✅ El hash de password se realiza en el Caso de Uso, que sí puede importar bcrypt.
 *
 * La entidad representa el concepto de Usuario en el dominio de negocio.
 */

'use strict';

const DomainError = require('../../../shared/domain/DomainError');

class User {
  /**
   * @param {Object} props
   * @param {string|null} props.id              - UUID del usuario (null si es nuevo)
   * @param {string}      props.name            - Nombre completo
   * @param {string}      props.email           - Correo electrónico
   * @param {string}      props.passwordHash    - Hash bcrypt del password
   * @param {string}      [props.financialProfile] - 'conservador'|'moderado'|'agresivo'
   * @param {boolean}     [props.onboardingCompleted] - Si completó el cuestionario
   * @param {Date}        [props.createdAt]
   */
  constructor({
    id = null,
    name,
    email,
    passwordHash,
    financialProfile = null,
    onboardingCompleted = false,
    role = 'student',
    createdAt = new Date(),
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.financialProfile = financialProfile;
    this.onboardingCompleted = onboardingCompleted;
    this.role = role;
    this.createdAt = createdAt;
  }

  /**
   * Valida el formato del correo electrónico usando una expresión regular simple.
   * No depende de ninguna librería externa.
   *
   * @throws {DomainError} Si el formato del email es inválido
   */
  validateEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      throw new DomainError(
        `El formato del correo electrónico '${this.email}' es inválido.`,
        'INVALID_EMAIL_FORMAT'
      );
    }
  }

  /**
   * Valida que el nombre del usuario no esté vacío y tenga longitud mínima.
   *
   * @throws {DomainError} Si el nombre es inválido
   */
  validateName() {
    if (!this.name || this.name.trim().length < 2) {
      throw new DomainError(
        'El nombre debe tener al menos 2 caracteres.',
        'INVALID_NAME'
      );
    }
  }

  /**
   * Valida todas las reglas de dominio del usuario.
   * Se llama antes de persistir la entidad.
   */
  validate() {
    this.validateEmail();
    this.validateName();
  }

  /**
   * Asigna el perfil financiero al usuario tras completar el onboarding.
   *
   * @param {string} profile - 'conservador' | 'moderado' | 'agresivo'
   * @throws {DomainError} Si el perfil es inválido
   */
  assignFinancialProfile(profile) {
    const validProfiles = ['conservador', 'moderado', 'agresivo'];
    if (!validProfiles.includes(profile)) {
      throw new DomainError(
        `Perfil financiero '${profile}' no es válido. Use: ${validProfiles.join(', ')}`,
        'INVALID_FINANCIAL_PROFILE'
      );
    }
    this.financialProfile = profile;
    this.onboardingCompleted = true;
  }

  /**
   * Promueve a este usuario a rol de administrador.
   */
  promoteToAdmin() {
    this.role = 'admin';
  }

  /**
   * Serializa la entidad para retorno seguro al cliente (sin passwordHash).
   *
   * @returns {Object} Representación pública del usuario
   */
  toPublicObject() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      financialProfile: this.financialProfile,
      onboardingCompleted: this.onboardingCompleted,
      role: this.role,
      createdAt: this.createdAt,
    };
  }
}

module.exports = User;
