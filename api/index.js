const app = require('../server/src/app');
const { sequelize } = require('../server/src/config/database');

let isDbInitialized = false;

async function ensureDb() {
  if (!isDbInitialized) {
    // Use alter:true so Vercel's ephemeral /tmp SQLite auto-migrates when models change
    await sequelize.sync({ alter: true });
    isDbInitialized = true;
    console.log('[Vercel] Database synced');
  }
}

module.exports = async (req, res) => {
  await ensureDb();
  return app(req, res);
};
