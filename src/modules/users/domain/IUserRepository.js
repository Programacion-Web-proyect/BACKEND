/**
 * IUserRepository.js — Interfaz / Contrato del Repositorio de Usuarios
 * Capa: src/modules/users/domain/
 *
 * Define el CONTRATO que cualquier implementación de repositorio debe cumplir.
 * La capa de Application depende de esta interfaz (no de la implementación),
 * aplicando el principio de Inversión de Dependencias (DIP) de SOLID.
 *
 * En JavaScript no existe 'interface' nativa, por lo que se usa una clase base
 * que lanza errores si los métodos no son sobreescritos.
 *
 * ❌ Esta clase NO importa Sequelize, Express ni ninguna librería externa.
 */

'use strict';

class IUserRepository {
  /**
   * Busca un usuario por su ID único.
   * @param {string} id
   * @returns {Promise<User|null>}
   */
  async findById(id) {
    throw new Error('IUserRepository.findById() must be implemented');
  }

  /**
   * Busca un usuario por su correo electrónico.
   * @param {string} email
   * @returns {Promise<User|null>}
   */
  async findByEmail(email) {
    throw new Error('IUserRepository.findByEmail() must be implemented');
  }

  /**
   * Persiste un nuevo usuario en el almacenamiento.
   * @param {User} user - Entidad de dominio a persistir
   * @returns {Promise<User>} Usuario persistido con ID asignado
   */
  async save(user) {
    throw new Error('IUserRepository.save() must be implemented');
  }

  /**
   * Actualiza los datos de un usuario existente.
   * @param {User} user - Entidad de dominio con datos actualizados
   * @returns {Promise<User>}
   */
  async update(user) {
    throw new Error('IUserRepository.update() must be implemented');
  }

  /**
   * Devuelve todos los usuarios.
   * @returns {Promise<User[]>}
   */
  async findAll() {
    throw new Error('IUserRepository.findAll() must be implemented');
  }

  /**
   * Elimina un usuario por su ID único.
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('IUserRepository.delete() must be implemented');
  }
}

module.exports = IUserRepository;
