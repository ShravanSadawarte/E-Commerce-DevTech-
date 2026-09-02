const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  addressId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  shippingAddressSnapshot: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  shippingFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'),
    defaultValue: 'Pending',
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.ENUM('Pending', 'Paid', 'Failed', 'Refunded'),
    defaultValue: 'Pending',
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    defaultValue: 'RAZORPAY',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'orders',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['orderNumber'] },
    { fields: ['userId'] },
    { fields: ['status'] },
    { fields: ['createdAt'] },
  ],
});

module.exports = Order;
