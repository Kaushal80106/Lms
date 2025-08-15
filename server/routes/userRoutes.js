import express from 'express' 
import {getUserData, userEnrolledCourses, purchaseCourse, updateUserCourseProgress, getUserCourseProgress, addUserRating, completeUserProfile, getUserProfileStatus} from '../controllers/userController.js' 

const userRouter = express.Router() 

userRouter.get('/data', getUserData) 
userRouter.get('/enrolled-courses', userEnrolledCourses)
userRouter.post('/purchase', purchaseCourse)
userRouter.post('/update-course-progress', updateUserCourseProgress)
userRouter.post('/course-progress', getUserCourseProgress)
userRouter.post('/add-rating', addUserRating)

// Profile completion routes
userRouter.post('/complete-profile', completeUserProfile)
userRouter.get('/profile-status', getUserProfileStatus)

export default userRouter