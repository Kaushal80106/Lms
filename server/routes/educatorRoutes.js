import express from 'express' 

import { addCourse, updateRoleToEducator, getEducatorCourses, educatorDashboardData, getEnrolledStudentsData, deleteCourse } from '../controllers/educatorController.js'
import upload from '../configs/multer.js'
import { protectEducator } from '../middlewares/authMiddleware.js'

const educatorRouter = express.Router()

educatorRouter.post('/update-role', updateRoleToEducator)
educatorRouter.post('/add-course', upload.single('image'), protectEducator, addCourse)
educatorRouter.get('/courses', protectEducator, getEducatorCourses)
educatorRouter.get('/dashboard', protectEducator, educatorDashboardData)
educatorRouter.get('/enrolled-students', protectEducator, getEnrolledStudentsData)

        // Course management routes
        educatorRouter.delete('/courses/:courseId', protectEducator, deleteCourse)

export default educatorRouter