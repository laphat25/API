/* eslint-disable no-console */
import JWT from 'jsonwebtoken'
import ms from 'ms'

// Kiểm tra biến môi trường
if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  throw new Error('Missing token secrets in environment variables')
}

// Tạo Access Token (hết hạn sau 15 phút)
export const generateAccessToken = (user) => {
  try {
    const payload = { id: user.id, role: user.role }
    return JWT.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '30m'
    })
  } catch (err) {
    console.error('Error generating access token:', err)
    throw new Error('Failed to generate access token: ' + err.message)
  }
}

// Tạo Refresh Token (hết hạn sau 7 ngày)
export const generateRefreshToken = (user) => {
  try {
    const payload = { id: user.id, role: user.role }
    return JWT.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '7d'
    })
  } catch (err) {
    console.error('Error generating refresh token:', err)
    throw new Error('Failed to generate refresh token: ' + err.message)
  }
}