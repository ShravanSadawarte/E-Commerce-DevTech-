const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userName: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('OPEN', 'RESOLVED', 'CLOSED'),
    defaultValue: 'OPEN',
  },
  lastMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'conversations',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
  ],
});

module.exports = Conversation;
