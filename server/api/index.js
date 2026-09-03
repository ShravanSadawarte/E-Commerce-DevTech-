const app = require('../src/app');
const { sequelize } = require('../src/config/database');

let isDbInitialized = false;

async function ensureDb() {
  if (!isDbInitialized) {
    await sequelize.sync({ alter: false });
    isDbInitialized = true;
    console.log('[Vercel] Database synced');
  }
}

module.exports = async (req, res) => {
  await ensureDb();
  return app(req, res);
};
