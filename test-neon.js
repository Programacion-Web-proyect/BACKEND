const { Sequelize } = require('sequelize');

async function testConnection(url, name, useServerless) {
  console.log(`\nTesting ${name}...`);
  try {
    let options = {
      dialect: 'postgres',
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false }
      },
      logging: false
    };

    if (useServerless) {
      const pg = require('@neondatabase/serverless');
      const ws = require('ws');
      pg.neonConfig.webSocketConstructor = ws;
      options.dialectModule = pg;
    }

    const sequelize = new Sequelize(url, options);
    await sequelize.authenticate();
    console.log(`✅ Success for ${name}`);
    await sequelize.close();
  } catch (err) {
    console.error(`❌ Failed for ${name}:`, err.message);
  }
}

async function run() {
  const url_pooled = "postgresql://neondb_owner:npg_fscXx20ZHiOz@ep-lively-butterfly-ajq89nmm-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require";
  const url_unpooled = "postgresql://neondb_owner:npg_fscXx20ZHiOz@ep-lively-butterfly-ajq89nmm.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require";

  await testConnection(url_pooled, "Standard PG (Pooled)", false);
  await testConnection(url_unpooled, "Standard PG (Unpooled)", false);
  await testConnection(url_pooled, "Serverless PG (Pooled)", true);
  await testConnection(url_unpooled, "Serverless PG (Unpooled)", true);
}

run();
