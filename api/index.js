const { sequelize, testConnection } = require('../server/src/config/database');
const seedDatabase = require('../server/src/seeders/seed');
const fs = require('fs');

// Track initialization state across warm invocations
let isInitialized = false;

const initializeDatabase = async () => {
  if (isInitialized) return;

  try {
    await testConnection();

    // On Vercel, check if the SQLite database needs to be seeded
    const isVercel = process.env.VERCEL === '1';
    if (isVercel) {
      const dbExists = fs.existsSync('/tmp/database.sqlite');
      if (!dbExists) {
        console.log('[Vercel] Cold start detected - seeding database...');
        await seedDatabase();
        console.log('[Vercel] Database seeded successfully.');
      } else {
        // DB file exists from a previous invocation in this container
        await sequelize.sync({ alter: false });
        console.log('[Vercel] Using existing database from warm container.');
      }
    } else {
      await sequelize.sync({ alter: false });
    }

    isInitialized = true;
    console.log('[DB] Initialization complete.');
  } catch (error) {
    console.error('[DB] Initialization failed:', error);
    throw error;
  }
};

// Initialize database before first request
const initPromise = initializeDatabase();

// Import the Express app (this registers all routes)
const app = require('../server/src/app');

// Wrap the Express app for Vercel
module.exports = async (req, res) => {
  // Wait for database to be ready
  await initPromise;
  // Delegate to Express
  return app(req, res);
};
