/**
 * UserRepository.js — Implementación Concreta del Repositorio de Usuarios
 * Capa: src/modules/users/infrastructure/repositories/
 *
 * Implementa el contrato IUserRepository usando Sequelize.
 * Responsabilidad de mapeo:
 *   - Convierte registros de Sequelize (UserModel) → Entidades de dominio (User)
 *   - Convierte Entidades de dominio (User) → Datos para Sequelize
 *
 * Esta es la única clase que "ensambla" los dos mundos:
 * el mundo de la base de datos y el mundo del dominio.
 */

'use strict';

const IUserRepository = require('../../domain/IUserRepository');
const User = require('../../domain/User');
const UserModel = require('./UserModel');

class UserRepository extends IUserRepository {
  /**
   * Mapea un registro de Sequelize a una entidad de dominio User.
   * Es un método privado de conversión (hydration).
   *
   * @param {Object} record - Instancia de UserModel (Sequelize)
   * @returns {User} Entidad de dominio
   */
  _toDomain(record) {
    if (!record) return null;
    return new User({
      id: record.id,
      name: record.name,
      email: record.email,
      passwordHash: record.passwordHash,
      financialProfile: record.financialProfile,
      onboardingCompleted: record.onboardingCompleted,
      role: record.role,
      createdAt: record.createdAt,
    });
  }

  /**
   * Busca un usuario por su UUID.
   * @param {string} id
   * @returns {Promise<User|null>}
   */
  async findById(id) {
    const record = await UserModel.findByPk(id);
    return this._toDomain(record);
  }

  /**
   * Busca un usuario por su correo electrónico.
   * @param {string} email
   * @returns {Promise<User|null>}
   */
  async findByEmail(email) {
    const record = await UserModel.findOne({
      where: { email: email.toLowerCase().trim() },
    });
    return this._toDomain(record);
  }

  /**
   * Persiste un nuevo usuario en la base de datos.
   * @param {User} user
   * @returns {Promise<User>} Usuario persistido con ID y timestamps
   */
  async save(user) {
    const record = await UserModel.create({
      name: user.name.trim(),
      email: user.email.toLowerCase().trim(),
      passwordHash: user.passwordHash,
      financialProfile: user.financialProfile,
      onboardingCompleted: user.onboardingCompleted,
      role: user.role,
    });
    return this._toDomain(record);
  }

  /**
   * Actualiza los datos de un usuario existente.
   * @param {User} user - Entidad con datos actualizados
   * @returns {Promise<User>}
   */
  async update(user) {
    await UserModel.update(
      {
        name: user.name,
        financialProfile: user.financialProfile,
        onboardingCompleted: user.onboardingCompleted,
        role: user.role,
      },
      { where: { id: user.id } }
    );
    const updated = await UserModel.findByPk(user.id);
    return this._toDomain(updated);
  }

  /**
   * Devuelve todos los usuarios registrados.
   * @returns {Promise<User[]>}
   */
  async findAll() {
    const records = await UserModel.findAll({
      order: [['createdAt', 'DESC']],
    });
    return records.map((record) => this._toDomain(record));
  }
}

module.exports = UserRepository;
