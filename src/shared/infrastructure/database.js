/**
 * database.js — Conexión centralizada a Sequelize
 * Capa: src/shared/infrastructure/
 *
 * Responsabilidad: Crear y exportar la instancia única de Sequelize.
 * En producción (Vercel + Neon) usa el driver serverless con WebSockets.
 * En desarrollo local usa SQLite, sin servidor externo.
 */

'use strict';

const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
  // Producción en Vercel / Neon
  // Usamos el driver pg estándar pero con reglas estrictas de pooling
  // para evitar problemas de conexión (timeouts o cuelgues) en Vercel.
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: require('pg'),
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 2,        // Máximo 2 conexiones concurrentes por función
      min: 0,        // Mínimo 0 para que no queden zombies
      idle: 0,       // Cerrar conexión de inmediato si no se usa
      acquire: 30000 // 30 segundos para intentar conectar antes de fallar
    },
    logging: false,
  });
} else {
  // Desarrollo local con SQLite
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './invest_database.sqlite',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });
}

module.exports = sequelize;
