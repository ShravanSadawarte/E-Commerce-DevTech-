const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductVariant = sequelize.define('ProductVariant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  colorHex: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  size: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  additionalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
}, {
  tableName: 'product_variants',
  timestamps: true,
  indexes: [
    { fields: ['productId'] },
  ],
});

module.exports = ProductVariant;
