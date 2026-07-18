/**
 * TransactionModel.js — Modelo Sequelize para Transacciones
 * Capa: src/modules/finance/infrastructure/repositories/
 */

'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../../../../shared/infrastructure/database');

const TransactionModel = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  walletId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'UUID de la billetera asociada a esta transacción',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'UUID del usuario propietario',
  },
  type: {
    type: DataTypes.ENUM('ingreso', 'gasto', 'transferencia'),
    allowNull: false,
    comment: 'Tipo de transacción',
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: { min: 0.01 },
    comment: 'Monto de la transacción (siempre positivo)',
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: '',
    comment: 'Descripción o concepto de la transacción',
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'sin categoría',
    comment: 'Categoría: alimentación, transporte, salud, etc.',
  },
  targetWalletId: {
    type: DataTypes.UUID,
    allowNull: true,
    defaultValue: null,
    comment: 'UUID de la billetera destino (solo para transferencias)',
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de la transacción',
  },
}, {
  tableName: 'transactions',
  timestamps: true,
});

module.exports = TransactionModel;
