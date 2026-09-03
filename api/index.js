const app = require('../server/src/app');
const { sequelize } = require('../server/src/config/database');

let isDbInitialized = false;

async function ensureDb() {
  if (!isDbInitialized) {
    // Use alter:false to preserve dummy data; ephemeral /tmp still works per cold start
    await sequelize.sync({ alter: false });
    isDbInitialized = true;
    console.log('[Vercel] Database synced');
  }
}

module.exports = async (req, res) => {
  await ensureDb();
  return app(req, res);
};
