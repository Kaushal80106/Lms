import React, { useState, useCallback, useContext, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const MyCourses = () => {
  const { currency, backendUrl, getToken } = useContext(AppContext)

  const [courses, setCourses] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    course: null
  })
  const [deleting, setDeleting] = useState(false)

  // Local fallback image.
  // This does NOT make any network request.
  const fallbackCourseImage =
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="48" viewBox="0 0 64 48">
        <rect width="64" height="48" fill="#f3f4f6"/>
        <text x="32" y="27" text-anchor="middle" font-size="10" fill="#6b7280">
          No Image
        </text>
      </svg>
    `)

  const fetchEducatorCourses = useCallback(async () => {
    try {
      setLoading(true)

      const token = await getToken()

      const { data } = await axios.get(
        `${backendUrl}/api/educator/courses`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (data.success) {
        setCourses(data.courses || [])

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

      const { data } = await axios.delete(
        `${backendUrl}/api/educator/courses/${deleteModal.course._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (data.success) {
        toast.success('Course deleted successfully!')

        console.log('Deleted course data:', data.deletedData)

        setCourses((prev) =>
          prev.filter(
            (course) => course._id !== deleteModal.course._id
          )
        )

        setDeleteModal({
          show: false,
          course: null
        })
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
    setDeleteModal({
      show: true,
      course
    })
  }

  const cancelDelete = () => {
    setDeleteModal({
      show: false,
      course: null
    })
  }

  useEffect(() => {
    fetchEducatorCourses()
  }, [fetchEducatorCourses])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600 text-lg">
          Loading courses...
        </p>
      </div>
    )
  }

  // Empty state
  if (!courses || courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          No Courses Yet
        </h2>

        <p className="text-gray-500 mb-6">
          You haven't created any courses yet.
          Start by adding your first course!
        </p>

        <button
          onClick={() =>
            (window.location.href = '/educator/add-course')
          }
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Your First Course
        </button>
      </div>
    )
  }

  return (
    <div className="w-full px-2 sm:px-4 py-4 sm:py-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">

        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            My Courses
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage all your courses
          </p>
        </div>

        <button
          onClick={fetchEducatorCourses}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Refresh
        </button>

      </div>

      {/* Course Container */}
      <div className="flex flex-col items-center w-full overflow-hidden rounded-md bg-white border border-gray-500/20">

        {/* ========================= */}
        {/* MOBILE CARD VIEW */}
        {/* ========================= */}

        <div className="w-full sm:hidden space-y-3 p-3">

          {courses.map((course) => {

            const enrolledCount =
              Array.isArray(course.enrolledStudents)
                ? course.enrolledStudents.length
                : 0

            const finalPrice =
              course.coursePrice -
              (course.discount * course.coursePrice) / 100

            const earnings =
              Math.floor(enrolledCount * finalPrice)

            return (
              <div
                key={course._id}
                className="border border-gray-200 rounded-lg p-3 space-y-3"
              >

                {/* Course Header */}
                <div className="flex items-center space-x-3">

                  <img
                    src={course.courseThumbnail || fallbackCourseImage}
                    alt="course image"
                    className="w-16 h-12 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = fallbackCourseImage
                    }}
                  />

                  <div className="flex-1 min-w-0">

                    <h3 className="font-medium text-gray-800 truncate">
                      {course.courseTitle}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {currency}
                      {Number(course.coursePrice || 0).toFixed(2)}
                    </p>

                  </div>

                </div>

                {/* Course Information */}
                <div className="grid grid-cols-2 gap-2 text-sm">

                  <div>
                    <span className="text-gray-500">
                      Earnings:
                    </span>

                    <p className="font-medium">
                      {currency}
                      {earnings}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500">
                      Students:
                    </span>

                    <p className="font-medium">
                      {enrolledCount}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500">
                      Published:
                    </span>

                    <p className="font-medium">
                      {course.createdAt
                        ? new Date(course.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500">
                      Status:
                    </span>

                    <div className="mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          course.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {course.isPublished
                          ? 'Published'
                          : 'Draft'}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Delete Button */}
                <div className="flex space-x-2 pt-2">

                  <button
                    onClick={() => confirmDelete(course)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>

                </div>

              </div>
            )
          })}

        </div>

        {/* ========================= */}
        {/* DESKTOP TABLE VIEW */}
        {/* ========================= */}

        <div className="hidden sm:block w-full overflow-x-auto">

          <table className="w-full overflow-hidden">

            <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">

              <tr>

                <th className="px-3 sm:px-4 py-3 font-semibold">
                  All Courses
                </th>

                <th className="px-3 sm:px-4 py-3 font-semibold">
                  Earnings
                </th>

                <th className="px-3 sm:px-4 py-3 font-semibold">
                  Students
                </th>

                <th className="px-3 sm:px-4 py-3 font-semibold">
                  Published On
                </th>

                <th className="px-3 sm:px-4 py-3 font-semibold">
                  Status
                </th>

                <th className="px-3 sm:px-4 py-3 font-semibold">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="text-sm text-gray-500">

              {courses.map((course) => {

                const enrolledCount =
                  Array.isArray(course.enrolledStudents)
                    ? course.enrolledStudents.length
                    : 0

                const finalPrice =
                  course.coursePrice -
                  (course.discount * course.coursePrice) / 100

                const earnings =
                  Math.floor(enrolledCount * finalPrice)

                return (
                  <tr
                    key={course._id}
                    className="border-b border-gray-500/20 hover:bg-gray-50"
                  >

                    {/* Course */}
                    <td className="px-3 sm:px-4 py-3">

                      <div className="flex items-center space-x-3">

                        <img
                          src={
                            course.courseThumbnail ||
                            fallbackCourseImage
                          }
                          alt="course image"
                          className="w-16 h-12 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src =
                              fallbackCourseImage
                          }}
                        />

                        <span className="truncate">
                          {course.courseTitle}
                        </span>

                      </div>

                    </td>

                    {/* Earnings */}
                    <td className="px-3 sm:px-4 py-3">

                      {currency}
                      {earnings}

                    </td>

                    {/* Students */}
                    <td className="px-3 sm:px-4 py-3">

                      {enrolledCount}

                    </td>

                    {/* Published */}
                    <td className="px-3 sm:px-4 py-3">

                      {course.createdAt
                        ? new Date(
                            course.createdAt
                          ).toLocaleDateString()
                        : 'N/A'}

                    </td>

                    {/* Status */}
                    <td className="px-3 sm:px-4 py-3">

                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          course.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {course.isPublished
                          ? 'Published'
                          : 'Draft'}
                      </span>

                    </td>

                    {/* Actions */}
                    <td className="px-3 sm:px-4 py-3">

                      <div className="flex space-x-2">

                        <button
                          onClick={() => confirmDelete(course)}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>
                )
              })}

            </tbody>

          </table>

        </div>

      </div>

      {/* ========================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================= */}

      {deleteModal.show && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto">

            <div className="text-center mb-4 sm:mb-6">

              <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-2">
                Delete Course
              </h2>

              <p className="text-sm sm:text-base text-gray-600">

                Are you sure you want to delete{' '}

                <strong>
                  "{deleteModal.course?.courseTitle}"
                </strong>
                ?

              </p>

              <p className="text-xs sm:text-sm text-red-500 mt-2">

                This action cannot be undone.
                All enrolled students, progress,
                and purchases will be permanently removed.

              </p>

            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">

              <button
                onClick={cancelDelete}
                disabled={deleting}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none disabled:opacity-50 text-sm sm:text-base"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteCourse}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {deleting
                  ? 'Deleting...'
                  : 'Delete Course'}
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