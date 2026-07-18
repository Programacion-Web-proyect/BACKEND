/**
 * userRoutes.js — Enrutador Express para el módulo de Usuarios
 * Capa: src/modules/users/interfaces/rest/
 *
 * Endpoints expuestos:
 *   POST /api/auth/register    → Registro de usuario
 *   POST /api/auth/login       → Inicio de sesión
 *   POST /api/users/onboarding → Cuestionario financiero (protegido)
 *   GET  /api/users/profile    → Perfil del usuario (protegido)
 */

'use strict';

const { Router } = require('express');
const { body } = require('express-validator');
const UserController = require('./UserController');
const authMiddleware = require('../../../../shared/infrastructure/authMiddleware');

const router = Router();

// ──────────────────────────────────────────────────────────────────────────────
// RUTAS PÚBLICAS (sin autenticación)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
router.post(
  '/auth/register',
  [
    body('name')
      .trim()
      .notEmpty().withMessage('El nombre es requerido.')
      .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres.'),
    body('email')
      .trim()
      .notEmpty().withMessage('El correo electrónico es requerido.')
      .isEmail().withMessage('Formato de correo electrónico inválido.')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('La contraseña es requerida.')
      .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
  ],
  UserController.register
);

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post(
  '/auth/login',
  [
    body('email')
      .trim()
      .notEmpty().withMessage('El correo electrónico es requerido.')
      .isEmail().withMessage('Formato de correo electrónico inválido.')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('La contraseña es requerida.'),
  ],
  UserController.login
);

/**
 * POST /api/auth/google
 * Body: { credential } — ID Token de Google OAuth 2.0
 */
router.post(
  '/auth/google',
  [
    body('credential')
      .notEmpty().withMessage('La credencial de Google es requerida.'),
  ],
  UserController.loginWithGoogle
);

// ──────────────────────────────────────────────────────────────────────────────
// RUTAS PROTEGIDAS (requieren JWT válido)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/users/onboarding
 * Body: { q1, q2, q3 } — Respuestas Likert (1-5)
 * Header: Authorization: Bearer <token>
 */
router.post(
  '/users/onboarding',
  authMiddleware,
  [
    body('q1')
      .notEmpty().withMessage('La respuesta Q1 es requerida.')
      .isInt({ min: 1, max: 5 }).withMessage('Q1 debe ser un entero entre 1 y 5.'),
    body('q2')
      .notEmpty().withMessage('La respuesta Q2 es requerida.')
      .isInt({ min: 1, max: 5 }).withMessage('Q2 debe ser un entero entre 1 y 5.'),
    body('q3')
      .notEmpty().withMessage('La respuesta Q3 es requerida.')
      .isInt({ min: 1, max: 5 }).withMessage('Q3 debe ser un entero entre 1 y 5.'),
  ],
  UserController.completeOnboarding
);

/**
 * GET /api/users/profile
 * Header: Authorization: Bearer <token>
 */
router.get('/users/profile', authMiddleware, UserController.getProfile);

/**
 * GET /api/auth/me — Alias de /users/profile para verificación de sesión.
 * Usado por el frontend al iniciar para validar el token JWT almacenado.
 * Header: Authorization: Bearer <token>
 */
router.get('/auth/me', authMiddleware, UserController.getProfile);

// ──────────────────────────────────────────────────────────────────────────────
// RUTAS DE ADMINISTRADOR (requieren JWT válido y rol 'admin')
// ──────────────────────────────────────────────────────────────────────────────

const adminMiddleware = require('../../../../shared/infrastructure/adminMiddleware');

/**
 * GET /api/users
 * Retorna la lista de todos los usuarios registrados.
 * Headers: Authorization: Bearer <token>
 */
router.get('/users', authMiddleware, adminMiddleware, UserController.getAllUsers);

/**
 * PUT /api/users/:id/role
 * Cambia el rol de un usuario.
 * Headers: Authorization: Bearer <token>
 * Body: { role: 'admin' | 'student' }
 */
router.put('/users/:id/role', authMiddleware, adminMiddleware, UserController.changeRole);

/**
 * DELETE /api/users/:id
 * Elimina un usuario por su ID.
 * Headers: Authorization: Bearer <token>
 */
router.delete('/users/:id', authMiddleware, adminMiddleware, UserController.deleteUser);

module.exports = router;
