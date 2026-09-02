const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  provider: {
    type: DataTypes.ENUM('RAZORPAY', 'COD', 'CARD', 'UPI', 'NETBANKING'),
    defaultValue: 'RAZORPAY',
  },
  providerOrderId: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  providerPaymentId: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'INR',
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Captured', 'Failed', 'Refunded'),
    defaultValue: 'Pending',
  },
  signature: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'payments',
  timestamps: true,
  indexes: [
    { fields: ['orderId'] },
    { fields: ['providerPaymentId'] },
  ],
});

module.exports = Payment;
