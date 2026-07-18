const sequelize = require('./src/shared/infrastructure/database');
const User = require('./src/modules/users/infrastructure/repositories/UserModel');

async function makeAllAdmins() {
  try {
    await sequelize.authenticate();
    console.log('Conectado a la base de datos.');

    // Actualizar a todos los usuarios para que sean admin
    const [updatedRows] = await User.update(
      { role: 'admin' },
      { where: {} } // Aplica a todos
    );

    console.log(`¡Éxito! Se han actualizado ${updatedRows} usuarios al rol de 'admin'.`);
    process.exit(0);
  } catch (error) {
    console.error('Error actualizando usuarios:', error);
    process.exit(1);
  }
}

makeAllAdmins();
