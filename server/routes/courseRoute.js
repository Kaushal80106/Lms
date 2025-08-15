import express from 'express'
import { getAllCourses, getCourseById } from '../controllers/courseController.js'

const courseRouter = express.Router()

courseRouter.get('/', getAllCourses)
courseRouter.get('/:courseId', getCourseById)

export default courseRouter