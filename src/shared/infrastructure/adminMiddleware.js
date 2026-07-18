/**
 * adminMiddleware.js — Middleware de Autorización de Administrador
 * Capa: src/shared/infrastructure/
 *
 * Se ejecuta DESPUÉS del authMiddleware (que adjunta req.user).
 * Verifica que el rol del usuario autenticado sea 'admin'.
 */

'use strict';

const DomainError = require('../domain/DomainError');
const UserModel = require('../../modules/users/infrastructure/repositories/UserModel');

async function adminMiddleware(req, res, next) {
  try {
    const userId = req.userId;

    if (!userId) {
      throw new DomainError('Usuario no autenticado en contexto de administrador.', 'UNAUTHORIZED', 401);
    }

    const user = await UserModel.findByPk(userId);

    if (!user || user.role !== 'admin') {
      throw new DomainError('Acceso denegado. Se requieren privilegios de administrador.', 'FORBIDDEN', 403);
    }

    // Opcional: inyectar el usuario en req por si las siguientes capas lo necesitan
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = adminMiddleware;
