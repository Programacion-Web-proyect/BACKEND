/**
 * authMiddleware.js — Middleware global de autenticación JWT
 * Capa: src/shared/infrastructure/
 *
 * Responsabilidad:
 *   1. Leer el token Bearer del header Authorization.
 *   2. Verificarlo con JWT_SECRET.
 *   3. Inyectar el userId decodificado en req.userId para uso en controladores.
 *
 * Las rutas que no requieran autenticación simplemente no usan este middleware.
 */

'use strict';

const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET || 'invest_super_secret_key_change_in_production';

/**
 * Middleware que protege rutas verificando el token JWT.
 * Si el token es inválido o ausente, responde con 401 Unauthorized.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. Token no proporcionado.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Por favor, inicia sesión nuevamente.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token inválido.',
    });
  }
};

module.exports = authMiddleware;
