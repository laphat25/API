import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { StatusCodes } from 'http-status-codes'
import User from '../models/User.js'
import Token from '../models/Token.js'
import ms from 'ms'
import { generateAccessToken, generateRefreshToken } from '../utils/jwtHelper.js'

// Hàm trợ giúp để xử lý lỗi
const handleControllerError = (res, status, message, error) => {
  console.error(message, error) // Ghi lại toàn bộ lỗi để gỡ lỗi
  return res.status(status).json({ error: message })
}

// Đăng ký người dùng mới
export const register = async (req, res) => {
  const { username, email, password, role = 'student' } = req.body

  try {
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return handleControllerError(res, StatusCodes.CONFLICT, 'Email đã được đăng ký')
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role
    })

    res.status(StatusCodes.CREATED).json({
      message: 'Người dùng đã đăng ký thành công',
      user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role }
    })
  } catch (error) {
    handleControllerError(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Đăng ký thất bại', error)
  }
}

// Đăng nhập người dùng
export const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ where: { email } })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return handleControllerError(res, StatusCodes.UNAUTHORIZED, 'Thông tin đăng nhập không hợp lệ')
    }

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    // Tạo refresh token trong DB. Có thể xảy ra race condition.
    await Token.create({ token: refreshToken, userId: user.id })

    // Thiết lập cookie với tên rõ hơn và `sameSite` nhất quán
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: ms('15m') // Access token hết hạn sau 15 phút
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: ms('7d') // Refresh token hết hạn sau 7 ngày
    })

    res.status(StatusCodes.OK).json({ message: 'Đăng nhập thành công' })
  } catch (error) {
    handleControllerError(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Đăng nhập thất bại', error)
  }
}

// Làm mới Access Token bằng Refresh Token
export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken

  if (!refreshToken) {
    return handleControllerError(res, StatusCodes.BAD_REQUEST, 'Yêu cầu refresh token')
  }

  try {
    // Xác minh refresh token
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    if (!payload.id || !payload.role) {
      return handleControllerError(res, StatusCodes.UNAUTHORIZED, 'Payload token không hợp lệ')
    }
    const storedToken = await Token.findOne({ where: { token: refreshToken } })

    if (!storedToken) {
      return handleControllerError(res, StatusCodes.UNAUTHORIZED, 'Refresh token không hợp lệ')
    }

    const newAccessToken = generateAccessToken({ id: payload.id, role: payload.role })

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: ms('15m')
    })

    res.status(StatusCodes.OK).json({ accessToken: newAccessToken })
  } catch (error) {
    // Nếu token không hợp lệ hoặc hết hạn, hãy xóa nó khỏi DB
    await Token.destroy({ where: { token: refreshToken } })
    return handleControllerError(res, StatusCodes.UNAUTHORIZED, 'Refresh token không hợp lệ hoặc đã hết hạn', error)
  }
}

// Đăng xuất người dùng
export const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken

  if (!refreshToken) {
    return handleControllerError(res, StatusCodes.BAD_REQUEST, 'Yêu cầu refresh token')
  }

  try {
    const deletedToken = await Token.destroy({ where: { token: refreshToken } })

    if (!deletedToken) {
      return handleControllerError(res, StatusCodes.NOT_FOUND, 'Không tìm thấy token')
    }
    // Xóa cookie khi đăng xuất
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    res.status(StatusCodes.OK).json({ message: 'Đăng xuất thành công' })
  } catch (error) {
    handleControllerError(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Đăng xuất thất bại', error)
  }
}