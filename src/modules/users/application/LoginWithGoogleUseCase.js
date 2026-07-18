/**
 * LoginWithGoogleUseCase.js — Caso de Uso: Inicio de Sesión / Registro con Google
 * Capa: src/modules/users/application/
 *
 * Orquesta el proceso de autenticación vía Google OAuth 2.0:
 *   1. Valida el ID Token de Google usando google-auth-library.
 *   2. Extrae email y name del payload del token.
 *   3. Busca el usuario por email en la base de datos:
 *      - Si existe: Inicia sesión y retorna JWT.
 *      - Si no existe: Registra un nuevo usuario con rol 'student',
 *        genera un password hash ficticio inaccesible, y retorna JWT.
 *
 * Principio de Seguridad: El password hash ficticio ($GOOGLE_OAUTH$...)
 * impide que el usuario pueda iniciar sesión manualmente sin Google,
 * ya que bcrypt.compare nunca coincidirá con este formato.
 */

'use strict';

const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../domain/User');
const DomainError = require('../../../shared/domain/DomainError');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET || 'invest_super_secret_key_change_in_production';
const googleClientId = process.env.GOOGLE_CLIENT_ID;

class LoginWithGoogleUseCase {
  /**
   * @param {IUserRepository} userRepository - Repositorio inyectado (inversión de dependencias)
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
    this.googleClient = new OAuth2Client(googleClientId);
  }

  /**
   * Ejecuta el caso de uso de login/registro con Google.
   *
   * @param {Object} params
   * @param {string} params.idToken - ID Token emitido por Google Sign-In
   * @returns {Promise<{token: string, user: Object}>}
   * @throws {DomainError} Si el token de Google es inválido o la configuración es incorrecta
   */
  async execute({ idToken }) {
    // 0. Verificar que GOOGLE_CLIENT_ID está configurado
    if (!googleClientId) {
      throw new DomainError(
        'La configuración de Google OAuth no está completa. Contacta al administrador.',
        'GOOGLE_CONFIG_ERROR'
      );
    }

    // 1. Validar el ID Token con Google
    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: googleClientId,
      });
      payload = ticket.getPayload();
    } catch (error) {
      throw new DomainError(
        'El token de Google es inválido o ha expirado.',
        'GOOGLE_AUTH_FAILED'
      );
    }

    // 2. Extraer datos del payload del token
    const email = payload.email;
    const name = payload.name || payload.given_name || 'Usuario Google';

    if (!email) {
      throw new DomainError(
        'No se pudo obtener el correo electrónico de la cuenta de Google.',
        'GOOGLE_AUTH_FAILED'
      );
    }

    // 3. Buscar usuario existente por email
    let user = await this.userRepository.findByEmail(email);

    if (!user) {
      // 4a. Registrar nuevo usuario con password hash ficticio
      // Este hash NO es un hash bcrypt válido, por lo que bcrypt.compare
      // siempre retornará false → el usuario no puede hacer login manual.
      const fictitiousHash = `$GOOGLE_OAUTH$${crypto.randomUUID()}`;

      user = new User({ name, email, passwordHash: fictitiousHash });
      user.validate(); // Valida reglas de dominio (email, nombre)
      user = await this.userRepository.save(user);
    }

    // 5. Generar JWT de la aplicación
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

module.exports = LoginWithGoogleUseCase;
