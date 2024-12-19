// src/routes/enrollmentRoutes.js
import express from 'express'
import { enrollCourse } from '../controllers/enrollmentController.js'
import { authenticate, isStudent } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Đăng ký khóa học (Chỉ sinh viên có thể đăng ký)
router.post('/enrollments', authenticate, isStudent, enrollCourse)


export default router