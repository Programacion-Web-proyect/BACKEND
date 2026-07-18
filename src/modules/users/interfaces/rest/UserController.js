/**
 * UserController.js — Controlador REST para el módulo de Usuarios
 * Capa: src/modules/users/interfaces/rest/
 *
 * Responsabilidades:
 *   1. Recibir peticiones HTTP y extraer datos del body/params.
 *   2. Instanciar y ejecutar los Casos de Uso correspondientes.
 *   3. Retornar respuestas HTTP estructuradas.
 *
 * ⚠️ El controlador NO contiene lógica de negocio.
 *    Solo es el "traductor" entre HTTP y los Casos de Uso.
 *
 * Patrón de inyección: Los casos de uso reciben el repositorio
 * en el constructor, manteniendo la inversión de dependencias.
 */

'use strict';

const { validationResult } = require('express-validator');
const RegisterUserUseCase = require('../../application/RegisterUserUseCase');
const LoginUserUseCase = require('../../application/LoginUserUseCase');
const LoginWithGoogleUseCase = require('../../application/LoginWithGoogleUseCase');
const CompleteOnboardingUseCase = require('../../application/CompleteOnboardingUseCase');
const UserRepository = require('../../infrastructure/repositories/UserRepository');

// Instancia compartida del repositorio (podría usarse IoC container en proyectos grandes)
const userRepository = new UserRepository();

class UserController {
  /**
   * POST /api/auth/register
   * Registra un nuevo usuario y retorna JWT.
   */
  static async register(req, res, next) {
    try {
      // Validar errores de express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          success: false,
          error: { type: 'ValidationError', details: errors.array() },
        });
      }

      const { name, email, password } = req.body;
      const useCase = new RegisterUserUseCase(userRepository);
      const result = await useCase.execute({ name, email, password });

      return res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente.',
        data: result,
      });
    } catch (error) {
      next(error); // Pasa al errorHandler global
    }
  }

  /**
   * POST /api/auth/login
   * Autentica al usuario y retorna JWT.
   */
  static async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          success: false,
          error: { type: 'ValidationError', details: errors.array() },
        });
      }

      const { email, password } = req.body;
      const useCase = new LoginUserUseCase(userRepository);
      const result = await useCase.execute({ email, password });

      return res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/google
   * Autentica al usuario mediante Google OAuth 2.0.
   * Recibe el ID Token de Google y retorna JWT de la aplicación.
   */
  static async loginWithGoogle(req, res, next) {
    try {
      const { credential } = req.body;

      if (!credential) {
        return res.status(422).json({
          success: false,
          error: { type: 'ValidationError', message: 'La credencial de Google es requerida.' },
        });
      }

      const useCase = new LoginWithGoogleUseCase(userRepository);
      const result = await useCase.execute({ idToken: credential });

      return res.status(200).json({
        success: true,
        message: 'Inicio de sesión con Google exitoso.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/users/onboarding
   * Procesa el cuestionario Likert y asigna perfil financiero.
   * Requiere autenticación (authMiddleware inyecta req.userId).
   */
  static async completeOnboarding(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          success: false,
          error: { type: 'ValidationError', details: errors.array() },
        });
      }

      const { q1, q2, q3 } = req.body;
      const userId = req.userId; // Inyectado por authMiddleware

      const useCase = new CompleteOnboardingUseCase(userRepository);
      const result = await useCase.execute({
        userId,
        q1: parseInt(q1, 10),
        q2: parseInt(q2, 10),
        q3: parseInt(q3, 10),
      });

      return res.status(200).json({
        success: true,
        message: `Perfil financiero asignado: ${result.profile}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/profile
   * Retorna el perfil del usuario autenticado.
   */
  static async getProfile(req, res, next) {
    try {
      const user = await userRepository.findById(req.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado.',
        });
      }
      return res.status(200).json({
        success: true,
        data: { user: user.toPublicObject() },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users
   * Retorna todos los usuarios registrados (solo admin).
   */
  static async getAllUsers(req, res, next) {
    try {
      const GetAllUsersUseCase = require('../../application/GetAllUsersUseCase');
      const useCase = new GetAllUsersUseCase({ userRepository });
      const result = await useCase.execute();

      return res.status(200).json({
        success: true,
        data: { users: result },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/:id/role
   * Promueve un usuario a administrador (solo admin).
   */
  static async makeAdmin(req, res, next) {
    try {
      const MakeUserAdminUseCase = require('../../application/MakeUserAdminUseCase');
      const useCase = new MakeUserAdminUseCase(userRepository);
      const result = await useCase.execute({ userId: req.params.id });

      return res.status(200).json({
        success: true,
        message: 'Usuario promovido a administrador exitosamente.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/:id
   * Elimina un usuario (solo admin).
   */
  static async deleteUser(req, res, next) {
    try {
      const DeleteUserUseCase = require('../../application/DeleteUserUseCase');
      const useCase = new DeleteUserUseCase(userRepository);
      await useCase.execute({ userId: req.params.id });

      return res.status(200).json({
        success: true,
        message: 'Usuario eliminado exitosamente.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
