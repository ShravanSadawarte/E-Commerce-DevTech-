const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { sequelize, testConnection } = require('./config/database');
const setupChatSocket = require('./sockets/chatSocket');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

setupChatSocket(io);

const startServer = async () => {
  try {
    await testConnection();

    // Sync database schema
    await sequelize.sync({ alter: false });
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
