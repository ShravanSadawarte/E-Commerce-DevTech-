const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ContactMessage = sequelize.define('ContactMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('NEW', 'READ', 'REPLIED', 'ARCHIVED'),
    defaultValue: 'NEW',
  },
  replyNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'contact_messages',
  timestamps: true,
});

module.exports = ContactMessage;
