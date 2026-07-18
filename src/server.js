/**
 * server.js — Punto de entrada del servidor
 * Capa: src/
 *
 * Responsabilidades:
 *   1. Conectar con la base de datos (Sequelize).
 *   2. Sincronizar los modelos (crear tablas si no existen).
 *   3. Arrancar el servidor Express en el puerto configurado.
 *
 * Orden de importación de modelos: todos deben cargarse aquí antes de sync()
 * para que Sequelize los conozca y cree las tablas correspondientes.
 */

'use strict';

require('dotenv').config();
const app = require('./app');
const sequelize = require('./shared/infrastructure/database');

// ── Importar modelos para que Sequelize los registre antes de sync() ──────────
require('./modules/users/infrastructure/repositories/UserModel');
require('./modules/finance/infrastructure/repositories/WalletModel');
require('./modules/finance/infrastructure/repositories/TransactionModel');

const PORT = process.env.PORT || 3001;

/**
 * Inicializa la conexión a la base de datos y arranca el servidor.
 */
async function startServer() {
  try {
    // 1. Verificar conexión a la BD
    await sequelize.authenticate();
    console.log(' Conexión a la base de datos establecida correctamente.');

    // 2. Sincronizar modelos (alter: true actualiza columnas sin destruir datos)
    await sequelize.sync({ alter: true });
    console.log(' Modelos sincronizados con la base de datos.');

    // 3. Arrancar el servidor SOLO si no estamos en Vercel
    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`\n INVEST Backend corriendo en: http://localhost:${PORT}`);
        console.log(` Health check: http://localhost:${PORT}/api/health`);
        console.log(` Ambiente: ${process.env.NODE_ENV || 'development'}\n`);
      });
    }
  } catch (error) {
    console.error(' Error al iniciar el servidor:', error);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
}

startServer();

// IMPORTANTE: Exportar la app para que Vercel la pueda ejecutar como función serverless
module.exports = app;
