// src/controllers/enrollmentController.js
import Enrollment from '../models/Enrollment.js'
import { StatusCodes } from 'http-status-codes'
import { Op } from 'sequelize'

// Helper function to handle errors
const handleControllerError = (res, status, message, error) => {
  console.error(message, error)
  return res.status(status).json({ error: message })
}

// Đăng ký khóa học cho học viên (Chỉ học viên mới có quyền đăng ký)
export const enrollCourse = async (req, res) => {
  const { student_id, course_id } = req.body

  if (!student_id || !course_id) {
    return handleControllerError(res, StatusCodes.BAD_REQUEST, 'Missing required fields')
  }

  try {
    const enrollment = await Enrollment.create({ student_id, course_id })
    res.status(StatusCodes.CREATED).json({ message: 'Enrollment created successfully', enrollment })
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return handleControllerError(res, StatusCodes.CONFLICT, 'This student is already enrolled in this course', error)
    }
    handleControllerError(res, StatusCodes.BAD_REQUEST, 'Failed to create enrollment', error)
  }
}