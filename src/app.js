/**
 * app.js — Inicialización de Express
 * Capa: src/
 *
 * Responsabilidades:
 *   1. Configurar middleware global (cors, json, urlencoded).
 *   2. Registrar todos los routers de la capa interfaces/rest/ de cada módulo.
 *   3. Registrar el errorHandler global como último middleware.
 *
 * No contiene lógica de negocio ni accede a la base de datos directamente.
 * La conexión a BD y el arranque del servidor están en server.js.
 */

'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// ── Routers de cada Bounded Context ──────────────────────────────────────────
const userRoutes = require('./modules/users/interfaces/rest/userRoutes');
const financeRoutes = require('./modules/finance/interfaces/rest/financeRoutes');

// ── Manejador global de errores ───────────────────────────────────────────────
const errorHandler = require('./shared/infrastructure/errorHandler');

const app = express();

// ── Middleware Global ─────────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true); // ¡Magia! Permite absolutamente cualquier URL (producción, pruebas, localhost)
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'INVEST API - Backend activo',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── Registro de Rutas por Bounded Context ────────────────────────────────────
// Módulo Users: /api/auth/*, /api/users/*
app.use('/api', userRoutes);

// Módulo Finance: /api/wallets/*, /api/transactions/*
app.use('/api', financeRoutes);

// ── Ruta no encontrada (404) ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      type: 'NotFoundError',
      message: `Ruta '${req.method} ${req.originalUrl}' no encontrada.`,
    },
  });
});

// ── Manejador Global de Errores ───────────────────────────────────────────────
// DEBE estar registrado DESPUÉS de todas las rutas
app.use(errorHandler);

module.exports = app;
