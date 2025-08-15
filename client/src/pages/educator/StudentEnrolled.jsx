import React, { useEffect, useState, useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/students/Loading'
import { toast } from 'react-toastify'
import axios from 'axios'

const StudentEnrolled = () => {
  const { backendUrl, getToken, currency } = useContext(AppContext)
  const [enrolledStudents, setEnrolledStudents] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchEnrolledStudents = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      
      const { data } = await axios.get(`${backendUrl}/api/educator/enrolled-students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (data.success) {
        setEnrolledStudents(data.enrolledStudents)
        setSummary(data.summary)
        console.log('Fetched enrolled students:', data.enrolledStudents)
        console.log('Summary:', data.summary)
      } else {
        toast.error(data.message || 'Failed to fetch enrolled students')
        setEnrolledStudents([])
        setSummary(null)
      }
    } catch (error) {
      console.error('Error fetching enrolled students:', error)
      toast.error('Failed to fetch enrolled students. Please try again.')
      setEnrolledStudents([])
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnrolledStudents()
  }, [])

  if (loading) {
    return <Loading />
  }

  if (!enrolledStudents || enrolledStudents.length === 0) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center md:p-8 md:pb-0 p-4 pt-8 pb-0'>
        <div className='text-center'>
          <h2 className='text-2xl font-medium text-gray-600 mb-4'>No Enrolled Students Yet</h2>
          <p className='text-gray-500 mb-6'>You don't have any students enrolled in your courses yet.</p>
          <button 
            onClick={() => window.location.href = '/educator/add-course'}
            className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            Create Your First Course
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex flex-col items-start justify-between p-3 sm:p-4 lg:p-8 pt-4 sm:pt-6 lg:pt-8 pb-0'>
      <div className='w-full'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 gap-3'>
          <h2 className='text-base sm:text-lg lg:text-xl font-medium'>Enrolled Students</h2>
          <button 
            onClick={fetchEnrolledStudents}
            className='px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm sm:text-base w-full sm:w-auto'
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {/* Summary Statistics */}
        {summary && (
          <div className='mb-4 sm:mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4'>
            <div className='bg-white p-3 sm:p-4 rounded-lg border border-gray-200'>
              <h3 className='text-xs sm:text-sm font-medium text-gray-600'>Total Students</h3>
              <p className='text-lg sm:text-xl lg:text-2xl font-bold text-blue-600'>{summary.totalStudents}</p>
            </div>
            <div className='bg-white p-3 sm:p-4 rounded-lg border border-gray-200'>
              <h3 className='text-xs sm:text-sm font-medium text-gray-600'>Total Courses</h3>
              <p className='text-lg sm:text-xl lg:text-2xl font-bold text-green-600'>{summary.totalCourses}</p>
            </div>
            <div className='bg-white p-3 sm:p-4 rounded-lg border border-gray-200'>
              <h3 className='text-xs sm:text-sm font-medium text-gray-600'>Total Purchases</h3>
              <p className='text-lg sm:text-xl lg:text-2xl font-bold text-purple-600'>{summary.totalPurchases}</p>
            </div>
            <div className='bg-white p-3 sm:p-4 rounded-lg border border-gray-200'>
              <h3 className='text-xs sm:text-sm font-medium text-gray-600'>Total Revenue</h3>
              <p className='text-lg sm:text-xl lg:text-2xl font-bold text-indigo-600'>{currency}{summary.totalRevenue}</p>
            </div>
          </div>
        )}

        {/* Mobile Card View */}
        <div className='w-full sm:hidden space-y-3'>
          {enrolledStudents.map((studentData) => (
            <div key={studentData.id} className='bg-white border border-gray-200 rounded-lg p-3 space-y-3'>
              <div className='flex items-center space-x-3'>
                <img 
                  src={studentData.student?.imageUrl || 'https://via.placeholder.com/36x36?text=U'} 
                  alt="Student" 
                  className='w-9 h-9 rounded-full object-cover'
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/36x36?text=U'
                  }}
                />
                <div className='flex-1 min-w-0'>
                  <p className='font-medium text-gray-800 text-sm'>{studentData.student?.name || 'Unknown Student'}</p>
                  <p className='text-xs text-gray-500'>{studentData.student?.email || 'No email'}</p>
                </div>
              </div>
              
              <div className='space-y-2'>
                <div className='text-xs text-gray-500'>Courses Enrolled:</div>
                {studentData.courses.map((course, index) => (
                  <div key={index} className='flex items-center space-x-2 bg-gray-50 p-2 rounded'>
                    <img 
                      src={course.courseThumbnail || 'https://via.placeholder.com/24x24?text=C'} 
                      alt="Course" 
                      className='w-6 h-6 rounded object-cover'
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/24x24?text=C'
                      }}
                    />
                    <span className='text-xs'>{course.courseTitle}</span>
                  </div>
                ))}
              </div>
              
              <div className='grid grid-cols-2 gap-2 text-xs'>
                <div>
                  <span className='text-gray-500'>Total Spent:</span>
                  <p className='font-medium text-green-600'>{currency}{studentData.totalSpent}</p>
                </div>
                <div>
                  <span className='text-gray-500'>Courses:</span>
                  <p className='font-medium'>{studentData.totalCourses}</p>
                </div>
              </div>
              
              <div className='flex items-center justify-center'>
                <span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs'>
                  Enrolled
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className='hidden sm:block w-full'>
          <div className='flex flex-col items-center max-w-6xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20'>
            <table className='table-fixed md:table-auto w-full overflow-hidden pb-4'>
              <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left'>
                <tr>
                  <th className='px-3 sm:px-4 py-3 font-semibold text-center hidden sm:table-cell'>
                    #
                  </th>
                  <th className='px-3 sm:px-4 py-3 font-semibold'>Student</th>
                  <th className='px-3 sm:px-4 py-3 font-semibold'>Courses Enrolled</th>
                  <th className='px-3 sm:px-4 py-3 font-semibold hidden lg:table-cell'>Total Spent</th>
                  <th className='px-3 sm:px-4 py-3 font-semibold hidden lg:table-cell'>First Enrollment</th>
                  <th className='px-3 sm:px-4 py-3 font-semibold hidden lg:table-cell'>Last Enrollment</th>
                  <th className='px-3 sm:px-4 py-3 font-semibold'>Status</th>
                </tr>
              </thead>
              <tbody className='text-sm text-gray-500'>
                {enrolledStudents.map((studentData) => (
                  <tr key={studentData.id} className='border-b border-gray-500/20 hover:bg-gray-50'>
                    <td className='px-3 sm:px-4 py-3 text-center hidden sm:table-cell'>{studentData.id}</td>
                    <td className='px-3 sm:px-4 py-3 flex items-center space-x-3'>
                      <img 
                        src={studentData.student?.imageUrl || 'https://via.placeholder.com/36x36?text=U'} 
                        alt="Student" 
                        className='w-9 h-9 rounded-full object-cover'
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/36x36?text=U'
                        }}
                      />
                      <div className='flex flex-col'>
                        <span className='font-medium text-gray-800'>{studentData.student?.name || 'Unknown Student'}</span>
                        <span className='text-xs text-gray-500'>{studentData.student?.email || 'No email'}</span>
                      </div>
                    </td>
                    <td className='px-3 sm:px-4 py-3'>
                      <div className='space-y-1'>
                        {studentData.courses.map((course, index) => (
                          <div key={index} className='flex items-center space-x-2'>
                            <img 
                              src={course.courseThumbnail || 'https://via.placeholder.com/24x24?text=C'} 
                              alt="Course" 
                              className='w-6 h-6 rounded object-cover'
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/24x24?text=C'
                              }}
                            />
                            <span className='text-xs'>{course.courseTitle}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className='px-3 sm:px-4 py-3 hidden lg:table-cell'>
                      <span className='font-medium text-green-600'>{currency}{studentData.totalSpent}</span>
                    </td>
                    <td className='px-3 sm:px-4 py-3 hidden lg:table-cell'>
                      {studentData.firstEnrollment ? new Date(studentData.firstEnrollment).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className='px-3 sm:px-4 py-3 hidden lg:table-cell'>
                      {studentData.lastEnrollment ? new Date(studentData.lastEnrollment).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className='px-3 sm:px-4 py-3'>
                      <div className='flex flex-col items-start space-y-1'>
                        <span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs'>
                          Enrolled
                        </span>
                        <span className='text-xs text-gray-500'>
                          {studentData.totalCourses} course{studentData.totalCourses !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Insights */}
        <div className='mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
          <div className='bg-white p-3 sm:p-4 rounded-lg border border-gray-200'>
            <h3 className='text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3'>Recent Enrollments</h3>
            <div className='space-y-2'>
              {enrolledStudents
                .sort((a, b) => new Date(b.lastEnrollment) - new Date(a.lastEnrollment))
                .slice(0, 5)
                .map((student, index) => (
                  <div key={index} className='flex items-center justify-between p-2 bg-gray-50 rounded'>
                    <span className='text-xs sm:text-sm font-medium'>{student.student?.name}</span>
                    <span className='text-xs text-gray-500'>
                      {new Date(student.lastEnrollment).toLocaleDateString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
          
          <div className='bg-white p-3 sm:p-4 rounded-lg border border-gray-200'>
            <h3 className='text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3'>Top Spenders</h3>
            <div className='space-y-2'>
              {enrolledStudents
                .sort((a, b) => b.totalSpent - a.totalSpent)
                .slice(0, 5)
                .map((student, index) => (
                  <div key={index} className='flex items-center justify-between p-2 bg-gray-50 rounded'>
                    <span className='text-xs sm:text-sm font-medium'>{student.student?.name}</span>
                    <span className='text-xs sm:text-sm font-bold text-green-600'>{currency}{student.totalSpent}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Course Management Actions */}
        <div className='mt-4 sm:mt-6 bg-white p-3 sm:p-4 rounded-lg border border-gray-200'>
          <h3 className='text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4'>Course Management</h3>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'>
            <button 
              onClick={() => window.location.href = '/educator/add-course'}
              className='px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base'
            >
              Add New Course
            </button>
            <button 
              onClick={() => window.location.href = '/educator/my-courses'}
              className='px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base'
            >
              Manage Courses
            </button>
            <button 
              onClick={fetchEnrolledStudents}
              className='px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base'
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentEnrolled