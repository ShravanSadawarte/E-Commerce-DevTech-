const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WishlistItem = sequelize.define('WishlistItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  wishlistId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'wishlist_items',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['wishlistId', 'productId'] },
  ],
});

module.exports = WishlistItem;
