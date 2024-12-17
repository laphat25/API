/* eslint-disable no-console */
import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

const sequelize = new Sequelize(
  process.env.DB_NAME || 'API_DB',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    timezone: process.env.DB_TIMEZONE || '+07:00'
  }
);

// Kiểm tra kết nối
(async () => {
  try {
    await sequelize.authenticate()
    console.log('Database connected successfully!')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
    console.error(error.stack) // Log stack trace
    throw new Error('Failed to connect to the database: ' + error.message)
  }
})()

export default sequelize