import jwt from 'jsonwebtoken'
import { StatusCodes } from 'http-status-codes'
import User from '../models/User.js'

// Middleware xác thực Access Token
const authenticate = async (req, res, next) => {
  const token = req.cookies?.accessToken || req.headers?.authorization?.split(' ')[1]

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findByPk(decoded.id)
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' })
    }
    req.user = { id: user.id, role: user.role }
    next()
  } catch (error) {
    console.error('Error verifying token:', error)
    if (error.name === 'TokenExpiredError') {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Access token expired', detail: error.message })
    }
    return res.status(StatusCodes.FORBIDDEN).json({ error: 'Invalid token', detail: error.message })
  }
}

// Middleware kiểm tra quyền teacher
const isTeacher = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' })
  }

  if (req.user.role !== 'teacher') {
    return res.status(StatusCodes.FORBIDDEN).json({ error: 'You do not have permission to access this resource' })
  }
  next()
}


const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next()
  } else {
    return res.status(StatusCodes.FORBIDDEN).json({ error: 'Forbidden' })
  }
}


export { authenticate, isTeacher, isStudent }