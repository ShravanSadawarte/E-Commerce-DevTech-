const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const dialect = process.env.DB_DIALECT || 'sqlite';

let sequelize;

if (dialect === 'sqlite') {
  const defaultStorage = process.env.NODE_ENV === 'test'
    ? path.resolve(__dirname, '../../database.test.sqlite')
    : path.resolve(__dirname, '../../database.sqlite');
  const storagePath = process.env.DB_STORAGE || defaultStorage;
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false,
    define: {
      timestamps: true,
      underscored: false,
    },
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'devtech_ecommerce',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        timestamps: true,
        underscored: false,
      },
    }
  );
}

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`[DB] Successfully connected via ${dialect.toUpperCase()} (${dialect === 'sqlite' ? 'database.sqlite' : process.env.DB_NAME})`);
  } catch (error) {
    console.error(`[DB] Database connection error:`, error.message);
    if (dialect === 'mysql') {
      console.warn(`[DB] Falling back to SQLite for zero-downtime execution...`);
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.resolve(__dirname, '../../database.sqlite'),
        logging: false,
      });
      await sequelize.authenticate();
      console.log(`[DB] Successfully initialized fallback SQLite database.`);
    }
  }
};

module.exports = { sequelize, testConnection };
