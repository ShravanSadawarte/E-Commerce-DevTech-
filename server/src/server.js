const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { sequelize, testConnection } = require('./config/database');
const setupChatSocket = require('./sockets/chatSocket');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.io – restrict CORS to known origins
const allowedSocketOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);
const io = new Server(server, {
  cors: {
    origin: allowedSocketOrigins.length > 0 ? allowedSocketOrigins : true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupChatSocket(io);

const startServer = async () => {
  try {
    await testConnection();

    // Sync database schema — alter:true auto-migrates SQLite when models change (dev convenience)
    // In production with MySQL, use migrations; alter is safe for SQLite fallback.
    const syncOptions = process.env.NODE_ENV === 'production' && process.env.DB_DIALECT === 'mysql'
      ? { alter: false }
      : { alter: true };
    try {
      await sequelize.sync(syncOptions);
    } catch (syncErr) {
      // Stale SQLite file (e.g. missing parentId column) — recreate
      console.warn('[DB] Sync failed, attempting recovery:', syncErr.message);
      if (process.env.DB_DIALECT !== 'mysql') {
        await sequelize.sync({ force: true });
        console.log('[DB] Database recreated via force sync');
        // Re-seed would be needed externally — don't auto-seed here
      } else {
        throw syncErr;
      }
    }
    console.log('[DB] Sequelize models synchronized successfully.');

    server.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`🚀 DevTech E-Commerce Server is running!`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`==================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server };
