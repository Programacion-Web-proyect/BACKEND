/**
 * WalletModel.js — Modelo Sequelize para Billeteras
 * Capa: src/modules/finance/infrastructure/repositories/
 */

'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../../../../shared/infrastructure/database');

const WalletModel = sequelize.define('Wallet', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'UUID del usuario propietario de la billetera',
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: true, len: [2, 100] },
    comment: 'Nombre descriptivo de la billetera',
  },
  currency: {
    type: DataTypes.ENUM('PEN', 'USD'),
    allowNull: false,
    defaultValue: 'PEN',
    comment: 'Moneda de la billetera: PEN (Soles) o USD (Dólares)',
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: { min: 0 },
    comment: 'Saldo actual de la billetera',
  },
}, {
  tableName: 'wallets',
  timestamps: true,
});

module.exports = WalletModel;
