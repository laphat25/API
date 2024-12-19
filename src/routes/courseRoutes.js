import express from 'express'
import { createCourse, getCourses } from '../controllers/courseController.js'
import { courseValidation } from '../validations/courseValidation.js'
import validateInput from '../middlewares/validateInput.js'
import { authenticate, isTeacher } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Tạo khóa học mới (Chỉ giáo viên mới có quyền tạo khóa học)
router.post('/courses', authenticate, isTeacher, validateInput(courseValidation), createCourse)

// Lấy danh sách khóa học (Có thể không cần xác thực)
router.get('/courses', authenticate, getCourses)

export default router


