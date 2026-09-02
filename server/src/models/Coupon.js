const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.ENUM('PERCENT', 'FIXED'),
    defaultValue: 'PERCENT',
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  minimumOrder: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  maximumDiscount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },
  usedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'coupons',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['code'] },
  ],
});

module.exports = Coupon;
