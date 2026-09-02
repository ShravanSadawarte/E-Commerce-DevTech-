const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  conversationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  senderType: {
    type: DataTypes.ENUM('CUSTOMER', 'ADMIN'),
    defaultValue: 'CUSTOMER',
  },
  senderName: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'messages',
  timestamps: true,
  indexes: [
    { fields: ['conversationId'] },
    { fields: ['senderId'] },
  ],
});

module.exports = Message;
