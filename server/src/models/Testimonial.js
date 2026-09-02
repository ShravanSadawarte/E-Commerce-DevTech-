const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Testimonial = sequelize.define('Testimonial', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING(100),
    defaultValue: 'Verified Customer',
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'testimonials',
  timestamps: true,
});

module.exports = Testimonial;
