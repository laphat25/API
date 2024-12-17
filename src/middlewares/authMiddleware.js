import jwt from 'jsonwebtoken'
import { StatusCodes } from 'http-status-codes'

// Middleware xác thực Access Token
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'No token provided' })
  }

  try {
    // Xác minh token với SECRET_KEY
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    req.user = decoded // Đưa thông tin người dùng vào request để các controller có thể truy cập
    next() // Tiến tới middleware hoặc route tiếp theo
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Access token expired' })
    }
    return res.status(StatusCodes.FORBIDDEN).json({ error: 'Invalid token' })
  }
}

// Middleware kiểm tra quyền teacher
export const isTeacher = (req, res, next) => {
  // Kiểm tra nếu người dùng đã được xác thực trong middleware authenticate
  if (!req.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' })
  }

  // Kiểm tra quyền của người dùng
  if (req.user.role !== 'teacher') {
    return res.status(StatusCodes.FORBIDDEN).json({ error: 'You do not have permission to access this resource' })
  }

  next() // Người dùng có quyền teacher, tiếp tục tới middleware hoặc route tiếp theo
}