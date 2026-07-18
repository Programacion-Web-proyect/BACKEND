/**
 * CompleteOnboardingUseCase.js — Caso de Uso: Completar Onboarding Financiero
 * Capa: src/modules/users/application/
 *
 * Procesa el cuestionario Likert de 3 preguntas y asigna el perfil financiero:
 *
 * Preguntas (escala 1-5):
 *   Q1: ¿Qué tan cómodo te sientes con la volatilidad de tus inversiones?
 *       (1=Nada cómodo, 5=Muy cómodo)
 *   Q2: ¿Cuánto tiempo planeas mantener tus inversiones?
 *       (1=Menos de 1 año, 5=Más de 5 años)
 *   Q3: ¿Qué porcentaje de tus ahorros estás dispuesto a invertir?
 *       (1=Menos del 10%, 5=Más del 50%)
 *
 * Cálculo del perfil (suma de las 3 respuestas):
 *   3-7  → conservador
 *   8-11 → moderado
 *   12-15 → agresivo
 */

'use strict';

const DomainError = require('../../../shared/domain/DomainError');

class CompleteOnboardingUseCase {
  /**
   * @param {IUserRepository} userRepository
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Ejecuta el caso de uso de onboarding.
   *
   * @param {Object} params
   * @param {string} params.userId  - ID del usuario autenticado
   * @param {number} params.q1      - Respuesta pregunta 1 (1-5)
   * @param {number} params.q2      - Respuesta pregunta 2 (1-5)
   * @param {number} params.q3      - Respuesta pregunta 3 (1-5)
   * @returns {Promise<{user: Object, profile: string}>}
   * @throws {DomainError}
   */
  async execute({ userId, q1, q2, q3 }) {
    // 1. Validar que las respuestas sean valores válidos (1-5)
    const answers = [q1, q2, q3];
    for (const answer of answers) {
      if (!Number.isInteger(answer) || answer < 1 || answer > 5) {
        throw new DomainError(
          'Cada respuesta del cuestionario debe ser un número entero entre 1 y 5.',
          'INVALID_LIKERT_ANSWER'
        );
      }
    }

    // 2. Buscar usuario existente
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new DomainError('Usuario no encontrado.', 'USER_NOT_FOUND');
    }

    // 3. Calcular perfil financiero según suma Likert
    const total = q1 + q2 + q3;
    let profile;

    if (total <= 7) {
      profile = 'conservador';
    } else if (total <= 11) {
      profile = 'moderado';
    } else {
      profile = 'agresivo';
    }

    // 4. Aplicar regla de dominio sobre la entidad User
    user.assignFinancialProfile(profile);

    // 5. Persistir el cambio
    const updatedUser = await this.userRepository.update(user);

    return {
      user: updatedUser.toPublicObject(),
      profile,
      score: total,
    };
  }
}

module.exports = CompleteOnboardingUseCase;
