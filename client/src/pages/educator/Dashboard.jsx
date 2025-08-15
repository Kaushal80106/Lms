import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import Loading from '../../components/students/Loading'
import { toast } from 'react-toastify'
import axios from 'axios'

const Dashboard = () => {
  const { currency, backendUrl, getToken } = useContext(AppContext)
  const [dashboardData, setDashboardData] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDashBoardData = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      
      // Fetch dashboard data
      const dashboardResponse = await axios.get(`${backendUrl}/api/educator/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (dashboardResponse.data.success) {
        setDashboardData(dashboardResponse.data.dashboardData)
        console.log('Fetched dashboard data:', dashboardResponse.data.dashboardData)
      } else {
        toast.error(dashboardResponse.data.message || 'Failed to fetch dashboard data')
        setDashboardData({
          totalEarnings: 0,
          enrolledStudentsData: [],
          totalCourses: 0
        })
      }

      // Fetch courses for recent courses section
      const coursesResponse = await axios.get(`${backendUrl}/api/educator/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (coursesResponse.data.success) {
        setCourses(coursesResponse.data.courses)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to fetch dashboard data. Please try again.')
      setDashboardData({
        totalEarnings: 0,
        enrolledStudentsData: [],
        totalCourses: 0
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashBoardData()
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <div className='min-h-screen flex flex-col items-start justify-between gap-4 sm:gap-5 lg:gap-8 p-3 sm:p-4 lg:p-8 pt-4 sm:pt-6 lg:pt-8 pb-0'>
      <div className='space-y-4 sm:space-y-5 lg:space-y-6 w-full'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
          <h1 className='text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800'>Educator Dashboard</h1>
          <button 
            onClick={fetchDashBoardData}
            className='px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm sm:text-base w-full sm:w-auto'
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5'>
          <div className='flex items-center gap-3 shadow-card border border-blue-500 p-3 sm:p-4 w-full rounded-md'>
            <img src={assets.patients_icon} alt="patient_icon" className='w-8 h-8 sm:w-10 sm:h-10' />
            <div>
              <p className='text-lg sm:text-xl lg:text-2xl font-medium text-gray-600'>{dashboardData?.enrolledStudentsData?.length || 0}</p>
              <p className='text-sm sm:text-base text-gray-500'>Total Enrolment</p>
            </div>
          </div>

          <div className='flex items-center gap-3 shadow-card border border-blue-500 p-3 sm:p-4 w-full rounded-md'>
            <img src={assets.appointments_icon} alt="patient_icon" className='w-8 h-8 sm:w-10 sm:h-10' />
            <div>
              <p className='text-lg sm:text-xl lg:text-2xl font-medium text-gray-600'>{dashboardData?.totalCourses || 0}</p>
              <p className='text-sm sm:text-base text-gray-500'>Total Courses</p>
            </div>
          </div>

          <div className='flex items-center gap-3 shadow-card border border-blue-500 p-3 sm:p-4 w-full rounded-md sm:col-span-2 lg:col-span-1'>
            <img src={assets.earning_icon} alt="earning_icon" className='w-8 h-8 sm:w-10 sm:h-10' />
            <div>
              <p className='text-lg sm:text-xl lg:text-2xl font-medium text-gray-600'>{currency}{dashboardData?.totalEarnings || 0}</p>
              <p className='text-sm sm:text-base text-gray-500'>Total Earnings</p>
            </div>
          </div>
        </div>

        {/* Recent Enrollments */}
        {dashboardData?.enrolledStudentsData && dashboardData.enrolledStudentsData.length > 0 && (
          <div className='bg-white rounded-lg border border-gray-200 p-4 sm:p-6'>
            <h3 className='text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4'>Recent Enrollments</h3>
            <div className='space-y-2 sm:space-y-3'>
              {dashboardData.enrolledStudentsData.slice(0, 5).map((enrollment, index) => (
                <div key={index} className='flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg gap-2'>
                  <div className='flex items-center space-x-2 sm:space-x-3'>
                    <img 
                      src={enrollment.student?.imageUrl || 'https://via.placeholder.com/32x32?text=U'} 
                      alt="Student" 
                      className='w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover'
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/32x32?text=U'
                      }}
                    />
                    <div>
                      <p className='font-medium text-gray-800 text-sm sm:text-base'>{enrollment.student?.name || 'Unknown Student'}</p>
                      <p className='text-xs sm:text-sm text-gray-500'>{enrollment.courseTitle}</p>
                    </div>
                  </div>
                  <span className='text-xs sm:text-sm text-gray-500'>
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className='bg-white rounded-lg border border-gray-200 p-4 sm:p-6'>
          <h3 className='text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4'>Quick Actions</h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
            <button 
              onClick={() => window.location.href = '/educator/add-course'}
              className='px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base'
            >
              Create New Course
            </button>
            <button 
              onClick={() => window.location.href = '/educator/my-courses'}
              className='px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base'
            >
              View My Courses
            </button>
            <button 
              onClick={() => window.location.href = '/educator/student-enrolled'}
              className='px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base sm:col-span-2 lg:col-span-1'
            >
              View Enrolled Students
            </button>
          </div>
        </div>

        {/* Recent Courses with Quick Actions */}
        {dashboardData?.totalCourses > 0 && (
          <div className='bg-white rounded-lg border border-gray-200 p-4 sm:p-6'>
            <h3 className='text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4'>Recent Courses</h3>
            <div className='space-y-2 sm:space-y-3'>
              {courses?.slice(0, 3).map((course) => (
                <div key={course._id} className='flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg gap-3'>
                  <div className='flex items-center space-x-2 sm:space-x-3'>
                    <img 
                      src={course.courseThumbnail || 'https://via.placeholder.com/32x32?text=C'} 
                      alt="Course" 
                      className='w-8 h-8 sm:w-10 sm:h-10 rounded object-cover'
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/32x32?text=C'
                      }}
                    />
                    <div>
                      <p className='font-medium text-gray-800 text-sm sm:text-base'>{course.courseTitle}</p>
                      <p className='text-xs sm:text-sm text-gray-500'>{course.enrolledStudents.length} students enrolled</p>
                    </div>
                  </div>
                                             <div className='flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto'>
                             <button 
                               onClick={() => {
                                 if (window.confirm(`Are you sure you want to delete "${course.courseTitle}"? This action cannot be undone.`)) {
                                   // Quick delete from dashboard
                                   window.location.href = `/educator/my-courses?delete=${course._id}`
                                 }
                               }}
                               className='px-2 sm:px-3 py-1 sm:py-2 bg-red-600 text-white text-xs sm:text-sm rounded hover:bg-red-700 transition-colors w-full sm:w-auto'
                             >
                               Delete
                             </button>
                           </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard