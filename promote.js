const sequelize = require('./src/shared/infrastructure/database');
const UserModel = require('./src/modules/users/infrastructure/repositories/UserModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function promoteAdmin() {
  try {
    await sequelize.authenticate();
    const input = process.argv[2];
    let user;

    if (input) {
      if (input.includes('@')) {
        // Buscar por correo
        user = await UserModel.findOne({ where: { email: input } });
      } else {
        // Buscar por token decodificado
        const jwtSecret = process.env.JWT_SECRET || 'invest_super_secret_key_change_in_production';
        const decoded = jwt.verify(input, jwtSecret);
        user = await UserModel.findByPk(decoded.userId);
      }
    } else {
      // Fallback: si no se provee argumento, buscamos al último actualizado/logueado (o creado)
      user = await UserModel.findOne({ order: [['updatedAt', 'DESC']] });
    }

    if (user) {
      user.role = 'admin';
      await user.save();
      console.log(`Usuario ${user.email} promovido a admin con éxito.`);
    } else {
      console.log('Usuario no encontrado.');
    }
  } catch (error) {
    console.error('Error:', error.message || error);
  } finally {
    await sequelize.close();
  }
}

promoteAdmin();
