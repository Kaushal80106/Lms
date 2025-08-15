import Course from '../models/course.js'

// Get all courses
export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true })
        res.json({ success: true, courses })
    } catch (error) {
        console.error('❌ Error in getAllCourses:', error)
        res.status(500).json({ success: false, message: error.message })
    }
}

// Get course by ID
export const getCourseById = async (req, res) => {
    try {
        const { courseId } = req.params
        
        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: 'Course ID is required'
            })
        }

        const course = await Course.findById(courseId)
        
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            })
        }

        res.json({ success: true, course })
    } catch (error) {
        console.error('❌ Error in getCourseById:', error)
        res.status(500).json({ success: false, message: error.message })
    }
}

