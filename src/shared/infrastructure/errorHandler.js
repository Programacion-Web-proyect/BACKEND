/**
 * errorHandler.js — Manejador global de errores
 * Capa: src/shared/infrastructure/
 *
 * Responsabilidad: Capturar todas las excepciones lanzadas por controladores
 * y casos de uso, y mapearlas a respuestas HTTP estructuradas.
 *
 * Mapeo de errores:
 *   - DomainError           → 400 Bad Request  (regla de negocio violada)
 *   - ValidationError       → 422 Unprocessable Entity
 *   - Error con status 404  → 404 Not Found
 *   - Resto                 → 500 Internal Server Error
 */

'use strict';

const DomainError = require('../../shared/domain/DomainError');

/**
 * Middleware de Express para manejo centralizado de errores.
 * Debe registrarse DESPUÉS de todos los routers en app.js.
 *
 * @param {Error}   err  - Error capturado
 * @param {Request} req  - Request de Express
 * @param {Response} res - Response de Express
 * @param {Function} next - Siguiente middleware (requerido por Express)
 */
const errorHandler = (err, req, res, next) => {
  // Log del error para trazabilidad en desarrollo
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[ERROR] ${err.name}: ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
      console.error(err.stack);
    }
  }

  // Error de dominio (regla de negocio violada) → 400 Bad Request
  if (err instanceof DomainError) {
    return res.status(400).json({
      success: false,
      error: {
        type: 'DomainError',
        code: err.code,
        message: err.message,
      },
    });
  }

  // Error de validación de express-validator (lanzado manualmente)
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      success: false,
      error: {
        type: 'ValidationError',
        message: err.message,
        details: err.details || [],
      },
    });
  }

  // Errores de Sequelize: violación de unicidad
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      error: {
        type: 'ConflictError',
        message: 'El recurso ya existe (conflicto de unicidad).',
      },
    });
  }

  // Errores explícitamente marcados con statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        type: err.name || 'Error',
        message: err.message,
      },
    });
  }

  // Error interno no controlado → 500
  return res.status(500).json({
    success: false,
    error: {
      type: 'InternalServerError',
      message: process.env.NODE_ENV === 'production'
        ? 'Error interno del servidor.'
        : err.message,
    },
  });
};

module.exports = errorHandler;
