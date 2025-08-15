import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { useLocation } from 'react-router-dom'
import {Line} from 'rc-progress'
import Footer from '../../components/students/Footer'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyEnrollment = () => {
  const {enrolledCourses , calculateCourseDuration , navigate, 
    backendUrl, getToken , userData ,fetchUserEnrolledCourses,calculateNoOfLectures } = useContext(AppContext)
  const [progressArray, setProgressArray] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const location = useLocation()

  // Check if user came from payment success
  useEffect(() => {
    if (location.state?.fromPayment) {
      setShowSuccessMessage(true)
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccessMessage(false), 5000)
    }
  }, [location])

  // Fetch real progress data for enrolled courses
  const fetchProgressData = async () => {
    if (enrolledCourses.length === 0) {
      setLoading(false)
      return
    }

    try {
      const token = await getToken()
      const tempProgressArray = await Promise.all(enrolledCourses.map(async (course) => {
        try {
          const { data } = await axios.post(`${backendUrl}/api/user/course-progress`, {
            courseId: course._id
          }, {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          let totalLectures = calculateNoOfLectures(course)
          const lectureCompleted = data.success && data.progressData ? data.progressData.lectureCompleted.length : 0

          return { 
            totalLectures,
            lectureCompleted
          }
        } catch (error) {
          console.error('Error fetching progress for course:', course._id, error)
          return { 
            totalLectures: calculateNoOfLectures(course),
            lectureCompleted: 0
          }
        }
      }))
      
      setProgressArray(tempProgressArray)
    } catch (error) {
      console.error('Error fetching progress data:', error)
      toast.error('Error fetching progress data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userData && enrolledCourses.length > 0) {
      fetchProgressData()
    } else if (enrolledCourses.length === 0) {
      setLoading(false)
    }
  }, [userData, enrolledCourses])

  useEffect(() => {
    if (userData) {
      fetchUserEnrolledCourses()
    }
  }, [userData, fetchUserEnrolledCourses])

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='w-16 sm:w-20 aspect-square border-4
        border-gray-300 border-t-4 border-t-blue-400 rounded-full 
        animate-spin'></div>
      </div>
    )
  }

  if (enrolledCourses.length === 0) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600 text-xl mb-4'>No courses enrolled yet</p>
          <button 
            onClick={() => navigate('/Course-List')}
            className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            Browse Courses
          </button>
        </div>
      </div>
    )
  }

  return (

    <>
   <div className='md:px-36 px-8 pt-10'>
    <div className='flex justify-between items-center'>
      <h1 className='text-2xl font-semibold '>
        My Enrollments
      </h1>
      <button 
        onClick={fetchProgressData}
        className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2'
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>Refresh</span>
      </button>
    </div>
    
    {/* Success message for payment completion */}
    {showSuccessMessage && (
      <div className='mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg'>
        <div className='flex items-center space-x-2'>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className='font-medium'>Course enrolled successfully! You can now start learning.</span>
        </div>
      </div>
    )}
      
      <table className='md:table-auto table-fixed w-full overflow-hidden
      border mt-10'>
      <thead className='text-gray-900 border-b border-gray-500/20 text-sm
      text-left max-sm:hidden'>
        <tr>
          <th className='px-4 py-3 font-semibold truncate'>Courses</th>
          <th className='px-4 py-3 font-semibold truncate'>Duration</th>
          <th className='px-4 py-3 font-semibold truncate'>Completed</th>
          <th className='px-4 py-3 font-semibold truncate'>Status</th>

        </tr>
      </thead>

      <tbody className='text-gray-700'>
        {enrolledCourses.map((course ,index)=>(
          <tr key={index} className='border-b border-gray-500/20'>
             <td className='md:px-4 pl-2 md:pl-4 py-3 flex  items-center space-x-5

              '>
              <img src={course.courseThumbnail} alt="" className='w-14 sm:w-24 
              md:w-28' />
              <div className='flex-1'> 
                <p>{course.courseTitle}</p>
                <Line strokeWidth = {2} percent={
                progressArray[index] ? ( progressArray[index].lectureCompleted / progressArray[index].totalLectures ) * 100 : 0
                } className='bg-gray-300 rounded-full' ></Line>
              </div>
             </td>
             <td className='px-4 py-3 max-sm:hidden'>
                {calculateCourseDuration(course)}
             </td>
             <td className='px-4 py-3 max-sm:hidden'>
            {progressArray[index] ? `${progressArray[index].lectureCompleted} / ${progressArray[index].totalLectures} 
            ` : '0 / 0 '} <span>Lectures</span>
             </td>
             <td className='px-4 py-3 max-sm:text-right'>
              
              <button onClick={() => navigate('/player/' + course._id )} className='
              px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-600 *:max-sm:text-xs text-white
              '>
                {progressArray[index] && progressArray[index].lectureCompleted / progressArray[index].totalLectures === 1 ? 'Completed' : 'Ongoing'} </button>
             </td>
          </tr>

        ))}
      </tbody>
    </table>
   </div>
   <Footer/>
   </>
  )
}

export default MyEnrollment