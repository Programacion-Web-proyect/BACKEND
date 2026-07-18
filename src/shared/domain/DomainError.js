/**
 * DomainError.js — Error de dominio personalizado
 * Capa: src/shared/domain/
 *
 * Permite que la capa de dominio lance errores semánticos sin depender
 * de Express ni códigos HTTP. El errorHandler los mapeará a respuestas HTTP.
 */

'use strict';

class DomainError extends Error {
  /**
   * @param {string} message   - Mensaje legible del error de negocio
   * @param {string} [code]    - Código de error opcional para clasificación
   */
  constructor(message, code = 'DOMAIN_ERROR') {
    super(message);
    this.name = 'DomainError';
    this.code = code;
  }
}

module.exports = DomainError;
