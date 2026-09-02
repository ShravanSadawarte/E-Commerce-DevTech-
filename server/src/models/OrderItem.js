const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  variantId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  productName: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  productImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  variantInfo: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: 'order_items',
  timestamps: true,
  indexes: [
    { fields: ['orderId'] },
    { fields: ['productId'] },
  ],
});

module.exports = OrderItem;
