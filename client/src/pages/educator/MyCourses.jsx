import React, { useState, useCallback, useContext, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/students/Loading'
import { toast } from 'react-toastify'
import axios from 'axios'

const MyCourses = () => {
  const { currency, backendUrl, getToken } = useContext(AppContext)
  const [courses, setCourses] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState({ show: false, course: null })
  const [deleting, setDeleting] = useState(false)

  const fetchEducatorCourses = useCallback(async () => {
    try {
      setLoading(true)
      const token = await getToken()
      
      const { data } = await axios.get(`${backendUrl}/api/educator/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (data.success) {
        setCourses(data.courses)
        console.log('Fetched educator courses:', data.courses)
      } else {
        toast.error(data.message || 'Failed to fetch courses')
        setCourses([])
      }
    } catch (error) {
      console.error('Error fetching educator courses:', error)
      toast.error('Failed to fetch courses. Please try again.')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [backendUrl, getToken])

  const handleDeleteCourse = async () => {
    if (!deleteModal.course) return

    setDeleting(true)
    try {
      const token = await getToken()
      
      const { data } = await axios.delete(`${backendUrl}/api/educator/courses/${deleteModal.course._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (data.success) {
        toast.success('Course deleted successfully!')
        console.log('Deleted course data:', data.deletedData)
        
        // Remove the deleted course from the list
        setCourses(prev => prev.filter(course => course._id !== deleteModal.course._id))
        
        // Close modal
        setDeleteModal({ show: false, course: null })
      } else {
        toast.error(data.message || 'Failed to delete course')
      }
    } catch (error) {
      console.error('Error deleting course:', error)
      toast.error('Failed to delete course. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const confirmDelete = (course) => {
    setDeleteModal({ show: true, course })
  }

  const cancelDelete = () => {
    setDeleteModal({ show: false, course: null })
  }

  useEffect(() => {
    fetchEducatorCourses()
  }, [fetchEducatorCourses])

  if (loading) {
    return <Loading />
  }

  if (!courses || courses.length === 0) {
    return (
      <div className='h-screen flex flex-col items-center justify-center md:p-8 md:pb-0 p-4 pt-8 pb-0'>
        <div className='text-center'>
          <h2 className='text-2xl font-medium text-gray-600 mb-4'>No Courses Yet</h2>
          <p className='text-gray-500 mb-6'>You haven't created any courses yet. Start by adding your first course!</p>
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
          <h2 className='text-base sm:text-lg lg:text-xl font-medium'>My Courses</h2>
          <button 
            onClick={fetchEducatorCourses}
            className='px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm sm:text-base w-full sm:w-auto'
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        <div className='flex flex-col items-center w-full overflow-hidden rounded-md bg-white border border-gray-500/20'>
          {/* Mobile Card View */}
          <div className='w-full sm:hidden space-y-3 p-3'>
            {courses.map((course) => (
              <div key={course._id} className='border border-gray-200 rounded-lg p-3 space-y-3'>
                <div className='flex items-center space-x-3'>
                  <img 
                    src={course.courseThumbnail} 
                    alt="course image" 
                    className='w-16 h-12 object-cover rounded'
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/64x48?text=No+Image'
                    }}
                  />
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-medium text-gray-800 truncate'>{course.courseTitle}</h3>
                    <p className='text-sm text-gray-500'>${course.coursePrice}</p>
                  </div>
                </div>
                
                <div className='grid grid-cols-2 gap-2 text-sm'>
                  <div>
                    <span className='text-gray-500'>Earnings:</span>
                    <p className='font-medium'>${Math.floor(course.enrolledStudents.length * (course.coursePrice - (course.discount * course.coursePrice / 100)))}</p>
                  </div>
                  <div>
                    <span className='text-gray-500'>Students:</span>
                    <p className='font-medium'>{course.enrolledStudents.length}</p>
                  </div>
                  <div>
                    <span className='text-gray-500'>Published:</span>
                    <p className='font-medium'>{new Date(course.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className='text-gray-500'>Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      course.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>

                                         <div className='flex space-x-2 pt-2'>
                           <button 
                             onClick={() => confirmDelete(course)}
                             className='flex-1 px-3 py-2 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors'
                           >
                             Delete
                           </button>
                         </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className='hidden sm:block w-full'>
            <table className='w-full overflow-hidden'>
              <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left'>
                <tr>
                  <th className='px-3 sm:px-4 py-3 font-semibold truncate'>All Courses</th>
                  <th className='px-3 sm:px-4 py-3 font-semibold truncate'>Earnings</th>
                  <th className='px-3 sm:px-4 py-3 font-semibold truncate'>Students</th>
                  <th className='px-3 sm:px-4 py-3 font-semibold truncate'>Published On</th>
                  <th className='px-3 sm:px-4 py-3 font-semibold truncate'>Status</th>
                  <th className='px-3 sm:px-4 py-3 font-semibold truncate'>Actions</th>
                </tr>
              </thead>
              <tbody className='text-sm text-gray-500'>
                {courses.map((course) => (
                  <tr key={course._id} className='border-b border-gray-500/20 hover:bg-gray-50'>
                    <td className='px-3 sm:px-4 py-3 flex items-center space-x-3 truncate'>
                      <img 
                        src={course.courseThumbnail} 
                        alt="course image" 
                        className='w-16 h-12 object-cover rounded'
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/64x48?text=No+Image'
                        }}
                      />
                      <span className='truncate'>{course.courseTitle}</span>
                    </td>
                    <td className='px-3 sm:px-4 py-3'>
                      ${Math.floor(course.enrolledStudents.length * (course.coursePrice - (course.discount * course.coursePrice / 100)))}
                    </td>
                    <td className='px-3 sm:px-4 py-3'>{course.enrolledStudents.length}</td>
                    <td className='px-3 sm:px-4 py-3'>
                      {new Date(course.createdAt).toLocaleDateString()}
                    </td>
                    <td className='px-3 sm:px-4 py-3'>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        course.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className='px-3 sm:px-4 py-3'>
                      <div className='flex space-x-2'>
                        
                        <button 
                          onClick={() => confirmDelete(course)}
                          className='px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors'
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-2">Delete Course</h2>
              <p className="text-sm sm:text-base text-gray-600">
                Are you sure you want to delete <strong>"{deleteModal.course?.courseTitle}"</strong>?
              </p>
              <p className="text-xs sm:text-sm text-red-500 mt-2">
                This action cannot be undone. All enrolled students, progress, and purchases will be permanently removed.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={cancelDelete}
                disabled={deleting}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCourse}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {deleting ? 'Deleting...' : 'Delete Course'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Course ID: {deleteModal.course?._id}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyCourses