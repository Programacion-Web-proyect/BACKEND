/**
 * UserModel.js — Modelo de Base de Datos Sequelize para Usuario
 * Capa: src/modules/users/infrastructure/repositories/
 *
 * Esta es la única capa que conoce Sequelize. Define el esquema
 * de la tabla 'users' en la base de datos.
 *
 * ⚠️ Este modelo NO es la entidad de dominio User.js.
 *    Es el DTO de persistencia que mapea al ORM.
 */

'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../../../../shared/infrastructure/database');

const UserModel = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
    comment: 'Identificador único del usuario (UUID v4)',
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100],
    },
    comment: 'Nombre completo del usuario',
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
    comment: 'Correo electrónico único del usuario',
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Hash bcrypt del password del usuario',
  },
  financialProfile: {
    type: DataTypes.ENUM('conservador', 'moderado', 'agresivo'),
    allowNull: true,
    defaultValue: null,
    comment: 'Perfil financiero asignado tras el onboarding',
  },
  role: {
    type: DataTypes.ENUM('student', 'admin'),
    allowNull: false,
    defaultValue: 'student',
    comment: 'Rol del usuario en el sistema',
  },
  onboardingCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Indica si el usuario completó el cuestionario de onboarding',
  },
}, {
  tableName: 'users',
  timestamps: true,       // createdAt, updatedAt automáticos
  underscored: false,     // Mantener camelCase en la BD
});

module.exports = UserModel;
