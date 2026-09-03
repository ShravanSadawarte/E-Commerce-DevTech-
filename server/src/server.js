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

    // Sync database schema — use alter:false to preserve dummy data in production/interview demo
    // Dummy data is pre-seeded via `npm run seed`; alter:false keeps it intact.
    try {
      await sequelize.sync({ alter: false });
    } catch (syncErr) {
      // Stale SQLite file (e.g. missing parentId column on first clone) — try alter:true once
      console.warn('[DB] Sync failed, attempting alter sync:', syncErr.message);
      if (process.env.DB_DIALECT !== 'mysql') {
        await sequelize.sync({ alter: true });
        console.log('[DB] Database migrated via alter sync');
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
