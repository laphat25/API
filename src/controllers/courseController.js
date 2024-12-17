import Course from '../models/Course.js'
import { StatusCodes } from 'http-status-codes'
import { Op } from 'sequelize'

// Helper function to handle errors
const handleControllerError = (res, status, message, error) => {
  console.error(message, error)
  return res.status(status).json({ error: message })
}


// Create a course (Teachers only)
export const createCourse = async (req, res) => {
  const { title, description, start_date, end_date } = req.body
  const teacher_id = req.user.id

  if (!title || !description || !start_date || !end_date) {
    return handleControllerError(res, StatusCodes.BAD_REQUEST, 'Missing required fields')
  }

  try {
    const course = await Course.create({ title, description, start_date, end_date, teacher_id })
    res.status(StatusCodes.CREATED).json({ message: 'Course created successfully', course })
  } catch (error) {
    handleControllerError(res, StatusCodes.BAD_REQUEST, 'Failed to create course', error)
  }
}

// Get all courses with pagination, search, and sorting
export const getCourses = async (req, res) => {
  const { page = 1, limit = 10, search, sortField, sortOrder = 'ASC' } = req.query
  const offset = (page - 1) * limit
  const parsedLimit = parseInt(limit, 10)
  const parsedPage = parseInt(page, 10)

  if (isNaN(parsedLimit) || isNaN(parsedPage)) {
    return handleControllerError(res, StatusCodes.BAD_REQUEST, 'Invalid page or limit parameter')
  }
  if (parsedLimit <= 0 || parsedPage <= 0) {
    return handleControllerError(res, StatusCodes.BAD_REQUEST, 'Page and limit must be greater than 0')
  }

  const whereClause = search ? {
    [Op.or]: [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } }
    ]
  } : {}

  if (req.user.role === 'teacher') {
    whereClause.teacher_id = req.user.id
  }

  const orderClause = sortField ? [[sortField, sortOrder.toUpperCase()]] : []

  try {
    const { count, rows: courses } = await Course.findAndCountAll({
      where: whereClause,
      limit: parsedLimit,
      offset: offset,
      order: orderClause
    })

    const totalPages = Math.ceil(count / parsedLimit)

    res.status(StatusCodes.OK).json({
      courses,
      currentPage: parsedPage,
      totalPages: totalPages,
      totalCourses: count
    })
  } catch (error) {
    handleControllerError(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to fetch courses', error)
  }
}