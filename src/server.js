import express from 'express'
import dotenv from 'dotenv'
import sequelize from './config/database.js'
import authRoutes from './routes/authRoutes.js'
import courseRoutes from './routes/courseRoutes.js'
import cookieParser from 'cookie-parser'
dotenv.config()

const app = express()
app.use(express.json())
//// Middleware
app.use(cookieParser()) // Để xử lý cookies
app.use(express.json()) // Xử lý JSON body
app.use(express.urlencoded({ extended: true })) // Xử lý URL-encoded body

// Routes
app.use(authRoutes)
app.use(courseRoutes)

// Start Server
const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log('Database connected!')
    await sequelize.sync({ alter: true }) // Safe synchronization
    console.log('Database synchronized!')
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`)
    })
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}

startServer()
